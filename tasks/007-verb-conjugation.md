# Task 007: Verb Conjugation Feature

## Goal
Add support for verbs with conjugations to the vocabulary trainer. Users can add verbs and define multiple conjugation forms (different tenses and persons). During training, each conjugation is treated as a separate flashcard.

## Requirements
- ✅ Users can choose between "word/sentence" and "verb" when adding vocabulary
- ✅ For verbs, users can add an infinitive form (German + Swiss German)
- ✅ Users can add multiple conjugation forms with:
  - Tense (Präsens, Präteritum, Perfekt, Futur)
  - Person (ich, du, er/sie/es, wir, ihr, sie/Sie)
  - German conjugated form
  - Swiss German conjugated form
- ✅ Each conjugation form appears as a separate card during training
- ✅ The infinitive form also appears as a card
- ✅ Vocabulary list shows verb indicator with conjugation count
- ✅ All training modes work with verb conjugations (flashcard, type-in, multiple choice)

## Implementation Details

### Model Changes (`vocabulary.model.ts`)
- Added `VocabularyType` type: 'word' | 'verb'
- Extended `Vocabulary` interface with:
  - `type: VocabularyType`
  - `verbConjugations?: VerbConjugation[]`
- New `VerbConjugation` interface with tense, person, and forms
- New `TrainingCard` interface for flattened training cards

### Service Changes (`vocabulary.service.ts`)
- Added migration logic to set default type 'word' for existing entries
- New methods:
  - `addVerb()` - add verb with conjugations
  - `updateVerb()` - update verb with conjugations
  - `getTrainingCards()` - flatten vocabulary into training cards (each conjugation becomes a card)

### Form Component (`vocabulary-form.component.*`)
- Added type selection radio buttons (word/verb)
- New verb conjugation section with:
  - Form inputs for tense, person, German form, Swiss form
  - "Add conjugation" button
  - Table showing all added conjugations
  - Delete button for each conjugation
- Updated save logic to handle both words and verbs
- Validation requires at least one conjugation for verbs

### List Component (`vocabulary-list.component.*`)
- Added "type" column to vocabulary table
- Visual badges showing:
  - "Wort" for regular words/sentences
  - "Verb (n)" for verbs with conjugation count
- Color-coded badges for easy identification

### Training Component (`training-session.component.ts`)
- Changed from using `Vocabulary[]` to `TrainingCard[]`
- Now uses `vocabService.getTrainingCards()` for training data
- Each verb conjugation appears as individual card with format: "person form (tense)"
- All training modes work seamlessly with conjugations

## User Experience
1. User clicks "Neue Vokabel"
2. Selects type: "Wort/Satz" or "Verb"
3. For verbs:
   - Enters infinitive (e.g., "gehen" / "gaa")
   - Adds conjugations one by one:
     - Selects tense (e.g., Präsens)
     - Selects person (e.g., ich)
     - Enters forms (e.g., "gehe" / "gang")
   - Can delete conjugations if needed
4. During training:
   - Infinitive appears as one card
   - Each conjugation appears as separate card
   - Card shows: "ich gehe (Präsens)" → user must answer: "gang"

## Benefits
- Comprehensive verb learning with all forms
- Focused practice on specific conjugations
- Flexible - can add as many or few conjugations as needed
- Works with all existing features (translation, TTS, example sentences)

## Migration
- Existing vocabulary entries automatically get `type: 'word'`
- No data loss for existing users
- Fully backward compatible

