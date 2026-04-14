import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../../Services/theme/theme.service';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-sistemasadminnavbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
  templateUrl: './sistemasadminnavbar.component.html',
  styleUrl: './sistemasadminnavbar.component.css'
})
export class SistemasadminnavbarComponent implements OnInit {

  items: MenuItem[] | undefined;
  themeService = inject(ThemeService);
  isSystemUser: boolean = false;

  constructor(private router: Router) {
    const decoded = getDecodedAccessToken();
    this.isSystemUser = decoded?.rol === 'SYSTEMUSER';
  }

  ngOnInit() {
    const inventarioItemsUser: MenuItem[] = [
      { label: 'Tipos de Equipo',  icon: 'pi pi-th-large',    routerLink: '/adminsistemas/tiposequipo' },
      { label: 'Equipos en Bodega', icon: 'pi pi-inbox',       routerLink: '/adminsistemas/equipos', queryParams: { vista: 'bodega' } },
      { label: 'Dados de Baja',     icon: 'pi pi-ban',         routerLink: '/adminsistemas/equipos', queryParams: { vista: 'baja' } },
    ];

    const itemsAdmin: MenuItem[] = [
      { label: 'Inicio',           icon: 'pi pi-home',     routerLink: '/adminsistemas' },
      { label: 'Mesa de Servicios', icon: 'pi pi-briefcase', routerLink: '/adminmesaservicios/casos' },
    ];

    const itemsUser: MenuItem[] = [
      { label: 'Inicio',         icon: 'pi pi-home',   routerLink: '/adminsistemas' },
      { label: 'Inventario',     icon: 'pi pi-box',    items: inventarioItemsUser },
      { label: 'Mantenimientos', icon: 'pi pi-wrench', routerLink: '/adminsistemas/mantenimientos' },
      { label: 'Trazabilidad',   icon: 'pi pi-history', routerLink: '/adminsistemas/trazabilidad' },
      {
        label: 'Repuestos',
        icon: 'pi pi-box',
        routerLink: '/adminsistemas/repuestos'
      },
    ];

    this.items = this.isSystemUser ? itemsUser : itemsAdmin;
  }

  navigateToAbout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('utoken', '');
    }
    this.router.navigate(['/login']);
  }
}
