import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-access-denied',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule],
    templateUrl: './access-denied.component.html',
    styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {

    constructor(private router: Router) { }

    goBack(): void {
        const token = sessionStorage.getItem('utoken');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const role = decoded.rol;

                switch (role) {
                    case 'SUPERADMIN':
                        this.router.navigate(['/superadmin']);
                        break;
                    case 'BIOMEDICAADMIN':
                        this.router.navigate(['/adminbiomedica']);
                        break;
                    case 'BIOMEDICAUSER':
                    case 'BIOMEDICATECNICO':
                        this.router.navigate(['/userbiomedica']);
                        break;
                    case 'INVITADO':
                        this.router.navigate(['/biomedica/home-invitado']);
                        break;
                    case 'SYSTEMADMIN':
                        this.router.navigate(['/adminsistemas']);
                        break;
                    case 'MANTENIMIENTOADMIN':
                        this.router.navigate(['/adminmantenimiento']);
                        break;
                    default:
                        this.router.navigate(['/login']);
                        break;
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                this.router.navigate(['/login']);
            }
        } else {
            this.router.navigate(['/login']);
        }
    }
}
