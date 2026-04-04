import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysReporteService, SysReporte } from '../../../Services/appServices/sistemasServices/sysreporte/sysreporte.service';
import { getDecodedAccessToken } from '../../../utilidades';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sys-reporte-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sys-reporte-form.component.html',
  styleUrls: ['./sys-reporte-form.component.css']
})
export class SysReporteFormComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() equipo: any = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isSubmitting = false;
  isDownloadingPdf = false;
  savedReporteId: number | null = null;

  form: SysReporte = this.emptyForm();

  constructor(private reporteService: SysReporteService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.reset();
    }
  }

  private emptyForm(): SysReporte {
    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toTimeString().slice(0, 5);
    return {
      fecha: hoy,
      hora_llamado: ahora,
      hora_inicio: '',
      hora_terminacion: '',
      servicio_anterior: '',
      ubicacion_anterior: '',
      servicio_nuevo: '',
      ubicacion_nueva: '',
      ubicacion_especifica: '',
      realizado_por: '',
      recibido_por: '',
      observaciones: ''
    };
  }

  private reset() {
    this.form = this.emptyForm();
    this.savedReporteId = null;
    this.isSubmitting = false;

    if (this.equipo) {
      this.form.servicio_anterior = this.equipo.servicio?.nombres || '';
      this.form.ubicacion_anterior = this.equipo.ubicacion || '';
      const decoded = getDecodedAccessToken();
      if (decoded) {
        this.form.realizado_por = `${decoded.nombres || ''} ${decoded.apellidos || ''}`.trim();
        this.form.id_sysusuario_fk = decoded.id;
      }
    }
  }

  close() {
    this.closed.emit();
  }

  async onSubmit() {
    if (!this.equipo?.id_sysequipo) return;

    this.isSubmitting = true;
    this.form.id_sysequipo_fk = this.equipo.id_sysequipo;

    this.reporteService.create(this.form).subscribe({
      next: (res) => {
        if (res.success) {
          this.savedReporteId = res.data?.id_sysreporte ?? null;
          Swal.fire({
            icon: 'success',
            title: 'Reporte guardado',
            text: 'El reporte de entrega fue registrado exitosamente.',
            confirmButtonColor: '#1a5f7a'
          });
          this.saved.emit();
        } else {
          Swal.fire('Error', res.message || 'No se pudo guardar el reporte.', 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('createReporte:', err);
        Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  async descargarPdf() {
    if (!this.savedReporteId) return;
    this.isDownloadingPdf = true;
    try {
      const blob = await this.reporteService.descargarPdfReporte(this.savedReporteId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReporteEntrega_${this.savedReporteId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
    } finally {
      this.isDownloadingPdf = false;
    }
  }
}
