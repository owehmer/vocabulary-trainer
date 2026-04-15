# 009 - Fix TTS Audio Cache Not Being Used for New Vocabulary

## Issue

When creating a new vocabulary entry and clicking the TTS speaker button multiple times, every click triggered a network request to the Plapperi API. The audio should be cached after the first playback.

## Root Cause

In `vocabulary-form.component.ts`, the `speakSwissGerman()` method was checking `if (this.isEdit && this.editId())` before using the cache. For new entries (not yet saved), it fell back to `ttsManager.speak()` which doesn't use caching at all.

However, the `AudioCacheStorageService` caches audio by **text content**, not by vocabulary ID. This means caching works regardless of whether the vocabulary entry exists yet.

## Solution

Changed `speakSwissGerman()` to always use `ttsManager.speakWithCache(text)` since the cache is text-based and works for both new and existing vocabulary entries.

Also simplified the `speakWithCache()` method signature by removing the unused `vocabularyId` and `cacheType` parameters, as the cache is purely text-based.

## Files Changed

- `src/app/components/vocabulary-form/vocabulary-form.component.ts` - Always use `speakWithCache()`
- `src/app/services/tts/tts-manager.service.ts` - Simplified method signature
- `src/app/components/vocabulary-list/vocabulary-list.component.ts` - Updated call to match new signature
- `src/app/components/training-session/training-session.component.ts` - Updated calls to match new signature

## Testing

1. Create a new vocabulary entry
2. Enter Swiss German text
3. Click the speaker button multiple times
4. Only the first click should trigger a network request (check Network tab in DevTools)
5. Subsequent clicks should play from cache (no network request)

