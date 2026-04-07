export type VocabularyType = 'word' | 'verb';

export interface Vocabulary {
  id: string;
  german: string;
  swissGerman: string;
  createdAt: string;
  type: VocabularyType;
  verbConjugations?: VerbConjugation[];
}

export interface VerbConjugation {
  tense: string; // e.g., 'Präsens', 'Präteritum', 'Perfekt'
  person: string; // e.g., 'ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'
  germanForm: string;
  swissGermanForm: string;
}

export interface TrainingCard {
  id: string;
  german: string;
  swissGerman: string;
  sourceVocabId: string;
  isVerbConjugation: boolean;
  tense?: string;
  person?: string;
}
