import { Injectable, inject } from '@angular/core';
import { VocabularyService } from '../vocabulary.service';

/**
 * Service for managing TTS audio cache
 * Stores audio data in the vocabulary entries to avoid repeated API calls
 */
@Injectable({ providedIn: 'root' })
export class TtsCacheService {
  private vocabService = inject(VocabularyService);

  /**
   * Get cached audio for Swiss German word
   */
  getCachedSwissAudio(vocabularyId: string): string | null {
    const vocab = this.vocabService.getById(vocabularyId);
    return vocab?.audioCache?.swissGermanAudio ?? null;
  }

  /**
   * Cache audio for Swiss German word
   */
  cacheSwissAudio(vocabularyId: string, audioBase64: string): void {
    const vocab = this.vocabService.getById(vocabularyId);
    if (!vocab) return;

    const updated = {
      ...vocab,
      audioCache: {
        ...vocab.audioCache,
        swissGermanAudio: audioBase64,
      },
    };

    this.vocabService.update(updated.id, updated.german, updated.swissGerman, updated.audioCache);
  }

  /**
   * Get cached audio for example sentence
   */
  getCachedExampleAudio(vocabularyId: string): string | null {
    const vocab = this.vocabService.getById(vocabularyId);
    return vocab?.audioCache?.exampleSentenceAudio ?? null;
  }

  /**
   * Cache audio for example sentence
   */
  cacheExampleAudio(vocabularyId: string, audioBase64: string): void {
    const vocab = this.vocabService.getById(vocabularyId);
    if (!vocab) return;

    const updated = {
      ...vocab,
      audioCache: {
        ...vocab.audioCache,
        exampleSentenceAudio: audioBase64,
      },
    };

    this.vocabService.update(updated.id, updated.german, updated.swissGerman, updated.audioCache);
  }

  /**
   * Clear all cached audio
   */
  clearAllCache(): void {
    const all = this.vocabService.getAll();
    all.forEach(vocab => {
      if (vocab.audioCache) {
        this.vocabService.update(vocab.id, vocab.german, vocab.swissGerman, undefined);
      }
    });
  }

  /**
   * Clear cached audio for a specific vocabulary
   */
  clearVocabularyCache(vocabularyId: string): void {
    const vocab = this.vocabService.getById(vocabularyId);
    if (vocab && vocab.audioCache) {
      this.vocabService.update(vocab.id, vocab.german, vocab.swissGerman, undefined);
    }
  }

  /**
   * Get statistics about cached audio
   */
  getCacheStats(): { total: number; cached: number; cacheSize: number } {
    const all = this.vocabService.getAll();
    const cached = all.filter(v => v.audioCache?.swissGermanAudio || v.audioCache?.exampleSentenceAudio);

    // Estimate cache size (base64 strings)
    let cacheSize = 0;
    all.forEach(v => {
      if (v.audioCache?.swissGermanAudio) {
        cacheSize += v.audioCache.swissGermanAudio.length;
      }
      if (v.audioCache?.exampleSentenceAudio) {
        cacheSize += v.audioCache.exampleSentenceAudio.length;
      }
    });

    return {
      total: all.length,
      cached: cached.length,
      cacheSize: Math.round(cacheSize / 1024), // KB
    };
  }
}

