import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HospitalDashboardComponent } from './hospital-dashboard.component';
import { CreateRequestComponent } from './create-request.component';
import { RequestManagementComponent } from './request-management.component';

const routes: Routes = [
  {
    path: '',
    component: HospitalDashboardComponent,
    children: [
      { path: 'requests', component: RequestManagementComponent },
      { path: 'create', component: CreateRequestComponent },
      { path: '', redirectTo: 'requests', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    HospitalDashboardComponent,
    CreateRequestComponent,
    RequestManagementComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class HospitalModule { }
