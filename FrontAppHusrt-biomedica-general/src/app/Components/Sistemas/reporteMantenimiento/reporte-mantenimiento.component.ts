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
import { getDecodedAccessToken } from '../../../../app/utilidades';
import { ProtocolosService } from '../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { SysmantenimientoService } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
/* import { CondicionInicialService } from '../../../../Services/appServices/biomedicaServices/condicionesIniciales/condicion-inicial.service'; */
import { DraftService } from '../../../Services/appServices/draft.service';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
  selector: 'app-reporte-mantenimiento',
  standalone: true,
  imports: [DatePickerModule, SelectModule, TextareaModule, InputTextModule, ButtonModule, CardModule, CalendarModule, InputMaskModule, CommonModule, CheckboxModule, ReactiveFormsModule, FormsModule, TableModule, UppercaseDirective],
  templateUrl: './reporte-mantenimiento.component.html',
  styleUrl: './reporte-mantenimiento.component.css'
})
export class CrearMantenimientoComponent implements OnInit {

  mantenimiento!: any;
  equipo!: any;
  protocolos!: any[];
  cumplimientoProtocolo: any[] = [];
  nombreUsuario!: any;
  selectProtocolos: any[] = [];
  mantenimientoForm!: FormGroup;
  sysequiposervices = inject(SysequiposService);
  protocoloservices = inject(ProtocolosService);
  userServices = inject(UserService);
  mantenimientoServices = inject(SysmantenimientoService);
  tipoEquipoService = inject(TipoEquipoService);
  /* condicionInicialService = inject(CondicionInicialService); */
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
    this.mantenimientoForm = this.fb.group({
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

    this.mantenimientoForm.valueChanges.subscribe(() => {
      this.calcularHoras();
    });

    if (this.tipoMantenimiento === 'Preventivo') {
      this.mantenimientoForm.get('tipoFalla')?.setValue('Sin Falla');
      this.mantenimientoForm.get('tipoFalla')?.disable();
      this.mantenimientoForm.get('motivo')?.setValue('Programado para mantenimiento preventivo');
      this.mantenimientoForm.get('motivo')?.disable();
    }

    this.mantenimientoForm.get('tipoMantenimiento')?.disable();

    const token = getDecodedAccessToken();

    if (token && (token.rol === 'SUPERADMIN' || token.rol === 'BIOMEDICAADMIN' || token.rol === 'BIOMEDICAUSER')) {

      this.mantenimientoForm.get('tipoMantenimiento')?.enable();
    }
  }

  calcularHoras() {
    const fechaInicio = this.mantenimientoForm.get('fechaRealizado')?.value;
    const horaInicio = this.mantenimientoForm.get('horaInicio')?.value;
    const fechaFin = this.mantenimientoForm.get('fechaFin')?.value;
    const horaFin = this.mantenimientoForm.get('horaTerminacion')?.value;

    if (fechaInicio && horaInicio && fechaFin && horaFin) {
      const inicio = new Date(fechaInicio);
      const [horasInicio, minutosInicio] = horaInicio.split(':');
      inicio.setHours(Number(horasInicio), Number(minutosInicio));

      const fin = new Date(fechaFin);
      const [horasFin, minutosFin] = horaFin.split(':');
      fin.setHours(Number(horasFin), Number(minutosFin));

      const diferenciaMs = fin.getTime() - inicio.getTime();

      if (diferenciaMs < 0) {
        this.mantenimientoForm.get('horaTotal')?.setValue('00:00:00', { emitEvent: false });
        return;
      }

      const hours = Math.floor(diferenciaMs / (1000 * 60 * 60));
      const minutes = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diferenciaMs % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      this.mantenimientoForm.get('horaTotal')?.setValue(formattedTime, { emitEvent: false });
    }
  }

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const idMantenimiento = Number(sessionStorage.getItem('idMantenimiento'));
    if (idMantenimiento && idMantenimiento > 0) {
      this.mantenimiento = await this.mantenimientoServices.getById(idMantenimiento) || {};
    } else {
      this.mantenimiento = {};
    }
    // Ensure we have compliance data
    if (this.mantenimiento.id) {
      this.mantenimiento.cumplimientoProtocolo = await this.protocoloservices.getCumplimientoProtocoloMantenimiento(this.mantenimiento.id);

      // Fetch full report details to get specific measurements
      try {
        const reportDetails = await this.mantenimientoServices.getById(this.mantenimiento.id);
        if (reportDetails && reportDetails.valoresMediciones) {
          this.mantenimiento.valoresMediciones = reportDetails.valoresMediciones;
        }
        if (reportDetails && reportDetails.repuestos) {
          this.mantenimiento.repuestos = reportDetails.repuestos;
        }
      } catch (error) {
        console.error('Error fetching report details for measurements:', error);
      }
    }
    const equipoRes = await this.sysequiposervices.getEquipoById(this.id);
    // El servicio de sistemas devuelve { success, data } — extraemos .data
    this.equipo = equipoRes?.data ?? equipoRes;
    this.protocolos = await this.protocoloservices.getProtocoloActivoTipoEquipo(this.equipo.tipoEquipo?.id);
    

    this.nombreUsuario = await this.userServices.getNameUSer(getDecodedAccessToken().id);

    // If editing, try to show the original author's name
    if (this.mantenimiento.id && this.mantenimiento.usuario) {
      this.nombreUsuario = this.mantenimiento.usuario;
    }

    // Fetch specific measurements
    if (this.equipo && (this.equipo.id_tipo_equipo_fk || this.equipo.tipoEquipoIdFk)) {
      try {
        const allMediciones = await this.tipoEquipoService.getMediciones(this.equipo.tipoEquipo?.id ?? this.equipo.id_tipo_equipo_fk);
        this.medicionesPreventivo = allMediciones.filter((m: any) => m.estado !== false);
        this.iniValoresMediciones();
      } catch (error) {
        console.error('Error fetching measurements:', error);
      }
    }

    await this.iniCumplimientoProtocolo();
    this.iniRepuestos();

    /* // Fetch patron equipments (Type 1316)
    try {
      this.equiposPatron = await this.sysequiposervices.getEquiposPatron();
    } catch (error) {
      console.error('Error fetching patron equipments:', error);
    } */

    // Initialize global initial conditions
    /* try {
      await this.iniCondicionesIniciales();
    } catch (error) {
      console.error('Error initializing initial conditions:', error);
    }
 */
    if (this.mantenimiento.id && this.mantenimiento.realizado) {
      this.mantenimientoForm.patchValue({
        // Fix: Use 'YYYY-MM-DDT00:00:00' to avoid timezone shifts
        fechaRealizado: this.mantenimiento.fechaRealizado ? new Date(this.mantenimiento.fechaRealizado + 'T00:00:00') : null,
        horaInicio: this.mantenimiento.horaInicio,
        fechaFin: this.mantenimiento.fechaFin ? new Date(this.mantenimiento.fechaFin + 'T00:00:00') : null,
        horaTerminacion: this.mantenimiento.horaTerminacion,
        horaTotal: this.mantenimiento.horaTotal,
        tipoMantenimiento: this.mantenimiento.tipoMantenimiento,
        tipoFalla: this.mantenimiento.tipoFalla,
        motivo: this.mantenimiento.motivo,
        trabajoRealizado: this.mantenimiento.trabajoRealizado,
        calificacion: this.mantenimiento.calificacion,
        nombreRecibio: this.mantenimiento.nombreRecibio,
        cedulaRecibio: this.mantenimiento.cedulaRecibio,
        observaciones: this.mantenimiento.observaciones,
        estadoOperativo: this.mantenimiento.estadoOperativo, // Load stored operative state
        equipoPatronIdFk: this.mantenimiento.equipoPatronIdFk // Patch patron equipment
      });

      // Fix: Ensure tipoMantenimiento is updated from report data
      if (this.mantenimiento.tipoMantenimiento) {
        this.tipoMantenimiento = this.mantenimiento.tipoMantenimiento;
        this.mantenimientoForm.get('tipoMantenimiento')?.enable({ emitEvent: false });
        this.mantenimientoForm.get('tipoMantenimiento')?.patchValue(this.mantenimiento.tipoMantenimiento);
      }

      // PrimeNG Calendar expects Date object.
      // If fetched dates are strings YYYY-MM-DD, new Date() works.

      if (this.mantenimiento.equipoPatronIdFk) {
        this.selectedPatron = this.equiposPatron.find(e => e.id === this.mantenimiento.equipoPatronIdFk);
      }
    }

    // Check for drafts after initial load
    this.checkForDraft();

    // Start auto-saving
    this.mantenimientoForm.valueChanges.subscribe(() => {
      this.saveDraft();
    });
  }

  checkForDraft() {
    const draftKey = `mantenimiento_${this.id}_${this.tipoMantenimiento}`;
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
            this.mantenimientoForm.patchValue(draft.data, { emitEvent: false });
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
    const draftKey = `mantenimiento_${this.id}_${this.tipoMantenimiento}`;
    this.draftService.saveDraft(draftKey, this.mantenimientoForm.value);
  }

  onSelectPatron() {
    const id = this.mantenimientoForm.get('equipoPatronIdFk')?.value;
    if (id) {
      this.selectedPatron = this.equiposPatron.find(e => e.id === id);
    } else {
      this.selectedPatron = null;
    }
  }

  iniValoresMediciones() {
    const array = this.mantenimientoForm.get('valoresMediciones') as FormArray;
    array.clear();
    if (this.medicionesPreventivo) {
      this.medicionesPreventivo.forEach(m => {
        // Find existing value in report if editing
        const existingVal = this.mantenimiento.valoresMediciones?.find((v: any) => v.medicion?.id === m.id || v.medicionIdFk === m.id);

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
    return this.mantenimientoForm.get('valoresMediciones') as FormArray;
  }

  async onSubmit() {
    if (this.mantenimientoForm.valid) {
      // Prepare payload
      let medicionesPayload = [];
      if (this.mantenimientoForm.value.valoresMediciones) {
        medicionesPayload = this.mantenimientoForm.value.valoresMediciones.map((m: any) => ({
          id: m.id,
          valor: m.valor,
          unidadRegistrada: m.unidadRegistrada,
          conforme: m.conforme
        }));
      }

      this.mantenimiento =
      {
        id: this.mantenimiento.id || null,
        añoProgramado: this.mantenimiento.añoProgramado || null,
        mesProgramado: this.mantenimiento.mesProgramado || null,
        fechaRealizado: this.mantenimientoForm.value.fechaRealizado,
        horaInicio: this.mantenimientoForm.value.horaInicio,
        fechaFin: this.mantenimientoForm.value.fechaFin,
        horaTerminacion: this.mantenimientoForm.value.horaTerminacion,
        horaTotal: this.mantenimientoForm.get('horaTotal')?.value || 0,
        tipoMantenimiento: this.tipoMantenimiento,
        tipoFalla: this.tipoMantenimiento == 'Preventivo' ? 'Sin Falla' : this.mantenimientoForm.value.tipoFalla,
        motivo: this.tipoMantenimiento == 'Preventivo' ? 'Programado para mantenimiento preventivo' : this.mantenimientoForm.value.motivo,
        trabajoRealizado: this.mantenimientoForm.value.trabajoRealizado,
        calificacion: this.mantenimientoForm.value.calificacion,
        nombreRecibio: this.mantenimientoForm.value.nombreRecibio,
        cedulaRecibio: this.mantenimientoForm.value.cedulaRecibio,
        observaciones: this.mantenimientoForm.value.observaciones,
        estadoOperativo: this.mantenimientoForm.value.estadoOperativo, // Ensure operative state is saved
        mantenimientoPropio: true,
        realizado: true,
        rutaPdf: null,
        servicioIdFk: this.equipo.servicioIdFk,
        equipoIdFk: this.equipo.id,
        usuarioIdFk: getDecodedAccessToken().id,
        mediciones: medicionesPayload, // Add measurements to payload
        repuestos: this.mantenimientoForm.value.repuestos, // Add accessories to payload
        equipoPatronIdFk: this.mantenimientoForm.value.equipoPatronIdFk, // Add patron equipment
        condicionesIniciales: this.mantenimientoForm.value.condicionesIniciales // Add initial conditions
      }
      if (this.mantenimiento.id) {
        // UPDATE: Use the update method if the report already exists (Corrective or Preventive edit)
        try {
          await this.mantenimientoServices.update(this.mantenimiento.id, this.mantenimiento);
          await this.guardarCumplimiento(this.mantenimiento.id);
          Swal.fire({
            icon: 'success',
            title: this.tipoMantenimiento === 'Preventivo' ? 'Se actualizó el mantenimiento Preventivo' : 'Se actualizó el mantenimiento Correctivo',
            showConfirmButton: false,
            timer: 1500
          });
          const draftKey = `mantenimiento_${this.id}_${this.tipoMantenimiento}`;
          this.draftService.clearDraft(draftKey);
          this.router.navigate(['/biomedica/mantenimientosequipo/', this.equipo.id]);
        } catch (error) {
          console.error('Error al actualizar el mantenimiento:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar el mantenimiento',
            text: 'Por favor, inténtelo de nuevo más tarde.'
          });
        }
      } else {
        // NEW: Only call creation if there is no ID (usually for new Corrective reports)
        /* try {
          const res = await this.mantenimientoServices.CrearMantenimientoCorrectivo(this.mantenimiento);
          if (res && res.id) {
            await this.guardarCumplimiento(res.id);
            Swal.fire({
              icon: 'success',
              title: 'Se almacenó el mantenimiento correctamente',
              showConfirmButton: false,
              timer: 1500
            });
            const draftKey = `mantenimiento_${this.id}_${this.tipoMantenimiento}`;
            this.draftService.clearDraft(draftKey);
            this.router.navigate(['/biomedica/mantenimientosequipo/', this.equipo.id]);
          } else {
            throw new Error('No se recibió el ID del mantenimiento creado');
          }
        } catch (error) {
          console.error('Error al crear el mantenimiento:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el mantenimiento',
            text: 'Por favor, inténtelo de nuevo más tarde.'
          });
        } */
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
    const array = this.mantenimientoForm.get('cumplimientoProtocolo') as FormArray;
    array.clear();
    this.protocolos.forEach(p => {
      // Find existing compliance in report if editing
      const existingComp = this.mantenimiento.cumplimientoProtocolo?.find((c: any) => c.protocoloPreventivoIdFk === p.id || c.protocolo?.id === p.id);

      array.push(this.fb.group({
        protocoloPreventivoIdFk: [p.id],
        cumple: [existingComp ? existingComp.cumple : 'CUMPLE'],
        mantenimientoIdFk: [this.mantenimiento.id],
        paso: [p.paso],
        observaciones: [existingComp ? existingComp.observaciones : '']
      }));
    });
  }

  // Initial Conditions (Global)
  activeCondicionesIniciales: any[] = [];

  get condicionesInicialesFormArray(): FormArray {
    return this.mantenimientoForm.get('condicionesIniciales') as FormArray;
  }

/*   async iniCondicionesIniciales() {
    const array = this.condicionesInicialesFormArray;
    array.clear();

    // Fetch active conditions
    this.activeCondicionesIniciales = await this.condicionInicialService.getActive();

    // Determine existing values if any
    const existing = this.mantenimiento && this.mantenimiento.cumplimientoCondicionesIniciales ? this.mantenimiento.cumplimientoCondicionesIniciales : [];

    this.activeCondicionesIniciales.forEach(cond => {
      const match = existing.find((e: any) => e.condicionInicialIdFk === cond.id || e.condicion?.id === cond.id || (e.condicionInicial && e.condicionInicial.id === cond.id));

      array.push(this.fb.group({
        id: [cond.id], // Definition ID
        descripcion: [cond.descripcion], // For display
        cumple: [match ? match.cumple : 'CUMPLE', Validators.required],
        observacion: [match ? match.observacion : '']
      }));
    });
  } */

  async guardarCumplimiento(mantenimientoId: any) {
    const promises = this.mantenimientoForm.value.cumplimientoProtocolo.map((protocolo: any) => {
      const cp = {
        protocoloPreventivoIdFk: protocolo.protocoloPreventivoIdFk,
        cumple: protocolo.cumple,
        mantenimientoIdFk: mantenimientoId,
        observaciones: protocolo.observaciones
      };
      return this.protocoloservices.addCumplimientoProtocolo(cp);
    });
    await Promise.all(promises);
  }

  get cumplimientoProtocoloFormArray(): FormArray {
    return this.mantenimientoForm.get('cumplimientoProtocolo') as FormArray;
  }

  testViewCumplimiento() {
    const idMantenimiento = Number(sessionStorage.getItem('idMantenimiento'));
    if (idMantenimiento && idMantenimiento > 0) {
      this.guardarCumplimiento(idMantenimiento);
    }
  }

  // Accessor for repuestos FormArray
  get repuestosFormArray(): FormArray {
    return this.mantenimientoForm.get('repuestos') as FormArray;
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
    const array = this.mantenimientoForm.get('repuestos') as FormArray;
    array.clear();
    if (this.mantenimiento.repuestos && this.mantenimiento.repuestos.length > 0) {
      this.mantenimiento.repuestos.forEach((r: any) => {
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
        Swal.fire("Mantenimiento Guardado!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Los cambios no se guardan", "", "info");
        this.location.back();
      }
    });
  }

  validarPreventivo(): boolean {
    return this.mantenimientoForm.value.tipoMantenimiento === 'Preventivo' ? true : false;
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