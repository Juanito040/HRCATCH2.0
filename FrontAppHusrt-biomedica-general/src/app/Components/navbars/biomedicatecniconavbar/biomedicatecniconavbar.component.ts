
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { jwtDecode } from 'jwt-decode';
import { ThemeService } from '../../../Services/theme/theme.service';

@Component({
    selector: 'app-biomedicatecniconavbar',
    standalone: true,
    imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
    templateUrl: './biomedicatecniconavbar.component.html',
    styleUrl: './biomedicatecniconavbar.component.css'
})
export class BiomedicatecniconavbarComponent implements OnInit {

    items: MenuItem[] | undefined;
    router = inject(Router);
    themeService = inject(ThemeService);

    ngOnInit() {
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                routerLink: '/userbiomedica'
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
                    {
                        label: 'Mantenimiento Técnico',
                        icon: 'pi pi-wrench',
                        routerLink: '/biomedica/tecnico/mantenimiento'
                    },
                    { label: 'Metrología', icon: 'pi pi-compass', routerLink: '/biomedica/actividadesmetrologicas' },
                    { label: 'Indicadores', icon: 'pi pi-chart-bar', routerLink: '/biomedica/indicadores' }
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
