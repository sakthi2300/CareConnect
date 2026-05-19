import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <div class="login-card fade-in">
        <div class="card-header">
          <div class="logo-wrap">
            <img src="assets/logo.svg" alt="CareConnect" class="logo-img">
          </div>
          <h1>CareConnect</h1>
          <p class="subtitle">Healthcare Staffing Platform</p>
        </div>

        <div class="alert-error" *ngIf="error">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email address</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" required placeholder="you@example.com">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePass ? 'password' : 'text'" name="password" [(ngModel)]="password" required>
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hidePass=!hidePass" tabindex="-1">
              <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="full-width login-btn"
                  [disabled]="form.invalid || loading">
            <mat-spinner *ngIf="loading" diameter="20" class="btn-spinner"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">or register as</span>
          <span class="divider-line"></span>
        </div>

        <div class="register-btns">
          <a mat-stroked-button routerLink="/auth/register-hospital" class="reg-btn hospital-btn">
            <mat-icon>business</mat-icon> Hospital
          </a>
          <a mat-stroked-button routerLink="/auth/register-staff" class="reg-btn staff-btn">
            <mat-icon>medical_services</mat-icon> Doctor / Nurse
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .login-card {
      background: #fff; border-radius: 20px; padding: 40px 36px;
      width: 100%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
    }
    .card-header { text-align: center; margin-bottom: 24px; }
    .logo-wrap {
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .logo-img { width: 64px; height: 64px; object-fit: contain; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1E293B; }
    .subtitle { margin: 4px 0 0; font-size: 0.82rem; color: #64748B; }

    .alert-error {
      display: flex; align-items: center; gap: 8px;
      background: #FFF0F0; border: 1px solid #FECACA; color: #DC2626;
      padding: 10px 14px; border-radius: 10px; font-size: 0.82rem;
      margin-bottom: 16px;
    }
    .alert-error mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }

    form { display: flex; flex-direction: column; gap: 4px; }
    .login-btn {
      height: 48px; font-size: 0.95rem; font-weight: 600;
      letter-spacing: 0.3px; margin-top: 4px;
    }
    .btn-spinner { display: inline-block; margin-right: 8px; }

    .divider-row {
      display: flex; align-items: center; gap: 12px;
      margin: 24px 0 16px;
    }
    .divider-line { flex: 1; height: 1px; background: #E2E8F0; }
    .divider-text { font-size: 0.72rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; }

    .register-btns { display: flex; gap: 10px; }
    .reg-btn { flex: 1; height: 42px; font-size: 0.8rem; border-radius: 10px !important; }
    .hospital-btn { color: #2E7D32 !important; border-color: #C8E6C9 !important; }
    .hospital-btn:hover { background: #F1F8F1 !important; }
    .staff-btn { color: #7B1FA2 !important; border-color: #E1BEE7 !important; }
    .staff-btn:hover { background: #FBF3FE !important; }
    .reg-btn mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;
  hidePass = true;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = null;
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        if (res.role === 'ROLE_HOSPITAL') { this.router.navigate(['/hospital']); }
        else { this.router.navigate(['/staff']); }
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.error || 'Invalid email or password.';
      }
    });
  }
}
