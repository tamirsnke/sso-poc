import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './auth-callback.component';
import { Home } from './home/home';

export const routes: Routes = [
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'home', component: Home }
];
