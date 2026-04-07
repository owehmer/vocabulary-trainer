import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ITtsProvider } from './tts-provider.interface';

interface PlappariResponse {
  text: string;
  dialect: string;
  voice_id: string;
  audio: string;
  format: string;
}

/**
 * Plapperi Text-to-Speech provider
 * Uses the Plapperi API for authentic Swiss German pronunciation
 */
@Injectable({ providedIn: 'root' })
export class PlappariTtsService implements ITtsProvider {
  private readonly apiUrl = 'https://demo-api.plapperi.ch/synthesize';
  private readonly speaking = signal(false);
  private currentAudio: HTMLAudioElement | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Speak text and return the audio data URL for caching
   */
  async speakAndCache(text: string, voiceId = 'aragon'): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<PlappariResponse>(this.apiUrl, {
        text_ch: text,
        voice_id: voiceId
      })
    );

    return `data:audio/${response.format};base64,${response.audio}`;
  }

  /**
   * Play audio from a data URL (cached or fresh)
   */
  async playAudioData(audioData: string): Promise<void> {
    if (this.speaking()) {
      this.stop();
      return;
    }

    try {
      this.speaking.set(true);
      const audio = new Audio(audioData);
      this.currentAudio = audio;

      audio.onended = () => {
        this.speaking.set(false);
        this.currentAudio = null;
      };

      audio.onerror = () => {
        this.speaking.set(false);
        this.currentAudio = null;
        console.error('Error playing audio');
      };

      await audio.play();
    } catch (error) {
      this.speaking.set(false);
      this.currentAudio = null;
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async speak(text: string, voiceId = 'aragon'): Promise<void> {
    try {
      const audioData = await this.speakAndCache(text, voiceId);
      await this.playAudioData(audioData);
    } catch (error) {
      this.speaking.set(false);
      this.currentAudio = null;
      console.error('Error calling Plapperi TTS API:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.speaking.set(false);
  }

  isAvailable(): boolean {
    // Plapperi is always available (no API key required)
    return true;
  }

  getName(): string {
    return 'Plapperi (Schweizer TTS)';
  }

  isSpeaking(): boolean {
    return this.speaking();
  }
}

