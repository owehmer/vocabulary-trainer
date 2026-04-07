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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
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

  // Cache management
  cacheSearchQuery = signal('');
  currentPage = signal(0);
  pageSize = 10;

  cacheStats = computed(() => this.ttsCacheService.getCacheStats());

  allCachedVocabularies = computed(() => {
    return this.vocabService.vocabulary().filter(v =>
      v.audioCache?.swissGermanAudio || v.audioCache?.exampleSentenceAudio
    );
  });

  filteredCachedVocabularies = computed(() => {
    const query = this.cacheSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.allCachedVocabularies();
    }
    return this.allCachedVocabularies().filter(v =>
      v.german.toLowerCase().includes(query) ||
      v.swissGerman.toLowerCase().includes(query)
    );
  });

  paginatedCachedVocabularies = computed(() => {
    const filtered = this.filteredCachedVocabularies();
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCachedVocabularies().length / this.pageSize);
  });

  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  hasPrevPage = computed(() => this.currentPage() > 0);

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
      this.currentPage.set(0);
      this.snackBar.open('Audio-Cache geleert', 'OK', { duration: 2000 });
    }
  }

  clearVocabCache(vocabId: string): void {
    this.ttsCacheService.clearVocabularyCache(vocabId);
    this.snackBar.open('Cache gelöscht', 'OK', { duration: 1500 });

    // Adjust page if current page is now empty
    const maxPage = this.totalPages() - 1;
    if (this.currentPage() > maxPage && maxPage >= 0) {
      this.currentPage.set(maxPage);
    }
  }

  onSearchChange(): void {
    this.currentPage.set(0); // Reset to first page when searching
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
