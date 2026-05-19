import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable()
export class WebSocketService {
  private client: Client | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  private subscriptions: Map<string, Subscription> = new Map();

  constructor(private zone: NgZone) { }

  connect(token: string | null): void {
    if (this.client && this.client.active) {
      console.log('[WebSocketService] Already connected/connecting, skipping');
      return;
    }

    console.log('[WebSocketService] Connecting to ws://localhost:8080/ws');

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      debug: (msg) => {
        // Only log connection-related messages, skip heartbeats
        if (msg.includes('CONNECTED') || msg.includes('SUBSCRIBE') || msg.includes('ERROR')) {
          console.log('[WebSocketService STOMP]', msg);
        }
      }
    });

    this.client.onConnect = (frame) => {
      console.log('[WebSocketService] STOMP connected successfully', frame);
      this.zone.run(() => this.connected$.next(true));
    };

    this.client.onDisconnect = () => {
      console.log('[WebSocketService] STOMP disconnected');
      this.zone.run(() => this.connected$.next(false));
    };

    this.client.onStompError = (frame) => {
      console.error('[WebSocketService] STOMP error:', frame.headers?.['message'], frame.body);
      this.zone.run(() => this.connected$.next(false));
    };

    this.client.onWebSocketError = (event) => {
      console.error('[WebSocketService] WebSocket error:', event);
    };

    this.client.activate();
  }

  subscribe(topic: string): Observable<IMessage> {
    console.log('[WebSocketService] Requesting subscription to:', topic);
    const subject = new Subject<IMessage>();

    if (!this.client) {
      console.error('[WebSocketService] Client not initialized, call connect() first');
      subject.error('WebSocket client not initialized');
      return subject.asObservable();
    }

    const doSubscribe = () => {
      console.log('[WebSocketService] Subscribing to topic:', topic);
      const stompSub = this.client!.subscribe(topic, message => {
        console.log('[WebSocketService] Received message on', topic, ':', message.body?.substring(0, 100));
        this.zone.run(() => subject.next(message));
      });
      console.log('[WebSocketService] Subscribed to', topic, 'with id:', stompSub.id);
    };

    // If already connected, subscribe immediately; otherwise wait for connection
    if (this.connected$.value) {
      doSubscribe();
    } else {
      console.log('[WebSocketService] Not yet connected, waiting for connection before subscribing to:', topic);
      this.connected$.pipe(
        filter(c => c),
        take(1)
      ).subscribe(() => {
        console.log('[WebSocketService] Connection established, now subscribing to:', topic);
        doSubscribe();
      });
    }

    return subject.asObservable();
  }

  send(destination: string, body: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    } else {
      console.warn('[WebSocketService] Cannot send - not connected');
    }
  }

  isConnected(): boolean {
    return this.connected$.value;
  }
}
