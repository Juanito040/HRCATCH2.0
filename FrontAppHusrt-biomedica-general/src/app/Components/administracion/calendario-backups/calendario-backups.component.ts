import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BackupSistemaService } from '../../../Services/appServices/biomedicaServices/backup/backup-sistema.service';

@Component({
    selector: 'app-calendario-backups',
    standalone: true,
    imports: [CommonModule, DatePickerModule, ButtonModule, FormsModule, ProgressSpinnerModule],
    templateUrl: './calendario-backups.component.html',
    styleUrl: './calendario-backups.component.css'
})
export class CalendarioBackupsComponent implements OnInit {

    private backupService = inject(BackupSistemaService);

    fechaSeleccionada: Date = new Date();
    backupsDelMes: any[] = [];
    semanas: { fecha: string | null, dia: number | null }[][] = [];
    loading: boolean = false;

    readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    ngOnInit(): void {
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
        if (backups.some(b => b.estado === 'Fallido')) return 'dia-fallido';
        if (backups.some(b => b.estado === 'Pendiente')) return 'dia-pendiente';
        if (backups.some(b => b.estado === 'Completado')) return 'dia-completado';
        return '';
    }
}
