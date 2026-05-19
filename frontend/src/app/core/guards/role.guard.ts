import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRoles: string[] = route.data['roles'] || [];
        const userRole = this.auth.role;

        if (userRole && expectedRoles.includes(userRole)) {
            return true;
        }

        // Redirect to the correct dashboard based on actual role
        if (userRole === 'ROLE_HOSPITAL') {
            this.router.navigate(['/hospital']);
        } else if (userRole === 'ROLE_DOCTOR' || userRole === 'ROLE_NURSE') {
            this.router.navigate(['/staff']);
        } else {
            this.router.navigate(['/auth/login']);
        }
        return false;
    }
}
