import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ThemeService } from '../../../Services/theme/theme.service';
import { NotificacionBackupService } from '../../../Services/appServices/biomedicaServices/backup/notificacion-backup.service';
import { PanelAlertasBackupComponent } from '../panel-alertas-backup/panel-alertas-backup.component';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-sistemasadminnavbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule,
            OverlayPanelModule, RouterModule, PanelAlertasBackupComponent],
  templateUrl: './sistemasadminnavbar.component.html',
  styleUrl: './sistemasadminnavbar.component.css'
})
export class SistemasadminnavbarComponent implements OnInit, OnDestroy {

  items: MenuItem[] | undefined;
  themeService = inject(ThemeService);
  notificacionService = inject(NotificacionBackupService);
  isSystemUser: boolean = false;

  constructor(private router: Router) {
    const decoded = getDecodedAccessToken();
    this.isSystemUser = decoded?.rol === 'SYSTEMUSER';
  }

  ngOnInit() {
    this.notificacionService.iniciarPolling();

    const inventarioItemsAdmin: MenuItem[] = [
      { label: 'Tipos de Equipo',   icon: 'pi pi-th-large',   routerLink: '/adminsistemas/tiposequipo' },
      { label: 'Dados de Baja',     icon: 'pi pi-ban',        routerLink: '/adminsistemas/equipos', queryParams: { vista: 'baja' } },
      { label: 'Bodega',            icon: 'pi pi-inbox',      routerLink: '/adminsistemas/equipos', queryParams: { vista: 'bodega' } },
      { label: 'Por Sede',          icon: 'pi pi-map-marker', routerLink: '/adminsistemas/equipossede' },
      { label: 'Por Roles',         icon: 'pi pi-sitemap',    routerLink: '/adminsistemas/equiposservicio' },
    ];

    const mantenimientoItemsAdmin: MenuItem[] = [
      { label: 'Programar Mantenimiento', icon: 'pi pi-calendar', routerLink: '/adminsistemas/planMantenimiento' },
      { label: 'Todos los Mantenimientos', icon: 'pi pi-list',    routerLink: '/adminsistemas/mantenimientos' },
    ];

    const backupItems: MenuItem[] = [
      { label: 'Sistemas de Información', icon: 'pi pi-list',     routerLink: '/admin/sistemasinformacion' },
      { label: 'Calendario de Backups',   icon: 'pi pi-calendar', routerLink: '/admin/sistemasinformacion/backups' },
    ];

    const itemsAdmin: MenuItem[] = [
      { label: 'Inicio',            icon: 'pi pi-home',      routerLink: '/adminsistemas' },
      { label: 'Inventario',        icon: 'pi pi-box',       items: inventarioItemsAdmin },
      { label: 'Mantenimiento',     icon: 'pi pi-wrench',    items: mantenimientoItemsAdmin },
      { label: 'Backups',           icon: 'pi pi-database',  items: backupItems },
      { label: 'Trazabilidad',      icon: 'pi pi-history',   routerLink: '/adminsistemas/trazabilidad' },
      { label: 'Repuestos',         icon: 'pi pi-cog',       routerLink: '/adminsistemas/repuestos' },
      { label: 'Parametrización',   icon: 'pi pi-sliders-h', routerLink: '/adminsistemas/parametrizacion' },
      { label: 'Mesa de Servicios', icon: 'pi pi-briefcase', routerLink: '/adminmesaservicios/casos' },
    ];

    const inventarioItemsUser: MenuItem[] = [
      { label: 'Tipos de Equipo',    icon: 'pi pi-th-large',   routerLink: '/adminsistemas/tiposequipo' },
      { label: 'Por Servicio',       icon: 'pi pi-sitemap',    routerLink: '/adminsistemas/equiposservicio' },
      { label: 'Por Sede',           icon: 'pi pi-map-marker', routerLink: '/adminsistemas/equipossede' },
      { label: 'Equipos en Bodega',  icon: 'pi pi-inbox',      routerLink: '/adminsistemas/equipos', queryParams: { vista: 'bodega' } },
      { label: 'Dados de Baja',      icon: 'pi pi-ban',        routerLink: '/adminsistemas/equipos', queryParams: { vista: 'baja' } },
    ];

    const itemsUser: MenuItem[] = [
      { label: 'Inicio',          icon: 'pi pi-home',     routerLink: '/adminsistemas' },
      { label: 'Inventario',      icon: 'pi pi-box',      items: inventarioItemsUser },
      { label: 'Mantenimientos',  icon: 'pi pi-wrench',   routerLink: '/adminsistemas/mantenimientos' },
      { label: 'Backups',         icon: 'pi pi-database', items: backupItems },
      { label: 'Trazabilidad',    icon: 'pi pi-history',  routerLink: '/adminsistemas/trazabilidad' },
      { label: 'Repuestos',       icon: 'pi pi-box',      routerLink: '/adminsistemas/repuestos' },
      { label: 'Indicadores',     icon: 'pi pi-chart-bar',routerLink: '/adminsistemas/indicadores' },
    ];

    this.items = this.isSystemUser ? itemsUser : itemsAdmin;
  }

  ngOnDestroy(): void {
    this.notificacionService.detenerPolling();
  }

  navigateToAbout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('utoken', '');
    }
    this.router.navigate(['/login']);
  }
}
