# 010 - TTS Provider Settings

## Task Description
Add TTS (Text-to-Speech) provider selection to the Settings page, similar to the existing translation provider selection.

## Requirements
- Allow users to choose between available TTS providers in Settings
- Support switching between "Plapperi API" and "Browser TTS"
- Persist the preference in localStorage
- Display provider descriptions to help users choose

## Implementation

### Changes Made

1. **TtsManagerService** (`src/app/services/tts/tts-manager.service.ts`)
   - Made `getPreferredProviderType()` method public (was private)
   - This allows the Settings component to read the current preference

2. **SettingsComponent** (`src/app/components/settings/settings.component.ts`)
   - Added `TtsManagerService` injection
   - Added `selectedTtsProvider` signal for the selected TTS provider
   - Updated `save()` method to persist TTS provider preference

3. **Settings Template** (`src/app/components/settings/settings.component.html`)
   - Added "Text-to-Speech Service" section with radio button selection
   - Two options:
     - **Plapperi API (kostenlos)**: Natural Swiss dialect pronunciation, supports caching
     - **Browser TTS**: Native browser speech synthesis, available offline

## User Interface

The new TTS settings section appears between the Translation Provider selection and the Claude API Key section. It follows the same visual pattern as the translation provider selection for consistency.

## Technical Notes
- The TTS provider preference is stored in localStorage under the key `vokabel_tts_provider`
- Valid values are: `plapperi` or `browser`
- Default provider is `plapperi`
- Only Plapperi provider supports audio caching

