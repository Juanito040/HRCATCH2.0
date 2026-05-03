import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { isTokenExpired, getDecodedAccessToken } from '../../utilidades';

@Component({
    selector: 'app-redireccion-inicial',
    standalone: true,
    template: '',
})
export class RedireccionInicialComponent implements OnInit {
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            if (!isTokenExpired()) {
                const decoded = getDecodedAccessToken();
                const role = decoded?.rol;

                switch (role) {
                    case 'SYSTEMADMIN':
                        this.router.navigate(['/adminsistemas']);
                        break;
                    case 'SYSTEMUSER':
                        this.router.navigate(['/admin/sistemasinformacion/backups']);
                        break;
                    case 'SUPERADMIN':
                        this.router.navigate(['/superadmin']);
                        break;
                    case 'MANTENIMIENTOADMIN':
                        this.router.navigate(['/adminmantenimiento']);
                        break;
                    case 'BIOMEDICAADMIN':
                        this.router.navigate(['/adminbiomedica']);
                        break;
                    case 'BIOMEDICAUSER':
                    case 'BIOMEDICATECNICO':
                        this.router.navigate(['/userbiomedica']);
                        break;
                    case 'MESAUSER':
                        this.router.navigate(['/mesauser/home']);
                        break;
                    case 'MESAADMIN':
                        this.router.navigate(['/adminmesaservicios']);
                        break;
                    case 'INVITADO':
                        this.router.navigate(['/biomedica/home-invitado']);
                        break;
                    default:
                        this.router.navigate(['/login']);
                        break;
                }
            } else {
                this.router.navigate(['/login']);
            }
        }
    }
}
