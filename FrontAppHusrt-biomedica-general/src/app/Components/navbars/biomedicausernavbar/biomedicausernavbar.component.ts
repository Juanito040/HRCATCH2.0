import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { inject } from '@angular/core';
import { ThemeService } from '../../../Services/theme/theme.service';

@Component({
    selector: 'app-biomedicausernavbar',
    standalone: true,
    imports: [MenubarModule, BadgeModule, CommonModule, AvatarModule, ButtonModule, PanelMenuModule, RouterModule],
    templateUrl: './biomedicausernavbar.component.html',
    styleUrl: './biomedicausernavbar.component.css'
})
export class BiomedicausernavbarComponent implements OnInit {

    items!: MenuItem[];
    userRole: string = '';
    themeService = inject(ThemeService);

    constructor(private router: Router) { }

    navigateToAbout() {
        sessionStorage.setItem('utoken', "");
        this.router.navigate(['/login'])
    }

    viewUser() {
        this.router.navigate(['/updateprofil']);
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (Error) {
            return null;
        }
    }

    getHomeLink(): string {
        const token = sessionStorage.getItem('utoken');
        if (token) {
            const decoded: any = this.getDecodedAccessToken(token);
            if (decoded?.rol === 'INVITADO') {
                return '/biomedica/home-invitado';
            }
        }
        return '/userbiomedica';
    }

    ngOnInit() {
        this.items = [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                routerLink: this.getHomeLink()
            },
            {
                label: 'Mesa de Servicios',
                icon: 'pi pi-briefcase',
                routerLink: '/adminmesaservicios/casos'
            }
        ];

        const token = sessionStorage.getItem('utoken');
        if (token) {
            const decoded: any = this.getDecodedAccessToken(token);
            this.userRole = decoded?.rol;
            const userRole = this.userRole;

            // Menu for BIOMEDICAUSER and others (excluding INVITADO)
            if (userRole !== 'INVITADO') {
                if (userRole === 'BIOMEDICATECNICO') {
                    // Technical Role Menu
                    this.items.push(
                        {
                            label: 'Gestion Operativa',
                            icon: 'pi pi-briefcase',
                            items: [
                                {
                                    label: 'Inventario',
                                    icon: 'pi pi-list',
                                    routerLink: '/biomedica/tecnico/equipos'
                                },
                                {
                                    label: 'Mantenimiento Técnico',
                                    icon: 'pi pi-wrench',
                                    routerLink: '/biomedica/tecnico/mantenimiento'
                                },
                                {
                                    label: 'Indicadores',
                                    icon: 'pi pi-chart-bar',
                                    routerLink: '/biomedica/indicadores'
                                },
                                {
                                    label: 'Metrologia',
                                    icon: 'pi pi-verified',
                                    routerLink: '/biomedica/actividadesmetrologicas'
                                }
                            ]
                        }
                    );
                } else {
                    // Standard User / Admin Menu
                    this.items.push(
                        {
                            label: 'Gestion Operativa',
                            icon: 'pi pi-briefcase',
                            items: [
                                {
                                    label: 'Inventario',
                                    icon: 'pi pi-list',
                                    routerLink: '/biomedica/inventario'
                                },
                                {
                                    label: 'Mantenimiento',
                                    icon: 'pi pi-cog',
                                    routerLink: '/biomedica/mantenimiento'
                                },
                                {
                                    label: 'Mantenimiento Técnico',
                                    icon: 'pi pi-wrench',
                                    routerLink: '/biomedica/mantenimientotecnico',
                                    visible: userRole === 'SUPERADMIN' || userRole === 'BIOMEDICAADMIN'
                                },
                                {
                                    label: 'Semaforización',
                                    icon: 'pi pi-exclamation-circle',
                                    routerLink: '/biomedica/semaforizacion'
                                },
                                {
                                    label: 'Indicadores',
                                    icon: 'pi pi-chart-bar',
                                    routerLink: '/biomedica/indicadores'
                                },
                                {
                                    label: 'Calendario',
                                    icon: 'pi pi-calendar',
                                    routerLink: '/biomedica/calendario'
                                },
                                {
                                    label: 'Metrologia',
                                    icon: 'pi pi-verified',
                                    routerLink: '/biomedica/actividadesmetrologicas'
                                }
                            ]
                        }
                    );
                }
            }
        }
    }

    toggleAll() {
        const expanded = !this.areAllItemsExpanded();
        this.items = this.toggleAllRecursive(this.items, expanded);
    }

    private toggleAllRecursive(items: MenuItem[], expanded: boolean): MenuItem[] {
        return items.map((menuItem) => {
            menuItem.expanded = expanded;
            if (menuItem.items) {
                menuItem.items = this.toggleAllRecursive(menuItem.items, expanded);
            }
            return menuItem;
        });
    }

    private areAllItemsExpanded(): boolean {
        return this.items.every((menuItem) => menuItem.expanded);
    }

}
