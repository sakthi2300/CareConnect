import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- Auth pages: no sidenav -->
    <div *ngIf="!auth.isLoggedIn" class="auth-shell">
      <router-outlet></router-outlet>
    </div>

    <!-- Dashboard shell with sidenav -->
    <mat-sidenav-container *ngIf="auth.isLoggedIn" class="app-shell">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" [opened]="true" class="app-sidebar">
        <div class="sidebar-brand" routerLink="/" style="cursor:pointer">
          <img src="assets/logo.svg" alt="CareConnect" class="brand-logo">
          <span class="brand-name">CareConnect</span>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list class="sidebar-nav">
          <a mat-list-item
             [routerLink]="auth.role === 'ROLE_HOSPITAL' ? '/hospital' : '/staff'"
             routerLinkActive="active-nav"
             [routerLinkActiveOptions]="{exact: false}">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/chat" routerLinkActive="active-nav">
            <mat-icon matListItemIcon>forum</mat-icon>
            <span matListItemTitle>Messages</span>
          </a>
          <a mat-list-item *ngIf="auth.role === 'ROLE_HOSPITAL'"
             routerLink="/hospital/create" routerLinkActive="active-nav">
            <mat-icon matListItemIcon>add_circle_outline</mat-icon>
            <span matListItemTitle>New Request</span>
          </a>
        </mat-nav-list>
        <div class="sidebar-spacer"></div>
        <mat-divider></mat-divider>
        <div class="sidebar-user" routerLink="/profile" routerLinkActive="active-nav" style="cursor: pointer;" matRipple>
          <div class="user-avatar" [class.emoji-mode]="auth.avatarUrl && isEmoji(auth.avatarUrl)">
            <mat-icon *ngIf="!auth.avatarUrl">person</mat-icon>
            <span *ngIf="auth.avatarUrl && isEmoji(auth.avatarUrl)">{{ auth.avatarUrl }}</span>
            <img *ngIf="auth.avatarUrl && !isEmoji(auth.avatarUrl)" [src]="auth.avatarUrl" alt="Avatar">
          </div>
          <div class="user-info">
            <span class="user-name">{{ auth.fullName }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
        </div>
        <mat-nav-list class="sidebar-bottom">
          <a mat-list-item (click)="logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="app-content">
        <div class="content-toolbar">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <div class="content-body" [class.chat-body]="isChatRoute()">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* Auth shell */
    .auth-shell { min-height: 100vh; background: linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #26A69A 100%); }

    /* App shell */
    .app-shell { height: 100vh; }

    /* Sidebar — clean white */
    .app-sidebar {
      width: var(--cc-sidebar-width); background: #FFFFFF;
      border-right: 1px solid #E2E8F0 !important;
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 20px 16px;
    }
    .brand-logo {
      width: 36px; height: 36px; object-fit: contain;
    }
    .brand-name { font-weight: 700; font-size: 1.1rem; letter-spacing: 0.02em; color: #1E293B; }

    .app-sidebar mat-divider { border-color: #F1F5F9 !important; }

    /* Sidebar nav */
    .sidebar-nav { padding: 8px 12px; }
    .sidebar-nav a {
      border-radius: 10px !important;
      color: #475569 !important;
      margin-bottom: 2px;
      height: 44px !important;
      transition: all 0.2s ease !important;
    }
    .sidebar-nav a:hover {
      background: #F1F5F9 !important;
      color: #1E293B !important;
    }
    .sidebar-nav a.active-nav {
      background: #EFF6FF !important;
      color: #2563EB !important;
    }
    .sidebar-nav a.active-nav mat-icon { color: #2563EB !important; }
    .sidebar-nav mat-icon { color: #94A3B8 !important; font-size: 20px !important; margin-right: 4px; }
    .sidebar-nav a:hover mat-icon { color: #475569 !important; }

    .sidebar-spacer { flex: 1; }

    /* User section */
    .sidebar-user {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 20px;
    }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #E2E8F0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .user-avatar.emoji-mode { background: transparent; font-size: 24px; line-height: 36px; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-avatar mat-icon { color: #94A3B8; font-size: 20px; width: 20px; height: 20px; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.8rem; font-weight: 600; color: #1E293B; }
    .user-role { font-size: 0.68rem; color: #64748B; }

    /* Logout */
    .sidebar-bottom { padding: 4px 12px 12px; }
    .sidebar-bottom a {
      border-radius: 10px !important;
      color: #64748B !important;
      height: 40px !important;
      transition: all 0.2s ease !important;
    }
    .sidebar-bottom a:hover { color: #EF4444 !important; background: #FEF2F2 !important; }
    .sidebar-bottom mat-icon { color: #94A3B8 !important; }
    .sidebar-bottom a:hover mat-icon { color: #EF4444 !important; }

    /* Content — FULL WIDTH, no max-width cap */
    .app-content { background: var(--cc-bg); display: flex; flex-direction: column; }
    .content-toolbar {
      padding: 20px 32px 0;
    }
    .page-title {
      margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--cc-text);
    }
    .content-body {
      flex: 1; padding: 20px 32px 32px;
      overflow-y: auto;
    }
    .content-body.chat-body { padding: 12px 24px 24px; }
  `]
})
export class AppComponent implements OnInit {
  pageTitle = 'Dashboard';
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updatePageTitle(e.urlAfterRedirects || e.url);
    });
  }

  getRoleLabel(): string {
    const r = this.auth.role;
    if (r === 'ROLE_HOSPITAL') return 'Hospital';
    if (r === 'ROLE_DOCTOR') return 'Doctor';
    if (r === 'ROLE_NURSE') return 'Nurse';
    return '';
  }

  isEmoji(str: string): boolean {
    if (!str) return false;
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    return emojiRegex.test(str) && str.length <= 5;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  isChatRoute(): boolean {
    return this.router.url.startsWith('/chat');
  }

  private updatePageTitle(url: string): void {
    if (url.includes('/chat')) this.pageTitle = 'Messages';
    else if (url.includes('/profile')) this.pageTitle = 'User Profile';
    else if (url.includes('/hospital/create')) this.pageTitle = 'New Request';
    else if (url.includes('/hospital')) this.pageTitle = 'Dashboard';
    else if (url.includes('/staff/accepted')) this.pageTitle = 'Accepted Jobs';
    else if (url.includes('/staff')) this.pageTitle = 'Dashboard';
    else this.pageTitle = 'Dashboard';
  }
}
