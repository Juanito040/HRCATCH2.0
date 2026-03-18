import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CargosService } from '../../../Services/appServices/general/cargos/cargos.service';
import Swal from 'sweetalert2';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
    selector: 'app-adm-cargos',
    standalone: true,
    imports: [CommonModule, TableModule, DialogModule, ButtonModule, InputTextModule, TextareaModule, ReactiveFormsModule, FormsModule, ToolbarModule, TagModule, InputSwitchModule, IconFieldModule, InputIconModule, UppercaseDirective],
    templateUrl: './adm-cargos.component.html',
    styleUrl: './adm-cargos.component.css'
})
export class AdmCargosComponent implements OnInit {

    cargosService = inject(CargosService);
    formBuilder = inject(FormBuilder);

    cargos: any[] = [];
    cargoForm: FormGroup;
    viewModal: boolean = false;
    isEditing: boolean = false;
    selectedCargo: any;
    loading: boolean = false;

    @ViewChild('dt') dt!: Table;

    constructor() {
        this.cargoForm = this.formBuilder.group({
            nombre: ['', [Validators.required]],
            descripcion: ['']
        });
    }

    ngOnInit(): void {
        this.loadCargos();
    }

    loadCargos() {
        this.loading = true;
        this.cargosService.getCargos().subscribe({
            next: (res) => {
                this.cargos = res;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    openNew() {
        this.cargoForm.reset();
        this.isEditing = false;
        this.viewModal = true;
    }

    editCargo(cargo: any) {
        this.selectedCargo = cargo;
        this.isEditing = true;
        this.cargoForm.patchValue({
            nombre: cargo.nombre,
            descripcion: cargo.descripcion
        });
        this.viewModal = true;
    }

    saveCargo() {
        if (this.cargoForm.invalid) {
            Swal.fire('Error', 'Complete los campos obligatorios', 'warning');
            return;
        }

        const cargoData = this.cargoForm.value;

        if (this.isEditing) {
            this.cargosService.updateCargo(this.selectedCargo.id, { ...cargoData, estado: this.selectedCargo.estado }).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cargo actualizado', 'success');
                    this.loadCargos();
                    this.viewModal = false;
                },
                error: () => Swal.fire('Error', 'No se pudo actualizar el cargo', 'error')
            });
        } else {
            this.cargosService.createCargo(cargoData).subscribe({
                next: () => {
                    Swal.fire('Éxito', 'Cargo creado', 'success');
                    this.loadCargos();
                    this.viewModal = false;
                },
                error: () => Swal.fire('Error', 'No se pudo crear el cargo', 'error')
            });
        }
    }

    toggleEstado(cargo: any) {
        const newStatus = !cargo.estado;
        this.cargosService.updateCargo(cargo.id, { estado: newStatus }).subscribe({
            next: () => {
                cargo.estado = newStatus;
                Swal.fire({
                    icon: 'success',
                    title: `Cargo ${newStatus ? 'activado' : 'desactivado'}`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            error: () => {
                // Revert UI change if failed (optional, depending on UX preference)
                Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
            }
        });
    }

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dt.filterGlobal(input.value, 'contains');
    }
}
