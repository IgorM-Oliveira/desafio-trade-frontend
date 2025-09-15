import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, map } from 'rxjs';
import { Tournament } from './models';

interface Paginated<T> { data: T[]; }

@Injectable({ providedIn: 'root' })
export class TournamentsService {
  private base = `${environment.apiBaseUrl}/tournaments`;
  constructor(private http: HttpClient) {}

  create(): Observable<Tournament> {
    return this.http.post<Tournament>(this.base, {});
  }

  seed(id: number, team_ids: number[], seed: number) {
    return this.http.post<Tournament | { id: number }>(
      `${this.base}/${id}/seed`,
      { team_ids, seed }
    );
  }

  simulate(id: number, seed: number) {
    return this.http.post<Tournament>(`${this.base}/${id}/simulate`, { seed });
  }

  show(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.base}/${id}`);
  }

  list(params?: { page?: number }): Observable<Tournament[]> {
    return this.http
      .get<Paginated<Tournament> | Tournament[]>(this.base, { params: params as any })
      .pipe(map(res => Array.isArray(res) ? res : res.data));
  }
}
