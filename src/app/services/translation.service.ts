import { Injectable } from '@angular/core';
import { ITranslationProvider } from './translation-provider.interface';

const TRANSLATION_API_URL = 'https://demo-api.plapperi.ch/translate';

export interface TranslationRequest {
  text_de: string;
  dialect: string;
}

export interface TranslationResponse {
  text_de: string;
  text_ch: string;
  dialect: string;
}

@Injectable({ providedIn: 'root' })
export class TranslationService implements ITranslationProvider {
  private defaultDialect = 'zh'; // Zürich dialect

  // ITranslationProvider implementation
  isAvailable(): boolean {
    return true; // Plapperi API is always available (no API key required)
  }

  getName(): string {
    return 'Plapperi API';
  }

  async translateToSwissGerman(german: string): Promise<string> {
    const response = await this.translate(german, this.defaultDialect);
    return response.text_ch;
  }
  // End ITranslationProvider implementation

  /**
   * Translates German text to Swiss German using the Plapperi API
   * @param textDe - German text to translate
   * @param dialect - Swiss German dialect (default: 'zh' for Zürich)
   * @returns Promise with the translation response
   */
  async translate(textDe: string, dialect: string = 'ag'): Promise<TranslationResponse> {
    if (!textDe || textDe.trim().length === 0) {
      throw new Error('Text darf nicht leer sein.');
    }

    const requestBody: TranslationRequest = {
      text_de: textDe.trim(),
      dialect: dialect,
    };

    try {
      const response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }

      const data: TranslationResponse = await response.json();

      if (!data.text_ch) {
        throw new Error('Ungültige API-Antwort: text_ch fehlt.');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Übersetzung fehlgeschlagen: ${error.message}`);
      }
      throw new Error('Übersetzung fehlgeschlagen: Unbekannter Fehler.');
    }
  }

  /**
   * Get list of available dialects
   * Currently only 'ag' (Aargau) is documented
   */
  getAvailableDialects(): Array<{ code: string; name: string }> {
    return [
      { code: 'ag', name: 'Aargau' },
      { code: 'zh', name: 'Zürich' },
      { code: 'be', name: 'Bern' },
      { code: 'bs', name: 'Basel' },
    ];
  }
}


