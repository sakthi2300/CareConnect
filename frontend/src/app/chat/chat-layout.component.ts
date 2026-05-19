import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-layout',
  template: `
    <div class="chat-layout fade-in">
      <div class="chat-sidebar">
        <app-chat-list></app-chat-list>
      </div>
      <div class="chat-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: flex; height: calc(100vh - 100px);
      background: var(--cc-surface);
      border-radius: var(--cc-radius-lg); overflow: hidden;
      box-shadow: var(--cc-shadow-md);
      border: 1px solid var(--cc-border);
    }
    .chat-sidebar {
      width: 340px; min-width: 280px;
      border-right: 1px solid var(--cc-border);
      display: flex; flex-direction: column;
      background: #FAFCFE;
    }
    .chat-main {
      flex: 1; display: flex; flex-direction: column;
      min-width: 0; background: var(--cc-surface);
    }
    @media (max-width: 768px) {
      .chat-layout { flex-direction: column; height: calc(100vh - 80px); border-radius: 0; }
      .chat-sidebar { width: 100%; min-width: unset; max-height: 220px; border-right: none; border-bottom: 1px solid var(--cc-border); }
    }
  `]
})
export class ChatLayoutComponent { }
