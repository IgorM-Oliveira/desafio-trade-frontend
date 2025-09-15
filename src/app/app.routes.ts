import type { Routes } from '@angular/router';

export const routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'organize',
    loadComponent: () =>
      import('../pages/organize/organize.component').then(m => m.OrganizeComponent),
  },
  {
    path: 'tournaments/:id',
    loadComponent: () =>
      import('../pages/tournament-detail/tournament-detail.component')
        .then(m => m.TournamentDetailComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
] satisfies Routes;
