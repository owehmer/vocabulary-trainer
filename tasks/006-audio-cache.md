# Task 006: Audio Cache for TTS

## Goal
Implement local caching of TTS audio to avoid unnecessary API calls and improve performance.

## Requirements
1. Store TTS audio data locally in localStorage (via vocabulary entries)
2. Cache both Swiss German word audio and example sentence audio
3. Only query the API when generating new audio or when cache is missing
4. Display cached vocabularies in settings with cache management options
5. Show cache statistics (number of cached items, storage size)

## Implementation

### Model Changes
- **vocabulary.model.ts**: Added optional `audioCache` field to store base64-encoded audio data
  - `swissGermanAudio`: Cached audio for Swiss German word
  - `exampleSentenceAudio`: Cached audio for example sentences

### New Service
- **tts-cache.service.ts**: Manages TTS audio cache
  - `getCachedSwissAudio()`: Retrieve cached Swiss word audio
  - `cacheSwissAudio()`: Store Swiss word audio in cache
  - `getCachedExampleAudio()`: Retrieve cached example sentence audio
  - `cacheExampleAudio()`: Store example sentence audio in cache
  - `clearAllCache()`: Clear all cached audio data
  - `clearVocabularyCache()`: Clear cache for specific vocabulary
  - `getCacheStats()`: Get cache statistics (total, cached count, size)

### Service Updates
- **vocabulary.service.ts**: Updated `update()` method to accept optional `audioCache` parameter
- **plappari-tts.service.ts**: 
  - Added `speakAndCache()`: Generate audio and return data URL for caching
  - Added `playAudioData()`: Play audio from cached data URL
  - Refactored `speak()` to use new methods
- **tts-manager.service.ts**: 
  - Integrated TtsCacheService
  - Added `speakWithCache()`: Speak with automatic caching support
  - Checks cache before making API calls
  - Automatically caches new audio on first play

### Component Updates
- **training-session.component.ts**:
  - Added `speakSwissGerman()`: Play Swiss word with caching
  - Added `speakExampleSentence()`: Play example sentence with caching
- **vocabulary-list.component.ts**: Added `speakSwissGerman()` with caching
- **vocabulary-form.component.ts**: Added `speakSwissGerman()` with caching (only when editing)
- **settings.component.ts**:
  - Added cache statistics display
  - Added search functionality with `cacheSearchQuery` signal
  - Added pagination with 10 items per page
  - Added computed signals for filtered and paginated vocabularies
  - Added `clearAllCache()`: Delete all cached audio
  - Added `clearVocabCache()`: Delete cache for specific vocabulary
  - Added `onSearchChange()`: Reset pagination when searching
  - Added `nextPage()`, `prevPage()`, `goToPage()`: Pagination controls

### UI Changes
- **settings.component.html**:
  - New "Audio Cache" section showing:
    - Cache statistics (count and size)
    - Search field to filter cached vocabularies
    - Paginated list of cached vocabularies (10 per page)
    - Badges indicating what's cached (word vs. example sentence)
    - Individual delete buttons for each vocabulary cache
    - "Delete All" button to clear entire cache
    - Pagination controls (previous/next, page indicator)
- **settings.component.css**: Added styling for cache section, search field, and pagination

## Technical Details

### Cache Strategy
- Audio is stored as base64-encoded data URLs in localStorage
- Cache is tied to vocabulary entries (survives deletion of individual entries)
- Browser TTS doesn't use cache (not needed for native TTS)
- Only Plapperi API calls are cached

### Storage
- Cache data is stored alongside vocabulary in localStorage
- No separate cache storage - integrated with vocabulary entries
- Cache size is estimated in KB for display

### User Experience
- Transparent caching - users don't need to manage it manually
- First play of a word/sentence queries API and caches result
- Subsequent plays use cached audio (instant playback, no API call)
- Users can view and manage cache in settings if needed
- Search functionality to quickly find cached vocabularies
- Pagination (10 items per page) for better performance with many vocabularies
- Clear visual indicators showing what's cached for each vocabulary

## Benefits
1. Reduced API calls to Plapperi service
2. Faster audio playback (no network latency)
3. Works offline for previously cached audio
4. Automatic cache management
5. User control over cache via settings

## Testing
- Play a Swiss German word → check that audio is cached
- Play same word again → verify it plays from cache (instant)
- Generate example sentence → check that it's cached separately
- Clear individual cache → verify audio is regenerated on next play
- Clear all cache → verify all audio must be regenerated
- Check cache statistics display correctly
- Export/import vocabulary → verify cache is preserved

## Notes
- Cache survives page reloads (localStorage)
- Cache does not expire automatically
- Users can manually clear cache in settings
- Example sentences are only cached if Claude API is configured
- New vocabularies start without cache (generated on first play)

