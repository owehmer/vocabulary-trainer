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
import { AudioCacheStorageService } from '../../services/tts/audio-cache-storage.service';
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
  protected audioCacheStorage = inject(AudioCacheStorageService);
  protected vocabService = inject(VocabularyService);
  private snackBar = inject(MatSnackBar);

  apiKey = signal(this.claudeService.getApiKey());
  hideKey = signal(true);
  selectedProvider = signal<ProviderType>(this.translationManager.getPreferredProviderType());

  // Cache management
  cacheSearchQuery = signal('');
  currentPage = signal(0);
  pageSize = 10;

  cacheStats = computed(() => this.audioCacheStorage.getCacheStats());

  allCachedAudio = computed(() => {
    return this.audioCacheStorage.getAllCached();
  });

  filteredCachedAudio = computed(() => {
    const query = this.cacheSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.allCachedAudio();
    }
    return this.allCachedAudio().filter(entry =>
      entry.text.includes(query)
    );
  });

  paginatedCachedAudio = computed(() => {
    const filtered = this.filteredCachedAudio();
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCachedAudio().length / this.pageSize);
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
      this.audioCacheStorage.clearAllCache();
      this.currentPage.set(0);
      this.snackBar.open('Audio-Cache geleert', 'OK', { duration: 2000 });
    }
  }

  clearAudioCache(text: string): void {
    this.audioCacheStorage.clearCachedAudio(text);
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
