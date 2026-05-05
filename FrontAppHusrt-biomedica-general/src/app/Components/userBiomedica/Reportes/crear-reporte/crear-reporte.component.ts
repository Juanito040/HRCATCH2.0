import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { getDecodedAccessToken } from '../../../../utilidades';
import { ProtocolosService } from '../../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { UserService } from '../../../../Services/appServices/userServices/user.service';
import { ReportesService } from '../../../../Services/appServices/biomedicaServices/reportes/reportes.service';
import { TipoEquipoService } from '../../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { CondicionInicialService } from '../../../../Services/appServices/biomedicaServices/condicionesIniciales/condicion-inicial.service';
import { DraftService } from '../../../../Services/appServices/draft.service';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
  selector: 'app-crear-reporte',
  standalone: true,
  imports: [DatePickerModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, CardModule, CalendarModule, InputMaskModule, CommonModule, CheckboxModule, ReactiveFormsModule, FormsModule, TableModule, UppercaseDirective],
  templateUrl: './crear-reporte.component.html',
  styleUrl: './crear-reporte.component.css'
})
export class CrearReporteComponent implements OnInit {

  reporte!: any;
  equipo!: any;
  protocolos!: any[];
  cumplimientoProtocolo: any[] = [];
  nombreUsuario!: any;
  selectProtocolos: any[] = [];
  reporteForm!: FormGroup;
  equiposervices = inject(EquiposService);
  protocoloservices = inject(ProtocolosService);
  userServices = inject(UserService);
  reprteServices = inject(ReportesService);
  tipoEquipoService = inject(TipoEquipoService);
  condicionInicialService = inject(CondicionInicialService);
  router = inject(Router);
  draftService = inject(DraftService);
  tipoMantenimiento = '';

  // Specific Measurements
  medicionesPreventivo: any[] = [];

  tiposMantenimiento = [
    { label: 'Correctivo', value: 'Correctivo' },
    { label: 'Preventivo', value: 'Preventivo' },
    { label: 'Predictivo', value: 'Predictivo' },
    { label: 'Otro', value: 'Otro' },
  ];

  tiposFalla = [
    'Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios',
    'Desconocido', 'Sin Falla', 'Otros', 'No Registra'
  ].map(v => ({ label: v, value: v }));

  estadosOperativos = [
    'Operativo sin restricciones', 'Operativo con restricciones', 'Fuera de servicio'
  ].map(v => ({ label: v, value: v }));

  id!: number;

  opcionesCumplimiento = [
    { label: 'Cumple', value: 'CUMPLE' },
    { label: 'No Cumple', value: 'NO_CUMPLE' },
    { label: 'No Aplica', value: 'NO_APLICA' }
  ];

  equiposPatron: any[] = [];
  selectedPatron: any = null;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private location: Location) {
    this.validarTipoMantenimiento();
    this.reporteForm = this.fb.group({
      fechaRealizado: [null, Validators.required],
      horaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      horaTerminacion: [null, Validators.required],
      horaTotal: [{ value: null, disabled: true }],
      tipoMantenimiento: [this.tipoMantenimiento, Validators.required],
      tipoFalla: [null, Validators.required],
      estadoOperativo: [null, Validators.required],
      motivo: ['', Validators.required],
      trabajoRealizado: ['', Validators.required],
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      nombreRecibio: ['', Validators.required],
      cedulaRecibio: ['', Validators.required],
      observaciones: ['', Validators.required],
      equipoPatronIdFk: [null], // Renamed field
      cumplimientoProtocolo: this.fb.array([]),
      valoresMediciones: this.fb.array([]),
      repuestos: this.fb.array([]),
      condicionesIniciales: this.fb.array([])
    });

    this.reporteForm.valueChanges.subscribe(() => {
      this.calcularHoras();
    });

    if (this.tipoMantenimiento === 'Preventivo') {
      this.reporteForm.get('tipoFalla')?.setValue('Sin Falla');
      this.reporteForm.get('tipoFalla')?.disable();
      this.reporteForm.get('motivo')?.setValue('Programado para mantenimiento preventivo');
      this.reporteForm.get('motivo')?.disable();
    }

    this.reporteForm.get('tipoMantenimiento')?.disable();

    const token = getDecodedAccessToken();

    if (token && (token.rol === 'SUPERADMIN' || token.rol === 'BIOMEDICAADMIN' || token.rol === 'BIOMEDICAUSER')) {

      this.reporteForm.get('tipoMantenimiento')?.enable();
    }
  }

  calcularHoras() {
    const fechaInicio = this.reporteForm.get('fechaRealizado')?.value;
    const horaInicio = this.reporteForm.get('horaInicio')?.value;
    const fechaFin = this.reporteForm.get('fechaFin')?.value;
    const horaFin = this.reporteForm.get('horaTerminacion')?.value;

    if (fechaInicio && horaInicio && fechaFin && horaFin) {
      const inicio = new Date(fechaInicio);
      const [horasInicio, minutosInicio] = horaInicio.split(':');
      inicio.setHours(Number(horasInicio), Number(minutosInicio));

      const fin = new Date(fechaFin);
      const [horasFin, minutosFin] = horaFin.split(':');
      fin.setHours(Number(horasFin), Number(minutosFin));

      const diferenciaMs = fin.getTime() - inicio.getTime();

      if (diferenciaMs < 0) {
        this.reporteForm.get('horaTotal')?.setValue('00:00:00', { emitEvent: false });
        return;
      }

      const hours = Math.floor(diferenciaMs / (1000 * 60 * 60));
      const minutes = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diferenciaMs % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      this.reporteForm.get('horaTotal')?.setValue(formattedTime, { emitEvent: false });
    }
  }

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const idReporte = Number(sessionStorage.getItem('idReporte'));
    if (idReporte && idReporte > 0) {
      this.reporte = await this.reprteServices.getPreventivoProgramado(idReporte) || {};
    } else {
      this.reporte = {};
    }
    // Ensure we have compliance data
    if (this.reporte.id) {
      this.reporte.cumplimientoProtocolo = await this.protocoloservices.getCumplimientoProtocoloReporte(this.reporte.id);

      // Fetch full report details to get specific measurements
      try {
        const reportDetails = await this.reprteServices.getReporteById(this.reporte.id);
        if (reportDetails && reportDetails.valoresMediciones) {
          this.reporte.valoresMediciones = reportDetails.valoresMediciones;
        }
        if (reportDetails && reportDetails.repuestos) {
          this.reporte.repuestos = reportDetails.repuestos;
        }
      } catch (error) {
        console.error('Error fetching report details for measurements:', error);
      }
    }
    this.equipo = await this.equiposervices.getEquipoById(this.id);
    this.protocolos = await this.protocoloservices.getProtocoloActivoTipoEquipo(this.equipo.tipoEquipoIdFk);

    this.nombreUsuario = await this.userServices.getNameUSer(getDecodedAccessToken().id);

    // If editing, try to show the original author's name
    if (this.reporte.id && this.reporte.usuario) {
      this.nombreUsuario = this.reporte.usuario;
    }

    // Fetch specific measurements
    if (this.equipo && this.equipo.tipoEquipoIdFk) {
      try {
        const allMediciones = await this.tipoEquipoService.getMediciones(this.equipo.tipoEquipoIdFk);
        this.medicionesPreventivo = allMediciones.filter((m: any) => m.estado !== false);
        this.iniValoresMediciones();
      } catch (error) {
        console.error('Error fetching measurements:', error);
      }
    }

    await this.iniCumplimientoProtocolo();
    this.iniRepuestos();

    // Fetch patron equipments (Type 1316)
    try {
      this.equiposPatron = await this.equiposervices.getEquiposPatron();
    } catch (error) {
      console.error('Error fetching patron equipments:', error);
    }

    // Initialize global initial conditions
    try {
      await this.iniCondicionesIniciales();
    } catch (error) {
      console.error('Error initializing initial conditions:', error);
    }

    if (this.reporte.id && this.reporte.realizado) {
      this.reporteForm.patchValue({
        // Fix: Use 'YYYY-MM-DDT00:00:00' to avoid timezone shifts
        fechaRealizado: this.reporte.fechaRealizado ? new Date(this.reporte.fechaRealizado + 'T00:00:00') : null,
        horaInicio: this.reporte.horaInicio,
        fechaFin: this.reporte.fechaFin ? new Date(this.reporte.fechaFin + 'T00:00:00') : null,
        horaTerminacion: this.reporte.horaTerminacion,
        horaTotal: this.reporte.horaTotal,
        tipoMantenimiento: this.reporte.tipoMantenimiento,
        tipoFalla: this.reporte.tipoFalla,
        motivo: this.reporte.motivo,
        trabajoRealizado: this.reporte.trabajoRealizado,
        calificacion: this.reporte.calificacion,
        nombreRecibio: this.reporte.nombreRecibio,
        cedulaRecibio: this.reporte.cedulaRecibio,
        observaciones: this.reporte.observaciones,
        estadoOperativo: this.reporte.estadoOperativo, // Load stored operative state
        equipoPatronIdFk: this.reporte.equipoPatronIdFk // Patch patron equipment
      });

      // Fix: Ensure tipoMantenimiento is updated from report data
      if (this.reporte.tipoMantenimiento) {
        this.tipoMantenimiento = this.reporte.tipoMantenimiento;
        this.reporteForm.get('tipoMantenimiento')?.enable({ emitEvent: false });
        this.reporteForm.get('tipoMantenimiento')?.patchValue(this.reporte.tipoMantenimiento);
      }

      // PrimeNG Calendar expects Date object.
      // If fetched dates are strings YYYY-MM-DD, new Date() works.

      if (this.reporte.equipoPatronIdFk) {
        this.selectedPatron = this.equiposPatron.find(e => e.id === this.reporte.equipoPatronIdFk);
      }
    }

    // Check for drafts after initial load
    this.checkForDraft();

    // Start auto-saving
    this.reporteForm.valueChanges.subscribe(() => {
      this.saveDraft();
    });
  }

  checkForDraft() {
    const draftKey = `reporte_${this.id}_${this.tipoMantenimiento}`;
    if (this.draftService.hasDraft(draftKey)) {
      Swal.fire({
        title: 'Borrador encontrado',
        text: '¿Deseas recuperar el progreso guardado anteriormente?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, recuperar',
        cancelButtonText: 'No, empezar de cero'
      }).then((result) => {
        if (result.isConfirmed) {
          const draft = this.draftService.getDraft(draftKey);
          if (draft && draft.data) {
            // Restore form values
            this.reporteForm.patchValue(draft.data, { emitEvent: false });
            Swal.fire({
              title: 'Recuperado',
              text: 'Se ha restaurado el borrador con éxito.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.draftService.clearDraft(draftKey);
        }
      });
    }
  }

  saveDraft() {
    const draftKey = `reporte_${this.id}_${this.tipoMantenimiento}`;
    this.draftService.saveDraft(draftKey, this.reporteForm.value);
  }

  onSelectPatron() {
    const id = this.reporteForm.get('equipoPatronIdFk')?.value;
    if (id) {
      this.selectedPatron = this.equiposPatron.find(e => e.id === id);
    } else {
      this.selectedPatron = null;
    }
  }

  iniValoresMediciones() {
    const array = this.reporteForm.get('valoresMediciones') as FormArray;
    array.clear();
    if (this.medicionesPreventivo) {
      this.medicionesPreventivo.forEach(m => {
        // Find existing value in report if editing
        const existingVal = this.reporte.valoresMediciones?.find((v: any) => v.medicion?.id === m.id || v.medicionIdFk === m.id);

        array.push(this.fb.group({
          id: [m.id],
          nombre: [m.nombre],
          unidad: [m.unidad],
          valorEstandar: [m.valorEstandar],
          valor: [existingVal ? existingVal.valor : ''],
          unidadRegistrada: [existingVal ? existingVal.unidadRegistrada : m.unidad],
          criterioAceptacion: [m.criterioAceptacion],
          conforme: [existingVal ? existingVal.conforme : false]
        }));
      });
    }
  }

  get valoresMedicionesFormArray(): FormArray {
    return this.reporteForm.get('valoresMediciones') as FormArray;
  }

  async onSubmit() {
    if (this.reporteForm.valid) {
      // Prepare payload
      let medicionesPayload = [];
      if (this.reporteForm.value.valoresMediciones) {
        medicionesPayload = this.reporteForm.value.valoresMediciones.map((m: any) => ({
          id: m.id,
          valor: m.valor,
          unidadRegistrada: m.unidadRegistrada,
          conforme: m.conforme
        }));
      }

      this.reporte =
      {
        id: this.reporte.id || null,
        añoProgramado: this.reporte.añoProgramado || null,
        mesProgramado: this.reporte.mesProgramado || null,
        fechaRealizado: this.reporteForm.value.fechaRealizado,
        horaInicio: this.reporteForm.value.horaInicio,
        fechaFin: this.reporteForm.value.fechaFin,
        horaTerminacion: this.reporteForm.value.horaTerminacion,
        horaTotal: this.reporteForm.get('horaTotal')?.value || 0,
        tipoMantenimiento: this.tipoMantenimiento,
        tipoFalla: this.tipoMantenimiento == 'Preventivo' ? 'Sin Falla' : this.reporteForm.value.tipoFalla,
        motivo: this.tipoMantenimiento == 'Preventivo' ? 'Programado para mantenimiento preventivo' : this.reporteForm.value.motivo,
        trabajoRealizado: this.reporteForm.value.trabajoRealizado,
        calificacion: this.reporteForm.value.calificacion,
        nombreRecibio: this.reporteForm.value.nombreRecibio,
        cedulaRecibio: this.reporteForm.value.cedulaRecibio,
        observaciones: this.reporteForm.value.observaciones,
        estadoOperativo: this.reporteForm.value.estadoOperativo, // Ensure operative state is saved
        mantenimientoPropio: true,
        realizado: true,
        rutaPdf: null,
        servicioIdFk: this.equipo.servicioIdFk,
        equipoIdFk: this.equipo.id,
        usuarioIdFk: getDecodedAccessToken().id,
        mediciones: medicionesPayload, // Add measurements to payload
        repuestos: this.reporteForm.value.repuestos, // Add accessories to payload
        equipoPatronIdFk: this.reporteForm.value.equipoPatronIdFk, // Add patron equipment
        condicionesIniciales: this.reporteForm.value.condicionesIniciales // Add initial conditions
      }
      if (this.reporte.id) {
        // UPDATE: Use the update method if the report already exists (Corrective or Preventive edit)
        try {
          await this.reprteServices.ActualizarPreventivoProgramado(this.reporte.id, this.reporte);
          await this.guardarCumplimiento(this.reporte.id);
          Swal.fire({
            icon: 'success',
            title: this.tipoMantenimiento === 'Preventivo' ? 'Se actualizó el reporte Preventivo' : 'Se actualizó el reporte Correctivo',
            showConfirmButton: false,
            timer: 1500
          });
          const draftKey = `reporte_${this.id}_${this.tipoMantenimiento}`;
          this.draftService.clearDraft(draftKey);
          this.router.navigate(['/biomedica/reportesequipo/', this.equipo.id]);
        } catch (error) {
          console.error('Error al actualizar el reporte:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar el reporte',
            text: 'Por favor, inténtelo de nuevo más tarde.'
          });
        }
      } else {
        // NEW: Only call creation if there is no ID (usually for new Corrective reports)
        try {
          const res = await this.reprteServices.CrearReporteCorrectivo(this.reporte);
          if (res && res.id) {
            await this.guardarCumplimiento(res.id);
            Swal.fire({
              icon: 'success',
              title: 'Se almacenó el reporte correctamente',
              showConfirmButton: false,
              timer: 1500
            });
            const draftKey = `reporte_${this.id}_${this.tipoMantenimiento}`;
            this.draftService.clearDraft(draftKey);
            this.router.navigate(['/biomedica/reportesequipo/', this.equipo.id]);
          } else {
            throw new Error('No se recibió el ID del reporte creado');
          }
        } catch (error) {
          console.error('Error al crear el reporte:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el reporte',
            text: 'Por favor, inténtelo de nuevo más tarde.'
          });
        }
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Incompleto',
        text: 'Por favor, diligencie todos los campos requeridos antes de guardar.',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  iniCumplimientoProtocolo() {
    const array = this.reporteForm.get('cumplimientoProtocolo') as FormArray;
    array.clear();
    this.protocolos.forEach(p => {
      // Find existing compliance in report if editing
      const existingComp = this.reporte.cumplimientoProtocolo?.find((c: any) => c.protocoloPreventivoIdFk === p.id || c.protocolo?.id === p.id);

      array.push(this.fb.group({
        protocoloPreventivoIdFk: [p.id],
        cumple: [existingComp ? existingComp.cumple : 'CUMPLE'],
        reporteIdFk: [this.reporte.id],
        paso: [p.paso],
        observaciones: [existingComp ? existingComp.observaciones : '']
      }));
    });
  }

  // Initial Conditions (Global)
  activeCondicionesIniciales: any[] = [];

  get condicionesInicialesFormArray(): FormArray {
    return this.reporteForm.get('condicionesIniciales') as FormArray;
  }

  async iniCondicionesIniciales() {
    const array = this.condicionesInicialesFormArray;
    array.clear();

    // Fetch active conditions
    this.activeCondicionesIniciales = await this.condicionInicialService.getActive();

    // Determine existing values if any
    const existing = this.reporte && this.reporte.cumplimientoCondicionesIniciales ? this.reporte.cumplimientoCondicionesIniciales : [];

    this.activeCondicionesIniciales.forEach(cond => {
      const match = existing.find((e: any) => e.condicionInicialIdFk === cond.id || e.condicion?.id === cond.id || (e.condicionInicial && e.condicionInicial.id === cond.id));

      array.push(this.fb.group({
        id: [cond.id], // Definition ID
        descripcion: [cond.descripcion], // For display
        cumple: [match ? match.cumple : 'CUMPLE', Validators.required],
        observacion: [match ? match.observacion : '']
      }));
    });
  }

  async guardarCumplimiento(reporteId: any) {
    const promises = this.reporteForm.value.cumplimientoProtocolo.map((protocolo: any) => {
      const cp = {
        protocoloPreventivoIdFk: protocolo.protocoloPreventivoIdFk,
        cumple: protocolo.cumple,
        reporteIdFk: reporteId,
        observaciones: protocolo.observaciones
      };
      return this.protocoloservices.addCumplimientoProtocolo(cp);
    });
    await Promise.all(promises);
  }

  get cumplimientoProtocoloFormArray(): FormArray {
    return this.reporteForm.get('cumplimientoProtocolo') as FormArray;
  }

  testViewCumplimiento() {
    const idReporte = Number(sessionStorage.getItem('idReporte'));
    if (idReporte && idReporte > 0) {
      this.guardarCumplimiento(idReporte);
    }
  }

  // Accessor for repuestos FormArray
  get repuestosFormArray(): FormArray {
    return this.reporteForm.get('repuestos') as FormArray;
  }

  // Add new accessory
  agregarRepuesto() {
    const repuestoGroup = this.fb.group({
      id: [null], // For editing
      nombreInsumo: [''],
      cantidad: [''],
      comprobanteEgreso: ['']
    });
    this.repuestosFormArray.push(repuestoGroup);
  }

  // Remove accessory
  eliminarRepuesto(index: number) {
    this.repuestosFormArray.removeAt(index);
  }

  // Initialize repuestos from report data
  iniRepuestos() {
    const array = this.reporteForm.get('repuestos') as FormArray;
    array.clear();
    if (this.reporte.repuestos && this.reporte.repuestos.length > 0) {
      this.reporte.repuestos.forEach((r: any) => {
        array.push(this.fb.group({
          id: [r.id],
          nombreInsumo: [r.nombreInsumo],
          cantidad: [r.cantidad],
          comprobanteEgreso: [r.comprobanteEgreso]
        }));
      });
    }
  }


  goBack(): void {
    Swal.fire({
      title: "¿Quieres guardar los cambios?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: `No guardar`,
      cancelButtonText: "Cancelar",
      icon: "question"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Reporte Guardado!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Los cambios no se guardan", "", "info");
        this.location.back();
      }
    });
  }

  validarPreventivo(): boolean {
    return this.reporteForm.value.tipoMantenimiento === 'Preventivo' ? true : false;
  }

  validarQR() {
    this.router.navigate(['/biomedica/validarqr']);
  }

  validarTipoMantenimiento() {
    if (sessionStorage.getItem('TipoMantenimiento') === 'C') {
      this.tipoMantenimiento = 'Correctivo';
    } else if (sessionStorage.getItem('TipoMantenimiento') === 'P') {
      this.tipoMantenimiento = 'Preventivo';
    }
  }

  convertirMayusculas(texto: string): string {
    return texto ? texto.toUpperCase() : '';
  }

}
