#!/usr/bin/env python3
"""HTTP site watch for Conrad / Goldfront public pages.

Stdlib only. No secrets. No CRM. No email.
Writes a markdown report under reports/site-watch/.

Exit codes:
  0  no FAIL findings
  1  one or more FAIL findings (dead phone, unexpected status, broken required check)
  2  usage / config / self-test error
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_CONFIG = SCRIPT_DIR / "config.json"

# Formatted NANP, tel: URIs, JSON-LD telephone, compact +1XXXXXXXXXX.
# Do not match bare 10-digit integers (SPA bundles are full of them).
FORMATTED_PHONE_RE = re.compile(
    r"(?<!\d)(?:\+1[\s.\-]?)?(?:\(?\d{3}\)?[\s.\-])\d{3}[\s.\-]\d{4}(?!\d)"
)
TEL_URI_RE = re.compile(r"tel:([+\d\s().-]+)", re.I)
E164_PLUS1_RE = re.compile(r"(?<!\d)\+1(\d{10})(?!\d)")
JSON_TEL_RE = re.compile(r'"telephone"\s*:\s*"([^"]+)"', re.I)
SKIP_SCHEMES = ("javascript:", "data:", "mailto:", "about:", "blob:")


@dataclass
class Hop:
    frm: str
    status: int
    to: str


@dataclass
class FetchResult:
    requested: str
    final_url: str
    status: int
    hops: list[Hop]
    body: str
    error: str | None = None


@dataclass
class PhoneHit:
    display: str
    digits: str
    classification: str  # dead | publish | unclassified
    raw: str


@dataclass
class LinkCheck:
    url: str
    status: int | None
    final_url: str
    error: str | None
    kind: str

    @property
    def broken(self) -> bool:
        if self.error:
            return True
        return self.status is None or self.status >= 400


@dataclass
class ContentCheck:
    id: str
    label: str
    kind: str  # require | forbid
    passed: bool
    severity: str
    detail: str


@dataclass
class SiteResult:
    site: dict[str, Any]
    fetch: FetchResult
    phones: list[PhoneHit]
    links: list[LinkCheck]
    content: list[ContentCheck]
    probes: list[FetchResult] = field(default_factory=list)
    related: list[FetchResult] = field(default_factory=list)

    @property
    def findings(self) -> list[str]:
        out: list[str] = []
        expected = int(self.site.get("expected_status") or 200)
        if self.fetch.error:
            out.append(f"FAIL fetch: {self.fetch.error}")
        elif self.fetch.status != expected:
            out.append(
                f"FAIL HTTP {self.fetch.status} (expected {expected}) for {self.site['url']}"
            )
        for hop in self.fetch.hops:
            if hop.status in (301, 302, 303, 307, 308):
                out.append(
                    f"NOTE {hop.status} {hop.frm} → {hop.to}"
                )
        for phone in self.phones:
            if phone.classification == "dead":
                out.append(
                    f"FAIL dead phone {phone.display} found (never publish)"
                )
        for link in self.links:
            if link.broken:
                out.append(
                    f"FAIL broken link {link.url} "
                    f"({link.error or f'HTTP {link.status}'})"
                )
        for check in self.content:
            if not check.passed and check.severity == "fail":
                out.append(f"FAIL {check.label}: {check.detail}")
            elif not check.passed:
                out.append(f"WARN {check.label}: {check.detail}")
        for probe in self.probes:
            if probe.error or probe.status >= 400:
                out.append(
                    f"FAIL probe {probe.requested} "
                    f"({probe.error or f'HTTP {probe.status}'})"
                )
        return out

    @property
    def failed(self) -> bool:
        return any(item.startswith("FAIL") for item in self.findings)


def load_config(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def digits_only_nanp(value: str) -> str | None:
    digits = re.sub(r"\D", "", value)
    if digits.startswith("1") and len(digits) == 11:
        digits = digits[1:]
    if len(digits) != 10:
        return None
    if digits[0] in "01" or digits[3] in "01":
        return None
    return digits


def format_nanp(digits: str) -> str:
    return f"{digits[0:3]}-{digits[3:6]}-{digits[6:10]}"


def locked_number_pattern(digits: str) -> re.Pattern[str]:
    body = r"[\s().\-+]*".join(digits)
    return re.compile(rf"(?<!\d)(?:1[\s().\-+]*)?{body}(?!\d)")


def classify_digits(digits: str, phone_lock: dict[str, Any]) -> str:
    for entry in phone_lock.get("dead") or []:
        if entry["digits"] == digits:
            return "dead"
    for entry in phone_lock.get("publish") or []:
        if entry["digits"] == digits:
            return "publish"
    return "unclassified"


def extract_phones(text: str, phone_lock: dict[str, Any]) -> list[PhoneHit]:
    found: dict[str, PhoneHit] = {}

    def add(raw: str) -> None:
        digits = digits_only_nanp(raw)
        if not digits:
            return
        found[digits] = PhoneHit(
            display=format_nanp(digits),
            digits=digits,
            classification=classify_digits(digits, phone_lock),
            raw=raw.strip(),
        )

    for match in FORMATTED_PHONE_RE.finditer(text):
        add(match.group(0))
    for match in TEL_URI_RE.finditer(text):
        add(match.group(1))
    for match in E164_PLUS1_RE.finditer(text):
        add(match.group(1))
    for match in JSON_TEL_RE.finditer(text):
        add(match.group(1))

    # Always scan for locked numbers, even if they appear without separators.
    for entry in list(phone_lock.get("dead") or []) + list(
        phone_lock.get("publish") or []
    ):
        if locked_number_pattern(entry["digits"]).search(text):
            add(entry["digits"])

    return sorted(found.values(), key=lambda p: (p.classification != "dead", p.digits))


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.hrefs: list[tuple[str, str]] = []
        self.json_ld: list[str] = []
        self._in_ld = False
        self._ld_chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k.lower(): (v or "") for k, v in attrs}
        if tag == "a" and ad.get("href"):
            self.hrefs.append((ad["href"], "a"))
        elif tag == "link" and ad.get("href"):
            rel = ad.get("rel", "").lower()
            kind = "canonical" if "canonical" in rel else "link"
            self.hrefs.append((ad["href"], kind))
        elif tag == "img" and ad.get("src"):
            self.hrefs.append((ad["src"], "img"))
        elif tag == "script":
            if ad.get("src"):
                self.hrefs.append((ad["src"], "script"))
            stype = ad.get("type", "").lower()
            if "ld+json" in stype:
                self._in_ld = True
                self._ld_chunks = []
        elif tag == "meta":
            prop = (ad.get("property") or ad.get("name") or "").lower()
            content = ad.get("content") or ""
            if content and prop in {
                "og:url",
                "og:image",
                "twitter:image",
                "twitter:url",
            }:
                self.hrefs.append((content, prop))

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_ld:
            self.json_ld.append("".join(self._ld_chunks))
            self._in_ld = False
            self._ld_chunks = []

    def handle_data(self, data: str) -> None:
        if self._in_ld:
            self._ld_chunks.append(data)


def _walk_json_urls(value: Any, out: list[str]) -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"url", "sameAs", "logo", "image"} and isinstance(item, str):
                if item.startswith("http"):
                    out.append(item)
            elif key in {"sameAs", "image"} and isinstance(item, list):
                for child in item:
                    if isinstance(child, str) and child.startswith("http"):
                        out.append(child)
            else:
                _walk_json_urls(item, out)
    elif isinstance(value, list):
        for item in value:
            _walk_json_urls(item, out)


def collect_urls(body: str, base_url: str) -> list[tuple[str, str]]:
    parser = LinkCollector()
    try:
        parser.feed(body)
    except Exception:
        pass
    pairs = list(parser.hrefs)
    for blob in parser.json_ld:
        try:
            data = json.loads(blob)
        except json.JSONDecodeError:
            continue
        urls: list[str] = []
        _walk_json_urls(data, urls)
        pairs.extend((url, "json-ld") for url in urls)

    resolved: list[tuple[str, str]] = []
    seen: set[str] = set()
    for raw, kind in pairs:
        raw = raw.strip()
        if not raw or raw.startswith("#"):
            continue
        lower = raw.lower()
        if lower.startswith("tel:"):
            continue
        if any(lower.startswith(scheme) for scheme in SKIP_SCHEMES):
            continue
        abs_url = urllib.parse.urljoin(base_url, raw)
        parsed = urllib.parse.urlparse(abs_url)
        if parsed.scheme not in {"http", "https"}:
            continue
        if abs_url in seen:
            continue
        seen.add(abs_url)
        resolved.append((abs_url, kind))
    return resolved


def should_skip_host(url: str, skip_hosts: list[str]) -> bool:
    host = (urllib.parse.urlparse(url).hostname or "").lower()
    return any(host == skip or host.endswith("." + skip) for skip in skip_hosts)


def fetch_url(
    url: str,
    *,
    timeout: int,
    user_agent: str,
    max_redirects: int,
) -> FetchResult:
    hops: list[Hop] = []

    class RecordingRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
            hops.append(Hop(frm=req.full_url, status=int(code), to=newurl))
            if len(hops) > max_redirects:
                raise urllib.error.HTTPError(
                    newurl, code, f"too many redirects (>{max_redirects})", headers, fp
                )
            return super().redirect_request(req, fp, code, msg, headers, newurl)

    ctx = ssl.create_default_context()
    opener = urllib.request.build_opener(
        RecordingRedirectHandler(),
        urllib.request.HTTPSHandler(context=ctx),
    )
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
        method="GET",
    )
    try:
        with opener.open(request, timeout=timeout) as response:
            raw = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
            body = raw.decode(charset, errors="replace")
            return FetchResult(
                requested=url,
                final_url=response.geturl(),
                status=int(response.status),
                hops=hops,
                body=body,
            )
    except urllib.error.HTTPError as exc:
        raw = exc.read() if exc.fp else b""
        charset = "utf-8"
        if exc.headers:
            charset = exc.headers.get_content_charset() or "utf-8"
        body = raw.decode(charset, errors="replace")
        return FetchResult(
            requested=url,
            final_url=exc.geturl() if hasattr(exc, "geturl") else url,
            status=int(exc.code),
            hops=hops,
            body=body,
            error=None if exc.code else str(exc),
        )
    except Exception as exc:  # noqa: BLE001 — report any transport failure
        return FetchResult(
            requested=url,
            final_url=url,
            status=0,
            hops=hops,
            body="",
            error=f"{type(exc).__name__}: {exc}",
        )


def run_content_checks(body: str, site: dict[str, Any]) -> list[ContentCheck]:
    checks: list[ContentCheck] = []
    for spec in site.get("require_text") or []:
        pattern = re.compile(spec["pattern"])
        found = bool(pattern.search(body))
        checks.append(
            ContentCheck(
                id=spec["id"],
                label=spec["label"],
                kind="require",
                passed=found,
                severity=spec.get("severity", "fail"),
                detail="present" if found else "not found in delivered HTML/JS",
            )
        )
    for spec in site.get("forbid_text") or []:
        pattern = re.compile(spec["pattern"])
        found = bool(pattern.search(body))
        checks.append(
            ContentCheck(
                id=spec["id"],
                label=spec["label"],
                kind="forbid",
                passed=not found,
                severity=spec.get("severity", "fail"),
                detail="found leftover copy" if found else "not present",
            )
        )
    return checks


def check_links(
    urls: list[tuple[str, str]],
    *,
    cfg: dict[str, Any],
    origin: str,
) -> list[LinkCheck]:
    skip_hosts = list(cfg.get("skip_link_hosts") or [])
    limit = int(cfg.get("max_links_per_site") or 20)
    timeout = int(cfg.get("timeout_seconds") or 20)
    ua = str(cfg["user_agent"])
    max_redirects = int(cfg.get("max_redirects") or 8)

    origin_host = (urllib.parse.urlparse(origin).hostname or "").lower()

    def rank(item: tuple[str, str]) -> tuple[int, str]:
        url, kind = item
        host = (urllib.parse.urlparse(url).hostname or "").lower()
        first_party = host == origin_host or host.endswith("." + origin_host)
        kind_rank = {
            "canonical": 0,
            "og:url": 1,
            "a": 2,
            "og:image": 3,
            "img": 4,
            "json-ld": 5,
        }.get(kind, 9)
        return (0 if first_party else 1, f"{kind_rank:02d}{url}")

    chosen: list[tuple[str, str]] = []
    for url, kind in sorted(urls, key=rank):
        if should_skip_host(url, skip_hosts):
            continue
        chosen.append((url, kind))
        if len(chosen) >= limit:
            break

    results: list[LinkCheck] = []
    for url, kind in chosen:
        fetched = fetch_url(
            url, timeout=timeout, user_agent=ua, max_redirects=max_redirects
        )
        results.append(
            LinkCheck(
                url=url,
                status=fetched.status or None,
                final_url=fetched.final_url,
                error=fetched.error,
                kind=kind,
            )
        )
    return results


def watch_site(site: dict[str, Any], cfg: dict[str, Any]) -> SiteResult:
    timeout = int(cfg.get("timeout_seconds") or 20)
    ua = str(cfg["user_agent"])
    max_redirects = int(cfg.get("max_redirects") or 8)
    phone_lock = cfg["phone_lock"]

    fetched = fetch_url(
        site["url"], timeout=timeout, user_agent=ua, max_redirects=max_redirects
    )
    phones = extract_phones(fetched.body, phone_lock) if fetched.body else []
    base = fetched.final_url or site["url"]
    urls = collect_urls(fetched.body, base) if fetched.body else []
    links = check_links(urls, cfg=cfg, origin=base) if fetched.body else []
    content = run_content_checks(fetched.body, site) if fetched.body else []

    probes: list[FetchResult] = []
    for path in site.get("probe_paths") or []:
        probe_url = urllib.parse.urljoin(base, path)
        probes.append(
            fetch_url(probe_url, timeout=timeout, user_agent=ua, max_redirects=max_redirects)
        )
        phones.extend(extract_phones(probes[-1].body, phone_lock))

    related: list[FetchResult] = []
    for extra in site.get("related_urls") or []:
        related.append(
            fetch_url(extra, timeout=timeout, user_agent=ua, max_redirects=max_redirects)
        )
        phones.extend(extract_phones(related[-1].body, phone_lock))

    # De-dupe phones after probes/related.
    unique: dict[str, PhoneHit] = {p.digits: p for p in phones}
    phones = sorted(unique.values(), key=lambda p: (p.classification != "dead", p.digits))

    return SiteResult(
        site=site,
        fetch=fetched,
        phones=phones,
        links=links,
        content=content,
        probes=probes,
        related=related,
    )


def md_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def render_report(
    results: list[SiteResult],
    cfg: dict[str, Any],
    *,
    generated_at: datetime,
    argv: list[str],
) -> str:
    lock = cfg["phone_lock"]
    dead_labels = ", ".join(e["label"] for e in lock.get("dead") or [])
    publish_labels = ", ".join(e["label"] for e in lock.get("publish") or [])
    failed = sum(1 for r in results if r.failed)
    date = generated_at.date().isoformat()

    lines: list[str] = [
        f"# Site watch report — {date}",
        "",
        f"Generated (UTC): {generated_at.strftime('%Y-%m-%d %H:%M:%SZ')}",
        f"Command: `python3 scripts/site-watch/watch.py{' ' + ' '.join(argv) if argv else ''}`",
        "Scope: HTTP GET only. No secrets. No CRM. No email.",
        "",
        "## Summary",
        "",
        f"{failed} site(s) have FAIL findings out of {len(results)} watched.",
        "",
        "| Site | Requested | Final status | Redirects | Dead phones | Broken links | Result |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for result in results:
        dead_count = sum(1 for p in result.phones if p.classification == "dead")
        broken = sum(1 for link in result.links if link.broken)
        status = (
            result.fetch.error
            or str(result.fetch.status)
        )
        lines.append(
            "| "
            + " | ".join(
                [
                    md_cell(result.site["name"]),
                    md_cell(result.site["url"]),
                    md_cell(status),
                    str(len(result.fetch.hops)),
                    str(dead_count),
                    str(broken),
                    "FAIL" if result.failed else "OK",
                ]
            )
            + " |"
        )

    lines += [
        "",
        "## Phone lock",
        "",
        f"- Dead (never publish): **{dead_labels or '(none configured)'}** — FAIL if found.",
        f"- Lindsey publish number: **{publish_labels or '(none configured)'}**.",
        f"- Unclassified phones: {lock.get('unlisted_policy')}",
        "- This report lists numbers found on the fetched pages. It does not invent numbers.",
        "",
    ]

    for result in results:
        site = result.site
        lines += [
            f"## {site['name']}",
            "",
            f"- Requested: {site['url']}",
            f"- Final URL: {result.fetch.final_url or '—'}",
            f"- Status: {result.fetch.status if not result.fetch.error else result.fetch.error}",
        ]
        if site.get("note"):
            lines.append(f"- Note: {site['note']}")
        if result.fetch.hops:
            lines.append("- Redirect chain:")
            for hop in result.fetch.hops:
                lines.append(f"  - `{hop.status}` {hop.frm} → {hop.to}")
        elif site.get("record_redirect_chain"):
            lines.append("- Redirect chain: none (direct response)")

        lines += ["", "### Phones found", ""]
        if result.phones:
            lines.append("| Number | Class | Raw match | Action |")
            lines.append("| --- | --- | --- | --- |")
            for phone in result.phones:
                if phone.classification == "dead":
                    action = "P0 — remove. Never publish."
                elif phone.classification == "publish":
                    action = "OK — Lindsey's publish number."
                else:
                    action = (
                        "Report only. Do not invent a replacement. "
                        "Do not change a Maps/listing phone without proving the listing."
                    )
                lines.append(
                    f"| {phone.display} | {phone.classification} | "
                    f"`{md_cell(phone.raw)}` | {action} |"
                )
        else:
            lines.append("_No NANP phones found in delivered HTML/JSON-LD/tel URIs._")

        lines += ["", "### Content checks", ""]
        if result.content:
            lines.append("| Check | Kind | Result | Detail |")
            lines.append("| --- | --- | --- | --- |")
            for check in result.content:
                mark = "PASS" if check.passed else check.severity.upper()
                lines.append(
                    f"| {md_cell(check.label)} | {check.kind} | {mark} | {md_cell(check.detail)} |"
                )
        else:
            lines.append("_No content checks configured._")

        if result.probes:
            lines += ["", "### Path probes", ""]
            lines.append("| URL | Status | Final URL |")
            lines.append("| --- | --- | --- |")
            for probe in result.probes:
                lines.append(
                    f"| {md_cell(probe.requested)} | "
                    f"{probe.error or probe.status} | {md_cell(probe.final_url)} |"
                )

        if result.related:
            lines += ["", "### Related URLs", ""]
            lines.append("| URL | Status | Final URL |")
            lines.append("| --- | --- | --- |")
            for extra in result.related:
                lines.append(
                    f"| {md_cell(extra.requested)} | "
                    f"{extra.error or extra.status} | {md_cell(extra.final_url)} |"
                )

        lines += ["", "### Links checked", ""]
        if result.links:
            lines.append("| URL | Kind | Status | Broken |")
            lines.append("| --- | --- | --- | --- |")
            for link in result.links:
                st = link.error or (str(link.status) if link.status is not None else "—")
                lines.append(
                    f"| {md_cell(link.url)} | {link.kind} | {md_cell(st)} | "
                    f"{'yes' if link.broken else 'no'} |"
                )
        else:
            lines.append(
                "_No first-party/social/asset links extracted "
                "(SPA shells often have no `<a href>` until JS runs)._"
            )

        lines += ["", "### Findings", ""]
        if result.findings:
            for item in result.findings:
                lines.append(f"- {item}")
        else:
            lines.append("- None.")
        lines.append("")

    lines += [
        "## Limits",
        "",
        "- Checks the HTML/JS the server actually delivered. No headless browser, so "
        "client-only routes may not appear as `<a href>` links.",
        "- Does not change Maps listings, CRM records, or send email.",
        "- Phone lock is exhaustive for the two configured numbers only.",
        "",
    ]
    return "\n".join(lines) + "\n"


def run_self_test() -> int:
    lock = {
        "dead": [{"digits": "2165135139", "label": "216-513-5139"}],
        "publish": [{"digits": "2162509078", "label": "216-250-9078"}],
    }
    cases = [
        ("216-513-5139", "2165135139", "dead"),
        ("(216) 513-5139", "2165135139", "dead"),
        ("+1-216-250-9078", "2162509078", "publish"),
        ("216.250.9078", "2162509078", "publish"),
    ]
    for raw, digits, cls in cases:
        got = digits_only_nanp(raw)
        if got != digits:
            print(f"self-test FAIL normalize {raw!r} -> {got!r} expected {digits!r}")
            return 2
        if classify_digits(got, lock) != cls:
            print(f"self-test FAIL classify {raw!r}")
            return 2

    blob = "Call 216.513.5139 or 216-250-9078. Also +12162795821."
    phones = extract_phones(blob, lock)
    by_digits = {p.digits: p for p in phones}
    if "2165135139" not in by_digits or by_digits["2165135139"].classification != "dead":
        print("self-test FAIL dead number scan")
        return 2
    if "2162509078" not in by_digits or by_digits["2162509078"].classification != "publish":
        print("self-test FAIL publish number scan")
        return 2
    if "2162795821" not in by_digits:
        print("self-test FAIL compact +1 extract")
        return 2
    if by_digits["2162795821"].classification != "unclassified":
        print("self-test FAIL unclassified")
        return 2

    # Bare JS integers must not become phones.
    js = "priorityLevel:5,p=1073741823;case 4:p=1e4"
    if extract_phones(js, lock):
        print("self-test FAIL false-positive JS integer")
        return 2

    gold = re.compile(r"(?i)gold\s*star")
    if not gold.search("Welcome to Gold Star Mortgage"):
        print("self-test FAIL gold star match")
        return 2
    if gold.search("Goldfront Capital"):
        print("self-test FAIL goldfront false positive")
        return 2

    print("self-test OK")
    return 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="HTTP-check Conrad public sites and write a markdown report."
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="Path to config.json (default: next to this script)",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Report directory (default: <repo>/reports/site-watch)",
    )
    parser.add_argument(
        "--date",
        default=None,
        help="Report date YYYY-MM-DD (default: today UTC)",
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Also write reports/site-watch/SAMPLE.md (same contents as the dated report)",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Run offline phone-lock and parser checks, then exit",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if args.self_test:
        return run_self_test()

    cfg_path = args.config if args.config.is_absolute() else (Path.cwd() / args.config)
    if not cfg_path.is_file():
        # Allow running from repo root as scripts/site-watch/watch.py
        alt = REPO_ROOT / "scripts/site-watch/config.json"
        if alt.is_file():
            cfg_path = alt
        else:
            print(f"config not found: {args.config}", file=sys.stderr)
            return 2

    cfg = load_config(cfg_path)
    generated_at = datetime.now(timezone.utc)
    if args.date:
        generated_at = datetime.strptime(args.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    results = [watch_site(site, cfg) for site in cfg["sites"]]

    out_dir = args.out_dir
    if out_dir is None:
        out_dir = REPO_ROOT / cfg.get("report_dir", "reports/site-watch")
    elif not out_dir.is_absolute():
        out_dir = Path.cwd() / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    report = render_report(
        results,
        cfg,
        generated_at=generated_at,
        argv=argv or sys.argv[1:],
    )
    dated = out_dir / f"{generated_at.date().isoformat()}.md"
    dated.write_text(report, encoding="utf-8")
    written = [dated]
    if args.sample:
        sample = out_dir / "SAMPLE.md"
        sample.write_text(report, encoding="utf-8")
        written.append(sample)

    failed = any(r.failed for r in results)
    print(f"wrote {dated}")
    for path in written[1:]:
        print(f"wrote {path}")
    print("RESULT", "FAIL" if failed else "OK")
    for result in results:
        for item in result.findings:
            if item.startswith("FAIL"):
                print(f"  [{result.site['id']}] {item}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
