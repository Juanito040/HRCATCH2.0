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
import { FabricanteService } from './../../../Services/appServices/biomedicaServices/fabricante/fabricante.service';
import Swal from 'sweetalert2';
import { getDecodedAccessToken } from '../../../utilidades';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
    selector: 'app-admfabricantes',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        TableModule, InputTextModule, ButtonModule, DialogModule, ToolbarModule, TooltipModule, TagModule,
        IconFieldModule, InputIconModule, UppercaseDirective
    ],
    templateUrl: './admfabricantes.component.html',
    styleUrl: './admfabricantes.component.css'
})
export class AdmFabricantesComponent implements OnInit {

    fabricanteService = inject(FabricanteService);
    formBuilder = inject(FormBuilder);

    fabricantes: any[] = [];
    loading: boolean = false;
    viewModal: boolean = false;
    isEditing: boolean = false;
    selectedFabricante: any;

    formGroup: FormGroup;
    @ViewChild('dt') dt!: Table;

    isAdminBiomedica: boolean = false;

    constructor() {
        this.formGroup = this.formBuilder.group({
            nombres: ['', Validators.required],
            pais: ['', Validators.required]
        });
    }

    async ngOnInit() {
        this.checkRole();
        this.loadFabricantes();
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

    async loadFabricantes() {
        this.loading = true;
        try {
            this.fabricantes = await this.fabricanteService.getFabricantes();
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

    openEdit(fabricante: any) {
        this.selectedFabricante = fabricante;
        this.isEditing = true;
        this.formGroup.patchValue({
            nombres: fabricante.nombres,
            pais: fabricante.pais
        });
        this.viewModal = true;
    }

    async saveFabricante() {
        if (this.formGroup.invalid) {
            Swal.fire('Atención', 'Complete todos los campos requeridos', 'warning');
            return;
        }

        const data = {
            ...this.formGroup.value,
            estado: true
        };

        try {
            if (this.isEditing) {
                await this.fabricanteService.actualizarFabricante(this.selectedFabricante.id, data);
                Swal.fire('Éxito', 'Fabricante actualizado correctamente', 'success');
            } else {
                await this.fabricanteService.createFabricante(data);
                Swal.fire('Éxito', 'Fabricante creado correctamente', 'success');
            }
            this.viewModal = false;
            this.loadFabricantes();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el fabricante', 'error');
        }
    }

    async toggleEstado(fabricante: any) {
        // Determine the new status (inverse of current)
        // Assuming backend handles update correctly.
        // If the backend doesn't have specific endpoint for toggle, we use update.

        // Check if fabricante.estado is boolean or number (sometimes bit types are 1/0)
        // Models say DataTypes.BOOLEAN

        const newStatus = !fabricante.estado;
        const action = newStatus ? 'activar' : 'desactivar';

        Swal.fire({
            title: `¿Desea ${action} el fabricante?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await this.fabricanteService.actualizarFabricante(fabricante.id, { estado: newStatus });
                    Swal.fire('Actualizado', `Fabricante ${newStatus ? 'activado' : 'desactivado'}`, 'success');
                    this.loadFabricantes();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', `No se pudo ${action} el fabricante`, 'error');
                }
            }
        });
    }
}
