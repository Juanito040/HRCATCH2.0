import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { DatePickerModule, DatePickerMonthChangeEvent } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { SistemaInformacionService } from '../../../Services/appServices/biomedicaServices/sistemaInformacion/sistema-informacion.service';
import { ResponsableService } from '../../../Services/appServices/biomedicaServices/responsable/responsable.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { BackupSistemaService } from '../../../Services/appServices/biomedicaServices/backup/backup-sistema.service';
import { NotificacionBackupService } from '../../../Services/appServices/biomedicaServices/backup/notificacion-backup.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admsistemasinformacion',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        TableModule, InputTextModule, ButtonModule, DialogModule, ToolbarModule, TooltipModule, TagModule,
        IconFieldModule, InputIconModule, SelectModule, DatePickerModule, TextareaModule
    ],
    templateUrl: './admsistemasinformacion.component.html',
    styleUrl: './admsistemasinformacion.component.css'
})
export class AmdSistemasInformacionComponent implements OnInit {

    sistemaService = inject(SistemaInformacionService);
    responsableService = inject(ResponsableService);
    userService = inject(UserService);
    backupService = inject(BackupSistemaService);
    notificacionService = inject(NotificacionBackupService);
    formBuilder = inject(FormBuilder);

    sistemas: any[] = [];
    usuarios: any[] = [];
    proveedores: any[] = [];
    loading: boolean = false;
    viewModal: boolean = false;
    isEditing: boolean = false;
    selectedSistema: any;

    // Calendario de backups
    viewCalendarioBackup: boolean = false;
    sistemaSeleccionado: any = null;
    backupsDelMes: any[] = [];
    fechaBackup: Date = new Date();
    viewFormBackup: boolean = false;
    nuevoBackup: any = { fecha: null, tipo: 'Completo', estado: 'Pendiente', frecuencia_backup: 'Mensual', observacion: '' };
    guardandoBackup: boolean = false;
    isEditingBackup: boolean = false;
    backupEditandoId: number | null = null;

    tipoBackupOptions = [
        { label: 'Completo', value: 'Completo' },
        { label: 'Incremental', value: 'Incremental' },
        { label: 'Diferencial', value: 'Diferencial' }
    ];

    estadoBackupOptions = [
        { label: 'Pendiente',    value: 'Pendiente' },
        { label: 'Completado',   value: 'Completado' },
        { label: 'Fallido',      value: 'Fallido' },
        { label: 'No realizado', value: 'No realizado' }
    ];

    frecuenciaBackupOptions = [
        { label: 'Anual',   value: 'Anual'   },
        { label: 'Mensual', value: 'Mensual' },
        { label: 'Semanal', value: 'Semanal' },
        { label: 'Diario',  value: 'Diario'  }
    ];

    formGroup: FormGroup;
    @ViewChild('dt') dt!: Table;

    constructor() {
        this.formGroup = this.formBuilder.group({
            nombre: ['', Validators.required],
            tipo: ['', Validators.required],
            version: ['', Validators.required],
            tecnologia: ['', Validators.required],
            responsableId: ['', Validators.required],
            proveedorId: ['', Validators.required]
        });
    }

    async ngOnInit() {
        this.loadSistemasInformacion();
        this.usuarios = await this.userService.getUsersSistemas();
        this.proveedores = await this.responsableService.getAllResponsables();
    }

    async loadSistemasInformacion() {
        this.loading = true;
        try {
            this.sistemas = await this.sistemaService.getSistemasInformacion();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar los sistemas de información', 'error');
        }
        this.loading = false;
    }

    onGlobalFilter(event: Event) {
        const target = event.target as HTMLInputElement;
        this.dt.filterGlobal(target.value, 'contains');
    }

    openNew() {
        this.formGroup.reset();
        this.isEditing = false;
        this.viewModal = true;
    }

    openEdit(sistema: any) {
        this.selectedSistema = sistema;
        this.isEditing = true;
        this.formGroup.patchValue({
            nombre: sistema.nombre,
            tipo: sistema.tipo,
            version: sistema.version,
            tecnologia: sistema.tecnologia,
            responsableId: sistema.responsableId,
            proveedorId: sistema.proveedorId
        });
        this.viewModal = true;
    }

    async saveSistema() {
        if (this.formGroup.invalid) {
            Swal.fire('Atención', 'Complete todos los campos requeridos correctamente', 'warning');
            return;
        }

        const data = {
            ...this.formGroup.value,
            estado: true
        };

        try {
            if (this.isEditing) {
                await this.sistemaService.actualizarSistema(this.selectedSistema.id, data);
                Swal.fire('Éxito', 'Sistema de información actualizado correctamente', 'success');
            } else {
                await this.sistemaService.createSistema(data);
                Swal.fire('Éxito', 'Sistema de información creado correctamente', 'success');
            }
            this.viewModal = false;
            this.loadSistemasInformacion();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el sistema de información', 'error');
        }
    }

    async toggleEstado(sistema: any) {
        const newStatus = !sistema.estado;
        const action = newStatus ? 'activar' : 'desactivar';

        Swal.fire({
            title: `¿Desea ${action} el sistema de información?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.sistemaService.actualizarSistema(sistema.id, { estado: newStatus });
                    Swal.fire('Actualizado', `Sistema ${newStatus ? 'activado' : 'desactivado'}`, 'success');
                    this.loadSistemasInformacion();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', `No se pudo ${action} el sistema de información`, 'error');
                }
            }
        });
    }

    // --- Calendario de backups ---

    async openCalendarioBackup(sistema: any) {
        this.sistemaSeleccionado = sistema;
        this.fechaBackup = new Date();
        this.viewCalendarioBackup = true;
        await this.cargarBackupsDelMes();
    }

    async onMesCalendarioChange(event: DatePickerMonthChangeEvent) {
        if (event.month != null && event.year != null) {
            this.fechaBackup = new Date(event.year, event.month - 1, 1);
            await this.cargarBackupsDelMes();
        }
    }

    async cargarBackupsDelMes() {
        try {
            this.backupsDelMes = await this.backupService.getBackupsPorSistema(this.sistemaSeleccionado.id);
        } catch (error) {
            console.error(error);
            this.backupsDelMes = [];
        }
    }

    abrirFormBackup() {
        this.isEditingBackup = false;
        this.backupEditandoId = null;
        this.nuevoBackup = { fecha: null, tipo: 'Completo', estado: 'Pendiente', frecuencia_backup: 'Mensual', observacion: '' };
        this.viewFormBackup = true;
    }

    editarBackup(backup: any) {
        this.isEditingBackup = true;
        this.backupEditandoId = backup.id;
        this.nuevoBackup = {
            fecha: new Date(backup.fecha + 'T00:00:00'),
            tipo: backup.tipo,
            estado: backup.estado,
            frecuencia_backup: backup.frecuencia_backup,
            observacion: backup.observacion
        };
        this.viewFormBackup = true;
    }

    async guardarBackup() {
        if (this.guardandoBackup) return;
        if (!this.nuevoBackup.fecha) {
            Swal.fire('Atención', 'Seleccione una fecha para el backup', 'warning');
            return;
        }
        this.guardandoBackup = true;
        try {
            const fechaStr = this.nuevoBackup.fecha instanceof Date
                ? this.nuevoBackup.fecha.toISOString().split('T')[0]
                : this.nuevoBackup.fecha;
            const payload = {
                fecha: fechaStr,
                tipo: this.nuevoBackup.tipo,
                estado: this.nuevoBackup.estado,
                frecuencia_backup: this.nuevoBackup.frecuencia_backup,
                observacion: this.nuevoBackup.observacion
            };
            if (this.isEditingBackup) {
                await this.backupService.updateBackup(this.backupEditandoId!, payload);
                if (payload.estado === 'Completado') {
                    this.notificacionService.eliminarAlertaPorSistema(this.sistemaSeleccionado.id);
                }
            } else {
                await this.backupService.createBackup({
                    sistemaInformacionId: this.sistemaSeleccionado.id,
                    ...payload
                });
            }
            this.fechaBackup = this.nuevoBackup.fecha instanceof Date
                ? this.nuevoBackup.fecha
                : new Date(this.nuevoBackup.fecha);
            this.viewFormBackup = false;
            await Swal.fire('Éxito', this.isEditingBackup ? 'Backup actualizado correctamente' : 'Backup registrado correctamente', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el backup', 'error');
            this.guardandoBackup = false;
            return;
        }
        this.guardandoBackup = false;
        await this.cargarBackupsDelMes();
    }

    async eliminarBackup(backup: any) {
        const result = await Swal.fire({
            title: '¿Eliminar backup?',
            text: `Fecha: ${backup.fecha}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await this.backupService.deleteBackup(backup.id);
                await this.cargarBackupsDelMes();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo eliminar el backup', 'error');
            }
        }
    }

    async cambiarEstadoBackup(backup: any, nuevoEstado: string) {
        try {
            await this.backupService.updateBackup(backup.id, { estado: nuevoEstado });
            backup.estado = nuevoEstado;
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    }

    getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' {
        if (estado === 'Completado') return 'success';
        if (estado === 'Fallido') return 'danger';
        return 'warn';
    }
}
