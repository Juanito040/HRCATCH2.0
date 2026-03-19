import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysRepuestosService, SysRepuesto } from '../../../Services/appServices/sistemasServices/sysrepuestos/sysrepuestos.service';
import { SysTipoRepuestosService, SysTipoRepuesto } from '../../../Services/appServices/sistemasServices/systiporepuestos/systiporepuestos.service';
import { getDecodedAccessToken } from '../../../utilidades';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sis-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css']
})
export class SisRepuestosComponent implements OnInit {

  // ─── Datos ────────────────────────────────────────────────
  repuestos: SysRepuesto[] = [];
  filteredRepuestos: SysRepuesto[] = [];
  tipos: SysTipoRepuesto[] = [];

  // ─── Estado UI ────────────────────────────────────────────
  isLoading = false;
  error: string | null = null;
  searchTerm = '';
  tabActual: 'repuestos' | 'tipos' = 'repuestos';

  // ─── Modal Repuesto ───────────────────────────────────────
  isRepuestoModalOpen = false;
  isEditMode = false;
  isSaving = false;
  selectedRepuesto: SysRepuesto | null = null;
  formRepuesto: Partial<SysRepuesto> = {};

  // ─── Modal Tipo ───────────────────────────────────────────
  isTipoModalOpen = false;
  isTipoEditMode = false;
  selectedTipo: SysTipoRepuesto | null = null;
  formTipo: Partial<SysTipoRepuesto> = {};

  // ─── Paginación ───────────────────────────────────────────
  readonly pageSize = 12;
  currentPage = 1;
  totalPages = 1;
  pagedRepuestos: SysRepuesto[] = [];

  private repuestosService = inject(SysRepuestosService);
  private tiposService = inject(SysTipoRepuestosService);

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN' || decoded?.rol === 'AG';
  }

  ngOnInit(): void {
    this.loadRepuestos();
    this.loadTipos();
  }

  // ─── Carga de datos ───────────────────────────────────────

  loadRepuestos(): void {
    this.isLoading = true;
    this.error = null;
    this.repuestosService.getRepuestos().subscribe({
      next: (res) => {
        if (res.success) {
          this.repuestos = Array.isArray(res.data) ? res.data : [res.data];
          this.applyFilters();
        } else {
          this.error = res.message || 'Error al cargar repuestos';
          this.repuestos = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor. Verifica que el backend esté activo.';
        this.repuestos = [];
        this.isLoading = false;
      }
    });
  }

  loadTipos(): void {
    this.tiposService.getTipos().subscribe({
      next: (res) => {
        if (res.success) this.tipos = Array.isArray(res.data) ? res.data : [res.data];
      },
      error: () => { this.tipos = []; }
    });
  }

  // ─── Filtros y paginación ─────────────────────────────────

  applyFilters(): void {
    let filtered = this.repuestos;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.nombre?.toLowerCase().includes(term) ||
        r.numero_parte?.toLowerCase().includes(term) ||
        r.numero_serie?.toLowerCase().includes(term) ||
        r.proveedor?.toLowerCase().includes(term) ||
        r.tipoRepuesto?.nombre?.toLowerCase().includes(term)
      );
    }
    this.filteredRepuestos = filtered;
    this.currentPage = 1;
    this.updatePage();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  updatePage(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredRepuestos.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRepuestos = this.filteredRepuestos.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  getPagesArray(): number[] {
    const delta = 2;
    const pages: number[] = [];
    const left = Math.max(1, this.currentPage - delta);
    const right = Math.min(this.totalPages, this.currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  // ─── Modal Repuesto ───────────────────────────────────────

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRepuesto = null;
    this.formRepuesto = { cantidad_stock: 0, is_active: true };
    this.isRepuestoModalOpen = true;
  }

  openEditModal(repuesto: SysRepuesto): void {
    this.isEditMode = true;
    this.selectedRepuesto = repuesto;
    this.formRepuesto = { ...repuesto };
    this.isRepuestoModalOpen = true;
  }

  closeRepuestoModal(): void {
    this.isRepuestoModalOpen = false;
    this.selectedRepuesto = null;
    this.formRepuesto = {};
  }

  guardarRepuesto(): void {
    if (!this.formRepuesto.nombre?.trim()) {
      Swal.fire('Atención', 'El nombre del repuesto es obligatorio', 'warning');
      return;
    }
    this.isSaving = true;

    const obs = this.isEditMode && this.selectedRepuesto?.id_sysrepuesto
      ? this.repuestosService.updateRepuesto(this.selectedRepuesto.id_sysrepuesto, this.formRepuesto)
      : this.repuestosService.createRepuesto(this.formRepuesto);

    obs.subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          Swal.fire({ icon: 'success', title: this.isEditMode ? '¡Actualizado!' : '¡Creado!', text: res.message, timer: 2000, showConfirmButton: false });
          this.closeRepuestoModal();
          this.loadRepuestos();
        } else {
          Swal.fire('Error', res.message || 'No se pudo guardar el repuesto', 'error');
        }
      },
      error: () => {
        this.isSaving = false;
        Swal.fire('Error', 'Error al conectar con el servidor', 'error');
      }
    });
  }

  // ─── Toggle activo/inactivo ───────────────────────────────

  toggleRepuesto(repuesto: SysRepuesto): void {
    const accion = repuesto.is_active ? 'desactivar' : 'activar';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} repuesto?`,
      text: `El repuesto "${repuesto.nombre}" será ${accion === 'activar' ? 'activado' : 'desactivado'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed && repuesto.id_sysrepuesto) {
        this.repuestosService.toggleActivo(repuesto.id_sysrepuesto).subscribe({
          next: (res) => {
            if (res.success) {
              const estado = repuesto.is_active ? 'desactivado' : 'activado';
              Swal.fire({ icon: 'success', title: `Repuesto ${estado}`, timer: 1500, showConfirmButton: false });
              this.loadRepuestos();
            }
          },
          error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
        });
      }
    });
  }

  // ─── Modal Tipo ───────────────────────────────────────────

  openCreateTipoModal(): void {
    this.isTipoEditMode = false;
    this.selectedTipo = null;
    this.formTipo = {};
    this.isTipoModalOpen = true;
  }

  openEditTipoModal(tipo: SysTipoRepuesto): void {
    this.isTipoEditMode = true;
    this.selectedTipo = tipo;
    this.formTipo = { ...tipo };
    this.isTipoModalOpen = true;
  }

  closeTipoModal(): void {
    this.isTipoModalOpen = false;
    this.selectedTipo = null;
    this.formTipo = {};
  }

  guardarTipo(): void {
    if (!this.formTipo.nombre?.trim()) {
      Swal.fire('Atención', 'El nombre del tipo es obligatorio', 'warning');
      return;
    }
    const obs = this.isTipoEditMode && this.selectedTipo?.id_sys_tipo_repuesto
      ? this.tiposService.updateTipo(this.selectedTipo.id_sys_tipo_repuesto, this.formTipo)
      : this.tiposService.createTipo(this.formTipo);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({ icon: 'success', title: this.isTipoEditMode ? '¡Actualizado!' : '¡Tipo creado!', text: res.message, timer: 1800, showConfirmButton: false });
          this.closeTipoModal();
          this.loadTipos();
        } else {
          Swal.fire('Error', res.message || 'No se pudo guardar el tipo', 'error');
        }
      },
      error: () => Swal.fire('Error', 'Error al conectar con el servidor', 'error')
    });
  }

  toggleTipo(tipo: SysTipoRepuesto): void {
    if (!tipo.id_sys_tipo_repuesto) return;
    this.tiposService.toggleActivo(tipo.id_sys_tipo_repuesto).subscribe({
      next: (res) => {
        if (res.success) {
          const estado = tipo.is_active ? 'desactivado' : 'activado';
          Swal.fire({ icon: 'success', title: `Tipo ${estado}`, timer: 1200, showConfirmButton: false });
          this.loadTipos();
        }
      },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado del tipo', 'error')
    });
  }

  // ─── Helpers ViEW ─────────────────────────────────────────

  getTipoNombre(id?: number): string {
    if (!id) return '—';
    const tipo = this.tipos.find(t => t.id_sys_tipo_repuesto === id);
    return tipo?.nombre || '—';
  }

  setTab(tab: 'repuestos' | 'tipos'): void {
    this.tabActual = tab;
  }
}
