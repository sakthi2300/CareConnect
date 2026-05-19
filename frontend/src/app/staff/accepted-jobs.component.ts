import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-accepted-jobs',
  template: `
    <div *ngIf="loading" class="empty-state fade-in">
      <mat-spinner diameter="34"></mat-spinner>
      <p>Loading accepted jobs...</p>
    </div>

    <div *ngIf="!loading && jobs.length === 0" class="empty-state fade-in">
      <mat-icon class="empty-icon">work_outline</mat-icon>
      <h3>No accepted jobs yet</h3>
      <p>When you accept emergency requests, they'll appear here.</p>
      <a mat-stroked-button color="primary" routerLink="../nearby">
        <mat-icon>explore</mat-icon> Browse Requests
      </a>
    </div>

    <div class="jobs-grid fade-in" *ngIf="!loading && jobs.length > 0">
      <div *ngFor="let job of jobs" class="job-card cc-card">
        <div class="job-top">
          <div>
            <h4>{{ job.title }}</h4>
            <p class="meta">
              <span><mat-icon>business</mat-icon>{{ job.hospitalName }}</span>
              <span><mat-icon>location_on</mat-icon>{{ job.city || 'N/A' }}</span>
            </p>
          </div>
          <span class="status-badge" [ngClass]="'status-' + job.status.toLowerCase()">
            {{ formatStatus(job.status) }}
          </span>
        </div>

        <p class="desc" *ngIf="job.description">{{ job.description }}</p>

        <div class="stats">
          <span><mat-icon>payments</mat-icon> ₹{{ job.salaryPerDay }}/day</span>
          <span><mat-icon>person</mat-icon> {{ job.numDoctorsAccepted }}/{{ job.numDoctorsRequired }}</span>
          <span><mat-icon>local_hospital</mat-icon> {{ job.numNursesAccepted }}/{{ job.numNursesRequired }}</span>
        </div>

        <div class="actions">
          <button mat-stroked-button (click)="openChat(job.id)">
            <mat-icon>chat</mat-icon> Open Chat
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; color: #CBD5E1; }
    .empty-state h3 { margin: 12px 0 4px; color: #475569; }
    .empty-state p { margin: 0 0 20px; color: #94A3B8; font-size: 0.85rem; }
    .empty-state a mat-icon { margin-right: 4px; }

    .jobs-grid { display:flex; flex-direction:column; gap:14px; }
    .job-card { padding:18px; }
    .job-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
    .job-top h4 { margin:0; color:#1E293B; font-size:0.95rem; }
    .meta { margin:4px 0 0; display:flex; gap:10px; flex-wrap:wrap; color:#64748B; font-size:0.74rem; }
    .meta span { display:flex; align-items:center; gap:2px; }
    .meta mat-icon { font-size:13px; width:13px; height:13px; }
    .desc { margin:10px 0; font-size:0.82rem; color:#475569; }
    .stats { display:flex; gap:12px; flex-wrap:wrap; font-size:0.76rem; color:#475569; }
    .stats span { display:flex; align-items:center; gap:3px; }
    .stats mat-icon { font-size:14px; width:14px; height:14px; }
    .actions { margin-top:12px; display:flex; justify-content:flex-end; }
  `]
})
export class AcceptedJobsComponent implements OnInit {
  jobs: any[] = [];
  loading = true;

  constructor(private api: ApiService, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.get<any[]>('/staff/requests/accepted').subscribe({
      next: res => {
        this.jobs = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.jobs = [];
        this.loading = false;
      }
    });
  }

  openChat(requestId: number): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.router.navigate(['/chat', requestId, userId]);
  }

  formatStatus(status: string): string {
    return (status || '').replace(/_/g, ' ');
  }
}
