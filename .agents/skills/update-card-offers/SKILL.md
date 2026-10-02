---
name: update-card-offers
description: Refresh Card Atlas credit-card offers from official bank and partner sources. Use when asked to update offers, cashback, coupons, caps, lounge access, domestic or international benefits for VSNSAINIVAS/card-atlas, including requests for a specific merchant such as Swiggy.
---

# Update Card Atlas offers

Work in the current checkout of `VSNSAINIVAS/card-atlas`. Read `AGENTS.md`, `README.md`, `offers.json`, `app.js`, and `validate.py` before editing. Fetch the latest remote state; preserve unrelated changes. If no Git checkout is present, use the GitHub connector to fetch the latest files and repository metadata into a working folder, or obtain an authorized clone. Use authorized GitHub writes when working through the connector; do not assume a downloaded folder has a Git remote. This is a static GitHub Pages site published from `main` at the repository root.

## Verify before changing

1. Identify the requested cards, merchants and time period. If none are specified, review all six cards. Use the current date in Asia/Kolkata. Ask only when a missing personal selection materially affects the answer.
2. Browse the official URLs in `offers.json.sources`. Search official issuer and named merchant/partner domains for newer notices, terms and expiry changes. Do not use memory, search snippets alone, blogs or another card variant to establish rates.
3. Open the underlying source. For PDF tables, inspect the relevant page when text extraction loses row/column relationships. Prefer a newer dated notice over an older product summary. If authoritative sources conflict or cannot be reached, flag the item and retain its previous `checked` date; never mark it freshly verified.
4. Record rate, currency/point unit, qualifying merchant/channel, minimum spend, cap, cap period, eligibility, exclusions, coupon, expiry and effective date when available. Never imply coupons stack, caps are per merchant when shared, points equal rupees, or a fee is a benefit.
5. Preserve unknown card networks, PIXEL packs/platform, personal fee arrangements and account-specific eligibility. A missing international benefit is not proof of ineligibility. Do not fabricate international rewards or lounge access.

## Update the canonical data

Edit only root `offers.json` for ordinary offer changes. Never edit a generated bundle: there is none. Keep stable card IDs and existing offer IDs unless splitting a genuinely different benefit.

Each offer has `id`, `card`, `category`, `kind` (`benefit`, `fee`, `notice`), `value`, `title`, `summary`, `details`, `source` (key in `sources`), `checked` (actual verification date), `regions` (nonempty array of `domestic` and/or `international`), and `merchants` (explicit merchant names). Optional fields: `code`, `expiry` (YYYY-MM-DD), `flag`, `merchantTitles` (merchant name to focused title), `merchantValues` (merchant name to its portion of a combined benefit). Use the categories already supported by `app.js`.

- Use `domestic` for India merchant offers and general everyday benefits. Use `international` only for explicitly verified overseas benefits/costs or a clearly labelled verification notice. Use both only with evidence for both. Record geographic limits in `details`.
- Tag only merchants to which the benefit directly applies. Mentioning an excluded merchant does not make it a match. Swiggy food delivery, Dineout and a welcome membership remain separate offers. For multi-brand offers, preserve shared caps and use `merchantTitles` when a generic title obscures the selected merchant's benefit.
- Fees must use `kind: fee`, never count as savings. Unknown values must use `kind: notice` and `flag`, not zero. Keep dated expired records labelled unless the user requests removal. Do not silently extend an expiry.
- When more than one source is needed, use the most directly applicable source for `source` and record the additional official URLs and conflict in `details`; do not silently discard contradictory evidence. Add primary HTTPS sources with `title`, `url`, and `checked`. Set each offer's `checked` only when that offer was verified. Set top-level `checked` only after a complete review; partial updates must retain the prior full-review date.
- Do not change `limits.json`, authentication, repository access, or personal data during an offer refresh.

## Validate and publish

Run `python3 validate.py` and `node --check app.js`. Check the diff and count changes; explain removed/expired items and unresolved conflicts. Test Swiggy search and merchant selection, all six card filters, domestic/international modes, grouped card view and a flagged/expired item. Preserve device-default appearance, theme overrides, readable contrast and existing layout.

If the user asked to update the live site, commit the reviewed data change and push normally to the publishing branch with available authorized tools. Do not force-push. Otherwise provide the proposed change for review. If write access fails, preserve the work and report the actual blocker; do not request credentials in chat. Verify the GitHub Pages deployment and live page before claiming publication. Summarize material offer changes, dates and uncertainties with official-source links.
