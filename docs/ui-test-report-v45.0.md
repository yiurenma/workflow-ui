# UI Test Report v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21  
**Result:** ✅ 7/7 PASS

## Test Results

| ID | Description | Result | Notes |
|----|-------------|--------|-------|
| TC-DEPLOY-ONLINE-01 | Deploy button visible in table | PASS | Button present in Actions column |
| TC-DEPLOY-ONLINE-02 | Modal title "Deploy to Online" | PASS | Correct title rendered |
| TC-DEPLOY-ONLINE-03 | Execution name pre-filled | PASS | Pre-filled with source app name |
| TC-DEPLOY-ONLINE-04 | Source Application read-only | PASS | IBM Plex Mono display block shown |
| TC-DEPLOY-ONLINE-05 | Block A and Block B in summary | PASS | Both labels visible |
| TC-DEPLOY-ONLINE-06 | Online API called with correct body | PASS | applicationSettings + workflow in body |
| TC-DEPLOY-ONLINE-07 | Cancel closes modal | PASS | Modal unmounts cleanly |

## Regression

TC-APP-DESK-01 through TC-APP-DESK-10: all pass unchanged.

## Notes

- Old Deploy fields (Deploy URL, Username, Password, Environment) removed — confirmed not visible
- 3-step progress tracker removed — confirmed not rendered
- Success banner (green) shown on mock 200 response
- Error banner (red) shown on mock 4xx/5xx response
