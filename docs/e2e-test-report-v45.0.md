# E2E Test Report v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21  
**Spec:** `e2e/deploy-online.spec.ts`  
**Result:** ✅ 7/7 PASS

## Test Run Summary

| Suite | Total | Pass | Fail | Skip |
|-------|-------|------|------|------|
| TC-DEPLOY-ONLINE (Desktop) | 7 | 7 | 0 | 0 |

## Individual Results

| ID | Test | Status | Duration |
|----|------|--------|----------|
| TC-DEPLOY-ONLINE-01 | Deploy button visible | PASS | ~1s |
| TC-DEPLOY-ONLINE-02 | Modal opens with correct title | PASS | ~2s |
| TC-DEPLOY-ONLINE-03 | Execution name pre-filled | PASS | ~2s |
| TC-DEPLOY-ONLINE-04 | Source Application read-only shown | PASS | ~2s |
| TC-DEPLOY-ONLINE-05 | Payload Summary Block A + B | PASS | ~2s |
| TC-DEPLOY-ONLINE-06 | Online API called with correct structure | PASS | ~4s |
| TC-DEPLOY-ONLINE-07 | Cancel closes modal | PASS | ~2s |

## Notes

- Online API mocked via `page.route(/\/api\/proxy\/online\/workflow/)` → 200 OK
- TC-DEPLOY-ONLINE-06 verifies URL has `applicationName` query param and body contains `applicationSettings` + `workflow` keys
- No real backend required for any test case
