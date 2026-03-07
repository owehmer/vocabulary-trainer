import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/vocabulary-list/vocabulary-list.component').then(
        m => m.VocabularyListComponent
      ),
  },
  {
    path: 'vocabulary/new',
    loadComponent: () =>
      import('./components/vocabulary-form/vocabulary-form.component').then(
        m => m.VocabularyFormComponent
      ),
  },
  {
    path: 'vocabulary/:id/edit',
    loadComponent: () =>
      import('./components/vocabulary-form/vocabulary-form.component').then(
        m => m.VocabularyFormComponent
      ),
  },
  {
    path: 'training',
    loadComponent: () =>
      import('./components/training-config/training-config.component').then(
        m => m.TrainingConfigComponent
      ),
  },
  {
    path: 'training/session',
    loadComponent: () =>
      import('./components/training-session/training-session.component').then(
        m => m.TrainingSessionComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(m => m.SettingsComponent),
  },
  { path: '**', redirectTo: '' },
];
