/**
 * Interface for Text-to-Speech providers
 * Allows switching between different TTS services (Browser, Plapperi, etc.)
 */
export interface ITtsProvider {
  /**
   * Speak Swiss German text
   * @param text - Swiss German text to speak
   * @returns Promise that resolves when speech starts or completes
   */
  speak(text: string): Promise<void>;

  /**
   * Stop current speech
   */
  stop(): void;

  /**
   * Check if this provider is available/configured
   * @returns true if the provider can be used
   */
  isAvailable(): boolean;

  /**
   * Get the name of this provider
   */
  getName(): string;

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean;
}

