import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysmantenimientoService, SysMantenimiento, CatalogoItem } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import Swal from 'sweetalert2';

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
  equipos: SysEquipo[] = [];
  tiposMantenimiento: CatalogoItem[] = [];
  tiposFalla: CatalogoItem[] = [];

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

  // Modal
  isModalOpen = false;
  isEditing = false;
  selectedMantenimiento: SysMantenimiento | null = null;
  formData: Partial<SysMantenimiento> = {};

  constructor(
    private mantenimientoService: SysmantenimientoService,
    private sysequiposService: SysequiposService
  ) {}

  ngOnInit() {
    this.loadCatalogos();
    this.loadMantenimientos();
    this.loadEquipos();
  }

  loadCatalogos() {
    this.mantenimientoService.getTiposMantenimiento().subscribe({
      next: (res) => { if (res.success) this.tiposMantenimiento = res.data; }
    });
    this.mantenimientoService.getTiposFalla().subscribe({
      next: (res) => { if (res.success) this.tiposFalla = res.data; }
    });
  }

  loadEquipos() {
    this.sysequiposService.getEquipos({ activo: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.equipos = Array.isArray(res.data) ? res.data : [res.data];
        }
      }
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

  openCreateModal() {
    this.isEditing = false;
    this.selectedMantenimiento = null;
    this.formData = { fecha: new Date().toISOString().split('T')[0] };
    this.isModalOpen = true;
  }

  openEditModal(m: SysMantenimiento) {
    this.isEditing = true;
    this.selectedMantenimiento = m;
    this.formData = { ...m };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedMantenimiento = null;
    this.formData = {};
  }

  saveMantenimiento() {
    if (!this.formData.id_sysequipo_fk) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Debe seleccionar un equipo' });
      return;
    }

    if (this.isEditing && this.selectedMantenimiento?.id_sysmtto) {
      this.mantenimientoService.update(this.selectedMantenimiento.id_sysmtto, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Mantenimiento actualizado exitosamente', timer: 2000, showConfirmButton: false });
            this.closeModal();
            this.loadMantenimientos();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'Error al actualizar' });
          }
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Error al conectar con el servidor' })
      });
    } else {
      this.mantenimientoService.create(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire({ icon: 'success', title: 'Creado', text: 'Mantenimiento registrado exitosamente', timer: 2000, showConfirmButton: false });
            this.closeModal();
            this.loadMantenimientos();
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: res.message || 'Error al crear' });
          }
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Error al conectar con el servidor' })
      });
    }
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
