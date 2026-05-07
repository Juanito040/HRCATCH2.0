import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { SysmantenimientoService, SysMantenimiento } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { ArchivosService } from '../../../Services/appServices/general/archivos/archivos.service';
import Swal from 'sweetalert2';
import { extractError } from '../../../utils/error-utils';

@Component({
  selector: 'app-historico-mantenimientos-equipo',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, DialogModule,
    TagModule, CardModule, IconFieldModule, InputIconModule, InputTextModule
  ],
  templateUrl: './historico-mantenimientos-equipo.component.html',
  styleUrls: ['./historico-mantenimientos-equipo.component.css']
})
export class HistoricoMantenimientosEquipoComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private mantenimientoService = inject(SysmantenimientoService);
  private equiposService = inject(SysequiposService);
  private archivosService = inject(ArchivosService);

  equipo: any = null;
  mantenimientos: SysMantenimiento[] = [];
  isLoading = false;
  error: string | null = null;

  modalDetalle = false;
  reporteSeleccionado: SysMantenimiento | null = null;

  async ngOnInit() {
    const equipoId = this.route.snapshot.paramMap.get('equipoId');
    if (!equipoId) return;

    this.isLoading = true;
    try {
      const res = await this.equiposService.getEquipoById(equipoId);
      this.equipo = (res as any)?.data ?? res;
    } catch {
      this.error = 'No se pudo cargar la información del equipo.';
      this.isLoading = false;
      return;
    }

    this.mantenimientoService.getByEquipo(Number(equipoId)).subscribe({
      next: (data) => {
        const raw = Array.isArray(data) ? data : (data as any)?.data ?? [];
        this.mantenimientos = raw.sort((a: SysMantenimiento, b: SysMantenimiento) => {
          const da = a.fechaRealizado || a.createdAt || '';
          const db = b.fechaRealizado || b.createdAt || '';
          return new Date(db).getTime() - new Date(da).getTime();
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el histórico de mantenimientos.';
        this.isLoading = false;
      }
    });
  }

  verDetalle(m: SysMantenimiento) {
    this.reporteSeleccionado = m;
    this.modalDetalle = true;
  }

  async verPdf(rutaPdf: string) {
    try {
      const blob = await this.archivosService.getArchivo(rutaPdf);
      if (blob.type === 'application/pdf') {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        Swal.fire('Error', 'El archivo descargado no es un PDF válido.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', extractError(err, 'cargar el archivo de mantenimiento'), 'error');
    }
  }

  async generarPdf(m: SysMantenimiento) {
    if (!m.id) return;
    try {
      const blob = await this.mantenimientoService.descargarPdf(m.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mantenimiento_${String(m.id).padStart(4, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', extractError(err, 'generar el PDF del historial de mantenimiento'), 'error');
    }
  }

  onGlobalFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(val, 'contains');
  }

  getTipoSeverity(tipo: string | undefined): 'success' | 'danger' | 'info' | 'secondary' | 'warn' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'secondary'> = {
      'Preventivo': 'success',
      'Correctivo':  'danger',
      'Predictivo':  'info',
      'Otro':        'secondary'
    };
    return map[tipo ?? ''] ?? 'secondary';
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return fecha; }
  }

  getNombreTecnico(m: SysMantenimiento): string {
    if (!m.usuario) return 'Sin asignar';
    return `${m.usuario.nombres ?? ''} ${m.usuario.apellidos ?? ''}`.trim() || 'Técnico';
  }

  getFechaProgramada(m: SysMantenimiento): string {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const mes = m.mesProgramado ? (meses[m.mesProgramado - 1] ?? '—') : '—';
    const anio = (m as any).añoProgramado;
    return anio ? `${mes} ${anio}` : mes;
  }

  volver() {
    this.location.back();
  }
}
