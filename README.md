# Conrad Command Center

The **glass HUD for JARVIS** — the interface for **Goldfront OS**, the private
operating system that runs Lindsey Conrad's lending + construction operation
(Goldfront + Conrad Enterprises, 8 units) and supports him as an elite operator.
This UI sits on the **Brain** (deal-math engine + memory + training loop, in the
separate `Goldfront-os` repo).

Elite evolution of the live dashboard at **command.theconradteam.com**.

See **`docs/JARVIS-LIVE.md`** for naming locks (JARVIS, Command Center, Brain, Manus builds).

## What's in here
- **`PROMPT.md`** — paste into Cursor or Manus to extend the HUD. **Start here.**
- **`index.html`** — Vite entry; open via `npm run dev` for the live React app.
- **`docs/`** — master spec, Executive Council, experience spec, coaching frameworks,
  **`JARVIS-LIVE.md`**.
- **`BRAND.md`** — design bar and the feeling to hit.
- **`BRAIN_CONNECTION.md`** — how this UI talks to the Brain's FastAPI endpoints.

## Ground rules (non-negotiable — see docs/master-spec.md §3)
- The Brain's engine computes every number; JARVIS and the UI narrate, never calculate.
- Nothing sends without a human gate (Approval Queue).
- Health/performance modules track and remind — they never dose, prescribe, or
  give medical advice; clinical decisions route to a real provider.
- Mobile-first: Cybertruck on Starlink. Fast on a weak connection.
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
