import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { VocabularyService } from '../../services/vocabulary.service';
import { TranslationManagerService } from '../../services/translation/translation-manager.service';
import { TtsManagerService } from '../../services/tts/tts-manager.service';
import { VocabularyType, VerbConjugation } from '../../models/vocabulary.model';

const TENSES = ['Präsens', 'Präteritum', 'Perfekt', 'Futur'];
const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];

@Component({
  selector: 'app-vocabulary-form',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './vocabulary-form.component.html',
  styleUrl: './vocabulary-form.component.css',
})
export class VocabularyFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vocabService = inject(VocabularyService);
  translationManager = inject(TranslationManagerService);
  ttsManager = inject(TtsManagerService);
  private snackBar = inject(MatSnackBar);

  editId = signal<string | null>(null);
  type = signal<VocabularyType>('word');
  german = signal('');
  swissGerman = signal('');
  generating = signal(false);

  // Verb conjugation
  conjugations = signal<VerbConjugation[]>([]);
  selectedTense = signal('Präsens');
  selectedPerson = signal('ich');
  germanForm = signal('');
  swissGermanForm = signal('');

  tenses = TENSES;
  persons = PERSONS;
  conjugationColumns = ['tense', 'person', 'german', 'swiss', 'actions'];

  get isEdit() {
    return this.editId() !== null;
  }

  get isVerb() {
    return this.type() === 'verb';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const entry = this.vocabService.getById(id);
      if (entry) {
        this.editId.set(id);
        this.type.set(entry.type);
        this.german.set(entry.german);
        this.swissGerman.set(entry.swissGerman);
        if (entry.type === 'verb' && entry.verbConjugations) {
          this.conjugations.set([...entry.verbConjugations]);
        }
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  async translate(): Promise<void> {
    const g = this.german().trim();
    if (!g) {
      this.snackBar.open('Bitte zuerst das deutsche Wort eingeben', 'OK', { duration: 3000 });
      return;
    }

    if (!this.translationManager.isAvailable()) {
      this.snackBar.open('Kein Übersetzungs-Service verfügbar', 'OK', { duration: 3000 });
      return;
    }

    this.generating.set(true);
    try {
      const result = await this.translationManager.translate(g);
      this.swissGerman.set(result);
    } catch (err: any) {
      this.snackBar.open(err.message, 'OK', { duration: 5000 });
    } finally {
      this.generating.set(false);
    }
  }

  addConjugation(): void {
    const gf = this.germanForm().trim();
    const sf = this.swissGermanForm().trim();

    if (!gf || !sf) {
      this.snackBar.open('Beide Konjugationsformen müssen ausgefüllt sein', 'OK', { duration: 3000 });
      return;
    }

    const existing = this.conjugations().find(
      c => c.tense === this.selectedTense() && c.person === this.selectedPerson()
    );

    if (existing) {
      this.snackBar.open('Diese Kombination existiert bereits', 'OK', { duration: 3000 });
      return;
    }

    const newConj: VerbConjugation = {
      tense: this.selectedTense(),
      person: this.selectedPerson(),
      germanForm: gf,
      swissGermanForm: sf,
    };

    this.conjugations.update(conjs => [...conjs, newConj]);
    this.germanForm.set('');
    this.swissGermanForm.set('');
  }

  deleteConjugation(conj: VerbConjugation): void {
    this.conjugations.update(conjs =>
      conjs.filter(c => !(c.tense === conj.tense && c.person === conj.person))
    );
  }

  save(): void {
    const g = this.german().trim();
    const s = this.swissGerman().trim();

    if (!g || !s) {
      this.snackBar.open('Beide Felder müssen ausgefüllt sein', 'OK', { duration: 3000 });
      return;
    }

    if (this.isVerb && this.conjugations().length === 0) {
      this.snackBar.open('Füge mindestens eine Konjugation hinzu', 'OK', { duration: 3000 });
      return;
    }

    if (this.isEdit) {
      if (this.isVerb) {
        this.vocabService.updateVerb(this.editId()!, g, s, this.conjugations());
      } else {
        this.vocabService.update(this.editId()!, g, s);
      }
    } else {
      if (this.isVerb) {
        this.vocabService.addVerb(g, s, this.conjugations());
      } else {
        this.vocabService.add(g, s);
      }
    }
    this.router.navigate(['/']);
  }

  /**
   * Speak Swiss German word with caching support (for edit mode)
   */
  speakSwissGerman(): void {
    const text = this.swissGerman().trim();
    if (!text) return;

    // Use cache if editing existing entry
    if (this.isEdit && this.editId()) {
      this.ttsManager.speakWithCache(text, this.editId()!, 'swiss');
    } else {
      // No cache for new entries (not yet saved)
      this.ttsManager.speak(text);
    }
  }
}
