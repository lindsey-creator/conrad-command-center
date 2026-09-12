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

## HUD (LINDSEY VISUAL LOCK)

Opening the Railway URL should feel like JARVIS from the future — Cybertruck landscape glass, not SaaS.

- **Look:** dark void + ice cyan `#00E5FF`, amber warn, red critical. Subtle scanlines, particle depth, corner brackets. No video. No neon-gamer clutter.
- **Arc Core:** pulses IDLE / THINKING / ACTING / TYPE-1. Always-working scan line.
- **Boot:** reactor ignition ≤2s, then the live board.
- **Panels only:** Arc Core · Type-1 Targeting (max 3) · MONEY NOW · LEAKING · Day Orbit. Command bar on the bottom.
- **PROVEN vs CLAIMED** on every panel. Giant type, 72px tap targets, readable at arm’s length.
- **Command bar:** Speak when ready, sir — Wispr into `#jarvis-command-input`, hold-to-talk, **EXECUTE**. Approvals stay on the glass.

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
