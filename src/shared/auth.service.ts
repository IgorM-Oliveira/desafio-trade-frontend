import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ user: User; token: string }>(
      `${environment.apiBaseUrl}/login`,
      { email, password }
    );
  }

  saveToken(t: string) { localStorage.setItem(this.tokenKey, t); }
  get token() { return localStorage.getItem(this.tokenKey) ?? ''; }
  isAuthenticated() { return !!this.token; }
  logout() { localStorage.removeItem(this.tokenKey); }
}
