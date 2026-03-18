import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
    selector: 'app-parametrizacion-biomedica',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './parametrizacion-biomedica.component.html',
    styleUrl: './parametrizacion-biomedica.component.css'
})
export class ParametrizacionBiomedicaComponent {
    router = inject(Router);
    isSuperAdmin: boolean = false;
    isBiomedicaAdmin: boolean = false;

    constructor() {
        this.checkRole();
    }

    checkRole() {
        const token = sessionStorage.getItem('utoken');
        if (token) {
            const decoded = getDecodedAccessToken();

            if (decoded?.rol === 'SUPERADMIN') {
                this.isSuperAdmin = true;
            }
            if (decoded?.rol === 'BIOMEDICAADMIN') {
                this.isBiomedicaAdmin = true;
            }

        }
    }

    showViewUsuarios() { this.router.navigate(['/admusuarios']); }
    showViewCargos() { this.router.navigate(['/admin/cargos']); }
    showViewServicios() { this.router.navigate(['/admin/servicios']); }
    showViewTiposEquipo() { this.router.navigate(['/admin/tiposequipo']); }
    showViewFabricantes() { this.router.navigate(['/admin/fabricantes']); }
    showViewProveedores() { this.router.navigate(['/admin/proveedores']); }
    showViewResponsables() { this.router.navigate(['/admin/responsables']); }
    showViewTiposDocumento() { this.router.navigate(['/admin/tiposdocumento']); }
    showViewEquipos() { this.router.navigate(['/biomedica/adminequipos']); }
}
