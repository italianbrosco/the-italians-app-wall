# Deal Analyzer share viewer corrections

The local viewer now respects dollar-based maintenance/CapEx inputs, displays financing and utility-owner toggles, lists additional owner/tenant expenses and complete house schedules, and includes the Flip Planner worksheet and task costs. Invalid payloads hide partial results. Text wraps at narrow phone widths, and browser printing hides installation controls.

Validation: `node scripts/verify-deal-viewer.mjs` and `node scripts/verify-deal-viewer-runtime.mjs` pass. Local browser checks at 390px and 320px showed no horizontal overflow. Six generated links successfully loaded the currently deployed public viewer's headlines and financial rows.

Deployment remains pending: this Mac cannot resolve the configured `do-server` SSH alias. Pushing these changes to GitHub does not publish them to the web server. The site-wide deployment script was not run. The changed public assets are only `dealanalyzer/deal/index.html`, `viewer.js`, and `styles.css`; deploy them together because the HTML updates the cache-busting version.
