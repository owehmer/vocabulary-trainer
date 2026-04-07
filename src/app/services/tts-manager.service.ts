import { Injectable, inject } from '@angular/core';
import { ITtsProvider } from './tts-provider.interface';
import { PlappariTtsService } from './plappari-tts.service';
import { BrowserTtsService } from './browser-tts.service';

const PROVIDER_STORAGE = 'vokabel_tts_provider';

export type TtsProviderType = 'plapperi' | 'browser';

/**
 * Manager service that provides a unified interface for Text-to-Speech
 * Handles switching between different TTS providers
 */
@Injectable({ providedIn: 'root' })
export class TtsManagerService {
  private plapperiService = inject(PlappariTtsService);
  private browserService = inject(BrowserTtsService);

  /**
   * Get the current active TTS provider
   */
  getCurrentProvider(): ITtsProvider {
    const preferredType = this.getPreferredProviderType();

    // Try to use preferred provider if available
    if (preferredType === 'plapperi' && this.plapperiService.isAvailable()) {
      return this.plapperiService;
    }

    if (preferredType === 'browser' && this.browserService.isAvailable()) {
      return this.browserService;
    }

    // Fallback to Plapperi (always available), then browser
    if (this.plapperiService.isAvailable()) {
      return this.plapperiService;
    }

    return this.browserService;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): ITtsProvider[] {
    return [this.plapperiService, this.browserService].filter(p => p.isAvailable());
  }

  /**
   * Speak text using the current provider
   */
  async speak(text: string): Promise<void> {
    // Check if either provider is currently speaking
    if (this.plapperiService.isSpeaking() || this.browserService.isSpeaking()) {
      this.stop();
      return;
    }

    const provider = this.getCurrentProvider();

    try {
      await provider.speak(text);
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    // Stop both providers to be safe
    this.plapperiService.stop();
    this.browserService.stop();
  }

  /**
   * Get the preferred provider type from storage
   */
  getPreferredProviderType(): TtsProviderType {
    const stored = localStorage.getItem(PROVIDER_STORAGE);
    return (stored === 'browser' || stored === 'plapperi') ? stored : 'plapperi';
  }

  /**
   * Set the preferred provider type
   */
  setPreferredProviderType(type: TtsProviderType): void {
    localStorage.setItem(PROVIDER_STORAGE, type);
  }

  /**
   * Get the name of the current provider
   */
  getCurrentProviderName(): string {
    return this.getCurrentProvider().getName();
  }

  /**
   * Check if any TTS provider is available
   */
  isAvailable(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  /**
   * Check if currently speaking
   * Returns true if any provider is currently speaking
   */
  isSpeaking(): boolean {
    return this.plapperiService.isSpeaking() || this.browserService.isSpeaking();
  }
}




