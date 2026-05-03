import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SysReporteEntregaService, SysReporteEntrega } from '../../../Services/appServices/sistemasServices/sysreporteentrega/sysreporteentrega.service';
import Swal from 'sweetalert2';

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

  reportes: SysReporteEntrega[] = [];
  isLoading = false;
  error: string | null = null;
  downloadingId: number | null = null;

  private reporteService = inject(SysReporteEntregaService);

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

    this.reporteService.getAll(this.equipo.id_sysequipo).subscribe({
      next: (res) => {
        this.reportes = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los reportes.';
        this.isLoading = false;
      }
    });
  }

  async descargarPdf(reporte: SysReporteEntrega) {
    if (!reporte.id_sysreporte) return;
    this.downloadingId = reporte.id_sysreporte;
    try {
      const blob = await this.reporteService.descargarPdfReporte(reporte.id_sysreporte);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReporteEntrega_${reporte.id_sysreporte}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
    } finally {
      this.downloadingId = null;
    }
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
