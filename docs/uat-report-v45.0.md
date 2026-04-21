# UAT Report v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21  
**Result:** ✅ UAT PASS

## Acceptance Criteria Verified

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Clicking Deploy opens modal titled "Deploy to Online" | PASS |
| 2 | Execution Application Name pre-filled with source app name | PASS |
| 3 | Source Application displayed as read-only (non-editable) | PASS |
| 4 | Payload Summary shows Block A (applicationSettings) and Block B (workflow) | PASS |
| 5 | Deploy button POSTs to online API with `applicationName` query param | PASS |
| 6 | Request body contains `applicationSettings` and `workflow` keys | PASS |
| 7 | Success state shown on 200 response | PASS |
| 8 | Error state shown on non-200 response | PASS |
| 9 | Cancel closes modal, no API call made | PASS |
| 10 | Old credential fields (Deploy URL, Username, Password, Environment) removed | PASS |

## Sign-off

All 10 acceptance criteria pass. UAT PASS 2026-04-21.
