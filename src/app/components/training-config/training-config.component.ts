import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VocabularyService } from '../../services/vocabulary.service';

export type TrainingMode = 'flashcard' | 'type-in' | 'multiple-choice';

@Component({
  selector: 'app-training-config',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
  ],
  templateUrl: './training-config.component.html',
  styleUrl: './training-config.component.css',
})
export class TrainingConfigComponent {
  private router = inject(Router);
  private vocabService = inject(VocabularyService);
  private snackBar = inject(MatSnackBar);

  selectedMode = signal<TrainingMode>('flashcard');

  modes: { value: TrainingMode; label: string; description: string; icon: string }[] = [
    {
      value: 'flashcard',
      label: 'Karteikarte',
      description: 'Zeige das deutsche Wort — tippe um die Zürichdeutsche Seite aufzudecken.',
      icon: 'style',
    },
    {
      value: 'type-in',
      label: 'Eingabe',
      description: 'Tippe das Zürichdeutsche Wort ein und überprüfe deine Antwort.',
      icon: 'keyboard',
    },
    {
      value: 'multiple-choice',
      label: 'Multiple Choice',
      description: 'Wähle die richtige Zürichdeutsche Übersetzung aus vier Optionen.',
      icon: 'checklist',
    },
  ];

  start(): void {
    const count = this.vocabService.getAll().length;
    if (count === 0) {
      this.snackBar.open('Noch keine Vokabeln vorhanden. Bitte zuerst Vokabeln hinzufügen.', 'OK', {
        duration: 4000,
      });
      return;
    }
    if (this.selectedMode() === 'multiple-choice' && count < 4) {
      this.snackBar.open('Für Multiple Choice werden mindestens 4 Vokabeln benötigt.', 'OK', {
        duration: 4000,
      });
      return;
    }
    this.router.navigate(['/training/session'], {
      queryParams: { mode: this.selectedMode() },
    });
  }
}
