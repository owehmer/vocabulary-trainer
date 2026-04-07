# Task 004: Plapperi Translation API Integration

## Goal
Integrate the Plapperi REST API as an alternative translation provider alongside the existing Claude AI service. This gives users a free translation option that doesn't require an API key.

## Requirements
- Create a new `TranslationService` to handle the Plapperi API
- API endpoint: `POST https://demo-api.plapperi.ch/translate`
- Request format: `{"text_de":"German text","dialect":"ag"}`
- Response format: `{"text_de":"German text","text_ch":"Swiss translation","dialect":"ag"}`
- Update the vocabulary form to offer both translation providers
- Make Plapperi the default option (free, no API key needed)
- Keep Claude AI as an alternative option (via dropdown menu)

## Implementation

### 1. TranslationService
Created `/src/app/services/translation.service.ts`:
- `translateToSwissGerman(textDe, dialect)` - Main translation method
- Default dialect: 'ag' (Aargau), but supports 'zh' (Zürich), 'be' (Bern), 'bs' (Basel)
- Error handling for network issues and invalid responses
- `getAvailableDialects()` - Returns list of supported Swiss German dialects

### 2. VocabularyFormComponent Updates
Enhanced `/src/app/components/vocabulary-form/vocabulary-form.component.ts`:
- Injected `TranslationService`
- Added `generateWithPlapperi()` - Uses Plapperi API with Zürich dialect
- Added `generateWithClaude()` - Uses existing Claude AI
- Modified `generate()` to default to Plapperi

Updated `/src/app/components/vocabulary-form/vocabulary-form.component.html`:
- Replaced single generate button with a split-button design
- Main button triggers Plapperi translation
- Dropdown menu allows choosing between:
  - Plapperi API (Zürich) - always available
  - Claude AI - requires API key
- Updated info text to mention both providers

### 3. UI Styling
Updated `/src/app/components/vocabulary-form/vocabulary-form.component.css`:
- Created `.button-group` styling for split button
- Seamlessly connected main button and dropdown
- Maintains Material Design appearance

## Benefits
- Users can translate without needing a Claude API key
- Free Plapperi API is the default option
- Claude AI still available for users who prefer it
- Flexible dialect selection (currently using Zürich dialect)
- Better user experience with clear provider selection

## Technical Notes
- Plapperi API requires no authentication
- Uses native `fetch` API (same as Claude service)
- Zürich dialect ('zh') chosen as default since the app is specifically for Zürichdeutsch
- Error messages are user-friendly and in German
- Both services use the same async/await pattern for consistency

## Future Enhancements
- Add dialect selection UI for Plapperi (allow user to choose AG, ZH, BE, BS)
- Cache translations to reduce API calls
- Add translation quality feedback mechanism
- Consider adding more translation providers

