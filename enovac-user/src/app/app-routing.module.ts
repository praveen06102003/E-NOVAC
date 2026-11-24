import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeDashboardComponent } from './features/dashboard/employee-dashboard/employee-dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CartComponent } from './features/cart/cart.component';
import { ProviderDashboardComponent } from './features/dashboard/provider-dashboard/provider-dashboard.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

{
  path: 'dashboard',
  component: EmployeeDashboardComponent,
  canActivate: [AuthGuard],
  data: { role: 'Employee' }
},
{
  path: 'provider-dashboard',
  component: ProviderDashboardComponent,
  canActivate: [AuthGuard],
  data: { role: 'Provider' }
},
  {
  path: 'cart',
  component: CartComponent,
  canActivate: [AuthGuard]
},

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }