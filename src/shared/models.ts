export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Team {
  id: number;
  name: string;
  registered_order: number;
}

export type MatchStage = 'QF' | 'SF' | 'THIRD' | 'FINAL';
export interface Match {
  id: number;
  stage: MatchStage;
  home_team_id: number;
  away_team_id: number;
  home_goals?: number | null;
  away_goals?: number | null;
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface Standing {
  position: number;
  points_total: number;
  team_id: number;
  team?: Team;
}

export type TournamentStatus = 'pending' | 'running' | 'finished';

export interface Tournament {
  id: number;
  status: TournamentStatus;
  matches?: Match[];
  standings?: Standing[];
}
