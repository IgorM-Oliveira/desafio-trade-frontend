import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{token:string,user:any}>(`${environment.apiBaseUrl}/login`, { email, password });
  }

  saveToken(token: string) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.KEY, token);
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(this.KEY) : null;
  }

  logout() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(this.KEY);
  }
}
