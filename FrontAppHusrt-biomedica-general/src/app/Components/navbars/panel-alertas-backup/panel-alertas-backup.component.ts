import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { NotificacionBackupService } from '../../../Services/appServices/biomedicaServices/backup/notificacion-backup.service';
import { BackupSistemaService } from '../../../Services/appServices/biomedicaServices/backup/backup-sistema.service';

@Component({
    selector: 'app-panel-alertas-backup',
    standalone: true,
    imports: [CommonModule, ButtonModule, TooltipModule],
    templateUrl: './panel-alertas-backup.component.html',
    styleUrl: './panel-alertas-backup.component.css'
})
export class PanelAlertasBackupComponent {

    notificacionService = inject(NotificacionBackupService);
    private backupService = inject(BackupSistemaService);
    alertas$ = this.notificacionService.alertas$;

    actualizar(): void {
        this.notificacionService.cargarAlertas();
    }

    async marcarCompletado(alerta: any): Promise<void> {
        try {
            await this.backupService.updateBackup(alerta.id, { estado: 'Completado' });
            this.notificacionService.eliminarAlertaPorSistema(alerta.sistemaId);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo marcar el backup como completado.' });
        }
    }
}
