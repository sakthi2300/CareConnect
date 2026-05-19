import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const stored = localStorage.getItem('careconnect_token');
    const token = this.extractToken(stored);
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }

  private extractToken(stored: string | null): string | null {
    if (!stored) {
      return null;
    }

    // Support legacy/raw format where the token itself was stored directly.
    const rawToken = this.sanitizeToken(stored);
    if (rawToken && this.looksLikeJwt(rawToken) && !this.isExpired(rawToken)) {
      return rawToken;
    }

    // Support object JSON format: { token, ... }.
    try {
      const parsed = JSON.parse(stored) as { token?: unknown } | string;
      if (typeof parsed === 'string') {
        const token = this.sanitizeToken(parsed);
        if (token && this.looksLikeJwt(token) && !this.isExpired(token)) {
          return token;
        }
      }
      if (parsed
        && typeof parsed === 'object'
        && typeof parsed.token === 'string') {
        const token = this.sanitizeToken(parsed.token);
        if (token && this.looksLikeJwt(token) && !this.isExpired(token)) {
          return token;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private looksLikeJwt(value: string): boolean {
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
  }

  private isExpired(token: string): boolean {
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
      return payload.exp <= Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  private sanitizeToken(value: string): string | null {
    if (!value) {
      return null;
    }
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }
    // Strip optional "Bearer " prefix if it was accidentally persisted.
    return normalized.replace(/^Bearer\s+/i, '');
  }
}

