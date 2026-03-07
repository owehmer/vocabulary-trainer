# 002 - Environment File for Claude API Key

## Goal
Add a gitignored environment file so the Claude API key can be set at build time
without entering it manually in the Settings UI.

## Requirements
- `src/environments/environment.ts` — gitignored, holds the actual API key
- `src/environments/environment.example.ts` — committed template with empty key
- `.gitignore` updated to exclude `environment.ts`
- `ClaudeService.getApiKey()` prefers the env key, falls back to localStorage

## Key resolution order
1. `environment.claudeApiKey` (compile-time, from `environment.ts`)
2. `vokabel_api_key` in localStorage (set via Settings page)

## Acceptance Criteria
- [ ] `environment.ts` is not tracked by git
- [ ] `environment.example.ts` is committed as a setup guide
- [ ] App builds without errors
- [ ] Claude API calls use the env key automatically when set
