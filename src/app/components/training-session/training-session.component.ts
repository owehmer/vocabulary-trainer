import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VocabularyService } from '../../services/vocabulary.service';
import { ClaudeTranslationService, ExampleSentence } from '../../services/translation/claude-translation.service';
import { TtsManagerService } from '../../services/tts/tts-manager.service';
import { Vocabulary } from '../../models/vocabulary.model';
import { TrainingMode } from '../training-config/training-config.component';

@Component({
  selector: 'app-training-session',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './training-session.component.html',
  styleUrl: './training-session.component.css',
})
export class TrainingSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vocabService = inject(VocabularyService);
  claudeService = inject(ClaudeTranslationService);
  ttsManager = inject(TtsManagerService);

  mode = signal<TrainingMode>('flashcard');
  vocabulary = signal<Vocabulary[]>([]);
  currentIndex = signal(0);
  correct = signal(0);
  wrong = signal(0);

  // Flashcard state
  flipped = signal(false);

  // Type-in state
  userInput = signal('');
  submitted = signal(false);

  // Multiple choice state
  options = signal<string[]>([]);
  selectedOption = signal<string | null>(null);

  // Example sentence
  exampleSentence = signal<ExampleSentence | null>(null);
  loadingExample = signal(false);
  exampleError = signal('');

  // Session state
  finished = signal(false);

  current = computed(() => this.vocabulary()[this.currentIndex()]);

  progress = computed(() => {
    const total = this.vocabulary().length;
    return total > 0 ? (this.currentIndex() / total) * 100 : 0;
  });

  isCorrectAnswer = computed(() => {
    if (!this.submitted()) return false;
    const answer = this.userInput().trim().toLowerCase();
    const correct = this.current()?.swissGerman.toLowerCase() ?? '';
    return answer === correct;
  });

  ngOnInit(): void {
    const modeParam = this.route.snapshot.queryParamMap.get('mode') as TrainingMode;
    this.mode.set(modeParam ?? 'flashcard');

    const all = this.vocabService.getAll();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    this.vocabulary.set(shuffled);

    if (shuffled.length === 0) {
      this.router.navigate(['/training']);
      return;
    }

    this.prepareCurrentCard();
  }

  private prepareCurrentCard(): void {
    this.flipped.set(false);
    this.userInput.set('');
    this.submitted.set(false);
    this.selectedOption.set(null);
    this.exampleSentence.set(null);
    this.exampleError.set('');

    if (this.mode() === 'multiple-choice') {
      this.buildOptions();
    }
  }

  private buildOptions(): void {
    const all = this.vocabulary();
    const current = this.current();
    const correct = current.swissGerman;
    const others = all
      .filter(v => v.id !== current.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(v => v.swissGerman);

    const opts = [correct, ...others].sort(() => Math.random() - 0.5);
    this.options.set(opts);
  }

  flip(): void {
    if (!this.flipped()) {
      this.flipped.set(true);
    }
  }

  markCorrect(): void {
    this.correct.update(n => n + 1);
    this.next();
  }

  markWrong(): void {
    this.wrong.update(n => n + 1);
    this.next();
  }

  submitTypeIn(): void {
    if (!this.userInput().trim()) return;
    this.submitted.set(true);
    if (this.isCorrectAnswer()) {
      this.correct.update(n => n + 1);
    } else {
      this.wrong.update(n => n + 1);
    }
  }

  selectOption(option: string): void {
    if (this.selectedOption() !== null) return;
    this.selectedOption.set(option);
    if (option === this.current().swissGerman) {
      this.correct.update(n => n + 1);
    } else {
      this.wrong.update(n => n + 1);
    }
  }

  next(): void {
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.vocabulary().length) {
      this.finished.set(true);
    } else {
      this.currentIndex.set(nextIndex);
      this.prepareCurrentCard();
    }
  }

  async loadExampleSentence(): Promise<void> {
    const current = this.current();
    if (!current) return;
    this.loadingExample.set(true);
    this.exampleError.set('');
    try {
      const sentence = await this.claudeService.generateExampleSentence(
        current.german,
        current.swissGerman
      );
      this.exampleSentence.set(sentence);
    } catch (err: any) {
      this.exampleError.set(err.message);
    } finally {
      this.loadingExample.set(false);
    }
  }

  restart(): void {
    this.currentIndex.set(0);
    this.correct.set(0);
    this.wrong.set(0);
    this.finished.set(false);
    const shuffled = [...this.vocabulary()].sort(() => Math.random() - 0.5);
    this.vocabulary.set(shuffled);
    this.prepareCurrentCard();
  }

  get scorePercent(): number {
    const total = this.correct() + this.wrong();
    return total > 0 ? Math.round((this.correct() / total) * 100) : 0;
  }

  get optionClass(): (opt: string) => string {
    return (opt: string) => {
      const selected = this.selectedOption();
      if (selected === null) return '';
      if (opt === this.current()?.swissGerman) return 'correct';
      if (opt === selected) return 'wrong';
      return '';
    };
  }
}
