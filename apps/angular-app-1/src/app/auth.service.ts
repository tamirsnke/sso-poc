import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  readonly isAuthenticated = signal(false);

  checkAuth() {
    this.http
      .get<{ user?: any }>('http://localhost:3001/protected', {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.isAuthenticated.set(true);
        },
        error: () => {
          this.isAuthenticated.set(false);
        },
      });
  }

  logout() {
    this.http
      .post<{ success: boolean; logoutUrl?: string }>(
        'http://localhost:3001/auth/logout',
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: (response) => {
          this.isAuthenticated.set(false);
          if (response.logoutUrl) {
            window.location.href = response.logoutUrl;
          } else {
            window.location.reload();
          }
        },
        error: () => {
          this.isAuthenticated.set(false);
          window.location.reload();
        },
      });
  }

  loginWithKeycloak() {
    const redirectUri = window.location.origin + '/auth/callback';
    const authUrl =
      'http://localhost:8080/realms/myrealm/protocol/openid-connect/auth' +
      '?client_id=myclient' +
      '&response_type=code' +
      '&scope=openid' +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  }

  userDetails() {
    return this.http.get<any>('http://localhost:3001/api/user-info', {
      withCredentials: true,
    });
  }
}
// Contains AI-generated edits.
