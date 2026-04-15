import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VocabularyService } from '../../services/vocabulary.service';
import { TtsManagerService } from '../../services/tts/tts-manager.service';
import { Vocabulary } from '../../models/vocabulary.model';

@Component({
  selector: 'app-vocabulary-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './vocabulary-list.component.html',
  styleUrl: './vocabulary-list.component.css',
})
export class VocabularyListComponent {
  vocabService = inject(VocabularyService);
  ttsManager = inject(TtsManagerService);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['type', 'german', 'swissGerman', 'actions'];
  importing = signal(false);

  get vocabulary() {
    return this.vocabService.vocabulary();
  }

  delete(entry: Vocabulary): void {
    if (confirm(`"${entry.german}" wirklich löschen?`)) {
      this.vocabService.delete(entry.id);
    }
  }

  exportJson(): void {
    this.vocabService.exportJson();
  }

  importJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing.set(true);
    this.vocabService
      .importJson(file)
      .then(count => {
        this.snackBar.open(`${count} neue Vokabeln importiert`, 'OK', { duration: 3000 });
      })
      .catch(err => {
        this.snackBar.open(err.message, 'OK', { duration: 4000 });
      })
      .finally(() => {
        this.importing.set(false);
        input.value = '';
      });
  }

  /**
   * Speak Swiss German word with caching support
   */
  speakSwissGerman(vocab: Vocabulary): void {
    this.ttsManager.speakWithCache(vocab.swissGerman);
  }
}
