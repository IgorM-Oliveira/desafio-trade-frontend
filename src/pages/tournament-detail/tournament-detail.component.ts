import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TournamentsService } from '../../shared/tournaments.service';
import { Tournament, Match, Standing } from '../../shared/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-tournament-detail',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule],
  template: `
    <mat-card *ngIf="t() as T">
      <div style="display:flex;align-items:center;gap:10px;justify-content:space-between">
        <div class="h-title">Torneio #{{ T.id }}</div>
        <span class="badge" [class.success]="T.status==='finished'" [class.gray]="T.status==='pending'">
          <mat-icon>{{ T.status==='finished' ? 'flag' : (T.status==='running' ? 'play_arrow' : 'schedule') }}</mat-icon>
        </span>
      </div>

      <h4 style="margin:12px 0 6px">Chaveamento</h4>
      <div class="bracket">
        <div class="stage">
          <h5>Quartas</h5>
          <div *ngFor="let m of stage('QF')" class="match" [class.winner]="isWinner(m, m.home_team_id)" [class.loser]="isLoser(m, m.home_team_id)">
            {{ label(m) }}
          </div>
        </div>
        <div class="stage">
          <h5>Semis</h5>
          <div *ngFor="let m of stage('SF')" class="match">{{ label(m) }}</div>
        </div>
        <div class="stage">
          <h5>3º Lugar</h5>
          <div *ngFor="let m of stage('THIRD')" class="match">{{ label(m) }}</div>
        </div>
        <div class="stage">
          <h5>Final</h5>
          <div *ngFor="let m of stage('FINAL')" class="match">{{ label(m) }}</div>
        </div>
      </div>

      <h4 style="margin-top:16px">Standings</h4>
      <ol class="ol-clean">
        <li *ngFor="let s of standingsSorted()">
          <b>{{ s.team?.name ?? s.team_id }}</b>
          <span style="opacity:.6"> ({{ s.points_total }})</span>
        </li>
      </ol>

      <div style="margin-top:14px;display:flex;gap:10px">
        <button mat-flat-button color="primary" (click)="simulate()" [disabled]="T.status==='finished'">
          <mat-icon>sports</mat-icon> Simular novamente
        </button>
      </div>
    </mat-card>
  `,
})
export class TournamentDetailComponent {
  t = signal<Tournament | undefined>(undefined);

  constructor(private route: ActivatedRoute, private svc: TournamentsService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.show(id).subscribe(T => this.t.set(T));
  }

  stage(s: 'QF' | 'SF' | 'THIRD' | 'FINAL') {
    const matches = this.t()?.matches ?? [];
    return matches.filter(m => m.stage === s);
  }

  label(m: Match) {
    const home = m.homeTeam?.name ?? m.home_team_id;
    const away = m.awayTeam?.name ?? m.away_team_id;
    const hg = m.home_goals ?? '-';
    const ag = m.away_goals ?? '-';
    return `${home} ${hg} x ${ag} ${away}`;
  }

  standingsSorted(): Standing[] {
    const list = this.t()?.standings ?? [];
    return [...list].sort((a,b) => a.position - b.position);
  }

  isWinner(m: Match, teamId: number) {
    if (m.home_goals == null || m.away_goals == null) return false;
    const diff = (teamId === m.home_team_id) ? (m.home_goals - m.away_goals) : (m.away_goals - m.home_goals);
    return diff > 0;
  }
  isLoser(m: Match, teamId: number) {
    if (m.home_goals == null || m.away_goals == null) return false;
    const diff = (teamId === m.home_team_id) ? (m.home_goals - m.away_goals) : (m.away_goals - m.home_goals);
    return diff < 0;
  }

  simulate() {
    const id = this.t()?.id;
    if (!id) return;
    this.svc.simulate(id, 42).subscribe(T => this.t.set(T));
  }
}
