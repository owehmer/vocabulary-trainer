import { Injectable, signal } from '@angular/core';
import { Vocabulary, VerbConjugation, TrainingCard } from '../models/vocabulary.model';

const STORAGE_KEY = 'vokabel_vocabulary';

@Injectable({ providedIn: 'root' })
export class VocabularyService {
  private _vocabulary = signal<Vocabulary[]>(this.load());

  readonly vocabulary = this._vocabulary.asReadonly();

  private load(): Vocabulary[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      // Migrate old entries without type
      return items.map((item: any) => ({
        ...item,
        type: item.type || 'word',
      }));
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
      type: 'word',
    };
    const updated = [...this._vocabulary(), entry];
    this._vocabulary.set(updated);
    this.save(updated);
    return entry;
  }

  addVerb(infinitiveGerman: string, infinitiveSwiss: string, conjugations: VerbConjugation[]): Vocabulary {
    const entry: Vocabulary = {
      id: crypto.randomUUID(),
      german: infinitiveGerman,
      swissGerman: infinitiveSwiss,
      createdAt: new Date().toISOString(),
      type: 'verb',
      verbConjugations: conjugations,
    };
    const updated = [...this._vocabulary(), entry];
    this._vocabulary.set(updated);
    this.save(updated);
    return entry;
  }

  update(id: string, german: string, swissGerman: string): void {
    const updated = this._vocabulary().map(v =>
      v.id === id ? { ...v, german, swissGerman } : v
    );
    this._vocabulary.set(updated);
    this.save(updated);
  }

  updateVerb(id: string, infinitiveGerman: string, infinitiveSwiss: string, conjugations: VerbConjugation[]): void {
    const updated = this._vocabulary().map(v =>
      v.id === id ? { ...v, german: infinitiveGerman, swissGerman: infinitiveSwiss, verbConjugations: conjugations } : v
    );
    this._vocabulary.set(updated);
    this.save(updated);
  }

  delete(id: string): void {
    const updated = this._vocabulary().filter(v => v.id !== id);
    this._vocabulary.set(updated);
    this.save(updated);
  }

  /**
   * Get training cards from vocabulary entries.
   * For words: returns single card.
   * For verbs: returns card for each conjugation (tense + person).
   */
  getTrainingCards(): TrainingCard[] {
    const cards: TrainingCard[] = [];

    for (const vocab of this._vocabulary()) {
      if (vocab.type === 'word') {
        cards.push({
          id: vocab.id,
          german: vocab.german,
          swissGerman: vocab.swissGerman,
          sourceVocabId: vocab.id,
          isVerbConjugation: false,
        });
      } else if (vocab.type === 'verb' && vocab.verbConjugations) {
        // Add infinitive as separate card
        cards.push({
          id: vocab.id,
          german: vocab.german,
          swissGerman: vocab.swissGerman,
          sourceVocabId: vocab.id,
          isVerbConjugation: false,
        });

        // Add each conjugation as separate card
        for (const conj of vocab.verbConjugations) {
          cards.push({
            id: `${vocab.id}-${conj.tense}-${conj.person}`,
            german: `${conj.person} ${conj.germanForm} (${conj.tense})`,
            swissGerman: conj.swissGermanForm,
            sourceVocabId: vocab.id,
            isVerbConjugation: true,
            tense: conj.tense,
            person: conj.person,
          });
        }
      }
    }

    return cards;
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
