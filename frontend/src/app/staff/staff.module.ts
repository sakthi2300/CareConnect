import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { StaffDashboardComponent } from './staff-dashboard.component';
import { NearbyRequestsComponent } from './nearby-requests.component';
import { AcceptedJobsComponent } from './accepted-jobs.component';

const routes: Routes = [
  {
    path: '',
    component: StaffDashboardComponent,
    children: [
      { path: 'nearby', component: NearbyRequestsComponent },
      { path: 'accepted', component: AcceptedJobsComponent },
      { path: '', redirectTo: 'nearby', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    StaffDashboardComponent,
    NearbyRequestsComponent,
    AcceptedJobsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class StaffModule { }
