import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RequestDetailComponent } from './request-detail.component';

const routes: Routes = [
  { path: ':id', component: RequestDetailComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  declarations: [RequestDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RequestsModule { }
