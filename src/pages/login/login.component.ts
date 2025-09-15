import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatIconModule],
  template: `
    <div style="display:grid;place-items:center;min-height:calc(100vh - 120px)">
      <mat-card style="width:min(520px,92vw);padding:8px 4px;">
        <div style="display:flex;align-items:center;gap:8px;padding:6px 16px 0">
          <mat-icon color="primary">login</mat-icon>
          <div class="h-title">Entrar</div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" style="padding: 0 16px 10px;">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="username" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Senha</mat-label>
            <input matInput formControlName="password" [type]="show ? 'text' : 'password'" autocomplete="current-password" />
            <button mat-icon-button matSuffix type="button" (click)="show = !show">
              <mat-icon>{{ show ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <div style="display:flex;gap:10px;align-items:center">
            <button mat-flat-button color="primary" [disabled]="form.invalid || loading()">
              <mat-icon>arrow_forward</mat-icon> Entrar
            </button>
            <span *ngIf="error()" style="color:#d32f2f">{{ error() }}</span>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`.w-full{width:100%}`]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  loading = signal(false);
  error = signal('');
  show = false;

  form = this.fb.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['secret', [Validators.required]],
  });

  constructor(private auth: AuthService, private router: Router) { }

  // ✅ se já estiver logado, pula a tela
  ngOnInit(): void {
    const token = this.auth.getToken?.() ??
      (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);

    if (token) this.router.navigate(['/organize'], { replaceUrl: true });
  }

  submit() {
    this.error.set('');
    this.loading.set(true);

    this.auth.login(this.form.value.email!, this.form.value.password!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.auth.saveToken(res.token);
          this.router.navigate(['/organize'], { replaceUrl: true });
        },
        error: (err) => this.error.set(err?.error?.message ?? 'Falha ao entrar'),
      });
  }
}
