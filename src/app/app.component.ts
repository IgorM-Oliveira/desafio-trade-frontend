import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <span>Campeonato</span>
      <span class="spacer"></span>
      <!-- evitar anchor cobrindo a página -->
      <button mat-button type="button" (click)="goLogin()">Login</button>
    </mat-toolbar>

    <div class="container">
      <router-outlet />
    </div>
  `,
  styles: [`
    :host { display:block; }
    .topbar { position: sticky; top: 0; z-index: 100; }
    .spacer { flex: 1; }
    .container { padding: 16px; position: relative; z-index: 1; }
  `],
})
export class AppComponent {
  constructor(private router: Router) {}
  goLogin(){ this.router.navigateByUrl('/login'); }
}
