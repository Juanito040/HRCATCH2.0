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
import { SistemaInformacionService } from '../../../Services/appServices/biomedicaServices/sistemaInformacion/sistema-informacion.service';
import { ResponsableService } from '../../../Services/appServices/biomedicaServices/responsable/responsable.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admsistemasinformacion',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        TableModule, InputTextModule, ButtonModule, DialogModule, ToolbarModule, TooltipModule, TagModule,
        IconFieldModule, InputIconModule, SelectModule
    ],
    templateUrl: './admsistemasinformacion.component.html',
    styleUrl: './admsistemasinformacion.component.css'
})
export class AmdSistemasInformacionComponent implements OnInit {

    sistemaService = inject(SistemaInformacionService);
    responsableService = inject(ResponsableService);
    userService = inject(UserService);
    formBuilder = inject(FormBuilder);

    sistemas: any[] = [];
    usuarios: any[] = [];
    proveedores: any[] = [];
    loading: boolean = false;
    viewModal: boolean = false;
    isEditing: boolean = false;
    selectedSistema: any;

    periodicidadOptions = [
        { label: 'Diario', value: 'Diario' },
        { label: 'Semanal', value: 'Semanal' },
        { label: 'Mensual', value: 'Mensual' },
        { label: 'Anual', value: 'Anual' }
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
            proveedorId: ['', Validators.required],
            periodicidad: ['']
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
            proveedorId: sistema.proveedorId,
            periodicidad: sistema.periodicidad
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
}
