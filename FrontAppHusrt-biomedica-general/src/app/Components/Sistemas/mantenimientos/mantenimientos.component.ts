import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysmantenimientoService, SysMantenimiento, CatalogoItem } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sis-mantenimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.css']
})
export class SisMantenimientosComponent implements OnInit {

  mantenimientos: SysMantenimiento[] = [];
  filteredMantenimientos: SysMantenimiento[] = [];
  tiposMantenimiento: CatalogoItem[] = [];
  tiposFalla: CatalogoItem[] = [];
  router = inject(Router);

  isLoading = false;
  error: string | null = null;

  searchTerm = '';
  filterTipo: number | '' = '';
  filterFechaInicio = '';
  filterFechaFin = '';

  // Dashboard
  dashboardData: any = null;
  isDashboardLoading = false;
  activeView: 'list' | 'dashboard' = 'list';

  constructor(
    private route: ActivatedRoute,
    private mantenimientoService: SysmantenimientoService,
    private sysequiposService: SysequiposService
  ) { }

  async ngOnInit() {
    this.loadCatalogos();
    this.loadMantenimientos();
  }

  /**
   * Navega al formulario reporte-mantenimiento para editar.
   * Mismo patrón que biomedica: guarda TipoMantenimiento e idMantenimiento en sessionStorage.
   */
  editarMantenimiento(idSysEquipo: number, idMantenimiento: number, tipoMantenimiento: string) {
    let tipo = 'P';
    if (tipoMantenimiento === 'Correctivo') tipo = 'C';
    else if (tipoMantenimiento === 'Preventivo') tipo = 'P';
    else if (tipoMantenimiento === 'Predictivo') tipo = 'PD';

    sessionStorage.setItem('TipoMantenimiento', tipo);
    sessionStorage.setItem('idMantenimiento', idMantenimiento.toString());
    this.router.navigate(['adminsistemas/reporteMantenimiento', idSysEquipo]);
  }

  loadCatalogos() {
    this.mantenimientoService.getTiposMantenimiento().subscribe({
      next: (res) => { if (res.success) this.tiposMantenimiento = res.data; }
    });
    this.mantenimientoService.getTiposFalla().subscribe({
      next: (res) => { if (res.success) this.tiposFalla = res.data; }
    });
  }

  loadMantenimientos() {
    this.isLoading = true;
    this.error = null;
    const filters: any = {};
    if (this.filterTipo) filters.tipo_mantenimiento = this.filterTipo;
    if (this.filterFechaInicio) filters.fecha_inicio = this.filterFechaInicio;
    if (this.filterFechaFin) filters.fecha_fin = this.filterFechaFin;

    this.mantenimientoService.getAll(filters).subscribe({
      next: (res) => {
        if (res.success) {
          this.mantenimientos = Array.isArray(res.data) ? res.data : [res.data];
          this.applySearch();
        } else {
          this.error = res.message || 'Error al cargar mantenimientos';
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor';
        this.isLoading = false;
      }
    });
  }

  loadDashboard() {
    this.isDashboardLoading = true;
    const filters: any = {};
    if (this.filterFechaInicio) filters.fecha_inicio = this.filterFechaInicio;
    if (this.filterFechaFin) filters.fecha_fin = this.filterFechaFin;

    this.mantenimientoService.getDashboard(filters).subscribe({
      next: (res) => {
        if (res.success) this.dashboardData = res.data;
        this.isDashboardLoading = false;
      },
      error: () => { this.isDashboardLoading = false; }
    });
  }

  applySearch() {
    if (!this.searchTerm) {
      this.filteredMantenimientos = this.mantenimientos;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredMantenimientos = this.mantenimientos.filter(m =>
      m.numero_reporte?.toLowerCase().includes(term) ||
      m.autor_realizado?.toLowerCase().includes(term) ||
      m.equipo?.nombre_equipo?.toLowerCase().includes(term) ||
      m.equipo?.placa_inventario?.toLowerCase().includes(term)
    );
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applySearch();
  }

  applyFilters() {
    this.loadMantenimientos();
    if (this.activeView === 'dashboard') this.loadDashboard();
  }

  clearFilters() {
    this.filterTipo = '';
    this.filterFechaInicio = '';
    this.filterFechaFin = '';
    this.searchTerm = '';
    this.loadMantenimientos();
  }

  switchView(view: 'list' | 'dashboard') {
    this.activeView = view;
    if (view === 'dashboard' && !this.dashboardData) this.loadDashboard();
  }

  getLabelTipo(value: number | undefined): string {
    if (!value) return 'N/A';
    return this.tiposMantenimiento.find(t => t.value === value)?.label || value.toString();
  }

  getLabelFalla(value: number | undefined): string {
    if (!value) return 'N/A';
    return this.tiposFalla.find(t => t.value === value)?.label || value.toString();
  }

  getTipoBadgeClass(tipo: number | undefined): string {
    const map: Record<number, string> = { 1: 'badge-danger', 2: 'badge-success', 3: 'badge-info', 4: 'badge-secondary' };
    return `badge ${tipo ? map[tipo] || 'badge-secondary' : 'badge-secondary'}`;
  }

  getMesProgramado(mes: number | undefined): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return mes ? meses[mes - 1] : 'N/A';
  }

  confirmDelete(m: SysMantenimiento) {
    Swal.fire({
      title: '¿Eliminar mantenimiento?',
      text: `¿Está seguro de eliminar el reporte ${m.numero_reporte || '#' + m.id_sysmtto}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && m.id_sysmtto) {
        this.mantenimientoService.delete(m.id_sysmtto).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Mantenimiento eliminado exitosamente', timer: 2000, showConfirmButton: false });
              this.loadMantenimientos();
            }
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el mantenimiento' })
        });
      }
    });
  }
}