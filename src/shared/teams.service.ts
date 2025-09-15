import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Team } from './models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamsService {
    private base = `${environment.apiBaseUrl}/teams`;
    constructor(private http: HttpClient) { }
    list(): Observable<Team[]> { return this.http.get<Team[]>(this.base); }
    create(name: string) { return this.http.post<Team>(this.base, { name }); }
    remove(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
