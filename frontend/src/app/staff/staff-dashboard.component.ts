import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-staff-dashboard',
  template: `
    <div class="fade-in">
      <div class="dash-welcome">
        <div class="welcome-text">
          <h3>Welcome back, {{ auth.fullName }} 👋</h3>
          <p>Find and accept emergency staffing requests near you</p>
        </div>
      </div>

      <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="dash-tabs" color="accent">
        <a mat-tab-link routerLink="nearby" routerLinkActive #rla1="routerLinkActive" [active]="rla1.isActive">
          <mat-icon>explore</mat-icon> Nearby Requests
        </a>
        <a mat-tab-link routerLink="accepted" routerLinkActive #rla2="routerLinkActive" [active]="rla2.isActive">
          <mat-icon>work</mat-icon> Accepted Jobs
        </a>
      </nav>
      <mat-tab-nav-panel #tabPanel>
        <router-outlet></router-outlet>
      </mat-tab-nav-panel>
    </div>
  `,
  styles: [`
    .dash-welcome {
      margin-bottom: 20px; padding: 20px 24px;
      background: linear-gradient(135deg, #E0F2F1 0%, #E8F5E9 100%);
      border-radius: var(--cc-radius); border: 1px solid #B2DFDB;
    }
    .welcome-text h3 { margin: 0; font-size: 1.15rem; font-weight: 600; color: #1E293B; }
    .welcome-text p { margin: 4px 0 0; font-size: 0.82rem; color: #64748B; }
    .dash-tabs { margin-bottom: 16px; }
    .dash-tabs a mat-icon { margin-right: 6px; font-size: 20px; height: 20px; width: 20px; }
  `]
})
export class StaffDashboardComponent {
  constructor(public auth: AuthService) {}
}
