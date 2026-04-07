export interface Vocabulary {
  id: string;
  german: string;
  swissGerman: string;
  createdAt: string;
  audioCache?: {
    swissGermanAudio?: string; // base64 audio data
    exampleSentenceAudio?: string; // base64 audio data
  };
}
