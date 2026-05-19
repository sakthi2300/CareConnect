import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { WebSocketService } from '../core/services/websocket.service';
import { NotificationService, EmergencyRequestNotification } from '../core/services/notification.service';
import { AuthService } from '../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nearby-requests',
  template: `
    <div class="fade-in">
      <!-- Notification banner -->
      <div *ngIf="notification" class="notif-banner" @fadeIn>
        <mat-icon>notifications_active</mat-icon>
        {{ notification }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="36"></mat-spinner>
        <p>Searching for nearby requests...</p>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && requests.length === 0" class="empty-state">
        <mat-icon class="empty-icon">explore_off</mat-icon>
        <h3>No nearby requests</h3>
        <p>Emergency requests from hospitals near you will appear here.</p>
      </div>

      <!-- Request cards -->
      <div class="request-grid" *ngIf="!loading">
        <div *ngFor="let r of requests" class="request-card cc-card"
             [class.new-card]="r._isNew" [class.accepted-card]="acceptedId === r.id">
          <div class="card-top">
            <div class="card-icon-wrap">
              <mat-icon>emergency</mat-icon>
            </div>
            <div class="card-title-area">
              <h4>{{ r.title }}</h4>
              <div class="card-meta-inline">
                <span><mat-icon>business</mat-icon> {{ r.hospitalName }}</span>
                <span><mat-icon>location_on</mat-icon> {{ r.city || 'N/A' }}</span>
                <span *ngIf="r.distanceKm != null"><mat-icon>straighten</mat-icon> {{ r.distanceKm }} km</span>
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
            <button mat-flat-button color="primary" (click)="acceptRequest(r.id)"
                    [disabled]="accepting === r.id || r.status === 'FILLED' || r.status === 'CANCELLED' || isAcceptDisabled(r)">
              <mat-spinner *ngIf="accepting === r.id" diameter="18" class="btn-spinner"></mat-spinner>
              <mat-icon *ngIf="accepting !== r.id">{{ acceptedId === r.id ? 'check' : 'check_circle' }}</mat-icon>
              {{ accepting === r.id ? 'Accepting...' : (acceptedId === r.id ? 'Accepted!' : 'Accept') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-banner {
      display:flex; align-items:center; gap:8px;
      background: linear-gradient(135deg, #E3F2FD, #E0F2F1);
      color:#1565C0; padding:10px 16px; border-radius:10px;
      font-size:0.82rem; font-weight:500; margin-bottom:16px;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulseNew { 0% { box-shadow:0 0 0 0 rgba(25,118,210,.25); } 70% { box-shadow:0 0 0 8px rgba(25,118,210,0); } }

    .loading-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px; color:#64748B; }
    .empty-state { text-align:center; padding:60px 24px; }
    .empty-icon { font-size:56px; width:56px; height:56px; color:#CBD5E1; }
    .empty-state h3 { margin:12px 0 4px; color:#475569; }
    .empty-state p { margin:0; color:#94A3B8; font-size:0.85rem; }

    .request-grid { display:flex; flex-direction:column; gap:16px; }
    .request-card { padding:20px; }
    .new-card { animation: pulseNew 1.5s ease-out; border-left:4px solid #1976D2 !important; }
    .accepted-card { border-left:4px solid #4CAF50 !important; }

    .card-top { display:flex; align-items:flex-start; gap:12px; }
    .card-icon-wrap {
      width:40px; height:40px; border-radius:10px;
      background:#FFF3E0; display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .card-icon-wrap mat-icon { color:#E65100; font-size:22px; }
    .card-title-area { flex:1; min-width:0; }
    .card-title-area h4 { margin:0; font-size:0.95rem; font-weight:600; color:#1E293B; }
    .card-meta-inline { display:flex; flex-wrap:wrap; gap:12px; margin-top:4px; }
    .card-meta-inline span { display:flex; align-items:center; gap:2px; font-size:0.72rem; color:#64748B; }
    .card-meta-inline mat-icon { font-size:13px; width:13px; height:13px; }

    .card-desc { font-size:0.82rem; color:#475569; margin:12px 0; line-height:1.5; }

    .card-stats {
      display:flex; gap:16px; padding:12px 0; flex-wrap: wrap;
      border-top:1px solid var(--cc-divider); border-bottom:1px solid var(--cc-divider); margin:8px 0;
    }
    .stat { display:flex; align-items:center; gap:8px; min-width: 60px; }
    .stat mat-icon { font-size:20px; width:20px; height:20px; line-height:20px; color:#64748B; overflow:hidden; flex-shrink:0; }
    .stat strong { font-size:0.9rem; color:#1E293B; line-height:1.2; display:block; }
    .stat small { display:block; font-size:0.7rem; color:#94A3B8; line-height:1.2; }

    .card-actions { display:flex; gap:8px; justify-content:flex-end; padding-top:12px; }
    .card-actions button mat-icon { margin-right:4px; font-size:18px; height:18px; width:18px; }
    .btn-spinner { display:inline-block; margin-right:6px; }
  `]
})
export class NearbyRequestsComponent implements OnInit, OnDestroy {
  requests: any[] = [];
  loading = true;
  accepting: number | null = null;
  acceptedId: number | null = null;
  notification: string | null = null;
  private notifSub: Subscription | null = null;
  private updateSub: Subscription | null = null;
  private notificationTimeout: any = null;

  constructor(
    private api: ApiService,
    private notificationService: NotificationService,
    private wsService: WebSocketService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.notificationService.startListening();

    this.notifSub = this.notificationService.onEmergencyRequest().subscribe({
      next: (newRequest: EmergencyRequestNotification) => {
        const exists = this.requests.some(r => r.id === newRequest.id);
        if (!exists) {
          const requestWithFlag = { ...newRequest, _isNew: true };
          this.requests = [requestWithFlag, ...this.requests];
          this.notification = `New emergency request from ${newRequest.hospitalName || 'a hospital'}!`;
          if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
          this.notificationTimeout = setTimeout(() => { this.notification = null; }, 5000);
          setTimeout(() => { requestWithFlag._isNew = false; }, 3000);
        }
      }
    });

    this.wsService.connect(this.auth.token);
    this.updateSub = this.wsService.subscribe('/topic/emergency-requests').subscribe(msg => {
      try {
        const data = JSON.parse(msg.body);
        if (data.type === 'REQUEST_UPDATED' && data.request) {
          const updated = data.request;
          const idx = this.requests.findIndex(r => r.id === updated.id);
          if (idx >= 0) {
            this.requests[idx] = { ...this.requests[idx], ...updated };
            if (updated.status === 'FILLED' || updated.status === 'CANCELLED') {
              setTimeout(() => {
                this.requests = this.requests.filter(r => r.id !== updated.id);
              }, 2000);
            }
          }
        }
      } catch (_) {}
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.updateSub?.unsubscribe();
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationService.stopListening();
  }

  loadRequests(): void {
    this.loading = true;
    this.api.get<any[]>('/staff/requests/nearby').subscribe({
      next: res => { this.requests = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  acceptRequest(id: number): void {
    console.log('[Accept] Calling POST /api/staff/requests/' + id + '/accept');
    this.accepting = id;
    this.acceptedId = null;
    this.api.post<any>(`/staff/requests/${id}/accept`, {}).subscribe({
      next: (updatedRequest) => {
        console.log('[Accept] SUCCESS for requestId=' + id, updatedRequest);
        this.accepting = null;
        this.acceptedId = id;
        this.snackBar.open('Request accepted successfully! 🎉', 'OK', { duration: 3000 });

        // Immediately update the card with the new counts/status from server response
        if (updatedRequest) {
          const idx = this.requests.findIndex(r => r.id === id);
          if (idx >= 0) {
            this.requests[idx] = { ...this.requests[idx], ...updatedRequest };
          }
        }

        // If request is now fully filled, remove it from the list after a brief delay
        if (updatedRequest?.status === 'FILLED') {
          setTimeout(() => {
            this.requests = this.requests.filter(r => r.id !== id);
          }, 2000);
        }
      },
      error: err => {
        console.error('[Accept] FAILED for requestId=' + id, err.status, err.error);
        this.accepting = null;
        const msg = err?.error?.error || err?.error?.message || 'Failed to accept request';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }

  openChat(requestId: number): void {
    const userId = this.auth.userId;
    if (!userId) return;
    this.router.navigate(['/chat', requestId, userId]);
  }

  formatStatus(s: string): string { return s.replace(/_/g, ' '); }

  isAcceptDisabled(r: any): boolean {
    const role = this.auth.role;
    if (role === 'ROLE_DOCTOR') {
      return r.numDoctorsAccepted >= r.numDoctorsRequired;
    } else if (role === 'ROLE_NURSE') {
      return r.numNursesAccepted >= r.numNursesRequired;
    }
    return false;
  }
}
