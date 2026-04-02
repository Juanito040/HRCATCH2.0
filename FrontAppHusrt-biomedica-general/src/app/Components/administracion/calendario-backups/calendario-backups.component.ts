import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { BackupSistemaService } from '../../../Services/appServices/biomedicaServices/backup/backup-sistema.service';

@Component({
    selector: 'app-calendario-backups',
    standalone: true,
    imports: [CommonModule, DatePickerModule, ButtonModule, TooltipModule, FormsModule, ProgressSpinnerModule, DialogModule],
    templateUrl: './calendario-backups.component.html',
    styleUrl: './calendario-backups.component.css'
})
export class CalendarioBackupsComponent implements OnInit {

    private backupService = inject(BackupSistemaService);

    fechaSeleccionada: Date = new Date();
    backupsDelMes: any[] = [];
    semanas: { fecha: string | null, dia: number | null }[][] = [];
    loading: boolean = false;

    backupSeleccionado: any = null;
    modalVisible: boolean = false;

    readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    ngOnInit(): void {
        this.cargarBackupsDelMes();
    }

    get tituloMes(): string {
        const titulo = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
            .format(this.fechaSeleccionada);
        return titulo.charAt(0).toUpperCase() + titulo.slice(1);
    }

    mesAnterior(): void {
        const d = new Date(this.fechaSeleccionada);
        d.setMonth(d.getMonth() - 1);
        this.fechaSeleccionada = d;
        this.cargarBackupsDelMes();
    }

    mesSiguiente(): void {
        const d = new Date(this.fechaSeleccionada);
        d.setMonth(d.getMonth() + 1);
        this.fechaSeleccionada = d;
        this.cargarBackupsDelMes();
    }

    onMesCambia(event: any): void {
        if (this.fechaSeleccionada) {
            this.cargarBackupsDelMes();
        }
    }

    async cargarBackupsDelMes(): Promise<void> {
        this.loading = true;
        try {
            const mes = this.fechaSeleccionada.getMonth() + 1;
            const anio = this.fechaSeleccionada.getFullYear();
            this.backupsDelMes = await this.backupService.getBackupsTodosMes(mes, anio);
            this.buildCalendar();
        } catch (error) {
            this.backupsDelMes = [];
            this.buildCalendar();
        } finally {
            this.loading = false;
        }
    }

    buildCalendar(): void {
        const anio = this.fechaSeleccionada.getFullYear();
        const mes = this.fechaSeleccionada.getMonth() + 1;
        const primerDia = new Date(anio, mes - 1, 1);
        const offset = (primerDia.getDay() + 6) % 7; // 0=Lun ... 6=Dom
        const totalDias = new Date(anio, mes, 0).getDate();

        this.semanas = [];
        let semana: { fecha: string | null, dia: number | null }[] = [];

        for (let i = 0; i < offset; i++) {
            semana.push({ fecha: null, dia: null });
        }

        for (let dia = 1; dia <= totalDias; dia++) {
            const mesStr = String(mes).padStart(2, '0');
            const diaStr = String(dia).padStart(2, '0');
            semana.push({ fecha: `${anio}-${mesStr}-${diaStr}`, dia });
            if (semana.length === 7) {
                this.semanas.push(semana);
                semana = [];
            }
        }

        if (semana.length > 0) {
            while (semana.length < 7) {
                semana.push({ fecha: null, dia: null });
            }
            this.semanas.push(semana);
        }
    }

    getBackupsDia(fecha: string): any[] {
        return this.backupsDelMes.filter(b => b.fecha === fecha);
    }

    getClaseDia(backups: any[]): string {
        return backups.length > 0 ? 'dia-con-backups' : '';
    }

    getTextoTooltip(backup: any): string {
        return `Sistema: ${backup.sistemaNombre}\nEstado: ${backup.estado}\nFrecuencia: ${backup.frecuencia_backup ?? '—'}\nFecha: ${backup.fecha}`;
    }

    getClaseChip(estado: string): string {
        if (estado === 'Completado') return 'backup-chip-completado';
        if (estado === 'Fallido') return 'backup-chip-fallido';
        return 'backup-chip-pendiente';
    }

    abrirDetalle(backup: any): void {
        this.backupSeleccionado = backup;
        this.modalVisible = true;
    }

    cerrarDetalle(): void {
        this.modalVisible = false;
        this.backupSeleccionado = null;
    }

    getClaseEstadoModal(estado: string): string {
        if (estado === 'Completado') return 'estado-completado';
        if (estado === 'Fallido') return 'estado-fallido';
        return 'estado-pendiente';
    }
}
