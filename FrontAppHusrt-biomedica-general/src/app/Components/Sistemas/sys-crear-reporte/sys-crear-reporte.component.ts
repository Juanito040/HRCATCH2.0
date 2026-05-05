import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { MesaService } from '../../../Services/mesa-servicios/mesa.service';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-sys-crear-reporte',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TableModule
  ],
  templateUrl: './sys-crear-reporte.component.html',
  styleUrl: './sys-crear-reporte.component.css'
})
export class SysCrearReporteComponent implements OnInit {

  equipo: any = null;
  equipoId!: number;
  isLoading = false;
  casoId: number | null = null;
  nombreUsuario = '';
  cedularUsuario = '';

  private sysequiposService = inject(SysequiposService);
  private mesaService = inject(MesaService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  reporteForm!: FormGroup;

  readonly tiposMantenimiento = [
    { label: 'Correctivo', value: 'Correctivo' },
    { label: 'Preventivo', value: 'Preventivo' },
    { label: 'Otro', value: 'Otro' },
  ];

  readonly tiposFalla = [
    'Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios',
    'Desconocido', 'Sin Falla', 'Otros', 'No Registra'
  ].map(v => ({ label: v, value: v }));

  readonly estadosOperativos = [
    'Operativo sin restricciones', 'Operativo con restricciones', 'Fuera de servicio'
  ].map(v => ({ label: v, value: v }));

  readonly calificaciones = [1, 2, 3, 4, 5].map(v => ({ label: v.toString(), value: v }));

  async ngOnInit(): Promise<void> {
    this.equipoId = Number(this.route.snapshot.paramMap.get('id'));
    const casoIdStr = sessionStorage.getItem('reporteCasoId');
    this.casoId = casoIdStr ? Number(casoIdStr) : null;

    this.buildForm();
    this.watchTipoMantenimiento();
    this.watchHoras();

    const token = getDecodedAccessToken();
    if (token?.id) {
      try {
        const user = await this.userService.getNameUSer(token.id);
        this.nombreUsuario = user?.nombreCompleto ?? '';
        this.cedularUsuario = user?.numeroId ?? '';
      } catch {
        // no-op: solo informativo
      }
    }

    this.loadEquipo();
  }

  private buildForm(): void {
    this.reporteForm = this.fb.group({
      fecha_realizado: [null, Validators.required],
      hora_inicio:     [null, Validators.required],
      hora_terminacion:[null, Validators.required],
      hora_total:      [{ value: '', disabled: true }],
      tipo_mantenimiento: ['Correctivo', Validators.required],
      tipo_falla:      [null, Validators.required],
      estado_operativo:[null, Validators.required],
      motivo:          ['', Validators.required],
      trabajo_realizado:['', Validators.required],
      calificacion:    [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      nombre_recibio:  ['', Validators.required],
      cedula_recibio:  ['', Validators.required],
      observaciones:   ['', Validators.required],
      repuestos:       this.fb.array([])
    });
  }

  private loadEquipo(): void {
    this.isLoading = true;
    this.sysequiposService.getEquipoById(this.equipoId).subscribe({
      next: (res) => {
        this.equipo = Array.isArray(res.data) ? res.data[0] : res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudo cargar el equipo', 'error');
      }
    });
  }

  private watchTipoMantenimiento(): void {
    this.reporteForm.get('tipo_mantenimiento')?.valueChanges.subscribe((val: string) => {
      const tipoFallaCtrl  = this.reporteForm.get('tipo_falla');
      const motivoCtrl     = this.reporteForm.get('motivo');
      if (val === 'Preventivo') {
        tipoFallaCtrl?.setValue('Sin Falla');
        tipoFallaCtrl?.disable();
        motivoCtrl?.setValue('Programado para mantenimiento preventivo');
        motivoCtrl?.disable();
      } else {
        tipoFallaCtrl?.enable();
        tipoFallaCtrl?.setValue(null);
        motivoCtrl?.enable();
        if (motivoCtrl?.value === 'Programado para mantenimiento preventivo') {
          motivoCtrl?.setValue('');
        }
      }
    });
  }

  private watchHoras(): void {
    this.reporteForm.get('hora_inicio')?.valueChanges.subscribe(() => this.calcularHoraTotal());
    this.reporteForm.get('hora_terminacion')?.valueChanges.subscribe(() => this.calcularHoraTotal());
  }

  private calcularHoraTotal(): void {
    const inicio = this.reporteForm.get('hora_inicio')?.value as string | null;
    const fin    = this.reporteForm.get('hora_terminacion')?.value as string | null;
    if (!inicio || !fin) return;

    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    const totalMin = (hF * 60 + mF) - (hI * 60 + mI);

    if (totalMin < 0) {
      this.reporteForm.get('hora_total')?.setValue('00:00', { emitEvent: false });
      return;
    }

    const horas   = Math.floor(totalMin / 60);
    const minutos = totalMin % 60;
    this.reporteForm.get('hora_total')?.setValue(
      `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
      { emitEvent: false }
    );
  }

  get repuestosArray(): FormArray {
    return this.reporteForm.get('repuestos') as FormArray;
  }

  agregarRepuesto(): void {
    this.repuestosArray.push(this.fb.group({
      nombre_insumo:       [''],
      cantidad:            [''],
      comprobante_egreso:  ['']
    }));
  }

  eliminarRepuesto(i: number): void {
    this.repuestosArray.removeAt(i);
  }

  private formatFecha(val: Date | null): string | null {
    if (!val) return null;
    return val instanceof Date ? val.toISOString().slice(0, 10) : String(val);
  }

  onSubmit(): void {
    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Incompleto',
        text: 'Por favor diligencie todos los campos requeridos.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const raw = this.reporteForm.getRawValue();
    const payload = {
      id_sysequipo_fk:    this.equipoId,
      titulo:             `Reporte ${raw.tipo_mantenimiento} - ${this.equipo?.nombre_equipo ?? ''}`,
      tipo_mantenimiento: raw.tipo_mantenimiento,
      tipo_falla:         raw.tipo_falla,
      estado_operativo:   raw.estado_operativo,
      motivo:             raw.motivo,
      trabajo_realizado:  raw.trabajo_realizado,
      calificacion:       raw.calificacion,
      nombre_recibio:     raw.nombre_recibio,
      cedula_recibio:     raw.cedula_recibio,
      observaciones:      raw.observaciones,
      fecha_realizado:    this.formatFecha(raw.fecha_realizado),
      hora_inicio:        raw.hora_inicio,
      hora_terminacion:   raw.hora_terminacion,
      hora_total:         raw.hora_total,
      id_usuario_fk:      getDecodedAccessToken()?.id ?? null,
      mesa_caso_id:       this.casoId ?? null
    };

    this.isLoading = true;
    this.mesaService.createSysReporteMantenimiento(payload).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Reporte guardado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.cerrarCasoYNavegar();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar el reporte',
          text: err?.error?.message ?? 'Inténtelo de nuevo más tarde.'
        });
      }
    });
  }

  private cerrarCasoYNavegar(): void {
    if (this.casoId) {
      const usuarioId = getDecodedAccessToken()?.id;
      const fd = new FormData();
      fd.append('usuarioId', String(usuarioId ?? ''));
      fd.append('mensajeFinal', 'Caso cerrado con reporte de mantenimiento de sistemas.');
      this.mesaService.closeCaso(this.casoId, fd).subscribe({
        next:  () => this.limpiarYNavegar(),
        error: () => this.limpiarYNavegar()
      });
    } else {
      this.router.navigate(['/adminsistemas/reportesequipo', this.equipoId]);
    }
  }

  private limpiarYNavegar(): void {
    sessionStorage.removeItem('reporteCasoId');
    this.router.navigate(['/adminmesaservicios/casos']);
  }

  goBack(): void {
    if (this.casoId) {
      sessionStorage.removeItem('reporteCasoId');
      this.router.navigate(['/adminmesaservicios/casos']);
    } else {
      this.router.navigate(['/adminsistemas/reportesequipo', this.equipoId]);
    }
  }
}
