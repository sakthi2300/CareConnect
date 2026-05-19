import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-hospital-register',
  template: `
    <div class="register-page">
      <div class="register-card fade-in">
        <div class="card-header">
          <div class="logo-wrap hospital"><mat-icon>business</mat-icon></div>
          <h1>Register Hospital</h1>
          <p class="subtitle">Join CareConnect to find medical staff</p>
        </div>
        <div class="alert-error" *ngIf="error"><mat-icon>error_outline</mat-icon><span>{{ error }}</span></div>
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Hospital Name</mat-label>
            <input matInput name="hospitalName" [(ngModel)]="data.hospitalName" required>
            <mat-icon matPrefix>business</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contact Person</mat-label>
            <input matInput name="fullName" [(ngModel)]="data.fullName" required>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Email</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="data.email" required>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Password</mat-label>
              <input matInput type="password" name="password" [(ngModel)]="data.password" required minlength="6">
            </mat-form-field>
          </div>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label>
              <input matInput type="tel" name="phoneNumber" [(ngModel)]="data.phoneNumber">
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>City</mat-label>
              <input matInput name="city" [(ngModel)]="data.city">
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput name="address" [(ngModel)]="data.address">
          </mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Latitude</mat-label>
              <input matInput type="number" name="latitude" [(ngModel)]="data.latitude" step="any">
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Longitude</mat-label>
              <input matInput type="number" name="longitude" [(ngModel)]="data.longitude" step="any">
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="form.invalid||loading">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            {{ loading ? 'Registering...' : 'Register Hospital' }}
          </button>
          <p class="link">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .register-card { background:#fff; border-radius:20px; padding:32px; width:100%; max-width:480px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
    .card-header { text-align:center; margin-bottom:20px; }
    .logo-wrap { width:48px; height:48px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px; }
    .logo-wrap.hospital { background:#E8F5E9; }
    .logo-wrap mat-icon { font-size:24px; width:24px; height:24px; color:#2E7D32; }
    h1 { margin:0; font-size:1.3rem; font-weight:700; color:#1E293B; }
    .subtitle { margin:4px 0 0; font-size:0.8rem; color:#64748B; }
    .alert-error { display:flex; align-items:center; gap:8px; background:#FFF0F0; border:1px solid #FECACA; color:#DC2626; padding:8px 12px; border-radius:8px; font-size:0.8rem; margin-bottom:12px; }
    form { display:flex; flex-direction:column; gap:2px; }
    .row { display:flex; gap:12px; }
    .row mat-form-field { flex:1; }
    .submit-btn { height:46px; font-size:0.9rem; font-weight:600; margin-top:4px; }
    .link { text-align:center; font-size:0.8rem; color:#64748B; margin:12px 0 0; }
    .link a { color:#1976D2; font-weight:500; }
  `]
})
export class HospitalRegisterComponent {
  data: any = {};
  error: string | null = null;
  loading = false;
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit(): void {
    this.loading = true; this.error = null;
    this.auth.registerHospital(this.data).subscribe({
      next: () => this.router.navigate(['/hospital']),
      error: err => { this.loading = false; this.error = err.error?.error || 'Registration failed.'; }
    });
  }
}
