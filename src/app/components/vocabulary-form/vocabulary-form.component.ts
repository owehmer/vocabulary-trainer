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
import { VocabularyService } from '../../services/vocabulary.service';
import { ClaudeService } from '../../services/claude.service';

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
  ],
  templateUrl: './vocabulary-form.component.html',
  styleUrl: './vocabulary-form.component.css',
})
export class VocabularyFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vocabService = inject(VocabularyService);
  claudeService = inject(ClaudeService);
  private snackBar = inject(MatSnackBar);

  editId = signal<string | null>(null);
  german = signal('');
  swissGerman = signal('');
  generating = signal(false);

  get isEdit() {
    return this.editId() !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const entry = this.vocabService.getById(id);
      if (entry) {
        this.editId.set(id);
        this.german.set(entry.german);
        this.swissGerman.set(entry.swissGerman);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  async generate(): Promise<void> {
    const g = this.german().trim();
    if (!g) {
      this.snackBar.open('Bitte zuerst das deutsche Wort eingeben', 'OK', { duration: 3000 });
      return;
    }
    this.generating.set(true);
    try {
      const result = await this.claudeService.generateSwissGerman(g);
      this.swissGerman.set(result);
    } catch (err: any) {
      this.snackBar.open(err.message, 'OK', { duration: 5000 });
    } finally {
      this.generating.set(false);
    }
  }

  save(): void {
    const g = this.german().trim();
    const s = this.swissGerman().trim();
    if (!g || !s) {
      this.snackBar.open('Beide Felder müssen ausgefüllt sein', 'OK', { duration: 3000 });
      return;
    }
    if (this.isEdit) {
      this.vocabService.update(this.editId()!, g, s);
    } else {
      this.vocabService.add(g, s);
    }
    this.router.navigate(['/']);
  }
}
