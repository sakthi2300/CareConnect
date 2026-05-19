import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ChatLayoutComponent } from './chat-layout.component';
import { ChatListComponent } from './chat-list.component';
import { ChatWindowComponent } from './chat-window.component';

const routes: Routes = [
  {
    path: '',
    component: ChatLayoutComponent,
    children: [
      { path: ':requestId/:participantUserId', component: ChatWindowComponent },
      { path: '', component: ChatWindowComponent }  // empty state
    ]
  }
];

@NgModule({
  declarations: [
    ChatLayoutComponent,
    ChatListComponent,
    ChatWindowComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ChatModule { }
