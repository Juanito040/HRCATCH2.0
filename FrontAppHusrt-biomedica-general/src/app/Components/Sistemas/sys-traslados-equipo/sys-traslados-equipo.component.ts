import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';

@Component({
  selector: 'app-sys-traslados-equipo',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './sys-traslados-equipo.component.html',
  styleUrls: ['./sys-traslados-equipo.component.css']
})
export class SysTrasladosEquipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private equiposService = inject(SysequiposService);

  equipo: any = null;
  traslados: any[] = [];
  isLoading = false;
  error: string | null = null;
  filtroTipo: 'TODOS' | 'BODEGA' | 'REACTIVACION' = 'TODOS';

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

    try {
      const res = await this.equiposService.getTraslados(Number(equipoId));
      this.traslados = (res?.data ?? []).sort((a: any, b: any) =>
        new Date(b.fecha ?? b.createdAt).getTime() - new Date(a.fecha ?? a.createdAt).getTime()
      );
    } catch {
      this.error = 'No se pudo cargar el registro de traslados.';
    }
    this.isLoading = false;
  }

  get trasladosFiltrados(): any[] {
    if (this.filtroTipo === 'TODOS') return this.traslados;
    return this.traslados.filter(t => t.tipo === this.filtroTipo);
  }

  contarPorTipo(tipo: string): number {
    return this.traslados.filter(t => t.tipo === tipo).length;
  }

  setFiltro(tipo: 'TODOS' | 'BODEGA' | 'REACTIVACION') {
    this.filtroTipo = tipo;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  getNombreUsuario(t: any): string {
    if (!t.usuario) return 'Sistema';
    return `${t.usuario.nombres ?? ''} ${t.usuario.apellidos ?? ''}`.trim() || 'Usuario';
  }
}
