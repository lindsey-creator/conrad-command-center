# Conrad Command Center

The interface for **Goldfront OS** — the private operating system that runs Lindsey
Conrad's lending + construction operation (Goldfront + Conrad Enterprises, 8 units)
and supports her personally. This is the "glass" that sits on top of the **Brain**
(the deal-math engine + memory + training loop, in the separate `goldfront-os` repo).

It is the elite evolution of the live dashboard at **command.theconradteam.com**.

## What's in here
- **`PROMPT.md`** — paste this into your build tool (Cursor, Manus, or Fable). It's
  the single instruction that tells the tool exactly what to build. **Start here.**
- **`index.html`** — a real, self-contained, mobile-first **shell** you can open
  right now (double-click it). It shows the look, layout, and every module in a
  clean "connect source" state. Fable extends this into the live app.
- **`docs/`** — the full spec set (self-contained copies): the master spec, the
  Executive Council vision, the Command Center experience spec, and the coaching
  frameworks (Hormozi, Miller, Sinek, Martell).
- **`BRAND.md`** — the design bar and the feeling to hit.
- **`BRAIN_CONNECTION.md`** — how this UI talks to the Brain's FastAPI endpoints.

## How to use it with Fable (or Cursor / Manus)
1. Open this repo in the tool.
2. Point it at **`PROMPT.md`** and let it read `docs/` and `index.html`.
3. Build order: keep `index.html`'s look, wire the shell to the Brain, then the
   live connectors. Never fake data — show "connect source" until a source is live.

## Ground rules (non-negotiable — see docs/master-spec.md §3)
- The Brain's engine computes every number; the UI narrates, never calculates.
- Nothing sends without a human gate (Approval Queue).
- Health/performance modules track and remind — they never dose, prescribe, or
  give medical advice; clinical decisions route to a real provider.
- Mobile-first: it runs from a Cybertruck on Starlink. Fast on a weak connection.
- Build once, build durable.

## Deploy (in order)

**Full checklist:** [`deploy/ORDER.md`](deploy/ORDER.md)

| Where | Command |
|-------|---------|
| **Manus production** | `curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh \| bash` |
| **Local dev** | `./scripts/setup-dev.sh` then `./scripts/run-stack.sh` |
| **Smoke test** | `./scripts/smoke-test.sh http://127.0.0.1:8000` |

## Run locally (finished stack)

Prerequisites: Node 18+, Python 3.11+, sibling [`Goldfront-os`](https://github.com/lindsey-creator/Goldfront-os) clone.

```bash
cd conrad-command-center
chmod +x scripts/*.sh
./scripts/run-stack.sh
```

Then open **http://127.0.0.1:8000**. Connectors are optional — modules show **Connect source** until keys are in `Goldfront-os/.env`. See **`BRAIN_CONNECTION.md`** and `Goldfront-os/deploy/CONNECT-EVERYTHING.md`.

## Push this to your own GitHub
Create an **empty** repo on GitHub (no README, or the first push conflicts), then:

```bash
cd conrad-command-center
git remote add origin https://github.com/<you>/conrad-command-center.git
git branch -M main
git push -u origin main
```
