import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('angular-app-2');
  private authService = inject(AuthService);

  // Use the shared auth service state
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  constructor(title: Title) {
    title.setTitle('angular-app-2');
    // Check auth on app initialization
    this.authService.checkAuth();
  }

  loginWithKeycloak() {
    this.authService.loginWithKeycloak();
  }

  logout() {
    this.authService.logout();
  }
}
