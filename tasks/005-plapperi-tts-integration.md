# 005 - Plapperi TTS Integration with Manager Pattern

## Goal
Integrate Plapperi Swiss German Text-to-Speech API with a centralized TTS manager service that provides a unified interface for multiple TTS providers (Plapperi and Browser TTS).

## Requirements
- Create a provider-based architecture for TTS services (similar to translation services)
- Implement Plapperi TTS as the default provider
- Support browser's built-in speech synthesis as fallback
- Make POST request to https://demo-api.plapperi.ch/synthesize
- Receive and play base64-encoded audio response
- Support stopping playback and switching between providers
- Provide visual feedback while audio is playing

## Implementation

### 1. TTS Provider Interface
**File:** `src/app/services/tts-provider.interface.ts`

Defines the contract for all TTS providers:
- `speak(text: string): Promise<void>` - Speak Swiss German text
- `stop(): void` - Stop current speech
- `isAvailable(): boolean` - Check if provider is available
- `getName(): string` - Get provider name
- `isSpeaking(): boolean` - Check if currently speaking

### 2. Plapperi TTS Service
**File:** `src/app/services/plappari-tts.service.ts`

Implements `ITtsProvider` interface:
- Uses HttpClient for API calls
- Decodes base64 audio from API response
- Creates data URL for audio playback: `data:audio/wav;base64,{audio}`
- Uses HTML5 Audio API for playback
- Manages speaking state with signals
- Always available (no API key required)

**API Details:**
- **Endpoint:** `https://demo-api.plapperi.ch/synthesize`
- **Request:**
  ```json
  {
    "text_ch": "Guete Morge",
    "voice_id": "aragon"
  }
  ```
- **Response:**
  ```json
  {
    "text": "Guete Morge",
    "dialect": "ag",
    "voice_id": "aragon",
    "audio": "UklGRiRo...", // base64 encoded WAV
    "format": "wav"
  }
  ```

### 3. Browser TTS Service
**File:** `src/app/services/browser-tts.service.ts`

Implements `ITtsProvider` interface:
- Uses browser's built-in `speechSynthesis` API
- Fallback option when Plapperi is not preferred
- Checks browser support via `'speechSynthesis' in window`
- Uses Swiss German locale (`de-CH`)

### 4. TTS Manager Service
**File:** `src/app/services/tts-manager.service.ts`

Central manager that:
- Injects both Plapperi and Browser TTS services
- Provides unified `speak()` and `stop()` methods
- Manages provider selection (default: Plapperi)
- Stores user preference in localStorage (`vokabel_tts_provider`)
- Exposes `speaking` signal for UI state
- Methods:
  - `speak(text: string)` - Speak using current provider
  - `stop()` - Stop current speech
  - `getCurrentProvider()` - Get active provider
  - `getAvailableProviders()` - List available providers
  - `setPreferredProviderType()` - Set user preference
  - `getCurrentProviderName()` - Get provider name for tooltips

### 5. Updated Components
**Files:**
- `src/app/components/vocabulary-form/vocabulary-form.component.ts`
- `src/app/components/vocabulary-form/vocabulary-form.component.html`
- `src/app/components/training-session/training-session.component.ts`
- `src/app/components/training-session/training-session.component.html`

Changes:
- Replaced `SpeechService` with `TtsManagerService`
- Updated all speak button calls to use `ttsManager.speak()`
- Updated speaking state checks to use `ttsManager.isSpeaking()`
- Updated tooltips to show current provider: `'Aussprechen mit ' + ttsManager.getCurrentProviderName()`
- Removed conditional rendering (TTS always available)

### 6. Legacy Service
**File:** `src/app/services/speech.service.ts`

- Marked as `@deprecated` with recommendation to use `TtsManagerService`
- Kept for backward compatibility
- All methods deprecated with JSDoc comments

## Architecture Benefits
1. **Provider Pattern:** Easy to add new TTS providers in the future
2. **Centralized Management:** Single entry point for all TTS operations
3. **Consistent with Translation:** Same architecture as translation services
4. **User Control:** Users can switch between providers
5. **Graceful Fallback:** Browser TTS available if Plapperi fails
6. **Type Safety:** Interface ensures all providers implement required methods

## Provider Comparison

| Feature | Plapperi TTS | Browser TTS |
|---------|-------------|-------------|
| Voice Quality | High (authentic Swiss German) | Varies by browser |
| Availability | Always (demo API) | Depends on browser support |
| API Key | Not required | N/A |
| Offline Support | No (requires internet) | Yes |
| Default | ✓ | Fallback |

## Testing
- Test vocabulary form speak button with both providers
- Test training session flashcard mode
- Test training session type-in mode feedback
- Test example sentence playback
- Verify audio plays correctly with Plapperi
- Verify fallback to browser TTS works
- Test stop functionality
- Check provider switching (when settings UI added)
- Verify speaking state updates correctly

## Future Enhancements
- Add TTS provider selection in settings UI
- Support additional Plapperi voices beyond "aragon"
- Cache audio responses for repeated words
- Add playback speed control
- Support for other Swiss German dialects
- Error recovery and retry logic


