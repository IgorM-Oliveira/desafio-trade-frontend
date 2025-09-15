// src/pages/organize/organize.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../shared/teams.service';
import { TournamentsService } from '../../shared/tournaments.service';
import { Team } from '../../shared/models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-organize',
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatCheckboxModule,
    MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, FormsModule
  ],
  template: `
    <div class="two-col">
      <mat-card>
        <div class="h-title">Times</div>

        <div class="row" style="gap:10px;align-items:center">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Novo time</mat-label>
            <input matInput placeholder="Nome do time" [(ngModel)]="newName" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="createTeam()">
            <mat-icon>add</mat-icon> Adicionar
          </button>
          <button mat-stroked-button (click)="quickCreate8()">
            <mat-icon>magic_button</mat-icon> Criar 8 de exemplo
          </button>
        </div>

        <div class="row" style="gap:10px;align-items:center;margin-top:8px">
          <button mat-stroked-button (click)="selectFirst8()">
            <mat-icon>done_all</mat-icon> Selecionar 8 primeiros
          </button>
          <span class="badge" [class.success]="selectedCount===8">{{selectedCount}}/8</span>
        </div>

        <div *ngFor="let t of teams()" class="row" style="margin:8px 0;align-items:center">
          <mat-checkbox [ngModel]="selected[t.id] ?? false" (ngModelChange)="selected[t.id] = $event">
            <b>{{ t.name }}</b> <span style="opacity:.6">(#{{ t.registered_order }})</span>
          </mat-checkbox>
          <span class="spacer"></span>
          <button mat-button color="warn" (click)="remove(t.id)"><mat-icon>delete</mat-icon> Remover</button>
        </div>
      </mat-card>

      <mat-card>
        <div class="h-title">Organizar & Simular</div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <button mat-flat-button color="primary" (click)="start()"
                  [disabled]="selectedCount !== 8 || working()">
            <mat-icon>play_circle</mat-icon> Seed (8)
          </button>

          <button mat-stroked-button (click)="simulate()" [disabled]="!currentId() || working()">
            <mat-icon>sports</mat-icon> Simular
          </button>

          <span *ngIf="msg()" class="badge warn">{{ msg() }}</span>
        </div>
      </mat-card>
    </div>
  `,
})
export class OrganizeComponent {
  teams = signal<Team[]>([]);
  selected: Record<number, boolean | undefined> = {};
  newName = '';
  msg = signal('');
  working = signal(false);
  currentId = signal<number | undefined>(undefined);

  get selectedCount(): number {
    return Object.values(this.selected).filter(v => v === true).length;
  }

  constructor(
    private teamsSvc: TeamsService,
    private tourSvc: TournamentsService,
    private router: Router
  ) {
    const last = typeof localStorage !== 'undefined' ? localStorage.getItem('lastTournamentId') : null;
    if (last) this.currentId.set(+last);
    this.refresh();
  }

  refresh() {
    this.teamsSvc.list().subscribe({
      next: (ts) => {
        this.teams.set(ts);
        ts.forEach((t) => (this.selected[t.id] ??= false));
      },
      error: (e) => this.msg.set(e?.error?.message ?? 'Falha ao carregar times'),
    });
  }

  createTeam() {
    if (!this.newName.trim()) return;
    this.teamsSvc.create(this.newName).subscribe({
      next: () => { this.newName = ''; this.refresh(); },
      error: (e) => this.msg.set(e?.error?.message ?? 'Erro ao criar time'),
    });
  }

  remove(id: number) {
    this.teamsSvc.remove(id).subscribe({
      next: () => this.refresh(),
      error: (e) => this.msg.set(e?.error?.message ?? 'Erro ao remover time'),
    });
  }

  selectFirst8() {
    const ids = this.teams().slice(0, 8).map(t => t.id);
    this.selected = {};
    ids.forEach(id => this.selected[id] = true);
  }

  quickCreate8() {
    const base = this.teams().length;
    const names = Array.from({ length: 8 }, (_, i) => `TIME ${base + i + 1}`);
    this.working.set(true);
    const createNext = (i: number) => {
      if (i >= names.length) { this.working.set(false); this.refresh(); return; }
      this.teamsSvc.create(names[i]).subscribe({
        next: () => createNext(i + 1),
        error: (e) => { this.msg.set(e?.error?.message ?? 'Erro ao criar times'); this.working.set(false); }
      });
    };
    createNext(0);
  }

  start(ev?: MouseEvent) {
    ev?.preventDefault(); ev?.stopPropagation();
    const ids = Object.entries(this.selected).filter(([, v]) => v).map(([k]) => +k);
    if (ids.length !== 8) { this.msg.set('Selecione exatamente 8 times'); return; }

    this.working.set(true);
    this.tourSvc.create().subscribe({
      next: (t) => {
        this.currentId.set(t.id);
        if (typeof localStorage !== 'undefined') localStorage.setItem('lastTournamentId', String(t.id));

        this.tourSvc.seed(t.id, ids, 42).subscribe({
          next: (seeded) => {
            this.msg.set('Quartas criadas');
            this.working.set(false);
            if (typeof localStorage !== 'undefined') localStorage.setItem('lastTournamentId', String(seeded.id));
            this.router.navigate(['/tournaments', seeded.id]);
          },
          error: (e) => {
            this.msg.set(e?.error?.message ?? 'Erro no seed');
            this.working.set(false);
          },
        });
      },
      error: (e) => {
        this.msg.set(e?.error?.message ?? 'Erro ao criar torneio');
        this.working.set(false);
      },
    });
  }

  simulate(ev?: MouseEvent) {
    ev?.preventDefault(); ev?.stopPropagation();
    const id = this.currentId() ?? (typeof localStorage !== 'undefined' ? +(localStorage.getItem('lastTournamentId') ?? 0) : 0);
    if (!id) { this.msg.set('Crie/seede um torneio primeiro'); return; }

    this.working.set(true);
    this.tourSvc.simulate(id, 42).subscribe({
      next: (t) => {
        this.working.set(false);
        if (typeof localStorage !== 'undefined') localStorage.setItem('lastTournamentId', String(t.id));
        this.router.navigate(['/tournaments', t.id]);
      },
      error: (e) => {
        this.msg.set(e?.error?.message ?? 'Erro ao simular');
        this.working.set(false);
      },
    });
  }
}
