# PM Doc v45.0 — Deploy Rewrite: Online API Integration

**Version:** 45.0  
**Date:** 2026-04-21  
**Status:** SHIPPED  
**Label:** `TODO-deploy-rewrite-online-api-workflow-json`

## Summary

Rewrote the Deploy modal to call the **online API** directly instead of the previous three-step remote deploy process. The deployment now sends the current application's settings and workflow as a structured two-block payload to the online execution engine.

## Problem

The previous Deploy flow required users to supply a remote Deploy URL, username, password, and environment, then performed three sequential API calls (CreateApplicationName → UpdateApplicationName → SaveWorkflow). This was complex, credential-heavy, and did not leverage the platform's online execution engine.

## Solution

Simplified to a single online API call with:
- **Execution Application Name** field (pre-filled from source app, editable)
- **Block A**: current application settings from operation API
- **Block B**: current workflow from operation API

## What Changed

### Before (v42.0)
- 5 form fields: Deploy URL, Application Name, Username, Password, Environment
- 3-step progress tracker (Create → Update → Save)
- Basic Auth with user-supplied credentials
- CORS proxy routing for cross-origin URLs

### After (v45.0)
- 1 editable field: Execution Application Name (pre-filled)
- 1 read-only display: Source Application
- Payload Summary panel showing Block A and Block B
- Single call to `onlineApi.postWorkflow`
- No credentials required

## User Flow

1. User clicks **Deploy** in Applications table Actions column
2. Deploy modal opens — execution name pre-filled from source application
3. User adjusts execution name if deploying to a different runtime context
4. User clicks **Deploy** → online API called with `applicationName` query param and two-block JSON body
5. Success banner shown on 200 response; error message on failure

## Notes

- The actual deploy workflow logic (CreateApplicationName → UpdateApplicationName → SaveWorkflow) will be implemented as a workflow in the online API by a separate task
- Body structure (`applicationSettings` + `workflow`) is agreed upon as the contract between Hub UI and the deploy workflow
