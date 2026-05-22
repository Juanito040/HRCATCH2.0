import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProtocolosService } from './../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { CondicionInicialService } from './../../../Services/appServices/biomedicaServices/condicionesIniciales/condicion-inicial.service';
import { TipoEquipoService } from './../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { Component, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from "primeng/dialog";
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';
import Swal from 'sweetalert2';

import { getDecodedAccessToken } from '../../../utilidades';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
  selector: 'app-admtiposequipo',
  standalone: true,
  imports: [TableModule, TextareaModule, CommonModule, InputIconModule, IconFieldModule, InputTextModule, DialogModule, ReactiveFormsModule, ButtonModule, FormsModule, TooltipModule, ToolbarModule, TagModule, InputSwitchModule, UppercaseDirective],
  templateUrl: './admtiposequipo.component.html',
  styleUrl: './admtiposequipo.component.css'
})
export class AdmtiposequipoComponent implements OnInit {

  formGroup: FormGroup;
  formBuilder = inject(FormBuilder);

  @ViewChild('dt2') dt2!: Table;
  tipoequipoService = inject(TipoEquipoService);
  protocolosServices = inject(ProtocolosService);
  condicionInicialService = inject(CondicionInicialService);
  cd = inject(ChangeDetectorRef);

  tiposEquipos!: any[];
  loading: boolean = false;
  viewModalTipoEquipo: boolean = false;
  viewAddTipoEquipo: boolean = false;
  tipoEquipoSelected!: any;
  protocoloTipoEquipo!: any[];
  isEditing: boolean = false;
  viewProtocolsModal: boolean = false;
  newProtocoloPaso: string = ''; // For the new protocol input

  isAdminBiomedica: boolean = false;

  constructor() {
    this.formGroup = this.formBuilder.group({
      nombres: ['', [Validators.required]],
      materialConsumible: ['', [Validators.required]],
      herramienta: ['', [Validators.required]],
      tiempoMinutos: ['', [Validators.required]],
      repuestosMinimos: ['', [Validators.required]],
      actividad: ['', [Validators.required]],
      tipoR: ['', [Validators.required]],
      requiereMetrologia: [false],
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
    this.checkRole();
    await this.loadTiposEquipos();
  }

  async loadTiposEquipos() {
    const all = await this.tipoequipoService.getAllTiposEquipos();

    const decoded = getDecodedAccessToken();
    const isSuperAdmin = decoded?.rol === 'SUPERADMIN';

    if (this.isAdminBiomedica && !isSuperAdmin) {
      // Filter only Type 1 (Biomedica) for BIOMEDICAADMIN
      this.tiposEquipos = all.filter(t => Number(t.tipoR) === 1);
    } else {
      // SUPERADMIN or others see everything
      this.tiposEquipos = all;
    }
  }

  checkRole() {
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded = getDecodedAccessToken();
      if (decoded?.rol === 'BIOMEDICAADMIN' || decoded?.rol === 'SUPERADMIN') {
        this.isAdminBiomedica = true;
      }
    }
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  async viewTipoEquipo(tipoEquipo: any) {
    this.tipoEquipoSelected = tipoEquipo;
    this.protocoloTipoEquipo = await this.protocolosServices.getProtocoloTipoEquipo(this.tipoEquipoSelected.id);
    this.viewProtocolsModal = true;
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
    if (this.isAdminBiomedica) {
      this.formGroup.patchValue({ tipoR: 1 }); // Force Biomedica
    }
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
      tipoR: tipoEquipo.tipoR,
      requiereMetrologia: tipoEquipo.requiereMetrologia || false,
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
    if (this.formGroup.valid) {
      if (this.isEditing) {
        // Update
        try {
          await this.tipoequipoService.actualizarTipoEquipo(this.tipoEquipoSelected.id, this.formGroup.value);
          await this.loadTiposEquipos();
          this.viewAddTipoEquipo = false;
          Swal.fire("Tipo de Equipo actualizado!", "", "success");
        } catch (error) {
          Swal.fire("Error al actualizar", "No se pudo actualizar", "error");
        }
      } else {
        // Create
        try {
          const payload = {
            ...this.formGroup.value,
            activo: true,
            requiereMetrologia: !!this.formGroup.value.requiereMetrologia // Ensure boolean
          };
          if (payload.tipoR) payload.tipoR = Number(payload.tipoR);

          await this.tipoequipoService.crearTipoEquipo(payload);
          await this.loadTiposEquipos();
          this.viewAddTipoEquipo = false;
          Swal.fire("Tipo de Equipo creado!", "", "success");
        } catch (error: any) {
          console.error(error);
          const detail = error.error?.detalle || error.message || "No se pudo crear el tipo de equipo";
          Swal.fire("Error al crear", detail, "error");
        }
      }
    } else {
      Swal.fire("Formulario inválido", "Completa los campos", "warning");
    }
  }


  async estadoTipoEquipo(idTipoEquipo: any, accion: string) {
    if (accion === 'A') {
      Swal.fire({
        title: "Desea activar el Tipo de equipo?",
        showCancelButton: true,
        confirmButtonText: "Activar",
        cancelButtonText: `Cancelar`
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await this.tipoequipoService.activarTipoEquipo(idTipoEquipo);
          await this.loadTiposEquipos();
          Swal.fire("Tipo de equipo activo!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Se descarto la activacion del tipo de equipo", "", "info");
        }
      });
    } else if (accion === 'D') {
      Swal.fire({
        title: "Desea desactivar el tipo de equipo?",
        showCancelButton: true,
        confirmButtonText: "Desactivar",
        cancelButtonText: `Cancelar`
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await this.tipoequipoService.desactivarTipoEquipo(idTipoEquipo);
            await this.loadTiposEquipos();
            Swal.fire("Tipo de equipo Inactivo!", "", "success");
          } catch {
            Swal.fire("El tipo de quipo tiene equipos activos relacionados", "", "error");
          }
        } else if (result.isDenied) {
          Swal.fire("Se descarto la activacion del tipo de equipo", "", "info");
        }
      });
    }
  }

  async toggleProtocolStatus(protocolo: any) {
    const action = protocolo.estado ? 'desactivar' : 'activar';
    const newStatus = !protocolo.estado;

    try {
      await this.protocolosServices.updateProtocolo(protocolo.id, { estado: newStatus });
      // Refresh the list
      this.protocoloTipoEquipo = await this.protocolosServices.getProtocoloTipoEquipo(this.tipoEquipoSelected.id);

      const toastMsg = newStatus ? 'Protocolo habilitado' : 'Protocolo deshabilitado';
      const toastIcon = newStatus ? 'success' : 'info'; // SweetAlert icons

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: toastIcon,
        title: toastMsg
      });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", `No se pudo ${action} el protocolo`, "error");
    }
  }

  async addProtocolo() {
    if (!this.newProtocoloPaso.trim()) {
      Swal.fire("Atención", "Escribe la descripción del paso", "warning");
      return;
    }

    const newProto = {
      paso: this.newProtocoloPaso,
      estado: true,
      tipoEquipoIdFk: this.tipoEquipoSelected.id
    };

    try {
      await this.protocolosServices.createProtocolo(newProto);
      this.newProtocoloPaso = ''; // Reset input
      // Refresh list
      this.protocoloTipoEquipo = await this.protocolosServices.getProtocoloTipoEquipo(this.tipoEquipoSelected.id);
      Swal.fire({
        icon: 'success',
        title: 'Protocolo agregado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar el protocolo", "error");
    }
  }

  // Mediciones Específicas Logic
  viewMedicionesModal: boolean = false;
  medicionesTipoEquipo: any[] = [];
  newMedicionNombre: string = '';
  newMedicionUnidad: string = '';
  newMedicionValorEstandar: string = '';
  newMedicionCriterioAceptacion: string = '';

  async viewMediciones(tipoEquipo: any) {
    try {
      this.tipoEquipoSelected = tipoEquipo;
      this.medicionesTipoEquipo = await this.tipoequipoService.getMediciones(this.tipoEquipoSelected.id);
      this.viewMedicionesModal = true;
    } catch (error) {
      console.error('Error opening mediciones modal:', error);
      Swal.fire("Error", "No se pudieron cargar las mediciones", "error");
    }
  }

  async addMedicion() {
    if (!this.newMedicionNombre.trim() || !this.newMedicionUnidad.trim()) {
      Swal.fire("Atención", "Nombre y Unidad son requeridos", "warning");
      return;
    }

    const newMed = {
      nombre: this.newMedicionNombre,
      unidad: this.newMedicionUnidad,
      valorEstandar: this.newMedicionValorEstandar,
      criterioAceptacion: this.newMedicionCriterioAceptacion,
      tipoEquipoIdFk: this.tipoEquipoSelected.id
    };

    try {
      await this.tipoequipoService.createMedicion(newMed);
      this.newMedicionNombre = '';
      this.newMedicionUnidad = '';
      this.newMedicionValorEstandar = '';
      this.newMedicionCriterioAceptacion = '';
      this.medicionesTipoEquipo = await this.tipoequipoService.getMediciones(this.tipoEquipoSelected.id);

      Swal.fire({
        icon: 'success',
        title: 'Medición agregada',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo agregar la medición", "error");
    }
  }

  async toggleMedicionEstado(medicion: any) {
    const newStatus = !medicion.estado;
    const action = newStatus ? 'activar' : 'desactivar';

    try {
      await this.tipoequipoService.updateMedicion(medicion.id, { estado: newStatus });
      this.medicionesTipoEquipo = await this.tipoequipoService.getMediciones(this.tipoEquipoSelected.id);

      Swal.fire({
        icon: 'success',
        title: `Medición ${newStatus ? 'activada' : 'desactivada'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", `No se pudo ${action} la medición`, "error");
    }
  }

  async deleteMedicion(idMedicion: any) {
    this.viewMedicionesModal = false; // Hide modal temporarily
    Swal.fire({
      title: "¿Eliminar medición?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      this.viewMedicionesModal = true; // Re-open modal
      if (result.isConfirmed) {
        try {
          await this.tipoequipoService.deleteMedicion(idMedicion);
          this.medicionesTipoEquipo = await this.tipoequipoService.getMediciones(this.tipoEquipoSelected.id);
          Swal.fire("Eliminado", "", "success");
        } catch (error) {
          Swal.fire("Error", "No se pudo eliminar", "error");
        }
      }
    });

  }

  // --- Condiciones Iniciales Logic (Global) ---
  viewCondicionesInicialesModal: boolean = false;
  condicionesIniciales: any[] = [];
  newCondicionDescripcion: string = '';

  async openCondicionesInicialesModal() {
    try {
      const allConditions = await this.condicionInicialService.getAll();
      if (Array.isArray(allConditions)) {
        this.condicionesIniciales = allConditions;
      } else {
        console.error('API did not return an array in open:', allConditions);
        this.condicionesIniciales = [];
      }
      this.viewCondicionesInicialesModal = true;
    } catch (error) {
      console.error(error);
      this.condicionesIniciales = [];
      Swal.fire("Error", "No se pudieron cargar las condiciones iniciales", "error");
    }
  }

  async addCondicionInicial() {
    if (!this.newCondicionDescripcion.trim()) {
      Swal.fire("Atención", "Escribe la descripción de la condición", "warning");
      return;
    }
    try {

      const created = await this.condicionInicialService.create({ descripcion: this.newCondicionDescripcion });


      this.newCondicionDescripcion = '';

      const allConditions = await this.condicionInicialService.getAll();


      if (Array.isArray(allConditions)) {
        this.condicionesIniciales = [...allConditions];
      } else {
        console.error('API did not return an array:', allConditions);
        this.condicionesIniciales = [];
      }

      this.cd.detectChanges(); // Force update

      Swal.fire({
        icon: 'success',
        title: 'Condición agregada',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error adding condition:', error);
      Swal.fire("Error", "No se pudo agregar", "error");
    }
  }

  async toggleCondicionInicialEstado(cond: any) {
    const newStatus = !cond.activo;
    try {
      await this.condicionInicialService.update(cond.id, { activo: newStatus });
      const allConditions = await this.condicionInicialService.getAll();

      if (Array.isArray(allConditions)) {
        this.condicionesIniciales = allConditions;
      } else {
        console.error('API did not return an array in toggle:', allConditions);
        this.condicionesIniciales = [];
      }
      this.cd.detectChanges(); // Ensure table updates
      Swal.fire({
        icon: 'success',
        title: `Condición ${newStatus ? 'activada' : 'desactivada'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  }

}
