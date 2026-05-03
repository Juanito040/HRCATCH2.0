import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, OnDestroy, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
      nombre_equipo: ['', [Validators.required, Validators.maxLength(255)]],
      marca: ['', [Validators.maxLength(255)]],
      modelo: ['', [Validators.maxLength(255)]],
      serie: ['', [Validators.maxLength(255)]],
      placa_inventario: ['', [Validators.maxLength(255)]],
      codigo: ['', [Validators.maxLength(255)]],
      ubicacion: ['', [Validators.maxLength(255)]],
      ubicacion_especifica: ['', [Validators.maxLength(255)]],
      activo: [1],
      ano_ingreso: ['', [Validators.min(1900), Validators.max(2100)]],
      dias_mantenimiento: ['', [Validators.min(0)]],
      periodicidad: ['', [Validators.min(0)]],
      administrable: [0],
      direccionamiento_Vlan: ['', [Validators.maxLength(255)]],
      numero_puertos: ['', [Validators.min(0)]],
      mtto: [1],
      id_sede_fk: [''],
      id_servicio_fk: [''],
      id_tipo_equipo_fk: [''],
      id_usuario_fk: [''],
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
      comodato: [false]
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

  save() {
    if (this.equipoForm.invalid) {
      Object.keys(this.equipoForm.controls).forEach(key => {
        this.equipoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = this.equipoForm.value;
    const hojaVidaFields = ['ip', 'mac', 'procesador', 'ram', 'disco_duro', 'sistema_operativo', 'office',
      'tonner', 'nombre_usuario', 'vendedor', 'tipo_uso', 'fecha_compra', 'fecha_instalacion',
      'costo_compra', 'contrato', 'observaciones', 'foto', 'compraddirecta', 'convenio', 'donado', 'comodato'];
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
