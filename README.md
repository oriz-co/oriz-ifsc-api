# oriz-ifsc-api

Indian IFSC code lookup — a monthly JSON snapshot of the RBI master list, served as static files from GitHub Pages. PWA-installable docs at `https://ifsc.api.oriz.in`.

## What

- Free, public, no-auth JSON endpoints.
- Refreshed monthly (first Monday, 06:30 IST) via GitHub Actions.
- Installable as a PWA (Chrome/Edge "Install app").

## Endpoints

- `GET /data/latest.json` — most recent snapshot.
- `GET /data/ifsc.json` — full IFSC index (same shape as `latest.json` for v0).

### Shape

```json
{
  "source": "https://github.com/razorpay/ifsc (RBI mirror)",
  "fetchedAt": "2026-06-22T...",
  "count": 1234,
  "bankCount": 50,
  "banks": {
    "HDFC": [{ "ifsc": "HDFC0000001", "branch": "MUMBAI - FORT" }],
    "SBIN": [{ "ifsc": "SBIN0000001", "branch": "MUMBAI MAIN BRANCH" }]
  }
}
```

## Schedule

Monthly snapshot on the first Monday at 06:30 IST (`0 1 1-7 * 1` UTC). Manual runs via the **Run workflow** button on the `scrape` workflow.

## Credits

IFSC data sourced from the [Razorpay public IFSC repository](https://github.com/razorpay/ifsc), which mirrors the [RBI master list](https://www.rbi.org.in/Scripts/Bs_viewRTGS.aspx). This project is independent and unaffiliated.

## License

MIT — see [LICENSE](./LICENSE).

Part of the [Oriz](https://oriz.in) family of small public APIs.
