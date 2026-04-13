import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SysReporteService, SysReporte } from '../../../Services/appServices/sistemasServices/sysreporte/sysreporte.service';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { getDecodedAccessToken } from '../../../utilidades';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sys-reporte-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sys-reporte-form.component.html',
  styleUrls: ['./sys-reporte-form.component.css']
})
export class SysReporteFormComponent implements OnInit {

  equipo: any = null;
  origenRuta: string = '/adminsistemas/equipos';

  isSubmitting = false;
  isDownloadingPdf = false;
  savedReporteId: number | null = null;

  servicios: any[] = [];
  equiposList: any[] = [];
  equipoRetirado: string = '';

  form: SysReporte = this.emptyForm();

  constructor(
    private router: Router,
    private reporteService: SysReporteService,
    private servicioService: ServicioService,
    private sysequiposService: SysequiposService
  ) {}

  ngOnInit() {
    const raw = sessionStorage.getItem('equipoParaReporte');
    if (raw) {
      this.equipo = JSON.parse(raw);
    }
    this.origenRuta = sessionStorage.getItem('origenReporte') || '/adminsistemas/equipos';
    this.initForm();
    this.loadLookupData();
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

  private initForm() {
    this.form = this.emptyForm();
    this.savedReporteId = null;
    this.equipoRetirado = '';

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

  async loadLookupData() {
    try {
      const data = await this.servicioService.getAllServicios();
      this.servicios = Array.isArray(data) ? data : [];
    } catch { this.servicios = []; }

    this.sysequiposService.getEquipos({}).subscribe({
      next: (res) => { this.equiposList = res.success && Array.isArray(res.data) ? res.data : []; },
      error: () => { this.equiposList = []; }
    });
  }

  volver() {
    sessionStorage.removeItem('equipoParaReporte');
    sessionStorage.removeItem('origenReporte');
    this.router.navigate([this.origenRuta]);
  }

  nuevoReporte() {
    this.savedReporteId = null;
    this.initForm();
  }

  async onSubmit() {
    if (!this.equipo?.id_sysequipo) return;

    this.isSubmitting = true;
    this.form.id_sysequipo_fk = this.equipo.id_sysequipo;

    if (this.equipoRetirado) {
      const prefijo = `[Equipo que se retira: ${this.equipoRetirado}]`;
      this.form.observaciones = this.form.observaciones
        ? `${prefijo}\n${this.form.observaciones}`
        : prefijo;
    }

    this.reporteService.create(this.form).subscribe({
      next: (res) => {
        if (res.success) {
          this.savedReporteId = res.data?.id_sysreporte ?? null;
          Swal.fire({
            icon: 'success',
            title: 'Reporte guardado',
            text: 'El reporte de entrega fue registrado exitosamente.',
            confirmButtonColor: '#1a5f7a',
            showConfirmButton: true
          });
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
    } catch {
      Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
    } finally {
      this.isDownloadingPdf = false;
    }
  }
}
