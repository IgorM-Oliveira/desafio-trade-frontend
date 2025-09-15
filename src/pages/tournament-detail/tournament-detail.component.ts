// src/pages/tournament-detail/tournament-detail.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TournamentsService } from '../../shared/tournaments.service';
import { Tournament, Match, Standing } from '../../shared/models';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-tournament-detail',
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card *ngIf="t() as T">
      <h3>Torneio #{{ T.id }} — {{ T.status }}</h3>

      <h4>Chaveamento</h4>
      <div class="bracket">
        <div>
          <h5>Quartas</h5>
          <div *ngFor="let m of stage('QF')">{{ label(m) }}</div>
        </div>
        <div>
          <h5>Semis</h5>
          <div *ngFor="let m of stage('SF')">{{ label(m) }}</div>
        </div>
        <div>
          <h5>3º Lugar</h5>
          <div *ngFor="let m of stage('THIRD')">{{ label(m) }}</div>
        </div>
        <div>
          <h5>Final</h5>
          <div *ngFor="let m of stage('FINAL')">{{ label(m) }}</div>
        </div>
      </div>

      <h4 style="margin-top:16px">Standings</h4>
      <ol>
        <li *ngFor="let s of standingsSorted()">
          {{ s.position }}º — {{ s.team?.name ?? s.team_id }} ({{ s.points_total }})
        </li>
      </ol>
    </mat-card>
  `,
  styles: [
    `.bracket{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
     .bracket div>div{padding:6px;border:1px solid #ddd;border-radius:8px;margin:6px 0}`
  ],
})
export class TournamentDetailComponent {
  t = signal<Tournament | undefined>(undefined);

  constructor(private route: ActivatedRoute, private svc: TournamentsService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.show(id).subscribe((T) => this.t.set(T));
  }

  stage(s: 'QF' | 'SF' | 'THIRD' | 'FINAL') {
    // Evita chamar .filter em undefined
    const matches = this.t()?.matches ?? [];
    return matches.filter((m) => m.stage === s);
  }

  label(m: Match) {
    const home = m.homeTeam?.name ?? m.home_team_id;
    const away = m.awayTeam?.name ?? m.away_team_id;
    const score = (m.home_goals ?? '-') + ' x ' + (m.away_goals ?? '-');
    return `${home} ${score} ${away}`;
  }

  standingsSorted(): Standing[] {
    // Garante array mesmo se standings vier undefined
    const list = this.t()?.standings ?? [];
    return [...list].sort((a, b) => a.position - b.position);
  }
}
