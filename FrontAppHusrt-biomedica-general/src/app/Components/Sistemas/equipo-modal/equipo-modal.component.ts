import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, OnDestroy, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SedeService } from '../../../Services/appServices/general/sede/sede.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import Swal from 'sweetalert2';
import { extractError } from '../../../utils/error-utils';

interface LookupItem {
  id: number;
  nombre: string;
}

interface CamposHV {
  ip: boolean;
  mac: boolean;
  procesador: boolean;
  ram: boolean;
  disco: boolean;
  tonner: boolean;
  so: boolean;
  office: boolean;
  nombre_usuario: boolean;
  tipo_uso: boolean;
  adquisicion: boolean;
  observaciones: boolean;
}

@Component({
  selector: 'app-sys-equipo-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipo-modal.component.html',
  styleUrls: ['./equipo-modal.component.css']
})
export class SysEquipoModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() equipo: SysEquipo | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  equipoForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  sedes: LookupItem[] = [];
  servicios: LookupItem[] = [];
  todosLosServicios: LookupItem[] = [];
  tiposEquipo: any[] = [];
  usuarios: LookupItem[] = [];

  fechasMantenimiento: number[] = [];
  hojaVidaExpanded: boolean = true;
  readonly currentYear = new Date().getFullYear();
  readonly years: number[] = Array.from(
    { length: new Date().getFullYear() - 1950 + 1 },
    (_, i) => new Date().getFullYear() - i
  );
  camposHV: CamposHV = {
    ip: true, mac: true, procesador: true, ram: true, disco: true,
    tonner: true, so: true, office: true, nombre_usuario: true,
    tipo_uso: true, adquisicion: true, observaciones: true,
  };
  private destroyed = false;
  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private sysequiposService: SysequiposService,
    private servicioService: ServicioService,
    private tipoEquipoService: TipoEquipoService,
    private sedeService: SedeService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.destroyRef.onDestroy(() => { this.destroyed = true; });
    this.initForm();
    this.loadLookupData();
    this.setupPeriodicidadListener();
    this.setupTipoEquipoListener();
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen'] && this.isOpen && this.equipoForm) {
      if (this.equipo) {
        this.equipoForm.patchValue({ ...this.equipo });
      } else {
        this.equipoForm.reset();
        this.equipoForm.patchValue({ activo: 1, mtto: 1, administrable: 0 });
        this.hojaVidaExpanded = true;
      }
      this.errorMessage = null;
    }
  }

  // ── Validadores personalizados ─────────────────────────────────────────────

  private static sinEspacios(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return /\s/.test(control.value) ? { sinEspacios: true } : null;
  }

  private static formatoCodigo(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    return /^[A-Za-z0-9\-_]+$/.test(control.value) ? null : { formatoCodigo: true };
  }

  private nombreUnicoValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const nombre = (control.value || '').trim();
      if (!nombre) return of(null);
      return timer(500).pipe(
        switchMap(() => this.sysequiposService.getEquipos({ search: nombre, includeAll: true })),
        map(response => {
          if (!response.success) return null;
          const lista = Array.isArray(response.data) ? response.data : [response.data];
          const duplicado = lista.find(e =>
            e.nombre_equipo?.toLowerCase() === nombre.toLowerCase() &&
            e.id_sysequipo !== this.equipo?.id_sysequipo
          );
          return duplicado ? { nombreDuplicado: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  // ──────────────────────────────────────────────────────────────────────────

  async loadLookupData() {
    try {
      const sedesData = await this.sedeService.getAllSedes();
      if (this.destroyed) return;
      this.sedes = (Array.isArray(sedesData) ? sedesData : []).map((s: any) => ({
        id: s.id_sede || s.id,
        nombre: s.nombre || s.nombres || 'Sin nombre'
      }));
    } catch (err) {
      if (!this.destroyed) console.error('Error al cargar sedes:', err);
    }

    if (this.destroyed) return;
    try {
      const serviciosData = await this.servicioService.getAllServicios();
      if (this.destroyed) return;
      this.todosLosServicios = (Array.isArray(serviciosData) ? serviciosData : []).map((s: any) => ({
        id: s.id_servicio || s.id,
        nombre: s.nombre || s.nombres || 'Sin nombre'
      }));
      this.servicios = [...this.todosLosServicios];
    } catch (err) {
      if (!this.destroyed) console.error('Error al cargar servicios:', err);
    }

    if (this.destroyed) return;
    try {
      const tiposData = await this.tipoEquipoService.getTiposEquiposSistemas();
      if (this.destroyed) return;
      this.tiposEquipo = (Array.isArray(tiposData) ? tiposData : []).map((t: any) => ({
        id: t.id_tipo_equipo || t.id,
        nombre: t.nombre || t.nombres || 'Sin nombre',
        campo_ip:            t.campo_ip,
        campo_mac:           t.campo_mac,
        campo_procesador:    t.campo_procesador,
        campo_ram:           t.campo_ram,
        campo_disco:         t.campo_disco,
        campo_tonner:        t.campo_tonner,
        campo_so:            t.campo_so,
        campo_office:        t.campo_office,
        campo_nombre_usuario:t.campo_nombre_usuario,
        campo_tipo_uso:      t.campo_tipo_uso,
        campo_adquisicion:   t.campo_adquisicion,
        campo_observaciones: t.campo_observaciones,
      }));
      // Recalcular campos por si el modal ya estaba abierto cuando los tipos cargaron
      const currentTipo = this.equipoForm?.get('id_tipo_equipo_fk')?.value;
      if (currentTipo) this.updateCamposHV(currentTipo);
    } catch (err) {
      if (!this.destroyed) console.error('Error al cargar tipos de equipo:', err);
    }

    if (this.destroyed) return;
    try {
      const usersData = await this.userService.getAllUsers();
      if (this.destroyed) return;
      this.usuarios = (Array.isArray(usersData) ? usersData : []).map((u: any) => ({
        id: u.id_usuario || u.id,
        nombre: `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.email || 'Sin nombre'
      }));
    } catch (err) {
      if (!this.destroyed) console.error('Error al cargar usuarios:', err);
    }
  }

  async onSedeChange(sedeId: any) {
    if (!sedeId) {
      this.servicios = [...this.todosLosServicios];
      this.equipoForm.patchValue({ id_servicio_fk: '' });
      return;
    }
    try {
      const data = await this.servicioService.getServiciosBySede(sedeId);
      this.servicios = (Array.isArray(data) ? data : []).map((s: any) => ({
        id: s.id_servicio || s.id,
        nombre: s.nombre || s.nombres || 'Sin nombre'
      }));
      this.equipoForm.patchValue({ id_servicio_fk: '' });
    } catch (err) {
      console.error('Error al filtrar servicios por sede:', err);
      this.servicios = [...this.todosLosServicios];
    }
  }

  initForm() {
    this.equipoForm = this.fb.group({
      nombre_equipo:        ['', [Validators.required, Validators.maxLength(255)], [this.nombreUnicoValidator()]],
      marca:                ['', [Validators.required, Validators.maxLength(255)]],
      modelo:               ['', [Validators.required, Validators.maxLength(255)]],
      serie:                ['', [Validators.required, Validators.maxLength(80), SysEquipoModalComponent.sinEspacios, SysEquipoModalComponent.formatoCodigo]],
      placa_inventario:     ['', [Validators.required, Validators.maxLength(255), SysEquipoModalComponent.sinEspacios, SysEquipoModalComponent.formatoCodigo]],
      codigo:               ['', [Validators.required, Validators.maxLength(255), SysEquipoModalComponent.sinEspacios, SysEquipoModalComponent.formatoCodigo]],
      ubicacion:            ['', [Validators.required, Validators.maxLength(255)]],
      ubicacion_especifica: ['', [Validators.required, Validators.maxLength(255)]],
      activo: [1],
      ano_ingreso:          ['', [Validators.required]],
      dias_mantenimiento:   ['', [Validators.required, Validators.min(0)]],
      periodicidad:         ['', [Validators.required]],
      // Configuración de Red — no obligatoria
      administrable:        [0],
      direccionamiento_Vlan:['', [Validators.maxLength(255)]],
      numero_puertos:       ['', [Validators.min(0)]],
      mtto: [1],
      preventivo_s: [false],
      id_sede_fk:           ['', [Validators.required]],
      id_servicio_fk:       ['', [Validators.required]],
      id_tipo_equipo_fk:    ['', [Validators.required]],
      id_usuario_fk:        ['', [Validators.required]],
      // Hoja de vida (solo se usa al crear)
      ip: [''],
      mac: [''],
      procesador: [''],
      ram: [''],
      disco_duro: [''],
      sistema_operativo: [''],
      office: [''],
      tonner: [''],
      nombre_usuario: [''],
      vendedor: [''],
      tipo_uso: [''],
      fecha_compra: [''],
      fecha_instalacion: [''],
      costo_compra: [''],
      contrato: [''],
      observaciones: [''],
      foto: [''],
      compraddirecta: [false],
      convenio: [false],
      donado: [false],
      comodato: [false],
      // Soporte del fabricante
      fecha_inicio_soporte: [''],
      anos_soporte_fabricante: ['']
    });
  }

  get modalTitle(): string {
    return this.equipo ? 'Editar Equipo' : 'Nuevo Equipo';
  }

  get isCreatingEquipo(): boolean {
    return this.equipo === null || this.equipo === undefined;
  }

  hasError(fieldName: string): boolean {
    const field = this.equipoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.equipoForm.get(fieldName);
    if (!field) return '';
    if (field.hasError('required')) return 'Este campo es requerido';
    if (field.hasError('maxlength')) return `Máximo ${field.errors?.['maxlength'].requiredLength} caracteres`;
    if (field.hasError('min')) return `Valor mínimo: ${field.errors?.['min'].min}`;
    if (field.hasError('max')) return `Valor máximo: ${field.errors?.['max'].max}`;
    if (field.hasError('nombreDuplicado')) return 'Ya existe un equipo con este nombre';
    if (field.hasError('sinEspacios')) return 'No se permiten espacios';
    if (field.hasError('formatoCodigo')) return 'Solo letras, números y guiones (Ej: SN-123456, INV-2025-001)';
    return '';
  }

  setupPeriodicidadListener() {
    this.equipoForm.get('periodicidad')?.valueChanges.subscribe(value => {
      this.updateFechasMantenimiento(value);
    });
  }

  setupTipoEquipoListener() {
    this.equipoForm.get('id_tipo_equipo_fk')?.valueChanges.subscribe(value => {
      this.updateCamposHV(value);
    });
  }

  private updateCamposHV(idTipo: any) {
    const bool = (v: any): boolean => (v === undefined || v === null) ? true : Boolean(v);
    if (!idTipo) {
      this.camposHV = {
        ip: true, mac: true, procesador: true, ram: true, disco: true,
        tonner: true, so: true, office: true, nombre_usuario: true,
        tipo_uso: true, adquisicion: true, observaciones: true,
      };
      return;
    }
    const tipo = this.tiposEquipo.find((t: any) => t.id === +idTipo);
    this.camposHV = {
      ip:             bool(tipo?.campo_ip),
      mac:            bool(tipo?.campo_mac),
      procesador:     bool(tipo?.campo_procesador),
      ram:            bool(tipo?.campo_ram),
      disco:          bool(tipo?.campo_disco),
      tonner:         bool(tipo?.campo_tonner),
      so:             bool(tipo?.campo_so),
      office:         bool(tipo?.campo_office),
      nombre_usuario: bool(tipo?.campo_nombre_usuario),
      tipo_uso:       bool(tipo?.campo_tipo_uso),
      adquisicion:    bool(tipo?.campo_adquisicion),
      observaciones:  bool(tipo?.campo_observaciones),
    };
  }

  updateFechasMantenimiento(periodicidad: string) {
    this.fechasMantenimiento.forEach((_, index) => {
      this.equipoForm.removeControl(`fecha_mantenimiento_${index + 1}`);
    });
    this.fechasMantenimiento = [];

    let cantidadCampos = 0;
    switch (periodicidad) {
      case '365': cantidadCampos = 1; break;
      case '180': cantidadCampos = 2; break;
      case '120': cantidadCampos = 4; break;
      case '90': cantidadCampos = 3; break;
      default: cantidadCampos = 0;
    }

    for (let i = 0; i < cantidadCampos; i++) {
      this.fechasMantenimiento.push(i);
      this.equipoForm.addControl(`fecha_mantenimiento_${i + 1}`, this.fb.control('', Validators.required));
    }
  }

  getFechaLabel(index: number): string {
    const periodicidad = this.equipoForm.get('periodicidad')?.value;
    switch (periodicidad) {
      case '365': return 'Fecha de Mantenimiento Anual';
      case '180': return `Fecha de Mantenimiento ${index + 1}° Semestre`;
      case '120': return `Fecha de Mantenimiento ${index + 1}° Cuatrimestre`;
      case '90': return `Fecha de Mantenimiento ${index + 1}° Trimestre`;
      default: return `Fecha de Mantenimiento ${index + 1}`;
    }
  }

  toggleHojaVida() {
    this.hojaVidaExpanded = !this.hojaVidaExpanded;
  }

  close() {
    this.equipoForm.reset();
    this.errorMessage = null;
    this.closed.emit();
  }

  private hojaVidaEstaVacia(): boolean {
    const campos = ['ip', 'mac', 'procesador', 'ram', 'disco_duro', 'sistema_operativo',
      'office', 'tonner', 'nombre_usuario', 'vendedor', 'tipo_uso',
      'fecha_compra', 'fecha_instalacion', 'costo_compra', 'contrato'];
    return campos.every(f => !this.equipoForm.get(f)?.value);
  }

  async save() {
    if (this.equipoForm.pending) {
      Swal.fire({ icon: 'info', title: 'Verificando', text: 'Espere mientras se validan los datos...', timer: 1500, showConfirmButton: false });
      return;
    }
    if (this.equipoForm.invalid) {
      Object.keys(this.equipoForm.controls).forEach(key => {
        this.equipoForm.get(key)?.markAsTouched();
      });

      const LABELS: Record<string, string> = {
        nombre_equipo:        'Nombre del Equipo',
        marca:                'Marca',
        modelo:               'Modelo',
        serie:                'Número de Serie',
        placa_inventario:     'Placa de Inventario',
        codigo:               'Código',
        ano_ingreso:          'Año de Ingreso',
        ubicacion:            'Ubicación',
        ubicacion_especifica: 'Ubicación Específica',
        periodicidad:         'Tipo de Mantenimiento',
        dias_mantenimiento:   'Días de Mantenimiento',
        id_sede_fk:           'Sede',
        id_servicio_fk:       'Servicio',
        id_tipo_equipo_fk:    'Tipo de Equipo',
        id_usuario_fk:        'Usuario Responsable',
      };

      const errores: string[] = [];
      for (const [key, label] of Object.entries(LABELS)) {
        const ctrl = this.equipoForm.get(key);
        if (!ctrl || !ctrl.errors) continue;
        if (ctrl.hasError('required'))      errores.push(`• <b>${label}</b>: campo obligatorio`);
        if (ctrl.hasError('nombreDuplicado')) errores.push(`• <b>${label}</b>: ya existe un equipo con ese nombre`);
        if (ctrl.hasError('sinEspacios'))   errores.push(`• <b>${label}</b>: no se permiten espacios`);
        if (ctrl.hasError('formatoCodigo')) errores.push(`• <b>${label}</b>: formato inválido (use letras, números y guiones)`);
        if (ctrl.hasError('maxlength'))     errores.push(`• <b>${label}</b>: texto demasiado largo`);
      }

      if (errores.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Completa los campos requeridos',
          html: errores.join('<br>'),
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#1a5f7a'
        });
      }
      return;
    }

    // Advertencia si la hoja de vida está vacía (solo al crear)
    if (this.isCreatingEquipo && this.hojaVidaEstaVacia()) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Hoja de vida no completada',
        text: 'No has completado la hoja de vida del equipo. Se recomienda registrarla para tener el historial técnico completo.',
        showCancelButton: true,
        confirmButtonText: 'Continuar sin hoja de vida',
        cancelButtonText: 'Volver a completarla',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#1a5f7a',
        reverseButtons: true
      });
      if (!resultado.isConfirmed) return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = this.equipoForm.value;
    const hojaVidaFields = ['ip', 'mac', 'procesador', 'ram', 'disco_duro', 'sistema_operativo', 'office',
      'tonner', 'nombre_usuario', 'vendedor', 'tipo_uso', 'fecha_compra', 'fecha_instalacion',
      'costo_compra', 'contrato', 'observaciones', 'foto', 'compraddirecta', 'convenio', 'donado', 'comodato',
      'fecha_inicio_soporte', 'anos_soporte_fabricante'];
    const uiOnlyFields = ['id_sede_fk'];

    const equipoData: any = {};
    const hojaVidaData: any = {};
    Object.keys(formData).forEach(key => {
      if (uiOnlyFields.includes(key)) {
        // no incluir en payload
      } else if (hojaVidaFields.includes(key)) {
        if (formData[key] !== null && formData[key] !== '' && formData[key] !== undefined) {
          hojaVidaData[key] = formData[key];
        }
      } else {
        equipoData[key] = formData[key];
      }
    });

    // Al crear, incluir hojaVida; al editar, solo datos del equipo
    const payload = this.equipo ? equipoData : { ...equipoData, hojaVida: hojaVidaData };

    if (this.equipo?.id_sysequipo) {
      this.sysequiposService.updateEquipo(this.equipo.id_sysequipo, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            Swal.fire({ icon: 'success', title: 'Actualizado', text: `Equipo "${equipoData.nombre_equipo}" actualizado exitosamente`, timer: 2000, showConfirmButton: false });
            this.saved.emit();
            this.close();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Error al actualizar el equipo' });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          Swal.fire({ icon: 'error', title: 'Error al actualizar', text: extractError(err, 'actualizar el equipo') });
        }
      });
    } else {
      this.sysequiposService.createEquipo(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            const created = Array.isArray(response.data) ? response.data[0] : response.data;
            Swal.fire({ icon: 'success', title: 'Creado', text: `Equipo "${created.nombre_equipo}" creado exitosamente`, timer: 2000, showConfirmButton: false });
            this.saved.emit();
            this.close();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Error al crear el equipo' });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          const backendMsg = err?.error?.message || err?.error?.errors?.[0]?.msg || err?.error?.detalle;
          const msg = backendMsg || extractError(err, 'crear el equipo');
          Swal.fire({ icon: 'error', title: 'Error al crear', text: msg });
        }
      });
    }
  }
}
