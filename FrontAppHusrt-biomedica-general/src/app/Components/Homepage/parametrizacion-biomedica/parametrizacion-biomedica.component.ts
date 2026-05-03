import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { getDecodedAccessToken } from '../../../utilidades';
import { AccesoModuloSistemasService } from '../../../Services/appServices/biomedicaServices/backup/acceso-modulo-sistemas.service';

@Component({
    selector: 'app-parametrizacion-biomedica',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './parametrizacion-biomedica.component.html',
    styleUrl: './parametrizacion-biomedica.component.css'
})
export class ParametrizacionBiomedicaComponent implements OnInit {
    router = inject(Router);
    private accesoService = inject(AccesoModuloSistemasService);

    isSuperAdmin: boolean = false;
    isBiomedicaAdmin: boolean = false;
    puedeVerGestionSistemas: boolean = false;

    constructor() {
        this.checkRole();
    }

    ngOnInit(): void {
        const ROLES_ADMIN_MODULO = ['SUPERADMIN', 'SYSTEMADMIN'];
        this.accesoService.obtenerAcceso().subscribe({
            next: (acceso) => {
                this.puedeVerGestionSistemas =
                    acceso.puedeAcceder && ROLES_ADMIN_MODULO.includes(acceso.rol ?? '');
            },
            error: () => { this.puedeVerGestionSistemas = false; }
        });
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
    showViewSistemasInformacion() { this.router.navigate(['/admin/sistemasinformacion']); }
}
