import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
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
import { extractError } from '../../../utils/error-utils';
import { getDecodedAccessToken } from '../../../../app/utilidades';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { SysmantenimientoService } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { UppercaseDirective } from '../../../Directives/uppercase.directive';
import { SysprotocoloService } from '../../../Services/appServices/sistemasServices/sysprotocolo/sysprotocolo.service';
import { SysTipoRepuestosService, SysTipoRepuesto } from '../../../Services/appServices/sistemasServices/systiporepuestos/systiporepuestos.service';
import { SysRepuestosService, SysRepuesto } from '../../../Services/appServices/sistemasServices/sysrepuestos/sysrepuestos.service';

@Component({
  selector: 'app-reporte-mantenimiento',
  standalone: true,
  imports: [
    DatePickerModule, SelectModule, TextareaModule, InputTextModule, ButtonModule,
    CardModule, CalendarModule, InputMaskModule, CommonModule, CheckboxModule,
    ReactiveFormsModule, FormsModule, TableModule, UppercaseDirective
  ],
  templateUrl: './reporte-mantenimiento.component.html',
  styleUrl: './reporte-mantenimiento.component.css'
})
export class CrearMantenimientoComponent implements OnInit {

  // ─── Propiedades ────────────────────────────────────────────────────────────
  mantenimiento!: any;
  equipo!: any;
  protocolos!: any[];
  cumplimientoProtocolo: any[] = [];
  nombreUsuario!: any;
  mantenimientoForm!: FormGroup;
  tipoMantenimiento = '';
  medicionesPreventivo: any[] = [];
  equiposPatron: any[] = [];
  selectedPatron: any = null;
  id!: number;
  tiposRepuesto: { label: string; value: number }[] = [];
  repuestosPorTipo: Map<number, { label: string; value: number }[]> = new Map();

  // ─── Servicios ──────────────────────────────────────────────────────────────
  private platformId = inject(PLATFORM_ID);
  sysequiposervices = inject(SysequiposService);
  sysprotocoloservices = inject(SysprotocoloService);
  userServices = inject(UserService);
  mantenimientoServices = inject(SysmantenimientoService);
  tipoEquipoService = inject(TipoEquipoService);
  tipoRepuestosService = inject(SysTipoRepuestosService);
  sysRepuestosService = inject(SysRepuestosService);
  router = inject(Router);

  // ─── Opciones de formulario ──────────────────────────────────────────────────
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

  opcionesCumplimiento = [
    { label: 'Cumple', value: 'CUMPLE' },
    { label: 'No Cumple', value: 'NO_CUMPLE' },
    { label: 'No Aplica', value: 'NO_APLICA' }
  ];

  // ─── Constructor ─────────────────────────────────────────────────────────────
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private location: Location) {
    this.mantenimientoForm = this.fb.group({
      fechaRealizado: [null, Validators.required],
      horaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      horaTerminacion: [null, Validators.required],
      horaTotal: [{ value: null, disabled: true }],
      tipoMantenimiento: ['', Validators.required],
      tipoFalla: [null, Validators.required],
      estadoOperativo: [null, Validators.required],
      motivo: ['', Validators.required],
      trabajoRealizado: ['', Validators.required],
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      nombreRecibio: ['', Validators.required],
      cedulaRecibio: ['', Validators.required],
      observaciones: ['', Validators.required],
      equipoPatronIdFk: [null],
      cumplimientoProtocolo: this.fb.array([]),
      valoresMediciones: this.fb.array([]),
      repuestos: this.fb.array([]),
      condicionesIniciales: this.fb.array([])
    });

    // Escucha cambios en tipoMantenimiento para ajustar campos
    this.mantenimientoForm.get('tipoMantenimiento')?.valueChanges.subscribe((val) => {
      if (val === 'Preventivo') {
        this.mantenimientoForm.get('tipoFalla')?.setValue('Sin Falla');
        this.mantenimientoForm.get('tipoFalla')?.disable();
        this.mantenimientoForm.get('motivo')?.setValue('Programado para mantenimiento preventivo');
        this.mantenimientoForm.get('motivo')?.disable();
      } else {
        this.mantenimientoForm.get('tipoFalla')?.enable();
        this.mantenimientoForm.get('motivo')?.enable();
        if (this.mantenimientoForm.get('tipoFalla')?.value === 'Sin Falla') {
          this.mantenimientoForm.get('tipoFalla')?.setValue(null);
        }
        if (this.mantenimientoForm.get('motivo')?.value === 'Programado para mantenimiento preventivo') {
          this.mantenimientoForm.get('motivo')?.setValue('');
        }
      }
    });

    // Calcula horas automáticamente al cambiar cualquier campo
    this.mantenimientoForm.valueChanges.subscribe(() => {
      this.calcularHoras();
    });

    // Por defecto el tipo de mantenimiento está bloqueado
    this.mantenimientoForm.get('tipoMantenimiento')?.disable();

    // Solo admins pueden cambiar el tipo
    const token = getDecodedAccessToken();
    if (token && (token.rol === 'SUPERADMIN' || token.rol === 'BIOMEDICAADMIN' || token.rol === 'BIOMEDICAUSER' || token.rol === 'SISTEMASADMIN' || token.rol === 'SISTEMASUSER')) {
      this.mantenimientoForm.get('tipoMantenimiento')?.enable();
    }
  }

  // ─── Ciclo de vida ───────────────────────────────────────────────────────────
  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const idMantenimiento = Number(localStorage.getItem('idMantenimiento'));

    await this.loadInitialData(idMantenimiento);
    await this.loadBaseData();

    // Para reportes nuevos, inicializa el tipo desde localStorage
    if (!this.mantenimiento.realizado) {
      // Si el registro ya tiene tipoMantenimiento (programado), usarlo
      // Si no, leerlo del localStorage (correctivo nuevo)
      if (!this.mantenimiento.tipoMantenimiento) {
        this.validarTipoMantenimiento();
        if (this.tipoMantenimiento) {
          this.mantenimientoForm.get('tipoMantenimiento')?.setValue(
            this.tipoMantenimiento, { emitEvent: false }
          );
        }
      }
      // Ajustar campos si es Preventivo
      if (this.tipoMantenimiento === 'Preventivo' || this.mantenimiento.tipoMantenimiento === 'Preventivo') {
        this.mantenimientoForm.get('tipoFalla')?.setValue('Sin Falla');
        this.mantenimientoForm.get('tipoFalla')?.disable();
        this.mantenimientoForm.get('motivo')?.setValue('Programado para mantenimiento preventivo');
        this.mantenimientoForm.get('motivo')?.disable();
      }
    }

    await this.initRelatedEntities();
    this.populateFormFromMantenimiento();
  }

  // ─── Carga de datos ──────────────────────────────────────────────────────────

  private async loadInitialData(idMantenimiento: number) {
    if (idMantenimiento && idMantenimiento > 0) {
      try {
        // ✅ Desempacar .data porque el backend retorna { success: true, data: {...} }
        const res: any = await this.mantenimientoServices.getById(idMantenimiento);
        this.mantenimiento = res?.data ?? res;

        // Carga cumplimiento de protocolo
        if (this.mantenimiento.id) {
          this.mantenimiento.cumplimientoProtocolo = await this.sysprotocoloservices
            .getCumplimientoProtocoloMantenimiento(this.mantenimiento.id)
            .catch(() => []);
        }
      } catch (error) {
        console.error('Error cargando datos iniciales del mantenimiento:', error);
        this.mantenimiento = {};
      }
    } else {
      this.mantenimiento = {};
    }
  }

  private async loadBaseData() {
    // 1. Cargar usuario
    try {
      this.nombreUsuario = await this.userServices.getNameUSer(getDecodedAccessToken().id);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      this.nombreUsuario = { nombreCompleto: 'Técnico', numeroId: '' };
    }
    // Si es edición, mostrar el usuario original del reporte
    if (this.mantenimiento.id && this.mantenimiento.usuario) {
      this.nombreUsuario = this.mantenimiento.usuario;
    }

    // 2. Cargar equipo, protocolos y mediciones
    try {
      const equipoRes = await this.sysequiposervices.getEquipoById(this.id);
      this.equipo = equipoRes?.data ?? equipoRes;

      const tipoEquipoId = this.equipo.tipoEquipo?.id ?? this.equipo.id_tipo_equipo_fk ?? this.equipo.tipoEquipoIdFk;

      if (tipoEquipoId) {
        const [protocolos, allMediciones] = await Promise.all([
          this.sysprotocoloservices.getActivosByTipoEquipo(tipoEquipoId).catch(() => []),
          this.tipoEquipoService.getMediciones(tipoEquipoId).catch(() => [])
        ]);
        this.protocolos = protocolos;
        this.medicionesPreventivo = allMediciones.filter((m: any) => m.estado !== false);
      } else {
        this.protocolos = [];
        this.medicionesPreventivo = [];
      }
    } catch (error) {
      console.error('Error cargando datos base del equipo:', error);
      Swal.fire('Error', extractError(error, 'cargar la información del equipo para el mantenimiento'), 'error');
    }
    try {
      const res = await this.tipoRepuestosService.getTipos({ is_active: true }).toPromise();
      const tipos = Array.isArray(res?.data) ? res!.data as SysTipoRepuesto[] : [];
      this.tiposRepuesto = tipos.map(t => ({ label: t.nombre, value: t.id_sys_tipo_repuesto! }));
    } catch (error) {
      console.error('Error cargando tipos de repuesto:', error);
    }
  }

  private async initRelatedEntities() {
    this.iniValoresMediciones();
    this.iniCumplimientoProtocolo();
    this.iniRepuestos();
  }

  private populateFormFromMantenimiento() {
    // ✅ Quitar el guard de realizado — si tiene id debe cargar datos
    if (!this.mantenimiento.id) return;

    // Setear tipoMantenimiento SIEMPRE que exista en el registro
    if (this.mantenimiento.tipoMantenimiento) {
      this.tipoMantenimiento = this.mantenimiento.tipoMantenimiento;
      this.mantenimientoForm.get('tipoMantenimiento')?.setValue(
        this.mantenimiento.tipoMantenimiento, { emitEvent: false }
      );
    }

    // Solo parchea los campos de reporte si ya fue realizado
    if (this.mantenimiento.realizado) {
      this.mantenimientoForm.patchValue({
        fechaRealizado: this.mantenimiento.fechaRealizado
          ? new Date(this.mantenimiento.fechaRealizado + 'T00:00:00') : null,
        horaInicio: this.mantenimiento.horaInicio,
        fechaFin: this.mantenimiento.fechaFin
          ? new Date(this.mantenimiento.fechaFin + 'T00:00:00') : null,
        horaTerminacion: this.mantenimiento.horaTerminacion,
        horaTotal: this.mantenimiento.horaTotal,
        tipoFalla: this.mantenimiento.tipoFalla,
        motivo: this.mantenimiento.motivo,
        trabajoRealizado: this.mantenimiento.trabajoRealizado,
        calificacion: this.mantenimiento.calificacion,
        nombreRecibio: this.mantenimiento.nombreRecibio,
        cedulaRecibio: this.mantenimiento.cedulaRecibio,
        observaciones: this.mantenimiento.observaciones,
        estadoOperativo: this.mantenimiento.estadoOperativo,
        equipoPatronIdFk: this.mantenimiento.equipoPatronIdFk
      });
    }

    const token = getDecodedAccessToken();
    const puedeEditarTipo = token && (
      token.rol === 'SUPERADMIN' || token.rol === 'BIOMEDICAADMIN' ||
      token.rol === 'BIOMEDICAUSER' || token.rol === 'SISTEMASADMIN' || token.rol === 'SISTEMASUSER'
    );
    if (puedeEditarTipo) {
      this.mantenimientoForm.get('tipoMantenimiento')?.enable({ emitEvent: false });
    } else {
      this.mantenimientoForm.get('tipoMantenimiento')?.disable({ emitEvent: false });
    }
  }
  // ─── Cálculo de horas ────────────────────────────────────────────────────────
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

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async onSubmit() {
    if (this.mantenimientoForm.valid) {
      const selectedTipo = this.mantenimientoForm.get('tipoMantenimiento')?.value || this.tipoMantenimiento;

      // Prepara mediciones
      let medicionesPayload: any[] = [];
      if (selectedTipo === 'Preventivo' && this.mantenimientoForm.value.valoresMediciones) {
        medicionesPayload = this.mantenimientoForm.value.valoresMediciones.map((m: any) => ({
          id: m.id,
          valor: m.valor,
          unidadRegistrada: m.unidadRegistrada,
          conforme: m.conforme
        }));
      }

      // Construye el payload conservando año y mes programado
      this.mantenimiento = {
        id: this.mantenimiento.id,
        añoProgramado: this.mantenimiento.añoProgramado ||
          (this.mantenimientoForm.value.fechaRealizado
            ? new Date(this.mantenimientoForm.value.fechaRealizado).getFullYear() : null),
        mesProgramado: (this.mantenimiento.mesProgramado !== null && this.mantenimiento.mesProgramado !== undefined)
          ? this.mantenimiento.mesProgramado
          : (this.mantenimientoForm.value.fechaRealizado
            ? new Date(this.mantenimientoForm.value.fechaRealizado).getMonth() + 1 : null),
        fechaRealizado: this.mantenimientoForm.value.fechaRealizado,
        horaInicio: this.mantenimientoForm.value.horaInicio,
        fechaFin: this.mantenimientoForm.value.fechaFin,
        horaTerminacion: this.mantenimientoForm.value.horaTerminacion,
        horaTotal: this.mantenimientoForm.get('horaTotal')?.value || 0,
        tipoMantenimiento: selectedTipo,
        tipoFalla: selectedTipo === 'Preventivo' ? 'Sin Falla' : this.mantenimientoForm.value.tipoFalla,
        motivo: selectedTipo === 'Preventivo'
          ? 'Programado para mantenimiento preventivo'
          : this.mantenimientoForm.value.motivo,
        trabajoRealizado: this.mantenimientoForm.value.trabajoRealizado,
        calificacion: this.mantenimientoForm.value.calificacion,
        nombreRecibio: this.mantenimientoForm.value.nombreRecibio,
        cedulaRecibio: this.mantenimientoForm.value.cedulaRecibio,
        observaciones: this.mantenimientoForm.value.observaciones,
        estadoOperativo: this.mantenimientoForm.value.estadoOperativo,
        mantenimientoPropio: true,
        realizado: true,
        rutaPdf: null,
        servicioIdFk: this.equipo.servicioIdFk ?? this.equipo.id_servicio_fk ?? this.equipo.servicio?.id,
        id_sysequipo_fk: this.equipo.id_sysequipo ?? this.equipo.id,
        usuarioIdFk: getDecodedAccessToken().id,
        mediciones: medicionesPayload,
        repuestos: this.mantenimientoForm.value.repuestos,
        equipoPatronIdFk: this.mantenimientoForm.value.equipoPatronIdFk,
        cumplimientoProtocolo: selectedTipo === 'Preventivo'
          ? this.mantenimientoForm.value.cumplimientoProtocolo : []
      };

      if (this.mantenimiento.id) {
        // EDITAR reporte existente
        try {
          await this.mantenimientoServices.update(this.mantenimiento.id, this.mantenimiento);
          await this.guardarCumplimiento(this.mantenimiento.id);
          Swal.fire({
            icon: 'success',
            title: selectedTipo === 'Preventivo'
              ? 'Se actualizó el mantenimiento Preventivo'
              : 'Se actualizó el mantenimiento Correctivo',
            showConfirmButton: false,
            timer: 1500
          });
          localStorage.removeItem('idMantenimiento');
          localStorage.removeItem('TipoMantenimiento');
          this.router.navigate(['/adminsistemas/mantenimientos']);
        } catch (error) {
          console.error('Error al actualizar el mantenimiento:', error);
          Swal.fire({ icon: 'error', title: 'Error al actualizar', text: extractError(error, 'actualizar el mantenimiento') });
        }
      } else {
        // CREAR reporte nuevo
        try {
          const res = await this.mantenimientoServices.create(this.mantenimiento);
          if (res && res.data?.id) {
            await this.guardarCumplimiento(res.data.id);
            Swal.fire({
              icon: 'success',
              title: 'Se almacenó el mantenimiento correctamente',
              showConfirmButton: false,
              timer: 1500
            });
            localStorage.removeItem('idMantenimiento');
            localStorage.removeItem('TipoMantenimiento');
            this.router.navigate(['/adminsistemas/mantenimientos']);
          } else {
            throw new Error('No se recibió el ID del mantenimiento creado');
          }
        } catch (error) {
          console.error('Error al crear el mantenimiento:', error);
          Swal.fire({ icon: 'error', title: 'Error al crear', text: extractError(error, 'crear el mantenimiento') });
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

  // ─── Protocolo ───────────────────────────────────────────────────────────────
  iniCumplimientoProtocolo() {
    const array = this.mantenimientoForm.get('cumplimientoProtocolo') as FormArray;
    array.clear();
    if (!this.protocolos?.length) return;

    this.protocolos.forEach(p => {
      const existingComp = this.mantenimiento.cumplimientoProtocolo?.find(
        (c: any) => c.protocoloPreventivoIdFk === p.id || c.protocolo?.id === p.id
      );
      array.push(this.fb.group({
        protocoloPreventivoIdFk: [p.id],
        cumple: [existingComp ? existingComp.cumple : 'CUMPLE'],
        mantenimientoIdFk: [this.mantenimiento.id],
        paso: [p.paso],
        observaciones: [existingComp ? existingComp.observaciones : '']
      }));
    });
  }

  async guardarCumplimiento(mantenimientoId: any) {
    const protocolos = this.mantenimientoForm.value.cumplimientoProtocolo;
    if (!protocolos?.length) return;

    const promises = protocolos.map((protocolo: any) => {
      const cp = {
        sysProtocoloPreventivoIdFk: protocolo.protocoloPreventivoIdFk,
        cumple: protocolo.cumple,
        sysReporteIdFk: mantenimientoId,
        observaciones: protocolo.observaciones
      };
      return this.sysprotocoloservices.addCumplimientoProtocolo(cp);
    });
    await Promise.all(promises);
  }

  get cumplimientoProtocoloFormArray(): FormArray {
    return this.mantenimientoForm.get('cumplimientoProtocolo') as FormArray;
  }

  // ─── Mediciones ──────────────────────────────────────────────────────────────
  iniValoresMediciones() {
    const array = this.mantenimientoForm.get('valoresMediciones') as FormArray;
    array.clear();
    if (!this.medicionesPreventivo?.length) return;

    this.medicionesPreventivo.forEach(m => {
      const existingVal = this.mantenimiento.valoresMediciones?.find(
        (v: any) => v.medicion?.id === m.id || v.medicionIdFk === m.id
      );
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

  get valoresMedicionesFormArray(): FormArray {
    return this.mantenimientoForm.get('valoresMediciones') as FormArray;
  }

  // ─── Repuestos ───────────────────────────────────────────────────────────────
  iniRepuestos() {
    const array = this.mantenimientoForm.get('repuestos') as FormArray;
    array.clear();
    if (!this.mantenimiento.repuestos?.length) return;

    this.mantenimiento.repuestos.forEach((r: any) => {
      array.push(this.fb.group({
        id: [r.id],
        tipoRepuestoIdFk: [r.tipoRepuestoIdFk ?? null],
        sysRepuestoIdFk: [r.sysRepuestoIdFk ?? null],
        cantidad: [r.cantidad],
      }));
    });
  }
  async cargarRepuestosPorTipo(idTipo: number, rowIndex: number) {
    if (!idTipo) {
      this.repuestosPorTipo.delete(rowIndex);
      return;
    }
    try {
      const res = await this.sysRepuestosService
        .getByTipo(idTipo, { is_active: true })
        .toPromise();
      const lista = Array.isArray(res?.data) ? res!.data as SysRepuesto[] : [];
      this.repuestosPorTipo.set(rowIndex, lista.map(r => ({
        label: r.nombre,
        value: r.id_sysrepuesto!
      })));
    } catch (error) {
      console.error('Error cargando repuestos por tipo:', error);
      this.repuestosPorTipo.set(rowIndex, []);
    }
  }

  getRepuestosParaFila(rowIndex: number): { label: string; value: number }[] {
    return this.repuestosPorTipo.get(rowIndex) ?? [];
  }
  get repuestosFormArray(): FormArray {
    return this.mantenimientoForm.get('repuestos') as FormArray;
  }
  onSeleccionarRepuesto(event: any, rowIndex: number) {
    const repuestos = this.getRepuestosParaFila(rowIndex);
    const encontrado = repuestos.find(r => r.value === event.value);
    this.repuestosFormArray.at(rowIndex).get('nombreInsumo')?.setValue(encontrado?.label ?? '');
  }

  onCambiarTipoRepuesto(event: any, rowIndex: number) {
    this.cargarRepuestosPorTipo(event.value, rowIndex);
    this.repuestosFormArray.at(rowIndex).get('sysRepuestoIdFk')?.setValue(null);
    this.repuestosFormArray.at(rowIndex).get('nombreInsumo')?.setValue('');
  }
  agregarRepuesto() {
    this.repuestosFormArray.push(this.fb.group({
      id: [null],
      tipoRepuestoIdFk: [null],
      sysRepuestoIdFk: [null],
      cantidad: [''],
    }));
  }

  eliminarRepuesto(index: number) {
    this.repuestosFormArray.removeAt(index);
  }

  // ─── Utilidades ──────────────────────────────────────────────────────────────
  validarTipoMantenimiento() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (localStorage.getItem('TipoMantenimiento') === 'C') {
      this.tipoMantenimiento = 'Correctivo';
    } else if (localStorage.getItem('TipoMantenimiento') === 'P') {
      this.tipoMantenimiento = 'Preventivo';
    }
  }

  onSelectPatron() {
    const id = this.mantenimientoForm.get('equipoPatronIdFk')?.value;
    this.selectedPatron = id ? this.equiposPatron.find(e => e.id === id) : null;
  }

  validarPreventivo(): boolean {
    return this.mantenimientoForm.get('tipoMantenimiento')?.value === 'Preventivo';
  }

  convertirMayusculas(texto: string): string {
    return texto ? texto.toUpperCase() : '';
  }

  goBack(): void {
    Swal.fire({
      title: '¿Quieres guardar los cambios?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      denyButtonText: 'No guardar',
      cancelButtonText: 'Cancelar',
      icon: 'question'
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSubmit();
      } else if (result.isDenied) {
        Swal.fire('Los cambios no se guardan', '', 'info');
        localStorage.removeItem('idMantenimiento');
        localStorage.removeItem('TipoMantenimiento');
        this.location.back();
      }
    });
  }
}