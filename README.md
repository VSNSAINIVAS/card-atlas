# Card Atlas

A static personal dashboard for six credit cards, 46 sourced benefits and four credit-limit pools. All styles, scripts and offer data are in `index.html`. No external runtime, backend or password is needed.

## Publish

GitHub Pages uses the `main` branch and repository root. It automatically republishes after commits.

## Update limits

Click **Edit limits** on the website, sign into GitHub, edit `limits.json`, and commit to `main`. Update the date and use nonnegative whole rupees without commas. GitHub write permissions protect published edits; visitors cannot change your repository.

- `hdfc`: one shared pool for Millennia and Regalia Gold.
- `pixel`: PIXEL Play only.
- `axis`: one shared pool for Airtel Axis and My Zone.
- `au`: ixigo AU only.

The dashboard does not change bank limits or track balances. Invalid JSON or invalid amounts produce an unavailable-data notice instead of fabricated limits. Keep the file valid; revert a mistaken commit using GitHub if needed.

## Offers and coverage

Reviewed on 2 October 2026 against official bank and card-partner sources. This is a manual snapshot, not a live or exhaustive personalised offer feed. Source links, known expiry dates and uncertainty labels appear on the website. PIXEL pack selections, card networks and personal fee arrangements are not assumed. Update the embedded offer data after rechecking official sources.

Known conflicts: Millennia lounge choice; Regalia cash redemption; ixigo UPI rates and train platform quotas. These are labelled in the UI. Dated 2026 changes are used for Airtel cashback and Regalia/AU lounge thresholds.

## Validation

Data and JavaScript logic checks passed for shared-limit totals, filtering, expiry, invalid-limit rejection and navigation. Responsive layouts cover phones, tablets and desktops. Check the deployed page in your browser; every physical device has not been tested.
