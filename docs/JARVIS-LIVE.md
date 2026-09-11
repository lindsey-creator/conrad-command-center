# JARVIS live — naming lock

This doc locks how Lindsey Conrad's operator stack is named in product copy, prompts, and the Command Center UI.

## Roles

| Name | What it is |
|------|------------|
| **JARVIS** | Sole AI command — this chat, Grok Bot, and the voice/text line in Command Center. Not Chief of Staff, Echo, Fable, or Manus. |
| **Command Center** | The glass HUD (`conrad-command-center`) where JARVIS lives. Mobile-first cockpit for money, leaks, Type-1s, and connectors. |
| **Brain** | FastAPI engine in sibling repo `Goldfront-os`. Computes every number; UI narrates only. |
| **Supercomputer** | Knowledge / memory layer (training, decisions, ingest) — not the HUD itself. |
| **Manus** | Named production **builds and deploy** on the always-on box only — not the assistant persona. |

## Wiring rules

- Command Center talks to Brain per `BRAIN_CONNECTION.md`. No invented metrics; offline sources show **Connect source** or **Offline**.
- Nothing sends without the **Approval Queue** human gate.
- Personal GHL location **3nUeqi** is for Lindsey's apply flows only — do not use Team GHL **FFdZ** writes from this UI.
- Publish phone for apply flows: **216-250-9078**.
- Do not build `rhinolending.capital/apply` in this repo; do not activate ads from here.

## Operator

- **Lindsey Conrad** — he/him in all UI and docs we maintain.

## Header copy (canonical)

**JARVIS · Command** with a live indicator when `/health` reports Brain reachable.

## Voice — Wispr Flow → command line

On phone or Cybertruck tablet, Lindsey dictates with **[Wispr Flow](https://wisprflow.ai)** (system-wide dictation). The cockpit is built for that flow:

1. Tap **Speak** on the command line (or tap the text field) so focus lands in `#jarvis-command-input`.
2. Trigger Wispr Flow — transcribed text appears in the command line.
3. **Execute** (or Enter) sends to Brain; nothing runs without live data or Approval Queue rules.

Browser hold-to-talk mic is a fallback when Wispr is unavailable. JARVIS copy uses he/him for Lindsey in UI we maintain.

## Town radar & Gmail inbox (HUD lane)

The **Town & inbox** band calls Brain `GET /inbox/radar` when implemented. Until routes and OAuth are live:

- **Gmail** — Connect Google (same OAuth as Calendar); the lane shows **Connect source**, never placeholder threads.
- **Town.com** — Brain `TOWN_API_TOKEN` (and future `/inbox/radar` fields with `source: town`); Cursor JARVIS can route Town context while the HUD stays honest offline.
