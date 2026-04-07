import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { ClaudeTranslationService } from '../../services/translation/claude-translation.service';
import { TranslationManagerService, ProviderType } from '../../services/translation/translation-manager.service';
import { TtsCacheService } from '../../services/tts/tts-cache.service';
import { VocabularyService } from '../../services/vocabulary.service';
import {MatTooltip} from '@angular/material/tooltip';

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
    MatDividerModule,
    MatListModule,
    MatTooltip,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected claudeService = inject(ClaudeTranslationService);
  protected translationManager = inject(TranslationManagerService);
  protected ttsCacheService = inject(TtsCacheService);
  protected vocabService = inject(VocabularyService);
  private snackBar = inject(MatSnackBar);

  apiKey = signal(this.claudeService.getApiKey());
  hideKey = signal(true);
  selectedProvider = signal<ProviderType>(this.translationManager.getPreferredProviderType());

  cacheStats = computed(() => this.ttsCacheService.getCacheStats());

  cachedVocabularies = computed(() => {
    return this.vocabService.vocabulary().filter(v =>
      v.audioCache?.swissGermanAudio || v.audioCache?.exampleSentenceAudio
    );
  });

  save(): void {
    this.claudeService.saveApiKey(this.apiKey());
    this.translationManager.setPreferredProviderType(this.selectedProvider());
    this.snackBar.open('Einstellungen gespeichert', 'OK', { duration: 2000 });
  }

  toggleVisibility(): void {
    this.hideKey.update(v => !v);
  }

  clearAllCache(): void {
    if (confirm('Wirklich alle Audio-Caches löschen? Die Audiodaten können jederzeit neu generiert werden.')) {
      this.ttsCacheService.clearAllCache();
      this.snackBar.open('Audio-Cache geleert', 'OK', { duration: 2000 });
    }
  }

  clearVocabCache(vocabId: string): void {
    this.ttsCacheService.clearVocabularyCache(vocabId);
    this.snackBar.open('Cache gelöscht', 'OK', { duration: 1500 });
  }
}
