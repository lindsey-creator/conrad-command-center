# JARVIS · Conrad Command

One landscape HUD for Lindsey Conrad (he/him), CEO of Goldfront / Revolution.

Same scene on laptop, phone, and the Tesla Cybertruck browser (Chromium, 16:9, 18" center). No video. No hover. Bookmark the HTTPS URL. Drive-safe as a static page.

## Open it

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. That is the only board.

## Truck bookmark

1. Deploy this repo to [Vercel](https://vercel.com) (Framework: Next.js).
2. Copy the production HTTPS URL. Example: `https://YOUR-APP.vercel.app`
3. In the Cybertruck browser, bookmark that URL. Full screen. Landscape.
4. Do not add a second page. This glass is the scene.

`npm run build` then `npm start` is the same app locally over HTTP. The truck needs the Vercel HTTPS URL.

## WHOOP (official API v2 only)

Register an app later in the [WHOOP Developer Dashboard](https://developer-dashboard.whoop.com/). Paid WHOOP membership is required or OAuth/data comes back empty.

Official docs used:

- OAuth: https://developer.whoop.com/docs/developing/oauth/
- API: https://developer.whoop.com/api/

| | |
|---|---|
| Auth | `https://api.prod.whoop.com/oauth/oauth2/auth` |
| Token | `https://api.prod.whoop.com/oauth/oauth2/token` |
| Data | `https://api.prod.whoop.com/developer/v2` · `GET /recovery` · `GET /cycle` · `GET /activity/sleep` |
| Scopes | `read:recovery read:cycles read:sleep read:profile offline` |

Env — copy `.env.example` to `.env.local`. Never commit secrets. Client secret stays on the server.

```
WHOOP_CLIENT_ID=
WHOOP_CLIENT_SECRET=
WHOOP_REDIRECT_URI=http://localhost:3000/api/whoop/callback
```

Production redirect URI (must match the WHOOP app):

```
https://YOUR-APP.vercel.app/api/whoop/callback
```

Set the same three env vars in the Vercel project. Refresh tokens rotate; the server stores the new one on each refresh (httpOnly cookie). No client-secret in the browser. No mic. No WebRTC.

Until credentials exist, the HUD shows **CONNECT WHOOP · SET ENV** and a **SAMPLE** recovery ring so the layout is never mistaken for live biometrics. Connected with no data: **NO DATA**, not fake scores.

## Sample feed

`data/command-center.sample.json` is a local config feed. Calendar, inbound cards, and WHOOP sample rings are **SAMPLE / EXAMPLE**, not production numbers. Lock phones and apply links are live ops facts.

CoS edits that JSON. No second Goldfront KB doc.

## Panes (one frame)

1. **CLOCK** — Cleveland, `America/New_York`
2. **NEXT** — next block only, huge
3. **TODAY** — max 3 more (time + title)
4. **INBOUND ONLY** — max 3 cards · 720 / $500K+ / realtor purchase / capital. No Ken lists. No chase.
5. **WHOOP** — recovery ring (green 67+, yellow 34–66, red 0–33), strain, last sleep %
6. **LOCK** — tap-to-call Lindsey `216-250-9078` · DSCR https://www.rhinolending.capital/apply · Residential https://applyconrad.com · Listing `216-279-5821` is Pat, not his call
7. **STATUS** — one CoS line

## Legacy Brain deck

The old Vite Brain stack is still in `src/`. It is **not** the truck HUD.

```bash
npm run dev:brain
```
