import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../core/services/websocket.service';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-chat-window',
  template: `
    <!-- Empty state -->
    <div *ngIf="!requestId" class="empty-state">
      <div class="empty-graphic">
        <mat-icon>forum</mat-icon>
      </div>
      <h3>Select a conversation</h3>
      <p>Choose a chat from the list to start messaging</p>
    </div>

    <!-- Active chat -->
    <div *ngIf="requestId" class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-avatar">
          <mat-icon>chat</mat-icon>
        </div>
        <div class="header-info">
          <div class="header-title">Request #{{ requestId }}</div>
          <div class="header-sub"><span class="online-dot"></span> Active</div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="errorMsg" class="error-bar">
        <mat-icon>error_outline</mat-icon> {{ errorMsg }}
      </div>

      <!-- Messages -->
      <div class="messages" #messagesContainer>
        <div *ngIf="messages.length === 0 && !loading" class="no-messages">
          <mat-icon>chat_bubble_outline</mat-icon>
          <p>No messages yet. Say hello! 👋</p>
        </div>
        <div *ngIf="loading" class="no-messages">
          <mat-spinner diameter="28"></mat-spinner>
        </div>

        <div *ngFor="let m of messages; let i = index"
             class="message-row fade-in-fast"
             [class.own]="m.senderUserId === currentUserId"
             [class.other]="m.senderUserId !== currentUserId">
          <!-- Avatar for other -->
          <div class="msg-avatar" *ngIf="m.senderUserId !== currentUserId && showAvatar(i)">
            <mat-icon>person</mat-icon>
          </div>
          <div class="msg-avatar-spacer" *ngIf="m.senderUserId !== currentUserId && !showAvatar(i)"></div>

          <div class="bubble-wrap">
            <span class="sender-label" *ngIf="m.senderUserId !== currentUserId && showAvatar(i)">{{ m.senderName }}</span>
            <div class="bubble">{{ m.content }}</div>
            <span class="msg-time">{{ formatTime(m.sentAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Composer -->
      <div class="composer">
        <div class="compose-bar">
          <input class="compose-input" [(ngModel)]="draft" placeholder="Type a message..."
                 autocomplete="off" [disabled]="sending" (keydown.enter)="send()">
          <button mat-icon-button color="primary" (click)="send()"
                  [disabled]="!draft.trim() || sending" class="send-btn">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }

    /* Empty */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; color: var(--cc-text-hint);
    }
    .empty-graphic {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--cc-divider); display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .empty-graphic mat-icon { font-size: 36px; width: 36px; height: 36px; color: #CBD5E1; }
    .empty-state h3 { margin: 0 0 4px; color: var(--cc-text-secondary); font-size: 1rem; }
    .empty-state p { margin: 0; font-size: 0.82rem; }

    /* Container */
    .chat-container { display: flex; flex-direction: column; height: 100%; }

    /* Header */
    .chat-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px; border-bottom: 1px solid var(--cc-border);
      background: var(--cc-surface);
    }
    .header-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: #E3F2FD; display: flex; align-items: center; justify-content: center;
    }
    .header-avatar mat-icon { font-size: 20px; color: var(--cc-primary); }
    .header-title { font-weight: 600; font-size: 0.9rem; color: var(--cc-text); }
    .header-sub { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--cc-text-secondary); }
    .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #4CAF50; }

    .error-bar {
      display: flex; align-items: center; gap: 8px;
      background: #FFEBEE; color: #C62828; padding: 6px 16px; font-size: 0.78rem;
    }

    /* Messages */
    .messages {
      flex: 1; overflow-y: auto; padding: 16px 20px;
      display: flex; flex-direction: column; gap: 4px;
      background: #F8FAFC;
    }
    .no-messages {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; flex: 1; color: var(--cc-text-hint); gap: 8px;
    }
    .no-messages mat-icon { font-size: 40px; width: 40px; height: 40px; color: #CBD5E1; }
    .no-messages p { font-size: 0.82rem; margin: 0; }

    .message-row { display: flex; align-items: flex-end; gap: 8px; }
    .message-row.own { justify-content: flex-end; }
    .message-row.other { justify-content: flex-start; }

    .msg-avatar {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: #E0E0E0; display: flex; align-items: center; justify-content: center;
    }
    .msg-avatar mat-icon { font-size: 16px; width: 16px; height: 16px; color: #757575; }
    .msg-avatar-spacer { width: 28px; flex-shrink: 0; }

    .bubble-wrap { display: flex; flex-direction: column; max-width: 60%; }
    .sender-label { font-size: 0.65rem; font-weight: 600; color: var(--cc-primary); margin-bottom: 2px; padding-left: 4px; }

    .bubble {
      padding: 10px 14px; font-size: 0.84rem; line-height: 1.45;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .own .bubble {
      background: linear-gradient(135deg, #1976D2, #1565C0);
      color: #fff; border-radius: 18px 18px 4px 18px;
    }
    .other .bubble {
      background: #fff; color: var(--cc-text);
      border: 1px solid var(--cc-border); border-radius: 18px 18px 18px 4px;
    }

    .msg-time { font-size: 0.6rem; margin-top: 2px; padding: 0 4px; }
    .own .msg-time { color: var(--cc-text-hint); text-align: right; }
    .other .msg-time { color: var(--cc-text-hint); text-align: left; }

    /* Composer */
    .composer {
      padding: 12px 20px; background: var(--cc-surface);
      border-top: 1px solid var(--cc-border);
    }
    .compose-bar {
      display: flex; align-items: center; gap: 8px;
      background: #F1F5F9; border-radius: 24px; padding: 4px 4px 4px 16px;
    }
    .compose-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 0.85rem; font-family: inherit; padding: 8px 0;
      color: var(--cc-text);
    }
    .compose-input::placeholder { color: var(--cc-text-hint); }
    .send-btn { flex-shrink: 0; }
  `]
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  requestId: number | null = null;
  participantUserId: number | null = null;
  messages: any[] = [];
  draft = '';
  loading = false;
  sending = false;
  errorMsg: string | null = null;
  currentUserId: number | null = null;
  private sub?: Subscription;
  private routeSub?: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScroll = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ws: WebSocketService,
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.auth.userId;
    this.ws.connect(this.auth.token);

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('requestId');
      const participant = params.get('participantUserId');
      if (id && participant) {
        this.requestId = Number(id);
        this.participantUserId = Number(participant);
        this.loadMessages();
        this.subscribeToChat();
      } else {
        this.requestId = null;
        this.participantUserId = null;
      }
    });
  }

  showAvatar(index: number): boolean {
    if (index === 0) return true;
    const prev = this.messages[index - 1];
    return prev.senderUserId !== this.messages[index].senderUserId;
  }

  private loadMessages(): void {
    if (!this.requestId || !this.participantUserId) return;
    this.loading = true; this.messages = [];
    this.api.get<any>(`/chat/requests/${this.requestId}/messages?participantUserId=${this.participantUserId}`).subscribe({
      next: res => { this.messages = res.content ?? []; this.loading = false; this.shouldScroll = true; },
      error: err => { this.errorMsg = err?.error?.error || 'Failed to load messages'; this.loading = false; }
    });
  }

  private subscribeToChat(): void {
    this.sub?.unsubscribe();
    if (!this.requestId || !this.participantUserId) return;
    this.sub = this.ws.subscribe(`/topic/requests/${this.requestId}/chat/${this.participantUserId}`).subscribe(msg => {
      const body = JSON.parse(msg.body);
      if (!this.messages.some(m => m.id === body.id)) {
        this.messages = [...this.messages, body];
        this.shouldScroll = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  send(): void {
    if (!this.draft.trim() || this.sending || !this.requestId || !this.participantUserId) return;
    this.errorMsg = null; this.sending = true;
    const body = { requestId: this.requestId, participantUserId: this.participantUserId, content: this.draft };
    this.api.post<any>(`/chat/requests/${this.requestId}/messages?participantUserId=${this.participantUserId}`, body).subscribe({
      next: saved => {
        if (!this.messages.some(m => m.id === saved.id)) {
          this.messages = [...this.messages, saved]; this.shouldScroll = true;
        }
        this.draft = ''; this.sending = false;
      },
      error: err => { this.errorMsg = err?.error?.error || 'Failed to send'; this.sending = false; }
    });
  }

  formatTime(sentAt: string): string {
    if (!sentAt) return '';
    return new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); this.routeSub?.unsubscribe(); }

  private scrollToBottom(): void {
    try { const el = this.messagesContainer?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch (_) {}
  }

}
