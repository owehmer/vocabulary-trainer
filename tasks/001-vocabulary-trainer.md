# 001 - Vocabulary Trainer: Full Initial Implementation

## Goal
Build the complete Zürichdeutsch vocabulary trainer Angular SPA as described in `app-plan.md`.

## Requirements

### Data
- `Vocabulary` model: `{ id, german, swissGerman, createdAt }`
- Persisted in localStorage under key `vokabel_vocabulary`

### Services
- `VocabularyService`: CRUD, localStorage persistence, JSON export/import
- `ClaudeService`: Claude Haiku API calls for Swiss German auto-complete and example sentences

### Components & Routes
| Route | Component |
|-------|-----------|
| `/` | `VocabularyListComponent` |
| `/vocabulary/new` | `VocabularyFormComponent` |
| `/vocabulary/:id/edit` | `VocabularyFormComponent` |
| `/training` | `TrainingConfigComponent` |
| `/training/session?mode=X` | `TrainingSessionComponent` |
| `/settings` | `SettingsComponent` |

### VocabularyListComponent
- Lists all entries with German and Swiss German columns
- Per-entry: Edit button, Delete button
- Global: Add button, Export JSON, Import JSON

### VocabularyFormComponent
- German text input (required)
- Swiss German text input with "Generate" button (calls Claude)
- Loading spinner while generating
- Save / Cancel actions

### SettingsComponent
- Text input for Claude API key
- Saves to `vokabel_api_key` in localStorage
- Shows warning if no key is set

### TrainingConfigComponent
- Radio button: Flashcard / Type-in / Multiple choice
- Start button → navigates to `/training/session?mode=<mode>`

### TrainingSessionComponent
- Reads `mode` from query param
- Shuffles vocabulary
- **Flashcard**: tap card to flip, then mark Correct/Wrong
- **Type-in**: text input, submit, see correct answer highlighted
- **Multiple choice**: 4 options shown as buttons
- "Show Example Sentence" button → calls Claude, shows sentence with translation
- Results screen at the end with score

## Acceptance Criteria
- [ ] `ng serve` compiles without errors
- [ ] Add entry with German only → Claude auto-fills Swiss German
- [ ] Add entry with both sides manually
- [ ] Edit and delete entries work
- [ ] JSON export creates valid downloadable file
- [ ] JSON import merges vocabulary from file
- [ ] All 3 training modes work end-to-end
- [ ] Score shown at end of training session
- [ ] Example sentence generated via Claude during training
- [ ] Settings page saves and restores API key
