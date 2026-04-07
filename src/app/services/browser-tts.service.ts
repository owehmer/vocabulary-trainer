import { Injectable, signal } from '@angular/core';
import { ITtsProvider } from './tts-provider.interface';

/**
 * Browser Text-to-Speech provider
 * Uses the browser's built-in speech synthesis (fallback)
 */
@Injectable({ providedIn: 'root' })
export class BrowserTtsService implements ITtsProvider {
  private readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  private readonly speaking = signal(false);

  async speak(text: string, lang = 'de-CH'): Promise<void> {
    if (!this.supported) {
      throw new Error('Browser speech synthesis not supported');
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.speaking.set(false);
      return;
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      utterance.onstart = () => {
        this.speaking.set(true);
      };

      utterance.onend = () => {
        this.speaking.set(false);
        resolve();
      };

      utterance.onerror = (event) => {
        this.speaking.set(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (!this.supported) return;
    window.speechSynthesis.cancel();
    this.speaking.set(false);
  }

  isAvailable(): boolean {
    return this.supported;
  }

  getName(): string {
    return 'Browser TTS';
  }

  isSpeaking(): boolean {
    return this.speaking();
  }
}

