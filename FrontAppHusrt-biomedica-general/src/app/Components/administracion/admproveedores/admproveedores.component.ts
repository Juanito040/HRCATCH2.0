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
import { ProveedorService } from './../../../Services/appServices/biomedicaServices/proveedor/proveedor.service';
import Swal from 'sweetalert2';
import { getDecodedAccessToken } from '../../../utilidades';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
    selector: 'app-admproveedores',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        TableModule, InputTextModule, ButtonModule, DialogModule, ToolbarModule, TooltipModule, TagModule,
        IconFieldModule, InputIconModule, UppercaseDirective
    ],
    templateUrl: './admproveedores.component.html',
    styleUrl: './admproveedores.component.css'
})
export class AdmProveedoresComponent implements OnInit {

    proveedorService = inject(ProveedorService);
    formBuilder = inject(FormBuilder);

    proveedores: any[] = [];
    loading: boolean = false;
    viewModal: boolean = false;
    isEditing: boolean = false;
    selectedProveedor: any;

    formGroup: FormGroup;
    @ViewChild('dt') dt!: Table;

    isAdminBiomedica: boolean = false;

    constructor() {
        this.formGroup = this.formBuilder.group({
            nombres: ['', Validators.required],
            telefono: ['', Validators.required],
            correo: ['', [Validators.required, Validators.email]],
            ciudad: ['', Validators.required],
            representante: ['', Validators.required],
            telRepresentante: ['', Validators.required]
        });
    }

    async ngOnInit() {
        this.checkRole();
        this.loadProveedores();
    }

    checkRole() {
        const token = sessionStorage.getItem('utoken');
        if (token) {
            const decoded = getDecodedAccessToken();
            if (decoded?.rol === 'BIOMEDICAADMIN') {
                this.isAdminBiomedica = true;
            }
        }
    }

    async loadProveedores() {
        this.loading = true;
        try {
            this.proveedores = await this.proveedorService.getProveedores();
        } catch (error) {
            console.error(error);
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

    openEdit(proveedor: any) {
        this.selectedProveedor = proveedor;
        this.isEditing = true;
        this.formGroup.patchValue({
            nombres: proveedor.nombres,
            telefono: proveedor.telefono,
            correo: proveedor.correo,
            ciudad: proveedor.ciudad,
            representante: proveedor.representante,
            telRepresentante: proveedor.telRepresentante
        });
        this.viewModal = true;
    }

    async saveProveedor() {
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
                await this.proveedorService.actualizarProveedor(this.selectedProveedor.id, data);
                Swal.fire('Éxito', 'Proveedor actualizado correctamente', 'success');
            } else {
                await this.proveedorService.createProveedor(data);
                Swal.fire('Éxito', 'Proveedor creado correctamente', 'success');
            }
            this.viewModal = false;
            this.loadProveedores();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el proveedor', 'error');
        }
    }

    async toggleEstado(proveedor: any) {
        const newStatus = !proveedor.estado;
        const action = newStatus ? 'activar' : 'desactivar';

        Swal.fire({
            title: `¿Desea ${action} el proveedor?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.proveedorService.actualizarProveedor(proveedor.id, { estado: newStatus });
                    Swal.fire('Actualizado', `Proveedor ${newStatus ? 'activado' : 'desactivado'}`, 'success');
                    this.loadProveedores();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', `No se pudo ${action} el proveedor`, 'error');
                }
            }
        });
    }
}
