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
  selector: 'app-sistemasadminnavbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
  templateUrl: './sistemasadminnavbar.component.html',
  styleUrl: './sistemasadminnavbar.component.css'
})
export class SistemasadminnavbarComponent implements OnInit {

  items: MenuItem[] | undefined;
  themeService = inject(ThemeService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/adminsistemas'
      },
      {
        label: 'Mesa de Servicios',
        icon: 'pi pi-briefcase',
        routerLink: '/adminmesaservicios/casos'
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        routerLink: '/admusuarios'
      },
      {
        label: 'Inventario',
        icon: 'pi pi-box',
        items: [
          { label: 'Tipos de Equipo',     icon: 'pi pi-th-large',     routerLink: '/adminsistemas/tiposequipo' },
          { label: 'Crear Equipo',       icon: 'pi pi-plus-circle',  routerLink: '/adminsistemas/equipos', queryParams: { action: 'crear' } },
          { separator: true },
          { label: 'Equipos en Bodega', icon: 'pi pi-inbox',        routerLink: '/adminsistemas/equipos', queryParams: { vista: 'bodega' } },
          { label: 'Dados de Baja',     icon: 'pi pi-ban',          routerLink: '/adminsistemas/equipos', queryParams: { vista: 'baja' } },
        ]
      },
      {
        label: 'Mantenimientos',
        icon: 'pi pi-wrench',
        routerLink: '/adminsistemas/mantenimientos'
      },
    ];
  }

  navigateToAbout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('utoken', "");
    }
    this.router.navigate(['/login'])
  }
}
