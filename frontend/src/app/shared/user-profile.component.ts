import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  template: `
    <div class="page-container fade-in">
      <mat-card class="profile-card cc-card">
        <div class="card-header-bg"></div>
        <div class="avatar-wrapper" *ngIf="profile">
          <div class="current-avatar" [class.emoji-mode]="isEmoji(newAvatar)">
            <mat-icon *ngIf="!newAvatar">person</mat-icon>
            <span *ngIf="newAvatar && isEmoji(newAvatar)">{{ newAvatar }}</span>
            <img *ngIf="newAvatar && !isEmoji(newAvatar)" [src]="newAvatar" alt="Avatar">
          </div>
        </div>

        <div class="custom-content">
          <div *ngIf="!profile" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading profile...</p>
          </div>

          <div class="profile-details" *ngIf="profile">
            <h3 class="profile-name">{{ profile.fullName }}</h3>
            <p class="profile-role">{{ formatRole(profile.role) }}</p>

            <div class="info-list">
              <div class="info-item">
                <mat-icon>email</mat-icon>
                <span>{{ profile.email }}</span>
              </div>
              <div class="info-item">
                <mat-icon>phone</mat-icon>
                <span>{{ profile.phoneNumber || 'Not provided' }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="avatar-edit-section">
              <p class="section-title">Change Your Profile Avatar</p>
              
              <div class="emoji-presets">
                <button class="preset-btn" *ngFor="let emoji of presets" (click)="newAvatar = emoji" 
                        [class.active]="newAvatar === emoji">{{ emoji }}</button>
              </div>

              <div class="custom-input-group">
                <input class="modern-input" [(ngModel)]="newAvatar" placeholder="Type Image URL or an Emoji...">
                <button mat-flat-button color="primary" class="save-btn" [disabled]="saving" (click)="updateAvatar()">
                   {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex; justify-content: center; width: 100%; min-height: 100%; padding: 20px;
    }
    .profile-card { 
      width: 100%; max-width: 500px;
      overflow: hidden; padding: 0; background: #FFF; 
      border-radius: 16px;
    }
    
    .card-header-bg { 
      height: 140px;
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
    }
    
    .avatar-wrapper {
      margin-top: -60px;
      display: flex; justify-content: center;
    }
    .current-avatar {
      width: 120px; height: 120px; border-radius: 50%;
      background: #EFF6FF; border: 6px solid #FFF;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .current-avatar.emoji-mode { background: #F8FAFC; font-size: 64px; line-height: 120px; }
    .current-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .current-avatar mat-icon { font-size: 50px; width: 50px; height: 50px; color: #94A3B8; }

    .custom-content { padding: 20px 32px 40px; }
    .loading-state { padding: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748B; }
    
    .profile-details { text-align: center; }
    .profile-name { margin: 0; font-size: 1.6rem; font-weight: 700; color: #1E293B; }
    .profile-role { margin: 4px 0 24px; font-size: 0.9rem; font-weight: 600; color: #3B82F6; letter-spacing: 0.5px; }
    
    .info-list { display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; padding: 20px; border-radius: 12px; text-align: left; }
    .info-item { display: flex; align-items: center; gap: 16px; font-size: 0.95rem; color: #475569; }
    .info-item mat-icon { width: 24px; height: 24px; font-size: 24px; color: #94A3B8; }
    
    .divider { height: 1px; background: #E2E8F0; margin: 32px 0; }
    
    .avatar-edit-section { display: flex; flex-direction: column; gap: 20px; text-align: left; }
    .section-title { margin: 0; font-size: 1.05rem; font-weight: 600; color: #1E293B; }
    
    .emoji-presets { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-start; }
    .preset-btn { 
      background: #F1F5F9; border: 2px solid transparent; border-radius: 50%;
      width: 50px; height: 50px; font-size: 24px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease;
    }
    .preset-btn:hover { background: #E2E8F0; transform: scale(1.05); }
    .preset-btn.active { border-color: #3B82F6; background: #EFF6FF; }
    
    .custom-input-group { display: flex; gap: 8px; margin-top: 8px; }
    .modern-input {
      flex: 1; padding: 0 16px; border-radius: 8px; border: 1px solid #CBD5E1;
      font-size: 0.95rem; outline: none; transition: border-color 0.2s;
    }
    .modern-input:focus { border-color: #3B82F6; }
    .save-btn { padding: 0 24px; border-radius: 8px; font-weight: 600; }
  `]
})
export class UserProfileComponent implements OnInit {
  profile: any = null;
  newAvatar: string = '';
  saving = false;
  presets = ['🏥', '👨‍⚕️', '👩‍⚕️', '💉', '🚑', '🩺', '🧑‍⚕️', '🌟'];

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.api.get<any>('/users/profile').subscribe({
      next: (res) => {
        this.profile = res;
        this.newAvatar = res.avatarUrl || '';
      },
      error: () => {
        this.snackBar.open('Failed to load profile', 'OK', { duration: 3000 });
      }
    });
  }

  isEmoji(str: string): boolean {
    if (!str) return false;
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    return emojiRegex.test(str) && str.length <= 5;
  }

  formatRole(r: string): string {
    return r ? r.replace('ROLE_', '') : '';
  }

  updateAvatar() {
    this.saving = true;
    this.api.put<any>('/users/profile/avatar', { avatarUrl: this.newAvatar }).subscribe({
      next: (res) => {
        this.saving = false;
        this.profile = res;
        this.auth.updateAvatarLocally(this.newAvatar);
        this.snackBar.open('Avatar updated successfully!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to update avatar', 'OK', { duration: 3000 });
      }
    });
  }
}
