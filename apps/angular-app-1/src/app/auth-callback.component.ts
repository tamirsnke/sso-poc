import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '<p>Logging in...</p>',
})
export class AuthCallbackComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      this.http
        .post(
          'http://localhost:3001/auth/login',
          {
            code,
            redirectUri: window.location.origin + '/auth/callback',
          },
          { withCredentials: true }
        )
        .subscribe({
          next: () => {
            // Update auth state immediately after successful login
            this.authService.checkAuth();
            this.router.navigateByUrl('/');
          },
          error: () => {
            this.router.navigateByUrl('/');
          },
        });
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
// Contains AI-generated edits.
