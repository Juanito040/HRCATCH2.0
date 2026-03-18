
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../../Services/theme/theme.service';

@Component({
    selector: 'app-biomedicaadminnavbar',
    standalone: true,
    imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
    templateUrl: './biomedicaadminnavbar.component.html',
    styleUrl: './biomedicaadminnavbar.component.css'
})
export class BiomedicaadminnavbarComponent implements OnInit {

    items: MenuItem[] | undefined;
    router = inject(Router);
    themeService = inject(ThemeService);

    ngOnInit() {
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                routerLink: '/adminbiomedica'
            },
            {
                label: 'Mesa de Servicios',
                icon: 'pi pi-briefcase',
                routerLink: '/adminmesaservicios/casos'
            },
            {
                label: 'Gestión Operativa',
                icon: 'pi pi-briefcase',
                items: [
                    { label: 'Inventario', icon: 'pi pi-list', routerLink: '/biomedica/inventario' },
                    { label: 'Semaforización', icon: 'pi pi-chart-pie', routerLink: '/biomedica/semaforizacion' },
                    { label: 'Mantenimiento', icon: 'pi pi-cog', routerLink: '/biomedica/mantenimiento' },
                    { label: 'Calendario', icon: 'pi pi-calendar', routerLink: '/biomedica/calendario' },
                    { label: 'Metrología', icon: 'pi pi-compass', routerLink: '/biomedica/actividadesmetrologicas' }
                ]
            },
            {
                label: 'Parametrización',
                icon: 'pi pi-box',
                items: [
                    { label: 'Tipos de Equipo', icon: 'pi pi-tags', routerLink: '/admin/tiposequipo' },
                    { label: 'Fabricantes', icon: 'pi pi-building', routerLink: '/admin/fabricantes' },
                    { label: 'Proveedores', icon: 'pi pi-truck', routerLink: '/admin/proveedores' },
                    { label: 'Responsables', icon: 'pi pi-user-edit', routerLink: '/admin/responsables' },
                    { label: 'Tipos Documento', icon: 'pi pi-file', routerLink: '/admin/tiposdocumento' }
                ]
            }
        ];
    }

    navigateToAbout() {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('utoken', "");
        }
        this.router.navigate(['/login'])
    }

    viewUser() {
        this.router.navigate(['/updateprofil']);
    }
}
