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
import { extractError } from '../../../utils/error-utils';

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
      // Campos de Hoja de Vida
      campo_ip:            [true],
      campo_mac:           [true],
      campo_procesador:    [true],
      campo_ram:           [true],
      campo_disco:         [true],
      campo_tonner:        [true],
      campo_so:            [true],
      campo_office:        [true],
      campo_nombre_usuario:[true],
      campo_tipo_uso:      [true],
      campo_adquisicion:   [true],
      campo_observaciones: [true],
    });
  }

  async ngOnInit() {
    await this.loadTiposEquipos();
  }

  async loadTiposEquipos() {
    this.loading = true;
    try {
      this.tiposEquipos = await this.tipoEquipoService.getTiposEquiposSistemas();
    } catch (err) {
      Swal.fire('Error', extractError(err, 'cargar los tipos de equipo'), 'error');
    } finally {
      this.loading = false;
    }
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) this.dt2.filterGlobal(target.value, 'contains');
  }

  private camposHVDefaults = {
    campo_ip: true, campo_mac: true, campo_procesador: true, campo_ram: true,
    campo_disco: true, campo_tonner: true, campo_so: true, campo_office: true,
    campo_nombre_usuario: true, campo_tipo_uso: true,
    campo_adquisicion: true, campo_observaciones: true,
  };

  viewModalAddTipoEquipo() {
    this.formGroup.reset();
    this.formGroup.patchValue(this.camposHVDefaults);
    this.isEditing = false;
    this.viewAddTipoEquipo = true;
  }

  openEditModal(tipoEquipo: any) {
    this.tipoEquipoSelected = tipoEquipo;
    this.isEditing = true;
    const bool = (v: any) => (v === undefined || v === null) ? true : Boolean(v);
    this.formGroup.patchValue({
      nombres: tipoEquipo.nombres,
      materialConsumible: tipoEquipo.materialConsumible,
      herramienta: tipoEquipo.herramienta,
      tiempoMinutos: tipoEquipo.tiempoMinutos,
      repuestosMinimos: tipoEquipo.repuestosMinimos || 'No aplica',
      actividad: tipoEquipo.actividad || 'Mantenimiento Preventivo',
      campo_ip:            bool(tipoEquipo.campo_ip),
      campo_mac:           bool(tipoEquipo.campo_mac),
      campo_procesador:    bool(tipoEquipo.campo_procesador),
      campo_ram:           bool(tipoEquipo.campo_ram),
      campo_disco:         bool(tipoEquipo.campo_disco),
      campo_tonner:        bool(tipoEquipo.campo_tonner),
      campo_so:            bool(tipoEquipo.campo_so),
      campo_office:        bool(tipoEquipo.campo_office),
      campo_nombre_usuario:bool(tipoEquipo.campo_nombre_usuario),
      campo_tipo_uso:      bool(tipoEquipo.campo_tipo_uso),
      campo_adquisicion:   bool(tipoEquipo.campo_adquisicion),
      campo_observaciones: bool(tipoEquipo.campo_observaciones),
    });
    this.viewAddTipoEquipo = true;
  }

  async saveTipoEquipo() {
    if (this.formGroup.invalid) {
      const campos: Record<string, string> = {
        nombres: 'el nombre del tipo de equipo',
        materialConsumible: 'el material consumible',
        herramienta: 'la herramienta requerida',
        tiempoMinutos: 'el tiempo en minutos',
        repuestosMinimos: 'los repuestos mínimos',
        actividad: 'la actividad de mantenimiento',
      };
      const primerCampoInvalido = Object.keys(campos).find(
        key => this.formGroup.get(key)?.invalid
      );
      const msg = primerCampoInvalido
        ? `El campo "${campos[primerCampoInvalido]}" es obligatorio.`
        : 'Completa todos los campos requeridos antes de guardar.';
      Swal.fire('Formulario incompleto', msg, 'warning');
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
      } catch (err) {
        Swal.fire('Error al actualizar', extractError(err, 'actualizar el tipo de equipo'), 'error');
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
      } catch (err) {
        Swal.fire('Error al crear', extractError(err, 'crear el tipo de equipo'), 'error');
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
    } catch (err) {
      const accion = isActivar ? 'activar' : 'desactivar';
      const defaultMsg = !isActivar
        ? 'No es posible desactivar este tipo de equipo porque tiene equipos activos asociados.'
        : 'No se pudo activar el tipo de equipo.';
      const msg = (err as any)?.error?.message || (err as any)?.error?.detalle || defaultMsg;
      Swal.fire(`No se pudo ${accion}`, msg, 'error');
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
    } catch (err) {
      Swal.fire('Error', extractError(err, 'agregar el protocolo de mantenimiento'), 'error');
    }
  }

  async toggleProtocolStatus(protocolo: any) {
    const newStatus = !protocolo.estado;
    try {
      await this.protocoloService.update(protocolo.id_sysprotocolo, { estado: newStatus });
      this.protocoloTipoEquipo = await this.protocoloService.getByTipoEquipo(this.tipoEquipoSelected.id);
      Swal.fire({ icon: 'success', title: `Protocolo ${newStatus ? 'habilitado' : 'deshabilitado'}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire('Error', extractError(err, 'actualizar el estado del protocolo'), 'error');
    }
  }
}
