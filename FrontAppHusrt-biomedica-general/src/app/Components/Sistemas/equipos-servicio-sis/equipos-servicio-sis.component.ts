import { Component, OnInit, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SysplanmantenimientoService } from '../../../Services/appServices/sistemasServices/sysplanmantenimiento/sysplanmantenimiento.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysEquipoDetailModalComponent } from '../equipo-detail-modal/equipo-detail-modal.component';
import { SysHistorialEquipoComponent } from '../historial-equipo/historial-equipo.component';
import { SysDeleteConfirmationDialogComponent, DeleteAction } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SysReportesEquipoComponent } from '../sys-reportes-equipo/sys-reportes-equipo.component';
import { SysReporteService } from '../../../Services/appServices/sistemasServices/sysreporte/sysreporte.service';
import { getDecodedAccessToken } from '../../../utilidades';
import { MenuItem } from 'primeng/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-equipos-servicio-sis',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    SysEquipoModalComponent, SysEquipoDetailModalComponent,
    SysHistorialEquipoComponent, SysDeleteConfirmationDialogComponent,
    SysReportesEquipoComponent
  ],
  templateUrl: './equipos-servicio-sis.component.html',
  styleUrl: './equipos-servicio-sis.component.css'
})
export class EquiposServicioSisComponent implements OnInit {
  @ViewChild(SysDeleteConfirmationDialogComponent) deleteDialog!: SysDeleteConfirmationDialogComponent;

  equipos: SysEquipo[] = [];
  filteredEquipos: any[] = [];
  pagedEquipos: any[] = [];
  searchTerm: string = '';
  servicio: any = null;
  idServicio: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  readonly pageSize = 15;
  currentPage: number = 1;
  totalPages: number = 1;

  isModalOpen: boolean = false;
  selectedEquipo: SysEquipo | null = null;
  isDetailModalOpen: boolean = false;
  equipoToView: SysEquipo | null = null;

  isHistorialModalOpen: boolean = false;
  equipoToHistorial: SysEquipo | null = null;

  isReporteFormOpen: boolean = false;
  equipoForReporte: any = null;

  isReportesListOpen: boolean = false;
  equipoForReportesList: any = null;

  isDeleteOptionsDialogOpen: boolean = false;
  equipoToDeleteWithOptions: SysEquipo | null = null;
  deleteDialogMode: 'bodega' | 'baja' = 'bodega';

  isPlanDialogOpen = false;
  currentEquipoPlan: any = null;
  intervencionesAnuales = 1;
  mesInicio = 1;
  anioInicio = new Date().getFullYear();
  selectedPlanes: { mes: number; ano: number }[] = [];
  calculatedMonthsText = '';
  isSavingPlan = false;

  readonly intervencionOptions = [
    { label: '1 vez al año (Anual)', value: 1 },
    { label: '2 veces al año (Semestral)', value: 2 },
    { label: '3 veces al año (Cuatrimestral)', value: 3 },
    { label: '4 veces al año (Trimestral)', value: 4 }
  ];

  readonly monthOptions = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 }, { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 }, { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  readonly anioOptions = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);

  private readonly MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  private router = inject(Router);
  private sysequiposService = inject(SysequiposService);
  private servicioService = inject(ServicioService);
  private planService = inject(SysplanmantenimientoService);
  private reporteService = inject(SysReporteService);

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN' || decoded?.rol === 'SYSTEMADMIN';
  }

  async ngOnInit() {
    if (typeof sessionStorage === 'undefined') return;
    const id = sessionStorage.getItem('idServicioSis');
    if (!id) {
      this.router.navigate(['/adminsistemas/servicios']);
      return;
    }
    this.idServicio = Number(id);
    await this.loadServicio();
    this.loadEquipos();
  }

  async loadServicio() {
    try {
      this.servicio = await this.servicioService.getServicio(this.idServicio);
    } catch {
      this.servicio = { nombres: 'Servicio' };
    }
  }

  loadEquipos() {
    this.isLoading = true;
    this.error = null;
    this.sysequiposService.getEquipos({ id_servicio_fk: this.idServicio }).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.applyFilters();
        } else {
          this.error = response.message || 'Error al cargar los equipos';
          this.equipos = []; this.filteredEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.error = 'Error al conectar con el servidor.';
        this.equipos = []; this.filteredEquipos = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  clearSearch(input: HTMLInputElement) {
    input.value = '';
    this.searchTerm = '';
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
      { label: 'Ver Detalles',          icon: 'pi pi-eye',             command: () => this.openDetailModal(equipo) },
      { label: 'Editar',                icon: 'pi pi-pencil',          command: () => this.openEditModal(equipo) },
      { label: 'Plan de Mantenimiento', icon: 'pi pi-calendar',        command: () => this.openPlanDialog(equipo) },
      { label: 'Reporte de Entrega',    icon: 'fas fa-file-export',    command: () => this.openReporteForm(equipo) },
      { label: 'Ver Reportes',          icon: 'fas fa-clipboard-list', command: () => this.openReportesList(equipo) },
      { label: 'Ver Historial',         icon: 'fas fa-history',        command: () => this.openHistorialModal(equipo) },
      { label: 'Enviar a Bodega',       icon: 'fas fa-warehouse',      command: () => this.confirmBodega(equipo) },
      { label: 'Dar de Baja',           icon: 'pi pi-ban',             command: () => this.confirmBaja(equipo) },
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
    if (equipo.id_sysequipo) this.router.navigate(['/adminsistemas/hojavida', equipo.id_sysequipo]);
  }

  volverAServicios() { this.router.navigate(['/adminsistemas/servicios']); }

  openEditModal(equipo: SysEquipo) { this.selectedEquipo = equipo; this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; this.selectedEquipo = null; }
  onEquipoSaved() { this.loadEquipos(); }

  openDetailModal(equipo: SysEquipo) { this.equipoToView = equipo; this.isDetailModalOpen = true; }
  closeDetailModal() { this.isDetailModalOpen = false; this.equipoToView = null; }
  onEditFromDetail(equipo: SysEquipo) { this.closeDetailModal(); this.openEditModal(equipo); }

  openHistorialModal(equipo: SysEquipo) { this.equipoToHistorial = equipo; this.isHistorialModalOpen = true; }
  closeHistorialModal() { this.isHistorialModalOpen = false; this.equipoToHistorial = null; }

  openReporteForm(equipo: any) {
    sessionStorage.setItem('equipoParaReporte', JSON.stringify(equipo));
    sessionStorage.setItem('origenReporte', '/adminsistemas/equiposservicio');
    this.router.navigate(['/adminsistemas/reporte-entrega']);
  }

  openReportesList(equipo: any) { this.equipoForReportesList = equipo; this.isReportesListOpen = true; }
  closeReportesList() { this.isReportesListOpen = false; this.equipoForReportesList = null; }

  confirmBodega(equipo: SysEquipo) { this.equipoToDeleteWithOptions = equipo; this.deleteDialogMode = 'bodega'; this.isDeleteOptionsDialogOpen = true; }
  confirmBaja(equipo: SysEquipo) { this.equipoToDeleteWithOptions = equipo; this.deleteDialogMode = 'baja'; this.isDeleteOptionsDialogOpen = true; }

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
            Swal.fire({ icon: 'success', title: 'Enviado a Bodega', text: `Equipo "${nombreEquipo}" enviado a bodega`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al enviar a bodega';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al conectar con el servidor.';
          if (this.deleteDialog) this.deleteDialog.showError(msg);
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
            Swal.fire({ icon: 'success', title: 'Dado de Baja', text: `Equipo "${nombreEquipo}" dado de baja`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al dar de baja';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
          }
        },
        error: (err) => {
          let msg = 'Error al conectar con el servidor';
          if (err.status === 403) msg = err.error?.message || 'Contraseña incorrecta';
          else if (err.error?.message) msg = err.error.message;
          if (this.deleteDialog) this.deleteDialog.showError(msg);
        }
      });
    }
  }

  closeDeleteOptionsDialog() { this.isDeleteOptionsDialogOpen = false; this.equipoToDeleteWithOptions = null; }

  async openPlanDialog(equipo: any) {
    this.currentEquipoPlan = equipo;
    this.intervencionesAnuales = 1;
    this.mesInicio = new Date().getMonth() + 1;
    this.anioInicio = new Date().getFullYear();
    this.selectedPlanes = [];
    this.calculatedMonthsText = '';
    try {
      const planes = await this.planService.getByEquipo(equipo.id_sysequipo);
      if (planes && planes.length > 0) {
        this.intervencionesAnuales = planes.length;
        this.mesInicio = planes[0].mes;
        this.anioInicio = planes[0].ano;
        this.selectedPlanes = planes.map((p: any) => ({ mes: p.mes, ano: p.ano }));
        this.updateCalculatedText();
      } else {
        this.calcularFechas();
      }
    } catch { this.calcularFechas(); }
    this.isPlanDialogOpen = true;
  }

  closePlanDialog() { this.isPlanDialogOpen = false; this.currentEquipoPlan = null; }

  calcularFechas() {
    if (!this.intervencionesAnuales || this.intervencionesAnuales <= 0) return;
    const interval = 12 / this.intervencionesAnuales;
    const nuevos: { mes: number; ano: number }[] = [];
    for (let i = 0; i < this.intervencionesAnuales; i++) {
      let calcMonth = this.mesInicio + i * interval;
      const calcYear = this.anioInicio + Math.floor((calcMonth - 1) / 12);
      calcMonth = ((calcMonth - 1) % 12) + 1;
      nuevos.push({ mes: Math.floor(calcMonth), ano: calcYear });
    }
    this.selectedPlanes = nuevos;
    this.updateCalculatedText();
  }

  updateCalculatedText() {
    if (!this.selectedPlanes.length) { this.calculatedMonthsText = ''; return; }
    this.calculatedMonthsText = this.selectedPlanes.map(p => `${this.MESES[p.mes - 1]} ${p.ano}`).join(' · ');
  }

  async savePlan() {
    if (!this.currentEquipoPlan) return;
    this.isSavingPlan = true;
    try {
      await this.planService.reemplazarPlanesEquipo(this.currentEquipoPlan.id_sysequipo, this.selectedPlanes);
      Swal.fire({ icon: 'success', title: 'Plan actualizado', text: `Se programaron ${this.selectedPlanes.length} mantenimiento(s).`, timer: 2000, showConfirmButton: false });
      this.closePlanDialog();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el plan de mantenimiento.' });
    } finally {
      this.isSavingPlan = false;
    }
  }

  async descargarPdfBaja(equipo: any) {
    const bajaId = equipo.baja?.id_sysbaja;
    if (!bajaId) { Swal.fire('Sin datos', 'No se encontró el registro de baja.', 'warning'); return; }
    try {
      const blob = await this.reporteService.descargarPdfBaja(bajaId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Baja_${equipo.nombre_equipo || bajaId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { Swal.fire('Error', 'No se pudo generar el PDF de baja.', 'error'); }
  }
}
