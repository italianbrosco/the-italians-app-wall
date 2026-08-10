# Italian Bros app showcase

This repository is the source for [ItalianBrosCo.com](https://italianbrosco.com/).

## Site structure

- `/` is the public app showcase.
- `/debug/apps/` preserves the previous local app launcher exactly as it appeared before the showcase launched.
- `catalog.js` is the source of truth for public app names, descriptions, verified production-store states, and release links.
- `assets/icons/` contains web-sized copies of the current production app icons.

## Update the catalog

1. Verify each release state from a primary store source. Only public production App Store and Google Play product pages may be linked.
2. Update `catalog.js`, the release snapshot date in `index.html`, and an icon only when its production icon changed.
3. Run `node scripts/verify-catalog.mjs` and visually check desktop and phone layouts.
4. Commit and push the verified change to `main`.
5. Run `scripts/deploy.sh`, then `scripts/verify-site.sh`.

Never expose TestFlight, internal testing, closed testing, upload, or review links on the public website. Products without a verified production-store page must say `Release updates coming soon` and provide no installation link.
