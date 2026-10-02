# Card Atlas

A responsive static wallet for six credit cards and four shared/individual limit pools. Hosted by GitHub Pages from `main`, repository root; commits automatically republish.

## Browse

- **Theme → Device** follows the phone/computer's light or dark appearance by default. Light/Dark overrides are stored only on that device.
- **Domestic / International** separates India/everyday benefits from verified overseas perks and costs. Fees are labelled as costs; unverified items have explicit notices.
- **Merchant** or a quick merchant button shows only directly linked benefits. Searching an exact merchant such as Swiggy uses the same explicit mapping. Multi-brand cashback becomes a merchant-specific title, while retaining the shared cap.
- **Card benefits** groups results by card. Card, region, merchant and category filters can be combined. Switching region clears merchant/category/search filters but keeps the selected card.
- Caps, coupons and conditions are readable in each result. Full details provide official sources.

## Update offers with the skill

Open this repository in Codex and ask:

> Use $update-card-offers to refresh all card offers from official bank and merchant sources and publish the update.

For a focused refresh:

> Use $update-card-offers to check Swiggy offers for all my cards.

The repository skill is `.agents/skills/update-card-offers/SKILL.md`. `AGENTS.md` also directs agents to it. In a chat tool that does not discover repository skills, ask it to read that exact file in this repository and follow it. Storing a repository skill does not install a personal ChatGPT plugin or run an automatic update service.

`offers.json` is the canonical dataset. Keep source links, verification dates, geography and direct merchant tags accurate. Never set a fresh review date without checking. Run `python3 validate.py` and `node --check app.js` before publishing. No bundling or build step is needed.

## Update limits

Click **Edit limits**, sign in to GitHub, edit the relevant amount in root `limits.json`, update the date, then commit. Only accounts with write permission can change the published amounts. The UI contains no credentials or simulated password protection.

- `hdfc`: Millennia + Regalia Gold, counted once.
- `pixel`: PIXEL Play.
- `axis`: Airtel Axis + My Zone, counted once.
- `au`: ixigo AU.

Use nonnegative whole rupees without commas. The dashboard does not change bank limits or track available balance. Do not change these values during an offer refresh.

## Coverage

This is a manually researched snapshot, not an exhaustive or live personalized feed. Check current bank/merchant terms before purchase. Networks, personal eligibility and PIXEL selections remain unknown unless supplied. International mode does not infer all base rewards abroad. Known uncertainties are labelled. PIXEL base rewards now reflect the 15,000-CashPoint fair-use ceiling in the August 2026 terms.
