import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysTrazabilidadService, EventoTrazabilidad } from '../../../Services/appServices/sistemasServices/systrazabilidad/systrazabilidad.service';

@Component({
  selector: 'app-sys-trazabilidad-global',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trazabilidad-global.component.html',
  styleUrls: ['./trazabilidad-global.component.css']
})
export class SysTrazabilidadGlobalComponent implements OnInit {
  eventos: EventoTrazabilidad[] = [];
  filtrados: EventoTrazabilidad[] = [];
  paginados: EventoTrazabilidad[] = [];

  isLoading = false;
  error: string | null = null;

  filtroAccion = '';
  filtroBusqueda = '';
  filtroDesde = '';
  filtroHasta = '';

  readonly pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  readonly ACCIONES = ['CREACION', 'EDICION', 'BODEGA', 'BAJA', 'REACTIVACION'];

  constructor(private trazabilidadService: SysTrazabilidadService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.isLoading = true;
    this.error = null;
    this.trazabilidadService.getTrazabilidadGlobal({
      accion: this.filtroAccion || undefined,
      desde: this.filtroDesde || undefined,
      hasta: this.filtroHasta || undefined
    }).subscribe({
      next: (res) => {
        this.eventos = res.data || [];
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar la trazabilidad. Verifica que el backend esté activo.';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    const term = this.filtroBusqueda.toLowerCase();
    this.filtrados = this.eventos.filter(e => {
      if (!term) return true;
      const equipo = e.equipo;
      return (
        equipo?.nombre_equipo?.toLowerCase().includes(term) ||
        equipo?.marca?.toLowerCase().includes(term) ||
        equipo?.serie?.toLowerCase().includes(term) ||
        e.usuario?.nombres?.toLowerCase().includes(term) ||
        e.usuario?.apellidos?.toLowerCase().includes(term)
      );
    });
    this.currentPage = 1;
    this.actualizarPagina();
  }

  actualizarPagina() {
    this.totalPages = Math.max(1, Math.ceil(this.filtrados.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginados = this.filtrados.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.actualizarPagina();
  }

  getPagesArray(): number[] {
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage - delta); i <= Math.min(this.totalPages, this.currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  min(a: number, b: number) { return Math.min(a, b); }

  getEtiqueta(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'Creación', EDICION: 'Edición', BODEGA: 'Bodega', BAJA: 'Baja', REACTIVACION: 'Reactivación'
    };
    return mapa[accion] || accion;
  }

  getBadgeClase(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'badge-creacion', EDICION: 'badge-edicion', BODEGA: 'badge-bodega',
      BAJA: 'badge-baja', REACTIVACION: 'badge-reactivacion'
    };
    return mapa[accion] || 'badge-default';
  }

  getIconClase(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'fas fa-plus-circle', EDICION: 'fas fa-pencil-alt',
      BODEGA: 'fas fa-warehouse', BAJA: 'fas fa-ban', REACTIVACION: 'fas fa-power-off'
    };
    return mapa[accion] || 'fas fa-circle';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  getNombreUsuario(evento: EventoTrazabilidad): string {
    if (!evento.usuario) return 'Sistema';
    return `${evento.usuario.nombres || ''} ${evento.usuario.apellidos || ''}`.trim() || 'Usuario';
  }

  getResumenDetalles(evento: EventoTrazabilidad): string {
    if (evento.accion !== 'EDICION' || !evento.detalles) return evento.detalles || '—';
    try {
      const cambios = JSON.parse(evento.detalles);
      if (Array.isArray(cambios)) return `${cambios.length} campo(s) modificado(s)`;
    } catch { /**/ }
    return evento.detalles;
  }
}
