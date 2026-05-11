import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReactivarEquipoData {
  ubicacion: string;
  ubicacion_especifica?: string;
  recibidoPor: string;
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
export class SysReactivarEquipoModalComponent implements OnChanges, OnDestroy {
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
  horaInicio = '';
  horaTerminacion = '';
  observaciones = '';
  isSubmitting = false;
  errorRecibido = false;
  modoUbicacion: 'restaurar' | 'nueva' = 'restaurar';

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue === true) {
      const tieneAnterior = !!this.ubicAnterior;
      this.modoUbicacion = tieneAnterior ? 'restaurar' : 'nueva';
      this.ubicacion = tieneAnterior ? this.ubicAnterior : '';
      this.ubicacion_especifica = tieneAnterior ? this.ubicEspOrigen : '';
      this.recibidoPor = '';
      this.horaInicio = new Date().toTimeString().slice(0, 5);
      this.horaTerminacion = '';
      this.observaciones = '';
      this.isSubmitting = false;
      this.errorRecibido = false;
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
    this.errorRecibido = false;
    this.confirmed.emit({
      ubicacion: this.ubicacion.trim(),
      ubicacion_especifica: this.ubicacion_especifica.trim() || undefined,
      recibidoPor: this.recibidoPor.trim(),
      horaInicio: this.horaInicio,
      horaTerminacion: this.horaTerminacion,
      observaciones: this.observaciones.trim()
    });
  }

  setSubmitting(v: boolean) { this.isSubmitting = v; }
}
