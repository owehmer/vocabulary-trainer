# 003 - Text-to-Speech

## Goal
Add text-to-speech playback using the browser's Web Speech API so users can hear
vocabulary entries and example sentences spoken aloud.

## Requirements
- `SpeechService`: wraps `SpeechSynthesis`, exposes `speak(text, lang)` and `speaking` signal
- Language codes: Swiss German → `de-CH`, Standard German → `de-DE`
- Play buttons added to:
  - `VocabularyListComponent`: speak Swiss German per row
  - `VocabularyFormComponent`: speak the Swiss German field value
  - `TrainingSessionComponent`: speak Swiss German on card reveal + speak example sentence
- Button shows a stop icon while speaking and returns to play when done
- Graceful degradation: button hidden if `speechSynthesis` not available in browser

## Acceptance Criteria
- [ ] `SpeechService` created at `src/app/services/speech.service.ts`
- [ ] Clicking play speaks the text in `de-CH`
- [ ] Clicking again while speaking stops playback
- [ ] Play buttons visible in vocabulary list, form, and training session
- [ ] No errors when `speechSynthesis` is unavailable
