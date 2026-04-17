import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BackupSistemaService } from '../../../Services/appServices/biomedicaServices/backup/backup-sistema.service';
import { NotificacionBackupService } from '../../../Services/appServices/biomedicaServices/backup/notificacion-backup.service';

@Component({
    selector: 'app-calendario-backups',
    standalone: true,
    imports: [CommonModule, DatePickerModule, ButtonModule, TooltipModule, FormsModule, ProgressSpinnerModule, DialogModule],
    templateUrl: './calendario-backups.component.html',
    styleUrl: './calendario-backups.component.css'
})
export class CalendarioBackupsComponent implements OnInit {

    private backupService = inject(BackupSistemaService);
    private notificacionService = inject(NotificacionBackupService);

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
        if (estado === 'No realizado') return 'backup-chip-no-realizado';
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
        if (estado === 'No realizado') return 'estado-no-realizado';
        return 'estado-pendiente';
    }

    async marcarCompletado(): Promise<void> {
        const result = await Swal.fire({
            title: '¿Marcar como Completado?',
            text: `Backup de ${this.backupSeleccionado.sistemaNombre}`,
            input: 'textarea',
            inputPlaceholder: 'Agregar observación (opcional)',
            inputAttributes: { 'aria-label': 'Observación' },
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, completar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            const payload: any = { estado: 'Completado' };
            const obs = (result.value as string)?.trim();
            if (obs) payload.observacion = obs;
            await this.backupService.updateBackup(this.backupSeleccionado.id, payload);
            this.cerrarDetalle();
            await this.cargarBackupsDelMes();
            await this.notificacionService.cargarAlertas();
        }
    }

    exportarExcel(): void {
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                       'agosto','septiembre','octubre','noviembre','diciembre'];
        const mes = this.fechaSeleccionada.getMonth();
        const anio = this.fechaSeleccionada.getFullYear();
        const mesNombre = meses[mes];
        const titulo = `CALENDARIO DE BACKUPS — ${mesNombre.toUpperCase()} ${anio}`;
        const nombreArchivo = `backups-${mesNombre}-${anio}.xlsx`;
        const ahora = new Date().toLocaleString('es-CO');

        const completados   = this.backupsDelMes.filter(b => b.estado === 'Completado').length;
        const pendientes    = this.backupsDelMes.filter(b => b.estado === 'Pendiente').length;
        const fallidos      = this.backupsDelMes.filter(b => b.estado === 'Fallido').length;
        const noRealizados  = this.backupsDelMes.filter(b => b.estado === 'No realizado').length;

        const aoa: any[][] = [
            [titulo, '', '', '', '', '', ''],
            [`Generado el: ${ahora}`, '', '', '', '', '', ''],
            [],
            ['#', 'Fecha', 'Sistema de Información', 'Tipo', 'Frecuencia', 'Estado', 'Observación'],
            ...this.backupsDelMes.map((b, i) => [
                i + 1,
                b.fecha ?? '—',
                b.sistemaNombre ?? '—',
                b.tipo ?? '—',
                b.frecuencia_backup ?? '—',
                b.estado ?? '—',
                b.observacion ?? '—'
            ]),
            [`Pendientes: ${pendientes}`, `Completados: ${completados}`, `Fallidos: ${fallidos}`, `No realizados: ${noRealizados}`, '', '', '']
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws['!cols'] = [
            { wch: 4 }, { wch: 12 }, { wch: 30 }, { wch: 15 },
            { wch: 15 }, { wch: 12 }, { wch: 30 }
        ];

        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
        ];

        // Estilos en celdas (requiere xlsx con soporte de estilos)
        const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
        if (ws[titleCell]) {
            ws[titleCell].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '1E3A5F' } },
                alignment: { horizontal: 'center' }
            };
        }

        for (let c = 0; c < 7; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 3, c });
            if (ws[cellRef]) {
                ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D3D3D3' } } };
            }
        }

        const colorMap: Record<string, string> = {
            'Completado':   'd4edda',
            'Pendiente':    'fff3cd',
            'Fallido':      'f8d7da',
            'No realizado': 'e0e0e0'
        };

        this.backupsDelMes.forEach((b, i) => {
            const color = colorMap[b.estado] ?? 'FFFFFF';
            for (let c = 0; c < 7; c++) {
                const cellRef = XLSX.utils.encode_cell({ r: 4 + i, c });
                if (ws[cellRef]) {
                    ws[cellRef].s = { fill: { fgColor: { rgb: color } } };
                }
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Backups');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), nombreArchivo);
    }
}
