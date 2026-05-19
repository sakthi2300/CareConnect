import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login.component';
import { HospitalRegisterComponent } from './hospital-register.component';
import { StaffRegisterComponent } from './staff-register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register-hospital', component: HospitalRegisterComponent },
  { path: 'register-staff', component: StaffRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    LoginComponent,
    HospitalRegisterComponent,
    StaffRegisterComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
