/**
 * Interface for translation providers
 * Allows switching between different translation services (Claude, Plapperi, etc.)
 */
export interface ITranslationProvider {
  /**
   * Translate German text to Swiss German
   * @param german - German text to translate
   * @returns Promise with Swiss German translation
   */
  translateToSwissGerman(german: string): Promise<string>;

  /**
   * Check if this provider is available/configured
   * @returns true if the provider can be used
   */
  isAvailable(): boolean;

  /**
   * Get the name of this provider
   */
  getName(): string;
}

