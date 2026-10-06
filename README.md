# Card Atlas

A responsive static wallet for six credit cards and four shared/individual limit pools. Hosted by GitHub Pages from `main`, repository root; commits automatically republish.

## Browse

- **Overview** brings together the wallet total, six card designs and the benefit explorer. **My cards** groups results by card.
- **Lounges** is a dedicated view of recorded domestic and international lounge benefits, including railway access. Visit allowances, spending conditions, eligibility notices and official sources stay attached to each benefit. This is a card-benefit guide, not an airport/lounge-location directory.
- **Search** works across the wallet in the selected region. Starting a new nonempty search clears the card, merchant, category and offer-type filters so an earlier selection cannot silently hide results. You can apply those filters again after searching. In the Lounges view, search stays within lounge benefits. Singular/plural terms, punctuation, “cash back”, “airport lounge access” and common lounge spelling mistakes such as “longue access” are supported. Press `/` to focus search.
- **Domestic / International** separates India/everyday benefits from verified overseas perks and costs. Changing region clears merchant/category/search/type filters and keeps the selected card. The Lounges view keeps its lounge category.
- **Merchant** or a popular merchant button shows only directly linked benefits. An exact merchant search such as Swiggy uses the same mapping. Multi-brand cashback becomes a merchant-specific title while retaining the shared cap.
- **Theme → Device** follows the device’s light/dark appearance. Light/Dark overrides are stored only on that device. The appearance menu uses readable theme-aware colors and supports arrow keys, Home/End, Enter and Escape.
- **Credit limits** counts four shared/individual pools once. **Sources & coverage** explains verification dates and known uncertainties. Conditions expand inline; full details open in a keyboard-accessible dialog.

## Check UI changes

No install, bundling or build step is required. Serve the repository with `python3 -m http.server 8765` and open `http://localhost:8765`.

```sh
python3 validate.py
node --check app.js
node --test tests/search.test.cjs
```

Browser regression checklist: select Swiggy then search Lounges; search airport lounge access; open Lounges and toggle both regions; exercise all six card filters and grouped results; check merchant-specific caps, dated/flagged results, empty-state reset, offer details and source links; inspect light/dark and narrow mobile layouts. Offer terms and saved limits must remain unchanged during a visual refresh.

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
