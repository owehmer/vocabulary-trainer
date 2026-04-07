import { Injectable } from '@angular/core';

const AUDIO_CACHE_KEY = 'vokabel_audio_cache';

interface AudioCacheEntry {
  text: string;
  audio: string; // base64 audio data
  cachedAt: string; // ISO timestamp
}

/**
 * Global audio cache storage service
 * Stores audio data by text (independent of vocabulary entries)
 * Cache persists even when vocabularies are deleted or edited
 */
@Injectable({ providedIn: 'root' })
export class AudioCacheStorageService {
  private cache: Map<string, AudioCacheEntry> = new Map();

  constructor() {
    this.loadCache();
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): void {
    try {
      const raw = localStorage.getItem(AUDIO_CACHE_KEY);
      if (raw) {
        const entries: AudioCacheEntry[] = JSON.parse(raw);
        this.cache = new Map(entries.map(e => [e.text.toLowerCase(), e]));
      }
    } catch (error) {
      console.error('Error loading audio cache:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(): void {
    try {
      const entries = Array.from(this.cache.values());
      localStorage.setItem(AUDIO_CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving audio cache:', error);
    }
  }

  /**
   * Get cached audio for text
   */
  getCachedAudio(text: string): string | null {
    const key = text.toLowerCase().trim();
    const entry = this.cache.get(key);
    return entry?.audio ?? null;
  }

  /**
   * Cache audio for text
   */
  cacheAudio(text: string, audioData: string): void {
    const key = text.toLowerCase().trim();
    const entry: AudioCacheEntry = {
      text: key,
      audio: audioData,
      cachedAt: new Date().toISOString(),
    };
    this.cache.set(key, entry);
    this.saveCache();
  }

  /**
   * Check if text has cached audio
   */
  hasCachedAudio(text: string): boolean {
    const key = text.toLowerCase().trim();
    return this.cache.has(key);
  }

  /**
   * Get all cached entries
   */
  getAllCached(): AudioCacheEntry[] {
    return Array.from(this.cache.values()).sort((a, b) =>
      b.cachedAt.localeCompare(a.cachedAt)
    );
  }

  /**
   * Clear specific cached audio
   */
  clearCachedAudio(text: string): void {
    const key = text.toLowerCase().trim();
    this.cache.delete(key);
    this.saveCache();
  }

  /**
   * Clear all cached audio
   */
  clearAllCache(): void {
    this.cache.clear();
    this.saveCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { count: number; sizeKB: number } {
    const entries = Array.from(this.cache.values());
    let totalSize = 0;

    entries.forEach(entry => {
      totalSize += entry.audio.length;
      totalSize += entry.text.length;
    });

    return {
      count: entries.length,
      sizeKB: Math.round(totalSize / 1024),
    };
  }
}

