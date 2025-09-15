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

@Component({
  standalone: true,
  selector: 'app-organize',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatCheckboxModule, FormsModule],
  template: `
    <div class="grid">
      <mat-card>
        <h3>Times</h3>
        <div class="row">
          <input placeholder="Novo time" [(ngModel)]="newName" />
          <button mat-stroked-button (click)="createTeam()">Adicionar</button>
          <button mat-stroked-button (click)="quickCreate8()">Criar 8 de exemplo</button>
        </div>
        <div class="row">
          <button mat-stroked-button (click)="selectFirst8()">Selecionar 8 primeiros</button>
          <span style="margin-left:8px">Selecionados: {{ selectedCount }}/8</span>
        </div>
        <div *ngFor="let t of teams()" class="row">
          <mat-checkbox
            [ngModel]="selected[t.id]"
            (ngModelChange)="selected[t.id] = $event"
          >
            {{ t.name }} (#{{ t.registered_order }})
          </mat-checkbox>
          <button mat-button color="warn" (click)="remove(t.id)">Remover</button>
        </div>
      </mat-card>

      <mat-card>
        <h3>Organizar & Simular</h3>
        <button
          type="button"
          mat-flat-button
          color="primary"
          (click)="start($event)"
          [disabled]="selectedCount !== 8 || working()"
        >
          Seed (8)
        </button>

        <button
          type="button"
          mat-stroked-button
          (click)="simulate($event)"
          [disabled]="!currentId() || working()"
        >
          Simular
        </button>
        <p *ngIf="msg()" style="margin-top:8px">{{ msg() }}</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .grid{display:grid;gap:16px;grid-template-columns:1fr 1fr}
    .row{display:flex;gap:8px;align-items:center;margin:8px 0}
  `],
})
export class OrganizeComponent {
  teams = signal<Team[]>([]);
  selected: Record<number, boolean> = {};
  newName = '';
  msg = signal('');
  working = signal(false);
  currentId = signal<number | undefined>(undefined);

  // ✅ agora reconta corretamente (não usa computed, é um getter)
  get selectedCount(): number {
    return Object.values(this.selected).filter(Boolean).length;
    // se quiser debugar: console.log(this.selected);
  }

  constructor(
    private teamsSvc: TeamsService,
    private tourSvc: TournamentsService,
    private router: Router
  ) {
    // tenta recuperar o último torneio (SSR-safe)
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
