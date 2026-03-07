import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaudeService } from '../../services/claude.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected claudeService = inject(ClaudeService);
  private snackBar = inject(MatSnackBar);

  apiKey = signal(this.claudeService.getApiKey());
  hideKey = signal(true);

  save(): void {
    this.claudeService.saveApiKey(this.apiKey());
    this.snackBar.open('API-Key gespeichert', 'OK', { duration: 2000 });
  }

  toggleVisibility(): void {
    this.hideKey.update(v => !v);
  }
}
