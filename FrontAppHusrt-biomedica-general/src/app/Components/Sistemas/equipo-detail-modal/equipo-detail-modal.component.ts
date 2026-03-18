import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';

@Component({
  selector: 'app-sys-equipo-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipo-detail-modal.component.html',
  styleUrls: ['./equipo-detail-modal.component.css']
})
export class SysEquipoDetailModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() equipo: SysEquipo | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<SysEquipo>();

  private router = inject(Router);

  ngOnChanges(changes: SimpleChanges) {}

  close() { this.closed.emit(); }
  requestEdit() { if (this.equipo) this.editRequested.emit(this.equipo); }
  verHojaVida() {
    if (this.equipo?.id_sysequipo) {
      this.closed.emit();
      this.router.navigate(['/adminsistemas/hojavida', this.equipo.id_sysequipo]);
    }
  }

  getEstadoBadgeClass(activo: number | undefined): string {
    return `badge badge-${Number(activo) === 1 ? 'success' : 'danger'}`;
  }
  formatEstado(activo: number | undefined): string {
    return Number(activo) === 1 ? 'Activo' : 'Inactivo';
  }
  formatValue(value: string | undefined): string { return value || 'No especificado'; }
  formatTipoEquipo(): string {
    if (!this.equipo) return 'No especificado';
    return this.equipo.tipoEquipo?.nombres || this.equipo.tipoEquipo?.nombre || 'No especificado';
  }
  formatServicio(): string {
    if (!this.equipo) return 'No especificado';
    const s = this.equipo.servicio;
    if (!s) return 'No especificado';
    return s.nombres || s.nombre || 'No especificado';
  }
  formatUsuario(): string {
    if (!this.equipo) return 'No especificado';
    const u = this.equipo.usuario;
    if (!u) return 'No especificado';
    return `${u.nombres || ''} ${u.apellidos || ''}`.trim() || 'No especificado';
  }
  printToPDF() { window.print(); }
}
