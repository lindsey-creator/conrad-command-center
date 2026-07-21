# Manus — accurate Echo Command deploy

**Start here:** [`ORDER.md`](ORDER.md) (full checklist in order).

## One line (Manus terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
```

## For Manus AI

Copy this prompt:

> Run on the Manus box (`~/Documents/Claude/Projects/Brain`). Execute the ordered deploy script from GitHub main. Do not print secrets from `.env`. Report verify output.
>
> ```bash
> curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
> ```
>
> Success = `curl http://127.0.0.1:8000/health` returns JSON and `/` title contains **Echo Command**. If public HTTPS fails but local passes, run `sudo bash goldfront-os/deploy/cloudflared-manus.sh`.

## Problem this fixes

`command.theconradteam.com` was serving **legacy static HTML** from `/var/www/dashboard`. The accurate product is **React Echo Command** built to `dist/` and served by **superman-brain** on `:8000` with nginx proxying all hostnames.
