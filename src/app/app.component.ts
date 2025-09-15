import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="topbar" style="backdrop-filter:saturate(110%) blur(6px)">
      <button mat-button [routerLink]="['/organize']" style="font-weight:800;letter-spacing:.4px">
        <mat-icon>emoji_events</mat-icon>
        Campeonato
      </button>
      <span class="spacer"></span>

      <!-- alterna entre Login e Logout conforme presença do token -->
      <ng-container *ngIf="!isAuthed(); else logged">
        <button mat-stroked-button color="accent" (click)="goLogin()">
          <mat-icon>login</mat-icon> Login
        </button>
      </ng-container>
      <ng-template #logged>
        <button mat-stroked-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </ng-template>
    </mat-toolbar>

    <div class="app-container">
      <router-outlet />
    </div>
  `,
  styles: [`.spacer{flex:1}`],
})
export class AppComponent implements OnInit {
  isAuthed = signal(false);

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.refreshAuth();

    // se token mudar em outra aba, atualiza o botão aqui
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'token') this.refreshAuth();
      });
    }
  }

  private refreshAuth() {
    this.isAuthed.set(!!this.auth.getToken?.() ||
      (typeof localStorage !== 'undefined' && !!localStorage.getItem('token')));
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.auth.logout?.(); // remove via serviço (se implementado)
    if (typeof localStorage !== 'undefined') localStorage.removeItem('token'); // fallback
    this.refreshAuth();
    this.router.navigateByUrl('/login');
  }
}
