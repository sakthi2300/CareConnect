import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-chat-list',
  template: `
    <div class="list-container">
      <div class="list-header">
        <mat-icon>forum</mat-icon>
        <span>Conversations</span>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="24"></mat-spinner>
      </div>

      <div *ngIf="!loading && conversations.length === 0" class="empty-list">
        <mat-icon>chat_bubble_outline</mat-icon>
        <p>No conversations yet</p>
        <small>Start chatting from a request</small>
      </div>

      <div class="conversation-list" *ngIf="!loading">
        <div *ngFor="let conv of conversations"
             class="conv-item"
             [class.active]="activeConversationKey === conversationKey(conv)"
             (click)="openChat(conv.requestId, conv.participantUserId)">
          <div class="conv-avatar" [class.hospital-avatar]="conv.otherPartyName !== 'Staff'">
            <mat-icon>{{ conv.otherPartyName === 'Staff' ? 'medical_services' : 'business' }}</mat-icon>
          </div>
          <div class="conv-body">
            <div class="conv-top-row">
              <span class="conv-name">{{ conv.otherPartyName }}</span>
              <span class="conv-time" *ngIf="conv.lastMessageAt">{{ formatTime(conv.lastMessageAt) }}</span>
            </div>
            <div class="conv-request-title">{{ conv.requestTitle }}</div>
            <div class="conv-preview" *ngIf="conv.lastMessage">{{ conv.lastMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-container { display: flex; flex-direction: column; height: 100%; }
    .list-header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 20px; font-weight: 700; font-size: 0.95rem;
      color: var(--cc-text); border-bottom: 1px solid var(--cc-border);
    }
    .list-header mat-icon { color: var(--cc-primary); font-size: 22px; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
    .empty-list {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; color: var(--cc-text-hint); gap: 4px; padding: 32px;
    }
    .empty-list mat-icon { font-size: 40px; width: 40px; height: 40px; color: #CBD5E1; }
    .empty-list p { font-size: 0.85rem; margin: 4px 0 0; }
    .empty-list small { font-size: 0.72rem; }

    .conversation-list { flex: 1; overflow-y: auto; }
    .conv-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 20px; cursor: pointer;
      border-bottom: 1px solid var(--cc-divider);
      transition: background 0.15s ease;
    }
    .conv-item:hover { background: #F1F5F9; }
    .conv-item.active {
      background: #EBF5FF;
      border-left: 3px solid var(--cc-primary);
    }

    .conv-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: #E8EAF6; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .conv-avatar.hospital-avatar { background: #E8F5E9; }
    .conv-avatar.hospital-avatar mat-icon { color: #2E7D32; }
    .conv-avatar mat-icon { font-size: 20px; width: 20px; height: 20px; color: #5C6BC0; }

    .conv-body { flex: 1; min-width: 0; }
    .conv-top-row { display: flex; justify-content: space-between; align-items: center; }
    .conv-name { font-weight: 600; font-size: 0.82rem; color: var(--cc-text); }
    .conv-time { font-size: 0.65rem; color: var(--cc-text-hint); white-space: nowrap; }
    .conv-request-title {
      font-size: 0.72rem; color: var(--cc-primary); font-weight: 500; margin-top: 1px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .conv-preview {
      font-size: 0.76rem; color: var(--cc-text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;
    }
  `]
})
export class ChatListComponent implements OnInit {
  conversations: any[] = [];
  loading = true;
  activeConversationKey: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void { this.loadConversations(); }

  loadConversations(): void {
    this.loading = true;
    this.api.get<any[]>('/chat/conversations').subscribe({
      next: res => { this.conversations = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openChat(requestId: number, participantUserId: number): void {
    this.activeConversationKey = `${requestId}:${participantUserId}`;
    this.router.navigate(['/chat', requestId, participantUserId]);
  }

  conversationKey(conv: any): string {
    return `${conv.requestId}:${conv.participantUserId}`;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffH < 168) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
