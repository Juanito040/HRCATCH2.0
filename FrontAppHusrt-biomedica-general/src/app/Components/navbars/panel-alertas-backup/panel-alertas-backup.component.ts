import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NotificacionBackupService } from '../../../Services/appServices/biomedicaServices/backup/notificacion-backup.service';

@Component({
    selector: 'app-panel-alertas-backup',
    standalone: true,
    imports: [CommonModule, ButtonModule, TooltipModule],
    templateUrl: './panel-alertas-backup.component.html',
    styleUrl: './panel-alertas-backup.component.css'
})
export class PanelAlertasBackupComponent {

    notificacionService = inject(NotificacionBackupService);
    alertas$ = this.notificacionService.alertas$;

    actualizar(): void {
        this.notificacionService.cargarAlertas();
    }
}
