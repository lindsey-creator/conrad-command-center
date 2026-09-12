# JARVIS live — naming lock

This doc locks how Lindsey Conrad's operator stack is named in product copy, prompts, and the Command Center UI.

## Roles

| Name | What it is |
|------|------------|
| **JARVIS** | Sole AI command — this chat, Grok Bot, and the voice/text line in Command Center. Not Chief of Staff, Echo, Fable, or Manus. |
| **Command Center** | The glass HUD (`conrad-command-center`) where JARVIS lives. Cinematic blue/cyan Iron Man cockpit — command bar, Type-1s, and feed slots. |
| **Brain** | FastAPI engine in sibling repo `Goldfront-os`. Computes every number; UI narrates only. |
| **Supercomputer** | Knowledge / memory layer (training, decisions, ingest) — not the HUD itself. |
| **Manus** | Named production **builds and deploy** on the always-on box only — not the assistant persona. |

## HUD (LINDSEY VISION)

Opening the Railway URL should feel like JARVIS, not SaaS.

- **Look:** cinematic blue/cyan holographic HUD (scan grid, corner brackets, arc reactor). Not a gold dashboard.
- **Command bar:** Speak when ready, sir — Wispr Flow into `#jarvis-command-input`, hold-to-talk fallback, **Execute**. Tasks and drafts still hit the Approval Queue.
- **Type-1 only:** exactly three slots — **MONEY NOW** · **LEAKING** · **EFFICIENCY**. Brain-backed; empty slots stay Standby / Connect source. Never invent numbers.
- **Feed slots:** Town · GHL apply · Calendar · WHOOP · Rise · Non-QM. Honest connect states until the Brain has the source.
- **Through the glass:** Type-1 **Run through glass** and feed **Ask JARVIS** seed the command bar. Approvals stay on the HUD.

Live production (no custom-domain work from this repo):
**https://jarvis-brain-production-8def.up.railway.app**

## Wiring rules

- Command Center talks to Brain per `BRAIN_CONNECTION.md`. No invented metrics; offline sources show **Connect source** or **Offline**.
- Nothing sends without the **Approval Queue** human gate.
- Personal GHL location **3nUeqi** is for Lindsey's apply flows only — do not use Team GHL **FFdZ** writes from this UI.
- Publish phone for apply flows: **216-250-9078**.
- Do not build `rhinolending.capital/apply` in this repo; do not activate ads from here.

## Operator

- **Lindsey Conrad** — he/him in all UI and docs we maintain. JARVIS addresses him as **sir**.

## Header copy (canonical)

**JARVIS · Command** with a live indicator when `/health` reports Brain reachable.
