import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserProfileComponent } from './shared/user-profile.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'hospital',
    loadChildren: () => import('./hospital/hospital.module').then(m => m.HospitalModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_HOSPITAL'] }
  },
  {
    path: 'staff',
    loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_DOCTOR', 'ROLE_NURSE'] }
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
