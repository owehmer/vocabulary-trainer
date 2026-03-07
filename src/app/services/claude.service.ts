import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const API_KEY_STORAGE = 'vokabel_api_key';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export interface ExampleSentence {
  swiss: string;
  german: string;
}

@Injectable({ providedIn: 'root' })
export class ClaudeService {
  getApiKey(): string {
    return environment.claudeApiKey || localStorage.getItem(API_KEY_STORAGE) || '';
  }

  saveApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  }

  hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  private async callClaude(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Kein Claude API-Key hinterlegt. Bitte unter Einstellungen eintragen.');
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `API-Fehler: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() ?? '';
  }

  async generateSwissGerman(german: string): Promise<string> {
    const prompt = `Übersetze das folgende deutsche Wort oder den Satz ins Zürichdeutsche (Schweizerdeutsch). Antworte NUR mit der Übersetzung, ohne Erklärungen, ohne Anführungszeichen.

Deutsch: ${german}`;
    return this.callClaude(prompt);
  }

  async generateExampleSentence(german: string, swissGerman: string): Promise<ExampleSentence> {
    const prompt = `Erstelle einen natürlichen Beispielsatz auf Zürichdeutsch, der das Wort oder den Ausdruck "${swissGerman}" (Hochdeutsch: "${german}") enthält.

Antworte exakt in diesem Format (zwei Zeilen):
Zürichdeutsch: [Satz auf Zürichdeutsch]
Deutsch: [Deutsche Übersetzung]`;

    const text = await this.callClaude(prompt);
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const swissLine = lines.find(l => l.startsWith('Zürichdeutsch:'));
    const germanLine = lines.find(l => l.startsWith('Deutsch:'));

    return {
      swiss: swissLine?.replace('Zürichdeutsch:', '').trim() ?? text,
      german: germanLine?.replace('Deutsch:', '').trim() ?? '',
    };
  }
}
