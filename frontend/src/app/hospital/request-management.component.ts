import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-request-management',
  template: `
    <div class="fade-in">
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="36"></mat-spinner>
        <p>Loading your requests...</p>
      </div>

      <div *ngIf="!loading && requests.length === 0" class="empty-state">
        <mat-icon class="empty-icon">inbox</mat-icon>
        <h3>No requests yet</h3>
        <p>Create your first emergency request to get started.</p>
        <a mat-raised-button color="primary" routerLink="../create">
          <mat-icon>add</mat-icon> Create Request
        </a>
      </div>

      <div class="filter-bar" *ngIf="!loading && requests.length > 0">
        <div class="filter-pills">
          <button [class.active]="statusFilter === 'ALL'" (click)="statusFilter = 'ALL'">All Requests</button>
          <button [class.active]="statusFilter === 'OPEN'" (click)="statusFilter = 'OPEN'">Open</button>
          <button [class.active]="statusFilter === 'PARTIALLY_FILLED'" (click)="statusFilter = 'PARTIALLY_FILLED'">Partially Filled</button>
          <button [class.active]="statusFilter === 'FILLED'" (click)="statusFilter = 'FILLED'">Filled</button>
          <button [class.active]="statusFilter === 'CANCELLED'" (click)="statusFilter = 'CANCELLED'">Cancelled</button>
        </div>
      </div>

      <div class="request-grid" *ngIf="!loading">
        <div *ngFor="let r of filteredRequests" class="request-card cc-card">
          <div class="card-top">
            <div class="card-icon-wrap">
              <mat-icon>emergency</mat-icon>
            </div>
            <div class="card-title-area">
              <h4>{{ r.title }}</h4>
              <div class="card-location">
                <mat-icon>location_on</mat-icon> {{ r.city || 'N/A' }}
              </div>
            </div>
            <span class="status-badge" [ngClass]="'status-' + r.status.toLowerCase()">{{ formatStatus(r.status) }}</span>
          </div>

          <p class="card-desc" *ngIf="r.description">{{ r.description }}</p>

          <div class="card-stats">
            <div class="stat">
              <mat-icon>payments</mat-icon>
              <div><strong>₹{{ r.salaryPerDay }}</strong><small>/day</small></div>
            </div>
            <div class="stat">
              <mat-icon>person</mat-icon>
              <div><strong>{{ r.numDoctorsAccepted }}/{{ r.numDoctorsRequired }}</strong><small>Doctors</small></div>
            </div>
            <div class="stat">
              <mat-icon>local_hospital</mat-icon>
              <div><strong>{{ r.numNursesAccepted }}/{{ r.numNursesRequired }}</strong><small>Nurses</small></div>
            </div>
          </div>

          <div class="card-actions">
            <button mat-stroked-button (click)="openChat(r.id)">
              <mat-icon>chat</mat-icon> Chat
            </button>
            <button mat-flat-button color="warn"
                    *ngIf="r.status === 'OPEN' || r.status === 'PARTIALLY_FILLED'"
                    (click)="closeRequest(r.id)" [disabled]="closingId === r.id">
              <mat-icon>cancel</mat-icon> {{ closingId === r.id ? 'Closing...' : 'Close' }}
            </button>
            <button mat-flat-button color="warn"
                    *ngIf="r.status === 'CANCELLED' || r.status === 'FILLED'"
                    (click)="deleteRequest(r.id)" [disabled]="deletingId === r.id">
              <mat-icon>delete</mat-icon> {{ deletingId === r.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px; color:#64748B; }
    .empty-state { text-align:center; padding:60px 24px; }
    .empty-icon { font-size:56px; width:56px; height:56px; color:#CBD5E1; }
    .empty-state h3 { margin:12px 0 4px; color:#475569; }
    .empty-state p { margin:0 0 20px; color:#94A3B8; font-size:0.85rem; }

    .filter-bar { margin-bottom: 24px; display: flex; justify-content: flex-start; }
    .filter-pills { 
      display: inline-flex; background: #F8FAFC; padding: 4px; 
      border-radius: 12px; border: 1px solid #E2E8F0; gap: 4px;
    }
    .filter-pills button {
      background: transparent; border: none; padding: 8px 16px;
      border-radius: 8px; font-size: 0.85rem; font-weight: 500;
      color: #64748B; cursor: pointer; transition: all 0.2s ease;
    }
    .filter-pills button:hover { color: #1E293B; background: #F1F5F9; }
    .filter-pills button.active {
      background: #FFFFFF; color: #3B82F6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .request-grid { display:flex; flex-direction:column; gap:16px; }

    .request-card { padding:20px; cursor:default; }
    .card-top { display:flex; align-items:flex-start; gap:12px; }
    .card-icon-wrap {
      width:40px; height:40px; border-radius:10px;
      background:#FFF3E0; display:flex; align-items:center; justify-content:center;
    }
    .card-icon-wrap mat-icon { color:#E65100; font-size:22px; }
    .card-title-area { flex:1; }
    .card-title-area h4 { margin:0; font-size:0.95rem; font-weight:600; color:#1E293B; }
    .card-location { display:flex; align-items:center; gap:2px; font-size:0.75rem; color:#64748B; margin-top:2px; }
    .card-location mat-icon { font-size:14px; width:14px; height:14px; }

    .card-desc { font-size:0.82rem; color:#475569; margin:12px 0; line-height:1.5; }

    .card-stats {
      display:flex; gap:20px; padding:12px 0;
      border-top:1px solid var(--cc-divider); border-bottom:1px solid var(--cc-divider);
      margin:4px 0;
    }
    .stat { display:flex; align-items:center; gap:8px; }
    .stat mat-icon { font-size:18px; width:18px; height:18px; color:#64748B; }
    .stat strong { font-size:0.88rem; color:#1E293B; }
    .stat small { display:block; font-size:0.68rem; color:#94A3B8; }

    .card-actions { display:flex; gap:8px; justify-content:flex-end; padding-top:12px; }
    .card-actions button mat-icon { margin-right:4px; font-size:18px; height:18px; width:18px; }
  `]
})
export class RequestManagementComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  closingId: number | null = null;
  deletingId: number | null = null;
  statusFilter: string = 'ALL';

  constructor(private api: ApiService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.loading = true;
    this.api.get<any[]>('/hospitals/requests').subscribe({
      next: res => { this.requests = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredRequests(): any[] {
    if (this.statusFilter === 'ALL') return this.requests;
    return this.requests.filter(r => r.status === this.statusFilter);
  }

  openChat(requestId: number): void {
    this.router.navigate(['/chat']);
    this.snackBar.open('Select a staff conversation from the chat list.', 'OK', { duration: 3000 });
  }

  closeRequest(id: number): void {
    this.closingId = id;
    this.api.post(`/hospitals/requests/${id}/close`, {}).subscribe({
      next: () => {
        this.closingId = null;
        this.snackBar.open('Request closed successfully', 'OK', { duration: 3000 });
        this.loadRequests();
      },
      error: err => {
        this.closingId = null;
        this.snackBar.open('Failed to close request', 'OK', { duration: 3000 });
      }
    });
  }

  deleteRequest(id: number): void {
    if (!confirm('Are you sure you want to permanently delete this request?')) return;
    this.deletingId = id;
    this.api.delete(`/hospitals/requests/${id}`).subscribe({
      next: () => {
        this.deletingId = null;
        this.snackBar.open('Request deleted successfully', 'OK', { duration: 3000 });
        this.loadRequests();
      },
      error: err => {
        this.deletingId = null;
        this.snackBar.open('Failed to delete request', 'OK', { duration: 3000 });
      }

    }
    );
    console.log(this.requests, "valthukal1");
  }

  formatStatus(s: string): string {
    return s.replace(/_/g, ' ');
  }
}
