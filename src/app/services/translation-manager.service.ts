import { Injectable, inject } from '@angular/core';
import { ITranslationProvider } from './translation-provider.interface';
import { ClaudeService } from './claude.service';
import { TranslationService } from './translation.service';

const PROVIDER_STORAGE = 'vokabel_translation_provider';

export type ProviderType = 'plapperi' | 'claude';

/**
 * Manager service that provides a unified interface for translation
 * Handles switching between different translation providers
 */
@Injectable({ providedIn: 'root' })
export class TranslationManagerService {
  private claudeService = inject(ClaudeService);
  private plapperiService = inject(TranslationService);

  /**
   * Get the current active translation provider
   */
  getCurrentProvider(): ITranslationProvider {
    const preferredType = this.getPreferredProviderType();

    // Try to use preferred provider if available
    if (preferredType === 'claude' && this.claudeService.isAvailable()) {
      return this.claudeService;
    }

    // Fallback to Plapperi (always available)
    return this.plapperiService;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): ITranslationProvider[] {
    return [this.plapperiService, this.claudeService].filter(p => p.isAvailable());
  }

  /**
   * Translate text using the current provider
   */
  async translate(german: string): Promise<string> {
    const provider = this.getCurrentProvider();
    return provider.translateToSwissGerman(german);
  }

  /**
   * Get the preferred provider type from storage
   */
  getPreferredProviderType(): ProviderType {
    const stored = localStorage.getItem(PROVIDER_STORAGE);
    return (stored === 'claude' || stored === 'plapperi') ? stored : 'plapperi';
  }

  /**
   * Set the preferred provider type
   */
  setPreferredProviderType(type: ProviderType): void {
    localStorage.setItem(PROVIDER_STORAGE, type);
  }

  /**
   * Get the name of the current provider
   */
  getCurrentProviderName(): string {
    return this.getCurrentProvider().getName();
  }

  /**
   * Check if any translation provider is available
   */
  isAvailable(): boolean {
    return this.getAvailableProviders().length > 0;
  }
}

