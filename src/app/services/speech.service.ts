import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  readonly speaking = signal(false);

  speak(text: string, lang = 'de-CH'): void {
    if (!this.supported) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.speaking.set(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => this.speaking.set(true);
    utterance.onend = () => this.speaking.set(false);
    utterance.onerror = () => this.speaking.set(false);
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (!this.supported) return;
    window.speechSynthesis.cancel();
    this.speaking.set(false);
  }
}
