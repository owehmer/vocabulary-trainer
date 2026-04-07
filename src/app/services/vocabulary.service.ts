import { Injectable, signal } from '@angular/core';
import { Vocabulary } from '../models/vocabulary.model';

const STORAGE_KEY = 'vokabel_vocabulary';

@Injectable({ providedIn: 'root' })
export class VocabularyService {
  private _vocabulary = signal<Vocabulary[]>(this.load());

  readonly vocabulary = this._vocabulary.asReadonly();

  private load(): Vocabulary[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: Vocabulary[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  getAll(): Vocabulary[] {
    return this._vocabulary();
  }

  getById(id: string): Vocabulary | undefined {
    return this._vocabulary().find(v => v.id === id);
  }

  add(german: string, swissGerman: string): Vocabulary {
    const entry: Vocabulary = {
      id: crypto.randomUUID(),
      german,
      swissGerman,
      createdAt: new Date().toISOString(),
    };
    const updated = [...this._vocabulary(), entry];
    this._vocabulary.set(updated);
    this.save(updated);
    return entry;
  }

  update(id: string, german: string, swissGerman: string, audioCache?: { swissGermanAudio?: string; exampleSentenceAudio?: string }): void {
    const updated = this._vocabulary().map(v =>
      v.id === id ? { ...v, german, swissGerman, audioCache } : v
    );
    this._vocabulary.set(updated);
    this.save(updated);
  }

  delete(id: string): void {
    const updated = this._vocabulary().filter(v => v.id !== id);
    this._vocabulary.set(updated);
    this.save(updated);
  }

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this._vocabulary(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vokabeln.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importJson(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const imported: Vocabulary[] = JSON.parse(e.target!.result as string);
          const existing = this._vocabulary();
          const existingIds = new Set(existing.map(v => v.id));
          const newEntries = imported.filter(v => !existingIds.has(v.id));
          const merged = [...existing, ...newEntries];
          this._vocabulary.set(merged);
          this.save(merged);
          resolve(newEntries.length);
        } catch {
          reject(new Error('Ungültige JSON-Datei'));
        }
      };
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      reader.readAsText(file);
    });
  }
}
