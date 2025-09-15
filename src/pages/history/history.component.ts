// src/pages/history/history.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentsService } from '../../shared/tournaments.service';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  standalone: true,
  selector: 'app-history',
  imports: [CommonModule, MatCardModule, MatListModule, RouterLink],
  template: `
    <mat-card>
      <h3>Histórico de Torneios</h3>
      <mat-nav-list>
        <a mat-list-item *ngFor="let t of list()" [routerLink]="['/tournaments', t.id]">
          Torneio #{{ t.id }} — {{ t.status }}
        </a>
        <p *ngIf="!list().length" style="opacity:.7;margin:8px 0">Nenhum torneio ainda.</p>
      </mat-nav-list>
    </mat-card>
  `,
})
export class HistoryComponent {
  list = signal<any[]>([]);
  constructor(private svc: TournamentsService) {
    this.svc.list().subscribe(ts => this.list.set(ts));
  }
}
