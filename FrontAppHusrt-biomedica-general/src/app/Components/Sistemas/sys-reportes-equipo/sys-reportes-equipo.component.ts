import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MesaService } from '../../../Services/mesa-servicios/mesa.service';

@Component({
  selector: 'app-sys-reportes-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sys-reportes-equipo.component.html',
  styleUrls: ['./sys-reportes-equipo.component.css']
})
export class SysReportesEquipoComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() equipo: any = null;
  @Output() closed = new EventEmitter<void>();

  reportes: any[] = [];
  isLoading = false;
  error: string | null = null;

  private mesaService = inject(MesaService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue && this.equipo?.id_sysequipo) {
      this.cargarReportes();
    }
    if (!changes['isOpen']?.currentValue) {
      this.reportes = [];
      this.error = null;
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  cargarReportes() {
    if (!this.equipo?.id_sysequipo) return;
    this.isLoading = true;
    this.error = null;

    this.mesaService.getSysReportesMantenimiento(this.equipo.id_sysequipo).subscribe({
      next: (res) => {
        this.reportes = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes de mantenimiento.';
        this.isLoading = false;
      }
    });
  }

  getTipoClass(tipo: string): string {
    const map: Record<string, string> = {
      'Correctivo': 'badge-correctivo',
      'Preventivo': 'badge-preventivo',
      'Otro':       'badge-otro'
    };
    return map[tipo] || 'badge-otro';
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Operativo':             'badge-operativo',
      'Con restricciones':     'badge-restricciones',
      'Fuera de servicio':     'badge-fuera'
    };
    return map[estado] || 'badge-otro';
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return fecha; }
  }

  close() {
    this.closed.emit();
  }
}
