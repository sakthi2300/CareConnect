import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-hospital-dashboard',
  template: `
    <div class="fade-in">
      <div class="dash-welcome">
        <div class="welcome-text">
          <h3>Welcome back, {{ auth.fullName }} 👋</h3>
          <p>Manage your emergency staffing requests</p>
        </div>
        <a mat-raised-button color="primary" routerLink="create" class="create-btn">
          <mat-icon>add</mat-icon> New Request
        </a>
      </div>

      <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="dash-tabs" color="primary">
        <a mat-tab-link routerLink="requests" routerLinkActive #rla1="routerLinkActive" [active]="rla1.isActive">
          <mat-icon>list_alt</mat-icon> My Requests
        </a>
        <a mat-tab-link routerLink="create" routerLinkActive #rla2="routerLinkActive" [active]="rla2.isActive">
          <mat-icon>add_circle</mat-icon> Create Request
        </a>
      </nav>
      <mat-tab-nav-panel #tabPanel>
        <router-outlet></router-outlet>
      </mat-tab-nav-panel>
    </div>
  `,
  styles: [`
    .dash-welcome {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px; padding: 20px 24px;
      background: linear-gradient(135deg, #E3F2FD 0%, #E0F2F1 100%);
      border-radius: var(--cc-radius); border: 1px solid #BBDEFB;
    }
    .welcome-text h3 { margin: 0; font-size: 1.15rem; font-weight: 600; color: #1E293B; }
    .welcome-text p { margin: 4px 0 0; font-size: 0.82rem; color: #64748B; }
    .create-btn { border-radius: 10px !important; }
    .create-btn mat-icon { margin-right: 4px; font-size: 20px; }
    .dash-tabs { margin-bottom: 16px; }
    .dash-tabs a mat-icon { margin-right: 6px; font-size: 20px; height: 20px; width: 20px; }
  `]
})
export class HospitalDashboardComponent {
  constructor(public auth: AuthService) {}
}
