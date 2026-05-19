import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface JwtResponse {
  token: string;
  userId: number;
  role: string;
  fullName: string;
  avatarUrl: string;
}

@Injectable()
export class AuthService {
  private readonly tokenKey = 'careconnect_token';
  private currentUserSubject = new BehaviorSubject<JwtResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) {
    const stored = localStorage.getItem(this.tokenKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as JwtResponse;
        const token = this.sanitizeToken(parsed?.token);
        if (token && !this.isTokenExpired(token)) {
          parsed.token = token;
          this.currentUserSubject.next(parsed);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<JwtResponse> {
    return this.api.post<JwtResponse>('/auth/login', { email, password }).pipe(
      tap(res => this.setSession(res))
    );
  }

  registerHospital(payload: any): Observable<JwtResponse> {
    return this.api.post<JwtResponse>('/auth/register/hospital', payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  registerStaff(payload: any): Observable<JwtResponse> {
    return this.api.post<JwtResponse>('/auth/register/staff', payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    const token = this.sanitizeToken(this.currentUserSubject.value?.token);
    if (!token) {
      return null;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get role(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  get fullName(): string | null {
    return this.currentUserSubject.value?.fullName ?? null;
  }

  get avatarUrl(): string | null {
    return this.currentUserSubject.value?.avatarUrl ?? null;
  }

  get userId(): number | null {
    return this.currentUserSubject.value?.userId ?? null;
  }

  private setSession(res: JwtResponse): void {
    const token = this.sanitizeToken(res?.token);
    if (!token) {
      this.logout();
      return;
    }
    res.token = token;
    localStorage.setItem(this.tokenKey, JSON.stringify(res));
    this.currentUserSubject.next(res);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as { exp?: number };
      if (!payload.exp) {
        return true;
      }
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    } catch {
      return true;
    }
  }

  private sanitizeToken(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const normalized = value.trim().replace(/^Bearer\s+/i, '');
    if (!normalized) {
      return null;
    }
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(normalized)
      ? normalized
      : null;
  }

  updateAvatarLocally(newAvatar: string): void {
    const current = this.currentUserSubject.value;
    if (current) {
      current.avatarUrl = newAvatar;
      this.setSession(current);
    }
  }
}

