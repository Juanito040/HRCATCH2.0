import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReactivarEquipoData { ubicacion: string; }

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
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<ReactivarEquipoData>();

  ubicacion = '';
  isSubmitting = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue === true) {
      this.ubicacion = this.ubicacionAnterior || 'Datacenter Principal';
      this.isSubmitting = false;
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  close() { if (!this.isSubmitting) { this.ubicacion = ''; this.isSubmitting = false; this.closed.emit(); } }
  confirm() { if (this.isSubmitting) return; this.confirmed.emit({ ubicacion: this.ubicacion.trim() || 'Bodega' }); }
  setSubmitting(v: boolean) { this.isSubmitting = v; }
}
