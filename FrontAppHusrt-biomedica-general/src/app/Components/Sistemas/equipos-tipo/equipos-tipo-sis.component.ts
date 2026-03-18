import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysEquipoDetailModalComponent } from '../equipo-detail-modal/equipo-detail-modal.component';
import { getDecodedAccessToken } from '../../../utilidades';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-equipos-tipo-sis',
  standalone: true,
  imports: [CommonModule, SysEquipoModalComponent, SysEquipoDetailModalComponent],
  templateUrl: './equipos-tipo-sis.component.html',
  styleUrl: './equipos-tipo-sis.component.css'
})
export class EquiposTipoSisComponent implements OnInit {
  equipos: SysEquipo[] = [];
  filteredEquipos: any[] = [];
  pagedEquipos: any[] = [];
  searchTerm: string = '';
  tipoNombre: string = '';
  idTipo: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  readonly pageSize = 15;
  currentPage: number = 1;
  totalPages: number = 1;

  isModalOpen: boolean = false;
  selectedEquipo: SysEquipo | null = null;
  isDetailModalOpen: boolean = false;
  equipoToView: SysEquipo | null = null;

  private router = inject(Router);
  private sysequiposService = inject(SysequiposService);
  private tipoEquipoService = inject(TipoEquipoService);

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN';
  }

  ngOnInit() {
    const id = sessionStorage.getItem('idTipoEquipoSis');
    if (!id) {
      this.router.navigate(['/adminsistemas/tiposequipo']);
      return;
    }
    this.idTipo = Number(id);
    this.loadTipoNombre();
    this.loadEquipos();
  }

  async loadTipoNombre() {
    try {
      const tipo = await this.tipoEquipoService.getTipoEquipo(this.idTipo);
      this.tipoNombre = tipo?.nombres || tipo?.nombre || 'Tipo de Equipo';
    } catch {
      this.tipoNombre = 'Tipo de Equipo';
    }
  }

  loadEquipos() {
    this.isLoading = true;
    this.error = null;
    this.sysequiposService.getEquipos({ id_tipo_equipo_fk: this.idTipo }).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.applyFilters();
        } else {
          this.error = response.message || 'Error al cargar los equipos';
          this.equipos = [];
          this.filteredEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.error = 'Error al conectar con el servidor.';
        this.equipos = [];
        this.filteredEquipos = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.equipos;
    if (this.searchTerm) {
      filtered = filtered.filter(e =>
        e.nombre_equipo?.toLowerCase().includes(this.searchTerm) ||
        e.marca?.toLowerCase().includes(this.searchTerm) ||
        e.modelo?.toLowerCase().includes(this.searchTerm) ||
        e.serie?.toLowerCase().includes(this.searchTerm) ||
        e.placa_inventario?.toLowerCase().includes(this.searchTerm) ||
        e.ubicacion?.toLowerCase().includes(this.searchTerm)
      );
    }
    this.filteredEquipos = this.withOpciones(filtered);
    this.currentPage = 1;
    this.updatePage();
  }

  private buildOpciones(equipo: SysEquipo): MenuItem[] {
    return [
      { label: 'Ver Detalles', icon: 'pi pi-eye',    command: () => this.openDetailModal(equipo) },
      { label: 'Editar',       icon: 'pi pi-pencil', command: () => this.openEditModal(equipo) },
    ];
  }

  private withOpciones(equipos: SysEquipo[]): any[] {
    return equipos.map(e => ({ ...e, opciones: this.buildOpciones(e) }));
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

  min(a: number, b: number): number { return Math.min(a, b); }

  getEstadoBadgeClass(activo: number | undefined): string {
    return `badge badge-${Number(activo) === 1 ? 'success' : 'danger'}`;
  }

  formatEstado(activo: number | undefined): string {
    return Number(activo) === 1 ? 'Activo' : 'Inactivo';
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
  onDocumentClick() { this.closeAllMenus(); }

  verHojaVida(equipo: SysEquipo) {
    if (equipo.id_sysequipo) {
      this.router.navigate(['/adminsistemas/hojavida', equipo.id_sysequipo]);
    }
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

  volverATipos() {
    this.router.navigate(['/adminsistemas/tiposequipo']);
  }
}
