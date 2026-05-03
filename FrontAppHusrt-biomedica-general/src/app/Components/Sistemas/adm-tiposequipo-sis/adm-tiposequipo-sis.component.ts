import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SysprotocoloService } from '../../../Services/appServices/sistemasServices/sysprotocolo/sysprotocolo.service';
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { UppercaseDirective } from '../../../Directives/uppercase.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adm-tiposequipo-sis',
  standalone: true,
  imports: [
    TableModule, TextareaModule, CommonModule, InputIconModule, IconFieldModule,
    InputTextModule, DialogModule, ReactiveFormsModule, FormsModule,
    ButtonModule, TooltipModule, ToolbarModule, TagModule, UppercaseDirective
  ],
  templateUrl: './adm-tiposequipo-sis.component.html',
  styleUrl: './adm-tiposequipo-sis.component.css'
})
export class AdmTiposEquipoSisComponent implements OnInit {

  formGroup: FormGroup;
  formBuilder = inject(FormBuilder);

  @ViewChild('dt2') dt2!: Table;
  tipoEquipoService = inject(TipoEquipoService);
  protocoloService = inject(SysprotocoloService);

  tiposEquipos: any[] = [];
  loading: boolean = false;
  viewAddTipoEquipo: boolean = false;
  tipoEquipoSelected: any;
  isEditing: boolean = false;

  viewProtocolsModal: boolean = false;
  protocoloTipoEquipo: any[] = [];
  newProtocoloPaso: string = '';
  isLoadingProtocolos: boolean = false;

  constructor() {
    this.formGroup = this.formBuilder.group({
      nombres: ['', [Validators.required]],
      materialConsumible: ['', [Validators.required]],
      herramienta: ['', [Validators.required]],
      tiempoMinutos: ['', [Validators.required]],
      repuestosMinimos: ['', [Validators.required]],
      actividad: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    await this.loadTiposEquipos();
  }

  async loadTiposEquipos() {
    this.loading = true;
    try {
      this.tiposEquipos = await this.tipoEquipoService.getTiposEquiposSistemas();
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los tipos de equipo', 'error');
    } finally {
      this.loading = false;
    }
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) this.dt2.filterGlobal(target.value, 'contains');
  }

  viewModalAddTipoEquipo() {
    this.formGroup.reset();
    this.isEditing = false;
    this.viewAddTipoEquipo = true;
  }

  openEditModal(tipoEquipo: any) {
    this.tipoEquipoSelected = tipoEquipo;
    this.isEditing = true;
    this.formGroup.patchValue({
      nombres: tipoEquipo.nombres,
      materialConsumible: tipoEquipo.materialConsumible,
      herramienta: tipoEquipo.herramienta,
      tiempoMinutos: tipoEquipo.tiempoMinutos,
      repuestosMinimos: tipoEquipo.repuestosMinimos || 'No aplica',
      actividad: tipoEquipo.actividad || 'Mantenimiento Preventivo',
    });
    this.viewAddTipoEquipo = true;
  }

  async saveTipoEquipo() {
    if (this.formGroup.invalid) {
      Swal.fire('Formulario inválido', 'Completa todos los campos requeridos', 'warning');
      return;
    }

    if (this.isEditing) {
      try {
        await this.tipoEquipoService.actualizarTipoEquipo(this.tipoEquipoSelected.id, {
          ...this.formGroup.value,
          tipoR: 2
        });
        await this.loadTiposEquipos();
        this.viewAddTipoEquipo = false;
        Swal.fire('Tipo de Equipo actualizado!', '', 'success');
      } catch {
        Swal.fire('Error al actualizar', 'No se pudo actualizar el tipo de equipo', 'error');
      }
    } else {
      try {
        await this.tipoEquipoService.crearTipoEquipo({
          ...this.formGroup.value,
          tipoR: 2,
          activo: true,
        });
        await this.loadTiposEquipos();
        this.viewAddTipoEquipo = false;
        Swal.fire('Tipo de Equipo creado!', '', 'success');
      } catch (error: any) {
        const detail = error.error?.detalle || error.message || 'No se pudo crear el tipo de equipo';
        Swal.fire('Error al crear', detail, 'error');
      }
    }
  }

  async estadoTipoEquipo(id: any, accion: string) {
    const isActivar = accion === 'A';
    const { isConfirmed } = await Swal.fire({
      title: `¿Desea ${isActivar ? 'activar' : 'desactivar'} este tipo de equipo?`,
      showCancelButton: true,
      confirmButtonText: isActivar ? 'Activar' : 'Desactivar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      if (isActivar) {
        await this.tipoEquipoService.activarTipoEquipo(id);
      } else {
        await this.tipoEquipoService.desactivarTipoEquipo(id);
      }
      await this.loadTiposEquipos();
      Swal.fire(`Tipo de equipo ${isActivar ? 'activo' : 'inactivo'}!`, '', 'success');
    } catch {
      if (!isActivar) {
        Swal.fire('No se puede desactivar', 'El tipo de equipo tiene equipos activos asociados', 'error');
      }
    }
  }

  async viewProtocolos(tipoEquipo: any) {
    this.tipoEquipoSelected = tipoEquipo;
    this.isLoadingProtocolos = true;
    this.viewProtocolsModal = true;
    try {
      this.protocoloTipoEquipo = await this.protocoloService.getByTipoEquipo(tipoEquipo.id);
    } catch {
      this.protocoloTipoEquipo = [];
    } finally {
      this.isLoadingProtocolos = false;
    }
  }

  async addProtocolo() {
    if (!this.newProtocoloPaso.trim()) {
      Swal.fire('Atención', 'Escribe el paso del protocolo', 'warning');
      return;
    }
    try {
      await this.protocoloService.create({
        paso: this.newProtocoloPaso,
        estado: true,
        id_tipo_equipo_fk: this.tipoEquipoSelected.id,
      });
      this.newProtocoloPaso = '';
      this.protocoloTipoEquipo = await this.protocoloService.getByTipoEquipo(this.tipoEquipoSelected.id);
      Swal.fire({ icon: 'success', title: 'Protocolo agregado', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire('Error', 'No se pudo agregar el protocolo', 'error');
    }
  }

  async toggleProtocolStatus(protocolo: any) {
    const newStatus = !protocolo.estado;
    try {
      await this.protocoloService.update(protocolo.id_sysprotocolo, { estado: newStatus });
      this.protocoloTipoEquipo = await this.protocoloService.getByTipoEquipo(this.tipoEquipoSelected.id);
      Swal.fire({ icon: 'success', title: `Protocolo ${newStatus ? 'habilitado' : 'deshabilitado'}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el protocolo', 'error');
    }
  }
}
