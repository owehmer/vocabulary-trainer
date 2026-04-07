import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { ClaudeService } from '../../services/claude.service';
import { TranslationManagerService, ProviderType } from '../../services/translation-manager.service';

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
    MatRadioModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected claudeService = inject(ClaudeService);
  protected translationManager = inject(TranslationManagerService);
  private snackBar = inject(MatSnackBar);

  apiKey = signal(this.claudeService.getApiKey());
  hideKey = signal(true);
  selectedProvider = signal<ProviderType>(this.translationManager.getPreferredProviderType());

  save(): void {
    this.claudeService.saveApiKey(this.apiKey());
    this.translationManager.setPreferredProviderType(this.selectedProvider());
    this.snackBar.open('Einstellungen gespeichert', 'OK', { duration: 2000 });
  }

  toggleVisibility(): void {
    this.hideKey.update(v => !v);
  }
}
