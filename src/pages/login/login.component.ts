import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule],
  template: `
    <mat-card>
      <h2>Entrar</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Senha</mat-label>
          <input matInput formControlName="password" type="password" />
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="form.invalid || loading()">Entrar</button>
      </form>
      <p *ngIf="error()" style="color:#d32f2f;margin-top:8px">{{ error() }}</p>
    </mat-card>
  `,
  styles: [`mat-card{max-width:400px;margin:48px auto;display:block}.w-full{width:100%}`],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['secret', [Validators.required]],
  });

  constructor(private auth: AuthService, private router: Router) { }

  submit() {
    this.error.set('');
    this.loading.set(true);

    this.auth.login(this.form.value.email!, this.form.value.password!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          console.log('login ok', res);
          this.auth.saveToken(res.token);
          this.router.navigate(['/organize'], { replaceUrl: true });
        },
        error: (err) => {
          console.error('login erro', err);
          this.error.set(err?.error?.message ?? 'Falha ao entrar');
        },
      });
  }
}
