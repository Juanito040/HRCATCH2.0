import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SedeService } from '../../../Services/appServices/general/sede/sede.service';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SelectModule } from 'primeng/select';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
  selector: 'app-admservicios',
  standalone: true,
  imports: [TableModule, CommonModule, InputIconModule, IconFieldModule, InputTextModule, DialogModule, ReactiveFormsModule, ButtonModule, TooltipModule, ToolbarModule, TagModule, SelectModule, CheckboxModule, UppercaseDirective],
  templateUrl: './admservicios.component.html',
  styleUrl: './admservicios.component.css'
})
export class AdmserviciosComponent implements OnInit {

  @ViewChild('dt2') dt2!: Table;
  servicios!: any[];
  sedes: any[] = [];
  servicioServices = inject(ServicioService);
  sedeServices = inject(SedeService);
  formBuilder = inject(FormBuilder);
  loading: boolean = false;
  visibleEditModal: boolean = false;
  selectedServicio: any;
  formGroup: FormGroup;

  constructor() {
    this.formGroup = this.formBuilder.group({
      nombres: ['', Validators.required],
      ubicacion: ['', Validators.required],
      sedeIdFk: ['', Validators.required],
      requiereMesaServicios: [false],
      activo: [true]
    });
  }

  async ngOnInit() {
    this.loading = true;
    try {
      this.servicios = await this.servicioServices.getAllServicios();
      this.sedes = await this.sedeServices.getAllSedes();
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos de servicios', 'error');
    } finally {
      this.loading = false;
    }
  }

  estadoServicio(idServicio: any, accion: String) {
    if (accion === 'A') {
      Swal.fire({
        title: "Desea activar el Servicio?",
        showCancelButton: true,
        confirmButtonText: "Activar",
        cancelButtonText: `Cancelar`
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await this.servicioServices.activarServicio(idServicio);
          this.servicios = await this.servicioServices.getAllServicios();
          Swal.fire("Servicio activo!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Se descarto la activacion del servicio", "", "info");
        }
      });
    } else if (accion === 'D') {
      Swal.fire({
        title: "Desea desactivar el servicio?",
        showCancelButton: true,
        confirmButtonText: "Desactivar",
        cancelButtonText: `Cancelar`
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await this.servicioServices.desactivarServicio(idServicio);
            this.servicios = await this.servicioServices.getAllServicios();
            Swal.fire("servicio Inactivo!", "", "success");
          } catch {
            Swal.fire("El servicio tiene equipos activos relacionados", "", "error");
          }
        } else if (result.isDenied) {
          Swal.fire("Se descarto la activacion del servicio", "", "info");
        }
      });
    }
  }



  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  openEditModal(servicio: any) {
    this.selectedServicio = servicio;
    this.formGroup.patchValue({
      nombres: servicio.nombres,
      ubicacion: servicio.ubicacion,
      sedeIdFk: servicio.sedeIdFk || servicio.sede?.id, // Handle flat or associated
      requiereMesaServicios: servicio.requiereMesaServicios,
      activo: servicio.activo
    });
    this.visibleEditModal = true;
  }

  openCreateModal() {
    this.selectedServicio = null;
    this.formGroup.reset({
      requiereMesaServicios: false,
      activo: true
    });
    this.visibleEditModal = true;
  }

  async saveServicio() {
    if (this.formGroup.valid) {
      try {
        if (this.selectedServicio) {
          // Update
          await this.servicioServices.actualizarServicio(this.selectedServicio.id, this.formGroup.value);
          Swal.fire("Servicio actualizado!", "", "success");
        } else {
          // Create
          await this.servicioServices.createServicio(this.formGroup.value);
          Swal.fire("Servicio creado!", "", "success");
        }
        this.servicios = await this.servicioServices.getAllServicios();
        this.visibleEditModal = false;
      } catch (error) {
        Swal.fire("Error", "No se pudo guardar el servicio", "error");
      }
    } else {
      Swal.fire("Formulario inválido", "Por favor completa los campos requeridos", "warning");
    }
  }
}
