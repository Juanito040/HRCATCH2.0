import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject } from '@angular/core';
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

@Component({
  selector: 'app-superadminnavbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule,
            OverlayPanelModule, RouterModule, PanelAlertasBackupComponent],
  templateUrl: './superadminnavbar.component.html',
  styleUrl: './superadminnavbar.component.css'
})
export class SuperadminnavbarComponent implements OnInit, OnDestroy {

  items: MenuItem[] | undefined;
  themeService = inject(ThemeService);
  notificacionService = inject(NotificacionBackupService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.notificacionService.iniciarPolling();
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/superadmin'
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
      }
    ];
  }

  navigateToAbout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('utoken', "");
    }
    this.router.navigate(['/login'])
  }

  ngOnDestroy(): void {
    this.notificacionService.detenerPolling();
  }

  viewUser() {
    this.router.navigate(['/updateprofil']);
  }
}
