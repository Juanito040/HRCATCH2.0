import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SysRepuestosService, SysRepuesto } from '../../../Services/appServices/sistemasServices/sysrepuestos/sysrepuestos.service';
import { SysTipoRepuestosService, SysTipoRepuesto } from '../../../Services/appServices/sistemasServices/systiporepuestos/systiporepuestos.service';
import { SysAuditoriaRepuestoService, SysAuditoriaRepuesto } from '../../../Services/appServices/sistemasServices/sysauditoriarepuesto/sysauditoriarepuesto.service';
import { getDecodedAccessToken } from '../../../utilidades';
import Swal from 'sweetalert2';

const ROLES_PERMITIDOS = ['SUPERADMIN', 'ADMINISTRADOR', 'AG'];

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
  filteredTiposGrid: SysTipoRepuesto[] = [];
  auditoria: SysAuditoriaRepuesto[] = [];
  filteredAuditoria: SysAuditoriaRepuesto[] = [];

  // ─── Estado UI ────────────────────────────────────────────
  isLoading = false;
  isLoadingAudit = false;
  error: string | null = null;
  searchTerm = '';
  searchTipos = '';
  searchInactivosRepuestos = '';
  searchInactivosTipos = '';
  searchAuditRepuestos = '';
  searchAuditTipos = '';
  tabActual: 'repuestos' | 'inactivos' | 'tipos' | 'registros' = 'repuestos';

  // ─── Modal Repuesto ───────────────────────────────────────
  isRepuestoModalOpen = false;
  isEditMode = false;
  isSaving = false;
  selectedRepuesto: SysRepuesto | null = null;
  formRepuesto: Partial<SysRepuesto> & { observacion?: string } = {};

  // ─── Modal Tipo ───────────────────────────────────────────
  isTipoModalOpen = false;
  isTipoEditMode = false;
  selectedTipo: SysTipoRepuesto | null = null;
  formTipo: Partial<SysTipoRepuesto> & { observacion?: string } = {};

  // ─── Paginación Repuestos ─────────────────────────────────
  readonly pageSize = 12;
  currentPage = 1;
  totalPages = 1;
  pagedRepuestos: SysRepuesto[] = [];

  // ─── Paginación Repuestos Inactivos ───────────────────────
  inactivosCurrentPage = 1;
  inactivosTotalPages = 1;
  pagedInactivosRepuestos: SysRepuesto[] = [];

  // ─── Paginación Registro Cambios (Repuestos) ──────────────
  auditPageRepuestos = 1;
  auditTotalPagesRepuestos = 1;
  pagedAuditoriaRepuestos: SysAuditoriaRepuesto[] = [];

  // ─── Paginación Registro Cambios (Tipos) ──────────────────
  auditPageTipos = 1;
  auditTotalPagesTipos = 1;
  pagedAuditoriaTipos: SysAuditoriaRepuesto[] = [];

  private repuestosService = inject(SysRepuestosService);
  private tiposService = inject(SysTipoRepuestosService);
  private auditoriaService = inject(SysAuditoriaRepuestoService);

  // ─── Permisos ─────────────────────────────────────────────
  get hasAccess(): boolean {
    const decoded = getDecodedAccessToken();
    return ROLES_PERMITIDOS.includes(decoded?.rol);
  }

  get isAdmin(): boolean {
    return this.hasAccess;
  }

  // ─── Tipos Computados ─────────────────────────────────────
  get activosTipos(): SysTipoRepuesto[] {
    return this.tipos.filter(t => t.is_active === true || (t.is_active as any) === 1);
  }

  get inactivosTipos(): SysTipoRepuesto[] {
    let list = this.tipos.filter(t => t.is_active === false || (t.is_active as any) === 0);
    if (this.searchInactivosTipos) {
      const term = this.searchInactivosTipos.toLowerCase();
      list = list.filter(t => 
        t.nombre.toLowerCase().includes(term) || 
        t.descripcion?.toLowerCase().includes(term) ||
        t.usuario_inactivacion?.toLowerCase().includes(term)
      );
    }
    return list;
  }

  // ─── Inicialización ───────────────────────────────────────
  ngOnInit(): void {
    this.loadRepuestos();
    this.loadTipos();
    this.loadAuditoria();
  }

  // ─── Carga de datos ───────────────────────────────────────

  loadRepuestos(): void {
    this.isLoading = true;
    this.error = null;
    this.repuestosService.getRepuestos().subscribe({
      next: (res) => {
        if (res.success) {
          this.repuestos = Array.isArray(res.data) ? res.data : [res.data];
        } else {
          this.error = res.message || 'Error al cargar repuestos';
          this.repuestos = [];
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor. Verifica que el backend esté activo.';
        this.repuestos = [];
        this.applyFilters();
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

  loadAuditoria(): void {
    this.isLoadingAudit = true;
    this.auditoriaService.getHistorial().subscribe({
      next: (res) => {
        const data = res.success ? res.data : [];
        this.auditoria = data;
        this.applyAuditFilter();
        this.isLoadingAudit = false;
      },
      error: () => {
        this.auditoria = [];
        this.applyAuditFilter();
        this.isLoadingAudit = false;
      }
    });
  }

  // ─── Filtros y paginación Repuestos ───────────────────────

  applyFilters(): void {
    // 1. Repuestos Activos
    let activeR = this.repuestos.filter(r => r.is_active === true || (r.is_active as any) === 1);
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      activeR = activeR.filter(r =>
        r.nombre?.toLowerCase().includes(term) ||
        r.numero_parte?.toLowerCase().includes(term) ||
        r.numero_serie?.toLowerCase().includes(term) ||
        r.proveedor?.toLowerCase().includes(term) ||
        r.tipoRepuesto?.nombre?.toLowerCase().includes(term)
      );
    }
    this.filteredRepuestos = activeR;

    // 2. Repuestos Inactivos
    let inactiveR = this.repuestos.filter(r => r.is_active === false || (r.is_active as any) === 0);
    if (this.searchInactivosRepuestos.trim()) {
      const term = this.searchInactivosRepuestos.toLowerCase();
      inactiveR = inactiveR.filter(r =>
        r.nombre?.toLowerCase().includes(term) ||
        r.numero_parte?.toLowerCase().includes(term) ||
        r.usuario_inactivacion?.toLowerCase().includes(term)
      );
    }
    this.filteredInactivosRepuestos = inactiveR;
    this.inactivosCurrentPage = 1;
    this.updateInactivosPage();

    // 3. Tipos Activos
    this.applyTiposFilter();

    this.currentPage = 1;
    this.updatePage();
  }

  filteredInactivosRepuestos: SysRepuesto[] = [];

  onSearchInactivosRepuestos(event: Event): void {
    this.searchInactivosRepuestos = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onSearchInactivosTipos(event: Event): void {
    this.searchInactivosTipos = (event.target as HTMLInputElement).value;
    // El getter inactivosTipos ya usa searchInactivosTipos, así que solo notificamos el cambio si fuera necesario
    // pero como es un getter, se actualiza solo en el template.
  }

  onSearchTipos(event: Event): void {
    this.searchTipos = (event.target as HTMLInputElement).value;
    this.applyTiposFilter();
  }

  applyTiposFilter(): void {
    let list = this.activosTipos;
    if (this.searchTipos.trim()) {
      const term = this.searchTipos.toLowerCase();
      list = list.filter(t => 
        t.nombre.toLowerCase().includes(term) || 
        t.descripcion?.toLowerCase().includes(term)
      );
    }
    this.filteredTiposGrid = list;
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

  updateInactivosPage(): void {
    this.inactivosTotalPages = Math.max(1, Math.ceil(this.filteredInactivosRepuestos.length / this.pageSize));
    if (this.inactivosCurrentPage > this.inactivosTotalPages) this.inactivosCurrentPage = this.inactivosTotalPages;
    const start = (this.inactivosCurrentPage - 1) * this.pageSize;
    this.pagedInactivosRepuestos = this.filteredInactivosRepuestos.slice(start, start + this.pageSize);
  }

  goToInactivosPage(page: number): void {
    if (page < 1 || page > this.inactivosTotalPages) return;
    this.inactivosCurrentPage = page;
    this.updateInactivosPage();
  }

  getInactivosPagesArray(): number[] {
    const delta = 2;
    const pages: number[] = [];
    const left = Math.max(1, this.inactivosCurrentPage - delta);
    const right = Math.min(this.inactivosTotalPages, this.inactivosCurrentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  // ─── Filtros y paginación Auditoría ───────────────────────

  applyAuditFilter(): void {
    const repuestosFiltered = this.auditoria.filter(a => a.tabla_origen === 'SysRepuesto' && this.matchesAuditSearch(a, 'repuestos'));
    const tiposFiltered = this.auditoria.filter(a => a.tabla_origen === 'SysTipoRepuesto' && this.matchesAuditSearch(a, 'tipos'));

    // Repuestos
    this.auditPageRepuestos = 1;
    this.auditTotalPagesRepuestos = Math.max(1, Math.ceil(repuestosFiltered.length / this.pageSize));
    this.pagedAuditoriaRepuestos = repuestosFiltered.slice(0, this.pageSize);

    // Tipos
    this.auditPageTipos = 1;
    this.auditTotalPagesTipos = Math.max(1, Math.ceil(tiposFiltered.length / this.pageSize));
    this.pagedAuditoriaTipos = tiposFiltered.slice(0, this.pageSize);
  }

  goToAuditPageRepuestos(page: number): void {
    if (page < 1 || page > this.auditTotalPagesRepuestos) return;
    this.auditPageRepuestos = page;
    const repuestosFiltered = this.auditoria.filter(a => a.tabla_origen === 'SysRepuesto' && this.matchesAuditSearch(a, 'repuestos'));
    const start = (page - 1) * this.pageSize;
    this.pagedAuditoriaRepuestos = repuestosFiltered.slice(start, start + this.pageSize);
  }

  goToAuditPageTipos(page: number): void {
    if (page < 1 || page > this.auditTotalPagesTipos) return;
    this.auditPageTipos = page;
    const tiposFiltered = this.auditoria.filter(a => a.tabla_origen === 'SysTipoRepuesto' && this.matchesAuditSearch(a, 'tipos'));
    const start = (page - 1) * this.pageSize;
    this.pagedAuditoriaTipos = tiposFiltered.slice(start, start + this.pageSize);
  }

  getAuditPagesArray(totalPages: number, currentPage: number): number[] {
    const delta = 2;
    const pages: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  }

  matchesAuditSearch(a: SysAuditoriaRepuesto, type: 'repuestos' | 'tipos'): boolean {
    const term = type === 'repuestos' ? this.searchAuditRepuestos : this.searchAuditTipos;
    if (!term.trim()) return true;
    const t = term.toLowerCase();
    return !!(
      a.usuario?.toLowerCase().includes(t) ||
      a.accion?.toLowerCase().includes(t) ||
      a.observacion?.toLowerCase().includes(t) ||
      a.nombre_item?.toLowerCase().includes(t)
    );
  }

  onSearchAuditRepuestos(event: Event): void {
    this.searchAuditRepuestos = (event.target as HTMLInputElement).value;
    this.applyAuditFilter();
  }

  onSearchAuditTipos(event: Event): void {
    this.searchAuditTipos = (event.target as HTMLInputElement).value;
    this.applyAuditFilter();
  }

  // ─── Modal Repuesto ───────────────────────────────────────

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRepuesto = null;
    this.formRepuesto = { cantidad_stock: 0, is_active: true, observacion: '' };
    this.isRepuestoModalOpen = true;
  }

  openEditModal(repuesto: SysRepuesto): void {
    this.isEditMode = true;
    this.selectedRepuesto = repuesto;
    this.formRepuesto = { ...repuesto, observacion: '' };
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
    if (this.isEditMode && !this.formRepuesto.observacion?.trim()) {
      Swal.fire('Atención', 'Debe ingresar una observación / motivo del cambio al editar', 'warning');
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

  // ─── Toggle Repuesto Activo/Inactivo ──────────────────────

  toggleRepuesto(repuesto: SysRepuesto): void {
    const accion = repuesto.is_active ? 'dar de baja al' : 'restaurar el';
    const verbo = repuesto.is_active ? 'Dar de baja' : 'Restaurar';
    Swal.fire({
      title: `¿${verbo} repuesto?`,
      html: `
        <div style="text-align:left;">
          <p style="color:#4b5563; font-size:0.95rem; margin-bottom:1rem;">El repuesto <strong>"${repuesto.nombre}"</strong> será ${repuesto.is_active ? 'dado de baja' : 'restaurado'}.</p>
          <label style="display:block; font-size:0.9rem; font-weight:600; color:var(--primary-color,#6366f1); margin-bottom:0.5rem;">
            <i class="pi pi-info-circle"></i> Motivo del cambio *
          </label>
          <textarea id="swal-observacion" class="swal2-textarea" placeholder="Escriba aquí el motivo (requerido)..." style="margin:0; width:100%; box-sizing:border-box; min-height:80px; border-radius:8px; border:1px solid #d1d5db; padding:0.75rem; font-size:0.95rem;"></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${verbo.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const obs = (document.getElementById('swal-observacion') as HTMLTextAreaElement)?.value?.trim();
        if (!obs) {
          Swal.showValidationMessage('La observación es obligatoria');
          return false;
        }
        return obs;
      }
    }).then(result => {
      if (result.isConfirmed && repuesto.id_sysrepuesto) {
        this.repuestosService.toggleActivo(repuesto.id_sysrepuesto, result.value as string).subscribe({
          next: (res) => {
            if (res.success) {
              const estado = repuesto.is_active ? 'dado de baja' : 'restaurado';
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
    this.formTipo = { observacion: '' };
    this.isTipoModalOpen = true;
  }

  openEditTipoModal(tipo: SysTipoRepuesto): void {
    this.isTipoEditMode = true;
    this.selectedTipo = tipo;
    this.formTipo = { ...tipo, observacion: '' };
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
    if (this.isTipoEditMode && !this.formTipo.observacion?.trim()) {
      Swal.fire('Atención', 'Debe ingresar una observación / motivo del cambio al editar', 'warning');
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

  // ─── Toggle Tipo Activo/Inactivo ──────────────────────────

  toggleTipo(tipo: SysTipoRepuesto): void {
    const verbo = tipo.is_active ? 'Inactivar' : 'Activar';
    Swal.fire({
      title: `¿${verbo} tipo de repuesto?`,
      html: `
        <div style="text-align:left;">
          <p style="color:#4b5563; font-size:0.95rem; margin-bottom:1rem;">El tipo <strong>"${tipo.nombre}"</strong> será ${tipo.is_active ? 'inactivado' : 'activado'}.</p>
          <label style="display:block; font-size:0.9rem; font-weight:600; color:var(--primary-color,#6366f1); margin-bottom:0.5rem;">
            <i class="pi pi-info-circle"></i> Motivo del cambio *
          </label>
          <textarea id="swal-observacion-tipo" class="swal2-textarea" placeholder="Escriba aquí el motivo (requerido)..." style="margin:0; width:100%; box-sizing:border-box; min-height:80px; border-radius:8px; border:1px solid #d1d5db; padding:0.75rem; font-size:0.95rem;"></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${verbo.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const obs = (document.getElementById('swal-observacion-tipo') as HTMLTextAreaElement)?.value?.trim();
        if (!obs) {
          Swal.showValidationMessage('La observación es obligatoria');
          return false;
        }
        return obs;
      }
    }).then(result => {
      if (result.isConfirmed && tipo.id_sys_tipo_repuesto) {
        this.tiposService.toggleActivo(tipo.id_sys_tipo_repuesto, result.value as string).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({ icon: 'success', title: `Tipo ${tipo.is_active ? 'inactivado' : 'activado'}`, timer: 1500, showConfirmButton: false });
              this.loadTipos();
            }
          },
          error: () => Swal.fire('Error', 'No se pudo cambiar el estado del tipo', 'error')
        });
      }
    });
  }

  // ─── Tab/navegación ───────────────────────────────────────

  setTab(tab: 'repuestos' | 'inactivos' | 'tipos' | 'registros'): void {
    this.tabActual = tab;
    if (tab === 'repuestos' || tab === 'inactivos') {
      this.searchTerm = '';
      this.applyFilters();
    }
    if (tab === 'registros' && this.auditoria.length === 0) {
      this.loadAuditoria();
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  getTipoNombre(id?: number): string {
    if (!id) return '—';
    const tipo = this.tipos.find(t => t.id_sys_tipo_repuesto === id);
    return tipo?.nombre || '—';
  }

  getAccionLabel(accion: string): string {
    const map: Record<string, string> = {
      creacion: 'Creación',
      edicion: 'Edición',
      activacion: 'Activación',
      inactivacion: 'Inactivación'
    };
    return map[accion] || accion;
  }

  getAccionClass(accion: string): string {
    const map: Record<string, string> = {
      creacion: 'badge-info',
      edicion: 'badge-warning',
      activacion: 'badge-success',
      inactivacion: 'badge-danger'
    };
    return map[accion] || 'badge-secondary';
  }
}
