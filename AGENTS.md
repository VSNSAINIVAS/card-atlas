# Card Atlas repository instructions

This is a buildless static GitHub Pages site. Publish from `main` and repository root. Preserve owner-controlled `limits.json` and never add credentials to client code.

For offer refresh requests, use `.agents/skills/update-card-offers/SKILL.md` (skill name `update-card-offers`). The canonical offer data is `offers.json`; UI logic is `app.js`; theme/layout is `styles.css`.

Before committing data or UI changes, run `python3 validate.py` and `node --check app.js`. Check merchant matches, geography and shared-limit pools. Do not assume card networks or PIXEL selections.
