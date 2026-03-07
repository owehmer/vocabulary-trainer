# Zürichdeutsch Vocabulary Trainer — App Plan

## Goal
An interactive vocabulary trainer SPA for learning Swiss/Zürich German (Zürichdeutsch).
The user speaks German and can add vocabulary entries (German ↔ Swiss German).
The Claude AI auto-fills the Swiss German side and generates real-life example sentences.

## Tech Stack
- **Framework:** Angular 21 (standalone components, signals)
- **UI:** Angular Material
- **AI:** Claude API (Haiku model) — direct browser calls with user-provided API key
- **Storage:** localStorage (`vokabel_vocabulary`, `vokabel_api_key`)
- **No backend required**

## Data Model
```typescript
interface Vocabulary {
  id: string;
  german: string;
  swissGerman: string;
  createdAt: string; // ISO date string
}
```

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | VocabularyListComponent | Home — list all vocabulary |
| `/vocabulary/new` | VocabularyFormComponent | Add new vocabulary |
| `/vocabulary/:id/edit` | VocabularyFormComponent | Edit existing vocabulary |
| `/training` | TrainingConfigComponent | Choose training mode |
| `/training/session` | TrainingSessionComponent | Active training session |
| `/settings` | SettingsComponent | Claude API key configuration |

## Features

### Vocabulary Management
- Add / edit / delete vocabulary entries
- Enter German side only → Claude auto-fills Swiss German
- Enter both sides manually
- JSON export (download `vokabeln.json`)
- JSON import (upload file, merge or replace)

### AI Integration (Claude Haiku)
- **Auto-complete:** German word/sentence → Zürichdeutsch equivalent
- **Example sentence:** vocab pair → real-life Zürichdeutsch sentence + German translation

### Training Modes
1. **Flashcard** — Show German, tap to reveal Swiss German; mark Correct / Wrong
2. **Type-in** — Show German, user types Swiss German, submit to check
3. **Multiple choice** — Show German, pick from 4 options (1 correct + 3 random)

Each session: shuffles vocab, tracks score, shows results summary at end.

## Roadmap
- [x] v1: Full CRUD + all 3 training modes + Claude integration
- [ ] v2: Text-to-speech for vocabulary and example sentences
- [ ] v3: Spaced repetition algorithm
- [ ] v4: Categories / tags for vocabulary
- [ ] v5: Progress statistics / history
