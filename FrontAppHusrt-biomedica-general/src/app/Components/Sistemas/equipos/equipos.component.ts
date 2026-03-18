import { Component, OnInit, ViewChild, ElementRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysEquipoDetailModalComponent } from '../equipo-detail-modal/equipo-detail-modal.component';
import { SysDeleteConfirmationDialogComponent, DeleteAction } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SysReactivarEquipoModalComponent, ReactivarEquipoData } from '../reactivar-equipo-modal/reactivar-equipo-modal.component';
import { getDecodedAccessToken } from '../../../utilidades';
import { MenuItem } from 'primeng/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sis-equipos',
  standalone: true,
  imports: [
    CommonModule,
    SysEquipoModalComponent,
    SysEquipoDetailModalComponent,
    SysDeleteConfirmationDialogComponent,
    SysReactivarEquipoModalComponent
  ],
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css']
})
export class SisEquiposComponent implements OnInit {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('estadoSelect') estadoSelectRef!: ElementRef<HTMLSelectElement>;
  @ViewChild(SysDeleteConfirmationDialogComponent) deleteDialog!: SysDeleteConfirmationDialogComponent;

  equipos: SysEquipo[] = [];
  filteredEquipos: any[] = [];
  pagedEquipos: any[] = [];
  searchTerm: string = '';
  selectedActivo: boolean | undefined = undefined;
  selectedView: 'all' | 'bodega' | 'baja' = 'all';

  readonly pageSize = 15;
  currentPage: number = 1;
  totalPages: number = 1;

  totalEquipos: number = 0;
  totalBodega: number = 0;
  totalBaja: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  isModalOpen: boolean = false;
  selectedEquipo: SysEquipo | null = null;

  isDetailModalOpen: boolean = false;
  equipoToView: SysEquipo | null = null;

  isDeleteOptionsDialogOpen: boolean = false;
  equipoToDeleteWithOptions: SysEquipo | null = null;

  isReactivarModalOpen: boolean = false;
  equipoToReactivar: SysEquipo | null = null;

  private router = inject(Router);

  constructor(private sysequiposService: SysequiposService) {}

  ngOnInit() {
    this.loadEquipos();
    this.loadCounters();
  }

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN';
  }

  loadCounters() {
    this.sysequiposService.getEquiposEnBodega().subscribe({
      next: (response) => {
        if (response.success) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.totalBodega = data.length;
        }
      },
      error: (err) => console.error('Error al cargar contador de bodega:', err)
    });

    this.sysequiposService.getEquiposDadosDeBaja().subscribe({
      next: (response) => {
        if (response.success) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.totalBaja = data.length;
        }
      },
      error: (err) => console.error('Error al cargar contador de baja:', err)
    });
  }

  loadEquipos(filters?: { activo?: boolean }) {
    this.isLoading = true;
    this.error = null;

    this.sysequiposService.getEquipos(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.totalEquipos = this.equipos.length;
          this.applyFilters();
        } else {
          this.error = response.message || 'Error al cargar los equipos';
          this.equipos = []; this.filteredEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.error = 'Error al conectar con el servidor. Por favor, verifica que el backend esté ejecutándose.';
        this.equipos = []; this.filteredEquipos = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;
    this.applyFilters();
  }

  onEstadoChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '') {
      this.selectedActivo = undefined;
      this.loadEquipos();
    } else {
      this.selectedActivo = value === '1';
      this.loadEquipos({ activo: this.selectedActivo });
    }
  }

  changeView(view: 'all' | 'bodega' | 'baja') {
    this.selectedView = view;
    this.isLoading = true;
    this.error = null;
    this.searchTerm = '';
    this.selectedActivo = undefined;
    this.resetSearchInput();
    this.resetEstadoSelect();

    if (view === 'bodega') {
      this.sysequiposService.getEquiposEnBodega().subscribe({
        next: (response) => {
          if (response.success) {
            this.equipos = Array.isArray(response.data) ? response.data : [response.data];
            this.totalBodega = this.equipos.length;
            this.applyFilters();
          } else {
            this.error = response.message || 'Error al cargar equipos en bodega';
            this.equipos = []; this.filteredEquipos = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Error al conectar con el servidor';
          this.equipos = []; this.filteredEquipos = [];
          this.isLoading = false;
        }
      });
    } else if (view === 'baja') {
      this.sysequiposService.getEquiposDadosDeBaja().subscribe({
        next: (response) => {
          if (response.success) {
            this.equipos = Array.isArray(response.data) ? response.data : [response.data];
            this.totalBaja = this.equipos.length;
            this.applyFilters();
          } else {
            this.error = response.message || 'Error al cargar equipos dados de baja';
            this.equipos = []; this.filteredEquipos = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = 'Error al conectar con el servidor';
          this.equipos = []; this.filteredEquipos = [];
          this.isLoading = false;
        }
      });
    } else {
      this.loadEquipos();
    }
  }

  applyFilters() {
    let filtered = this.equipos;
    if (this.searchTerm) {
      filtered = filtered.filter(equipo =>
        equipo.nombre_equipo?.toLowerCase().includes(this.searchTerm) ||
        equipo.marca?.toLowerCase().includes(this.searchTerm) ||
        equipo.modelo?.toLowerCase().includes(this.searchTerm) ||
        equipo.ubicacion?.toLowerCase().includes(this.searchTerm) ||
        equipo.serie?.toLowerCase().includes(this.searchTerm) ||
        equipo.placa_inventario?.toLowerCase().includes(this.searchTerm) ||
        equipo.codigo?.toLowerCase().includes(this.searchTerm)
      );
    }
    this.filteredEquipos = this.withOpciones(filtered);
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredEquipos.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedEquipos = this.filteredEquipos.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  resetSearchInput() {
    if (this.searchInputRef) this.searchInputRef.nativeElement.value = '';
  }

  resetEstadoSelect() {
    if (this.estadoSelectRef) this.estadoSelectRef.nativeElement.value = '';
  }

  getEstadoBadgeClass(activo: number | undefined): string {
    return `badge badge-${Number(activo) === 1 ? 'success' : 'danger'}`;
  }

  formatEstado(activo: number | undefined): string {
    return Number(activo) === 1 ? 'Activo' : 'Inactivo';
  }

  formatSerie(serie: string | undefined): string {
    return serie || 'N/A';
  }

  formatTipoEquipo(equipo: SysEquipo): string {
    return equipo.tipoEquipo?.nombres || equipo.tipoEquipo?.nombre || 'N/A';
  }

  openCreateModal() {
    this.selectedEquipo = null;
    this.isModalOpen = true;
  }

  openEditModal(equipo: SysEquipo) {
    this.selectedEquipo = equipo;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEquipo = null;
  }

  onEquipoSaved() {
    this.loadEquipos();
    this.loadCounters();
  }

  verHojaVida(equipo: SysEquipo) {
    if (equipo.id_sysequipo) {
      this.router.navigate(['/adminsistemas/hojavida', equipo.id_sysequipo]);
    }
  }

  toggleMenu(equipo: any) {
    const wasOpen = equipo._menuOpen;
    this.closeAllMenus();
    equipo._menuOpen = !wasOpen;
  }

  closeAllMenus() {
    this.filteredEquipos.forEach((e: any) => e._menuOpen = false);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeAllMenus();
  }

  private buildOpciones(equipo: SysEquipo): MenuItem[] {
    if (this.selectedView === 'all') {
      return [
        { label: 'Ver Detalles',    icon: 'pi pi-eye',     command: () => this.openDetailModal(equipo) },
        { label: 'Editar',          icon: 'pi pi-pencil',  command: () => this.openEditModal(equipo) },
        { label: 'Enviar a Bodega / Baja', icon: 'pi pi-trash', command: () => this.confirmDelete(equipo) }
      ];
    } else if (this.selectedView === 'bodega') {
      return [
        { label: 'Ver Detalles', icon: 'pi pi-eye',       command: () => this.openDetailModal(equipo) },
        { label: 'Reactivar',    icon: 'pi pi-power-off', command: () => this.reactivarEquipo(equipo) },
        { label: 'Dar de Baja',  icon: 'pi pi-trash',     command: () => this.confirmDelete(equipo) }
      ];
    } else {
      return [
        { label: 'Ver Detalles', icon: 'pi pi-eye', command: () => this.openDetailModal(equipo) }
      ];
    }
  }

  private withOpciones(equipos: SysEquipo[]): any[] {
    return equipos.map(equipo => ({ ...equipo, opciones: this.buildOpciones(equipo) }));
  }

  openDetailModal(equipo: SysEquipo) {
    this.equipoToView = equipo;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.equipoToView = null;
  }

  onEditFromDetail(equipo: SysEquipo) {
    this.closeDetailModal();
    this.openEditModal(equipo);
  }

  confirmDelete(equipo: SysEquipo) {
    this.equipoToDeleteWithOptions = equipo;
    this.isDeleteOptionsDialogOpen = true;
  }

  handleDeleteOptionsConfirm(deleteAction: DeleteAction) {
    if (!this.equipoToDeleteWithOptions?.id_sysequipo) return;

    const id = this.equipoToDeleteWithOptions.id_sysequipo;
    const nombreEquipo = this.equipoToDeleteWithOptions.nombre_equipo || 'Equipo desconocido';

    if (deleteAction.action === 'bodega') {
      this.sysequiposService.enviarABodega(id, deleteAction.data.motivo).subscribe({
        next: (response) => {
          if (this.deleteDialog) this.deleteDialog.resetSubmitting();
          if (response.success) {
            this.closeDeleteOptionsDialog();
            this.loadEquipos();
            this.loadCounters();
            Swal.fire({ icon: 'success', title: 'Enviado a Bodega', text: `Equipo "${nombreEquipo}" enviado a bodega exitosamente`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al enviar el equipo a bodega';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al conectar con el servidor. Verifica que el backend esté activo.';
          if (this.deleteDialog) this.deleteDialog.showError(msg);
          Swal.fire({ icon: 'error', title: 'Error', text: msg });
        }
      });
    } else if (deleteAction.action === 'baja') {
      const bajaData = {
        justificacion_baja: deleteAction.data.justificacion_baja || '',
        accesorios_reutilizables: deleteAction.data.accesorios_reutilizables,
        id_usuario: deleteAction.data.id_usuario,
        password: deleteAction.data.password || ''
      };

      this.sysequiposService.darDeBaja(id, bajaData).subscribe({
        next: (response) => {
          if (this.deleteDialog) this.deleteDialog.resetSubmitting();
          if (response.success) {
            this.closeDeleteOptionsDialog();
            this.loadEquipos();
            this.loadCounters();
            Swal.fire({ icon: 'success', title: 'Dado de Baja', text: `Equipo "${nombreEquipo}" dado de baja exitosamente`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al dar de baja el equipo';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
          }
        },
        error: (err) => {
          let msg = 'Error al conectar con el servidor';
          if (err.status === 403) msg = err.error?.message || 'Contraseña incorrecta';
          else if (err.status === 400) msg = err.error?.message || 'Datos inválidos';
          else if (err.error?.message) msg = err.error.message;
          if (this.deleteDialog) this.deleteDialog.showError(msg);
          Swal.fire({ icon: 'error', title: 'Error', text: msg });
        }
      });
    }
  }

  closeDeleteOptionsDialog() {
    this.isDeleteOptionsDialogOpen = false;
    this.equipoToDeleteWithOptions = null;
    if (this.searchInputRef && !this.searchTerm) {
      this.searchInputRef.nativeElement.value = '';
    }
  }

  reactivarEquipo(equipo: SysEquipo) {
    if (!equipo.id_sysequipo) return;
    this.equipoToReactivar = equipo;
    this.isReactivarModalOpen = true;
  }

  closeReactivarModal() {
    this.isReactivarModalOpen = false;
    this.equipoToReactivar = null;
  }

  handleReactivarConfirm(data: ReactivarEquipoData) {
    if (!this.equipoToReactivar?.id_sysequipo) return;

    const equipoId = this.equipoToReactivar.id_sysequipo;
    const equipoNombre = this.equipoToReactivar.nombre_equipo;
    const ubicacionFinal = data.ubicacion;

    this.sysequiposService.reactivarEquipo(equipoId).subscribe({
      next: (response) => {
        if (response.success) {
          if (ubicacionFinal && ubicacionFinal !== 'Bodega') {
            this.sysequiposService.updateEquipo(equipoId, { ubicacion: ubicacionFinal }).subscribe({
              next: () => {
                Swal.fire({ icon: 'success', title: 'Reactivado', text: `Equipo "${equipoNombre}" reactivado. Nueva ubicación: ${ubicacionFinal}`, timer: 2500, showConfirmButton: false });
                this.closeReactivarModal();
                this.changeView('bodega');
                this.loadCounters();
              },
              error: () => {
                Swal.fire({ icon: 'warning', title: 'Parcialmente reactivado', text: 'Equipo reactivado, pero hubo un error al cambiar la ubicación' });
                this.closeReactivarModal();
                this.changeView('bodega');
                this.loadCounters();
              }
            });
          } else {
            Swal.fire({ icon: 'success', title: 'Reactivado', text: `Equipo "${equipoNombre}" reactivado exitosamente`, timer: 2000, showConfirmButton: false });
            this.closeReactivarModal();
            this.changeView('bodega');
            this.loadCounters();
          }
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Error al reactivar el equipo' });
          this.closeReactivarModal();
        }
      },
      error: (err) => {
        console.error('Error al reactivar equipo:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor' });
        this.closeReactivarModal();
      }
    });
  }
}
