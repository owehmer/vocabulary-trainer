# Plan: Interactive Zürichdeutsch Vocabulary Trainer

## Context
Building an interactive vocabulary trainer web app as an Angular 21 SPA. The user speaks German and wants to learn Swiss/Zürich German. The app allows entering German vocabulary, auto-fills the Swiss German side via Claude API, and supports multiple training modes. Vocabulary is persisted in localStorage with JSON export/import.

---

## Step 0: Create app-plan.md (first action)
Create `app-plan.md` at the project root as a human-readable overview of all goals, features, tech stack, and roadmap. This is the living document for the project.

---

## Architecture Overview

### Routes
- `/` → Vocabulary list (home)
- `/vocabulary/new` → Add vocabulary
- `/vocabulary/:id/edit` → Edit vocabulary
- `/training` → Training config (choose mode)
- `/training/session` → Active training session
- `/settings` → Claude API key configuration

### Components & Services

**Services (src/app/services/):**
- `vocabulary.service.ts` — CRUD, localStorage persistence, JSON export/import
- `claude.service.ts` — Claude API calls (auto-complete Swiss German, generate example sentences)

**Components (src/app/components/):**
- `vocabulary-list/` — lists all entries, add/delete/export/import buttons
- `vocabulary-form/` — add/edit form; "Generate Swiss German" button calls Claude; shows loading state
- `training-config/` — mode selector (flashcard / type-in / multiple choice) + start button
- `training-session/` — renders the active training based on chosen mode
- `settings/` — input field to save Claude API key to localStorage

### Data Model
```typescript
interface Vocabulary {
  id: string;
  german: string;
  swissGerman: string;
  createdAt: string; // ISO date string
}
```

---

## Key Implementation Details

### Claude API Integration
- **No backend needed**: User enters their own Claude API key in Settings → saved to localStorage
- Model: `claude-haiku-4-5-20251001` (fast, cheap, ideal for short translations)
- Two prompts:
  1. **Auto-complete**: Given German word/sentence → return Zürichdeutsch equivalent
  2. **Example sentence**: Given a vocabulary pair → return a real-life Zürichdeutsch sentence + German translation

### Vocabulary Storage
- `localStorage` key: `vokabel_vocabulary`
- JSON export: download as `vokabeln.json`
- JSON import: file input → parse → merge or replace

### Training Modes (user picks when starting)
1. **Flashcard**: Show German side → tap card to reveal Swiss German; buttons: "Correct" / "Wrong" to track score
2. **Type-in**: Show German → text input → submit → show correct answer; mark correct/incorrect
3. **Multiple choice**: Show German → 4 options (1 correct + 3 random from vocab list) → tap answer

Training session shuffles vocabulary, tracks score, shows results at the end.

### UI
- Angular Material for components (MatCard, MatButton, MatInput, MatToolbar, etc.)
- Simple, clean mobile-friendly layout

---

## File Plan

### New files to create:
```
app-plan.md                          ← project goals overview (Step 0)
tasks/
  001-vocabulary-trainer.md          ← task description per CLAUDE.md convention

src/app/
  models/
    vocabulary.model.ts

  services/
    vocabulary.service.ts
    claude.service.ts

  components/
    vocabulary-list/
    vocabulary-form/
    training-config/
    training-session/
    settings/
```

### Files to modify:
- `src/app/app.routes.ts`, `app.ts`, `app.html`, `app.css`
- `src/styles.css` — Angular Material theme
- `package.json` — add `@angular/material`, `@anthropic-ai/sdk`

---

## Implementation Order
0. Create `app-plan.md`
1. Install Angular Material + Anthropic SDK
2. Create `tasks/001-vocabulary-trainer.md`
3. Define `Vocabulary` model
4. Implement `VocabularyService` + `ClaudeService`
5. Build `SettingsComponent`
6. Build `VocabularyListComponent` + `VocabularyFormComponent`
7. Build `TrainingConfigComponent` + `TrainingSessionComponent`
8. Wire up routes, update `app.html` with nav bar
9. Commit

---

## Verification
- `ng serve` compiles without errors
- Add entry (German only → Claude auto-fills Swiss), add entry (both manual)
- Edit and delete entries
- JSON export/import works
- All 3 training modes work, score shown at end
- Example sentence generated via Claude during training
- Settings saves/reads API key from localStorage
