# Task 006: Global Audio Cache for TTS

## Goal
Implement a global audio cache that persists independently of vocabulary entries. Audio should remain cached even when vocabularies are deleted or edited, and be reused when the same text is encountered again.

## Requirements
1. Store TTS audio data globally in localStorage (independent of vocabulary entries)
2. Cache audio by text content (case-insensitive)
3. Reuse cached audio when the same text is played, regardless of which vocabulary it belongs to
4. Preserve cache when vocabularies are deleted or edited
5. Display cached audio in settings with search and pagination
6. Show cache statistics (number of cached items, storage size)

## Implementation

### Model Changes
- **vocabulary.model.ts**: Removed audioCache field (no longer storing audio in vocabulary entries)

### New Service
- **audio-cache-storage.service.ts**: Global audio cache storage
  - Stores audio data by text (case-insensitive keys)
  - `getCachedAudio()`: Retrieve cached audio by text
  - `cacheAudio()`: Store audio in global cache
  - `hasCachedAudio()`: Check if text has cached audio
  - `getAllCached()`: Get all cached entries with metadata
  - `clearCachedAudio()`: Clear specific cached audio
  - `clearAllCache()`: Clear all cached audio
  - `getCacheStats()`: Get cache statistics (count, size)

### Service Updates
- **vocabulary.service.ts**: Removed audioCache parameter from update() method
- **plappari-tts.service.ts**: 
  - `speakAndCache()`: Generate audio and return data URL for caching
  - `playAudioData()`: Play audio from cached data URL
- **tts-manager.service.ts**: 
  - Replaced TtsCacheService with AudioCacheStorageService
  - Updated `speakWithCache()`: Check global cache by text before making API calls
  - Automatically caches new audio in global cache on first play

### Removed Services
- **tts-cache.service.ts**: Removed (replaced by AudioCacheStorageService)

### Component Updates
- **training-session.component.ts**:
  - `speakSwissGerman()`: Play Swiss word with global caching
  - `speakExampleSentence()`: Play example sentence with global caching
- **vocabulary-list.component.ts**: `speakSwissGerman()` with global caching
- **vocabulary-form.component.ts**: `speakSwissGerman()` with global caching
- **settings.component.ts**:
  - Uses AudioCacheStorageService instead of vocabulary-based cache
  - Added search functionality with `cacheSearchQuery` signal
  - Added pagination with 10 items per page
  - Added computed signals for filtered and paginated audio entries
  - `clearAllCache()`: Delete all cached audio
  - `clearAudioCache()`: Delete cache for specific text
  - `onSearchChange()`: Reset pagination when searching
  - `nextPage()`, `prevPage()`, `goToPage()`: Pagination controls

## Technical Details

### Cache Strategy
- Audio is stored globally by text content (case-insensitive)
- Cache key: lowercase, trimmed text (e.g., "velo")
- Cache persists independently of vocabulary entries
- Deleting or editing vocabularies does not affect cache
- Same text from different vocabularies uses same cached audio
- Browser TTS doesn't use cache (not needed for native TTS)
- Only Plapperi API calls are cached

### Storage
- Cache data stored separately in localStorage under `vokabel_audio_cache`
- Each entry includes: text, audio data (base64), timestamp
- Cache size is calculated and displayed in KB
- No automatic expiration - manual management only

### Cache Reuse
- When playing "Velo", checks if audio for "velo" (lowercase) exists
- If found, plays cached audio immediately
- If not found, calls API, caches result, then plays
- Next time "Velo" is played (from any vocabulary), uses cached audio
- Works across vocabulary additions, edits, and deletions

### User Experience
- Transparent caching - users don't need to manage it manually
- First play of any text queries API and caches result globally
- Subsequent plays of same text use cached audio (instant playback, no API call)
- Cache persists when vocabularies are deleted or edited
- When re-adding previously cached vocabulary, audio is instantly available
- Users can view and manage global cache in settings
- Search functionality to quickly find cached audio entries
- Pagination (10 items per page) for better performance with many entries
- Cache timestamps show when audio was first cached

## Benefits
1. **Reduced API Calls**: Audio cached once, reused forever
2. **Faster Performance**: No network latency for cached audio
3. **Persistent Cache**: Survives vocabulary edits and deletions
4. **Smart Reuse**: Same text from different vocabularies uses same cache
5. **Offline Support**: Previously cached audio works offline
6. **User Control**: Full visibility and management of cached data
7. **Scalability**: Pagination handles large caches efficiently
8. **Memory Efficient**: Only one cache entry per unique text

## Testing
- Play "Velo" → check that audio is cached globally
- Play "velo" again → verify it plays from cache (instant)
- Delete the vocabulary → verify cache still exists
- Add new vocabulary with "Velo" → verify it uses existing cache
- Edit vocabulary from "Velo" to "Velo2" → verify old cache remains
- Generate example sentence → check that it's cached separately
- Clear individual cache → verify audio is regenerated on next play
- Clear all cache → verify all audio must be regenerated
- Check cache statistics display correctly
- Test search and pagination with many cached entries

## Notes
- Global cache survives page reloads (localStorage)
- Cache persists independently of vocabularies
- Cache does not expire automatically
- Users can manually clear cache in settings
- Text matching is case-insensitive ("Velo" = "velo" = "VELO")
- Each unique text has one cache entry (no duplicates)
- Cache includes timestamps for reference

