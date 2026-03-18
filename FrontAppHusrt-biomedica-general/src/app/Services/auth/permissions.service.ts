import { Injectable } from '@angular/core';
import { getDecodedAccessToken } from '../../utilidades';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    constructor() { }

    getUserRole(): string | null {
        const decodedToken = getDecodedAccessToken();
        return decodedToken ? decodedToken.rol : null;
    }

    hasRole(allowedRoles: string[]): boolean {
        const userRole = this.getUserRole();
        return userRole ? allowedRoles.includes(userRole) : false;
    }

    canEdit(): boolean {
        return this.hasRole(['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN']);
    }

    canCreate(): boolean {
        return this.hasRole(['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN']);
    }

    canDelete(): boolean {
        return this.hasRole(['BIOMEDICAADMIN', 'SUPERADMIN']);
    }

    isTecnico(): boolean {
        return this.hasRole(['BIOMEDICATECNICO']);
    }
}
