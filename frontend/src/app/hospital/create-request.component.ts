import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-request',
  template: `
    <div class="form-wrapper fade-in">
      <mat-card class="form-card cc-card">
        <mat-card-header class="card-header">
          <div class="header-icon-wrap"><mat-icon>add_alert</mat-icon></div>
          <div class="header-text">
            <mat-card-title>Create Emergency Request</mat-card-title>
            <mat-card-subtitle>Post a staffing request for medical professionals instantly</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput name="title" [(ngModel)]="data.title" required placeholder="e.g. Urgent ICU Staffing">
              <mat-icon matPrefix>title</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput name="description" [(ngModel)]="data.description" rows="3"
                        placeholder="Describe the emergency and requirements"></textarea>
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput name="city" [(ngModel)]="data.city">
                <mat-icon matPrefix>location_city</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Salary/Day (₹)</mat-label>
                <input matInput type="number" name="salaryPerDay" [(ngModel)]="data.salaryPerDay" required min="0">
                <mat-icon matPrefix>payments</mat-icon>
              </mat-form-field>
            </div>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Latitude</mat-label>
                <input matInput type="number" name="latitude" [(ngModel)]="data.latitude" step="any">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Longitude</mat-label>
                <input matInput type="number" name="longitude" [(ngModel)]="data.longitude" step="any">
              </mat-form-field>
            </div>

            <div class="section-label">Staff Requirements</div>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Doctors Required</mat-label>
                <input matInput type="number" name="numDoctorsRequired" [(ngModel)]="data.numDoctorsRequired" required min="0">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nurses Required</mat-label>
                <input matInput type="number" name="numNursesRequired" [(ngModel)]="data.numNursesRequired" required min="0">
                <mat-icon matPrefix>local_hospital</mat-icon>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn"
                    [disabled]="form.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              {{ loading ? 'Creating...' : 'Create Request' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrapper { width: 100%; display: flex; justify-content: center; padding: 24px 0; }
    .form-card { width: 100%; max-width: 650px; border-radius: 16px !important; padding: 28px 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.06) !important; background: #FFF; }
    
    .card-header { padding: 0 0 24px 0; margin-bottom: 24px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; gap: 16px; }
    .header-icon-wrap { width: 56px; height: 56px; border-radius: 14px; background: #E0F2FE; display: flex; align-items: center; justify-content: center; color: #0284C7; }
    .header-icon-wrap mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .header-text mat-card-title { font-size: 1.45rem; font-weight: 700; color: #0F172A; margin: 0; }
    .header-text mat-card-subtitle { font-size: 0.9rem; color: #64748B; margin-top: 4px; }

    form { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; gap: 16px; width: 100%; }
    .row mat-form-field { flex: 1; }
    
    .section-label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 4px; padding-bottom: 8px; border-bottom: 2px dashed #F1F5F9; }
    .submit-btn { height: 52px; font-size: 1rem; font-weight: 600; letter-spacing: 0.5px; margin-top: 16px; border-radius: 12px !important; }
  `]
})
export class CreateRequestComponent {
  data: any = { salaryPerDay: 0, numDoctorsRequired: 0, numNursesRequired: 0 };
  loading = false;

  constructor(private api: ApiService, private router: Router, private snackBar: MatSnackBar) { }

  onSubmit(): void {
    this.loading = true;
    const payload = {
      ...this.data,
      salaryPerDay: this.toNumberOrNull(this.data.salaryPerDay),
      numDoctorsRequired: this.toNumberOrNull(this.data.numDoctorsRequired),
      numNursesRequired: this.toNumberOrNull(this.data.numNursesRequired),
      latitude: this.toNumberOrNull(this.data.latitude),
      longitude: this.toNumberOrNull(this.data.longitude)
    };

    this.api.post('/hospitals/requests', payload).subscribe({
      next: () => {
        this.snackBar.open('Request created and broadcasted!', 'OK', { duration: 3000 });
        this.router.navigate(['/hospital/requests']);
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(this.getErrorMessage(err), 'OK', { duration: 5000 });
      }
    });
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getErrorMessage(err: any): string {
    const body = err?.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body?.error) {
      return body.error;
    }
    if (err?.message) {
      return err.message;
    }
    return 'Failed to create request';
  }
}
