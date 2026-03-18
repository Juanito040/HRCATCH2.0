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
    selector: 'app-mesaadminnavbar',
    standalone: true,
    imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
    templateUrl: './mesaadminnavbar.component.html',
    styleUrl: './mesaadminnavbar.component.css'
})
export class MesaadminnavbarComponent implements OnInit {

    items: MenuItem[] | undefined;
    themeService = inject(ThemeService);

    constructor(private router: Router) { }

    ngOnInit() {
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                routerLink: '/adminmesaservicios'
            },
            {
                label: 'Casos',
                icon: 'pi pi-ticket',
                routerLink: '/adminmesaservicios/casos'
            },
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Categorías',
                        icon: 'pi pi-tags',
                        routerLink: '/adminmesaservicios/config/categorias'
                    },
                    {
                        label: 'Roles y Usuarios',
                        icon: 'pi pi-users',
                        routerLink: '/adminmesaservicios/config/roles'
                    }
                ]
            }
        ];
    }

    navigateToLogin() {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('utoken', "");
        }
        this.router.navigate(['/login'])
    }

    viewUser() {
        this.router.navigate(['/updateprofil']);
    }
}
