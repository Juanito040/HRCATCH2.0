import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';

export interface ReactivarEquipoData {
  ubicacion: string;
  ubicacion_especifica?: string;
  recibidoPor: string;
  cargo_receptor: string;
  servicioDestinoId?: number;
  horaInicio: string;
  horaTerminacion: string;
  observaciones: string;
}

@Component({
  selector: 'app-sys-reactivar-equipo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reactivar-equipo-modal.component.html',
  styleUrls: ['./reactivar-equipo-modal.component.css']
})
export class SysReactivarEquipoModalComponent implements OnChanges, OnDestroy, OnInit {
  private servicioService = inject(ServicioService);

  @Input() isOpen = false;
  @Input() equipoNombre = '';
  @Input() ubicacionAnterior = '';
  @Input() ubicacionEspecifica = '';
  @Input() equipo: any = null;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<ReactivarEquipoData>();

  ubicacion = '';
  ubicacion_especifica = '';
  recibidoPor = '';
  cargo_receptor = '';
  servicioDestinoId: number | null = null;
  serviciosList: any[] = [];
  horaInicio = '';
  horaTerminacion = '';
  observaciones = '';
  isSubmitting = false;
  errorRecibido = false;
  errorCargo = false;
  modoUbicacion: 'restaurar' | 'nueva' = 'restaurar';
  modoServicio: 'restaurar' | 'nuevo' = 'restaurar';

  get ubicAnterior(): string {
    return this.equipo?.ubicacion_anterior || this.ubicacionAnterior || '';
  }

  get ubicEspOrigen(): string {
    return this.equipo?.bodega?.ubicacion_esp_origen || '';
  }

  get ubic_bod(): string {
    return this.equipo?.ubic_bod || this.ubicacionEspecifica || 'Bodega';
  }

  get sede(): string {
    return this.equipo?.servicio?.sede?.nombres || '';
  }

  get servicio(): string {
    return this.equipo?.servicio?.nombres || '';
  }

  get servicioAnteriorId(): number | null {
    return this.equipo?.id_servicio_anterior_fk ?? null;
  }

  get servicioAnteriorNombre(): string {
    const id = this.servicioAnteriorId;
    if (!id) return '';
    const encontrado = this.serviciosList.find(s => s.id === id);
    return encontrado?.nombres || '';
  }

  ngOnInit() {
    this.servicioService.getAllServiciosActivos().then(s => this.serviciosList = s).catch(() => {});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue === true) {
      const tieneAnterior = !!this.ubicAnterior;
      const tieneServicioAnterior = !!this.servicioAnteriorId;
      this.modoUbicacion = tieneAnterior ? 'restaurar' : 'nueva';
      this.modoServicio = tieneServicioAnterior ? 'restaurar' : 'nuevo';
      this.ubicacion = tieneAnterior ? this.ubicAnterior : '';
      this.ubicacion_especifica = tieneAnterior ? this.ubicEspOrigen : '';
      this.servicioDestinoId = tieneServicioAnterior ? this.servicioAnteriorId : null;
      this.recibidoPor = '';
      this.cargo_receptor = '';
      this.horaInicio = new Date().toTimeString().slice(0, 5);
      this.horaTerminacion = '';
      this.observaciones = '';
      this.isSubmitting = false;
      this.errorRecibido = false;
      this.errorCargo = false;
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  onModoChange() {
    if (this.modoUbicacion === 'restaurar') {
      this.ubicacion = this.ubicAnterior;
      this.ubicacion_especifica = this.ubicEspOrigen;
    } else {
      this.ubicacion = '';
      this.ubicacion_especifica = '';
    }
  }

  onModoServicioChange() {
    if (this.modoServicio === 'restaurar') {
      this.servicioDestinoId = this.servicioAnteriorId;
    } else {
      this.servicioDestinoId = null;
    }
  }

  close() {
    if (!this.isSubmitting) {
      this.errorRecibido = false;
      this.closed.emit();
    }
  }

  confirm() {
    if (this.isSubmitting) return;
    if (!this.recibidoPor.trim()) {
      this.errorRecibido = true;
      return;
    }
    if (!this.cargo_receptor.trim()) {
      this.errorCargo = true;
      return;
    }
    this.errorRecibido = false;
    this.errorCargo = false;
    this.confirmed.emit({
      ubicacion: this.ubicacion.trim(),
      ubicacion_especifica: this.ubicacion_especifica.trim() || undefined,
      recibidoPor: this.recibidoPor.trim(),
      cargo_receptor: this.cargo_receptor.trim(),
      servicioDestinoId: this.servicioDestinoId ?? undefined,
      horaInicio: this.horaInicio,
      horaTerminacion: this.horaTerminacion,
      observaciones: this.observaciones.trim()
    });
  }

  setSubmitting(v: boolean) { this.isSubmitting = v; }
}
