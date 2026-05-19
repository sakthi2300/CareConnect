import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';

export interface EmergencyRequestNotification {
    id: number;
    hospitalId: number;
    hospitalName: string;
    title: string;
    description: string;
    city: string;
    latitude: number;
    longitude: number;
    salaryPerDay: number;
    numDoctorsRequired: number;
    numNursesRequired: number;
    numDoctorsAccepted: number;
    numNursesAccepted: number;
    status: string;
    createdAt: string;
    distanceKm?: number;
}

interface RequestEventEnvelope {
    type?: string;
    request?: EmergencyRequestNotification;
}

@Injectable()
export class NotificationService implements OnDestroy {
    private emergencyRequests$ = new Subject<EmergencyRequestNotification>();
    private subscription: Subscription | null = null;
    private connected = false;

    constructor(
        private wsService: WebSocketService,
        private authService: AuthService
    ) { }

    /**
     * Connect to WebSocket and subscribe to emergency request notifications.
     * Call this when the staff dashboard loads.
     */
    startListening(): void {
        if (this.connected) {
            console.log('[NotificationService] Already listening for emergency requests');
            return;
        }

        console.log('[NotificationService] Starting to listen for emergency requests');

        // Connect to WebSocket endpoint /ws
        this.wsService.connect(this.authService.token);

        // Subscribe to /topic/emergency-requests
        this.subscription = this.wsService.subscribe('/topic/emergency-requests').subscribe({
            next: message => {
                try {
                    const payload = JSON.parse(message.body) as EmergencyRequestNotification | RequestEventEnvelope;
                    const request = this.extractRequest(payload);
                    if (!request) {
                        console.warn('[NotificationService] Ignoring unknown emergency request message payload');
                        return;
                    }
                    console.log('[NotificationService] Received emergency request:', request.id, request.hospitalName);
                    this.emergencyRequests$.next(request);
                } catch (e) {
                    console.error('[NotificationService] Failed to parse emergency request message:', e);
                }
            },
            error: err => {
                console.error('[NotificationService] WebSocket subscription error:', err);
                this.connected = false;
            }
        });

        this.connected = true;
    }

    /**
     * Observable stream of incoming emergency request notifications.
     * Components subscribe to this to receive real-time updates.
     */
    onEmergencyRequest(): Observable<EmergencyRequestNotification> {
        return this.emergencyRequests$.asObservable();
    }

    /**
     * Stop listening and clean up.
     */
    stopListening(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.connected = false;
        console.log('[NotificationService] Stopped listening for emergency requests');
    }

    ngOnDestroy(): void {
        this.stopListening();
    }

    private extractRequest(payload: EmergencyRequestNotification | RequestEventEnvelope): EmergencyRequestNotification | null {
        if (this.isEmergencyRequest(payload)) {
            return payload;
        }
        if (payload && typeof payload === 'object' && payload.request && this.isEmergencyRequest(payload.request)) {
            return payload.request;
        }
        return null;
    }

    private isEmergencyRequest(value: unknown): value is EmergencyRequestNotification {
        if (!value || typeof value !== 'object') {
            return false;
        }
        const candidate = value as Partial<EmergencyRequestNotification>;
        return typeof candidate.id === 'number'
            && typeof candidate.hospitalName === 'string'
            && typeof candidate.status === 'string';
    }
}
