# JARVIS · Conrad Command

One web HUD URL for Lindsey Conrad (he/him). Laptop, phone, Cybertruck browser. Landscape. No video. Giant type.

v1 glass is locked. Placeholders and empty states. No invented live data.

## Open

```bash
npm install
npm run dev
```

http://localhost:3000

Truck: deploy to Vercel. Bookmark the HTTPS URL.

## On glass

- Clock — `America/New_York`
- Next meeting — placeholder (no calendar feed)
- Today — 3 slots labeled TODAY
- Inbound only — 3 cards: 720 / realtor / capital. Empty. No names.
- WHOOP — Connect. No fake recovery / strain / sleep. Official OAuth later at [developer.whoop.com](https://developer.whoop.com). No Cursor plugin.
- Phone — `216-250-9078`
- Apply — https://applyconrad.com · https://www.rhinolending.capital/apply
- Status — one CoS line

Not on glass: Ken lists, email, LO bench, bot chat.

## WHOOP later

Official API v2 only. Env in `.env.local` — never commit secrets.

```
WHOOP_CLIENT_ID=
WHOOP_CLIENT_SECRET=
WHOOP_REDIRECT_URI=https://YOUR-APP.vercel.app/api/whoop/callback
```

Until that exists, the pane is Connect and em-dashes.

## Config

`data/command-center.sample.json` — CoS status line, lock phone, apply URLs. Not a second KB doc.
