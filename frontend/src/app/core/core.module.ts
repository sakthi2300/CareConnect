import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { WebSocketService } from './services/websocket.service';
import { NotificationService } from './services/notification.service';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  imports: [CommonModule, RouterModule],
  providers: [
    AuthService,
    ApiService,
    WebSocketService,
    NotificationService,
    JwtInterceptor
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule | null) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule.');
    }
  }
}

