import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { Title } from '@angular/platform-browser';
import { BusinessService } from './business.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  protected readonly title = signal('angular-app-1');
  private authService = inject(AuthService);
  private businessService = inject(BusinessService);  
  orders = signal<any[]>([]);
  user = signal<any>({});
  // Use the shared auth service state
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  constructor(title: Title) {
    title.setTitle('angular-app-1');
    // Check auth on app initialization
    this.authService.checkAuth();
  }

  loginWithKeycloak() {
    this.authService.loginWithKeycloak();
  }

  logout() {
    this.authService.logout();
  }

  getOrders() {
    this.businessService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      }
    });
  }

  userDetails() {
    this.authService.userDetails().subscribe({
      next: (user) => {
        this.user.set(user);
      }
    });
  }

}
