import { Component, OnInit, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router, ActivatedRoute } from '@angular/router';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { SysplanmantenimientoService } from '../../../Services/appServices/sistemasServices/sysplanmantenimiento/sysplanmantenimiento.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysEquipoDetailModalComponent } from '../equipo-detail-modal/equipo-detail-modal.component';
import { SysDeleteConfirmationDialogComponent, DeleteAction } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SysReactivarEquipoModalComponent, ReactivarEquipoData } from '../reactivar-equipo-modal/reactivar-equipo-modal.component';
import { SysHistorialEquipoComponent } from '../historial-equipo/historial-equipo.component';
import { SysTrasladosModalComponent } from '../traslados-modal/traslados-modal.component';
import { SysReportesEquipoComponent } from '../sys-reportes-equipo/sys-reportes-equipo.component';
import { SysReporteEntregaService } from '../../../Services/appServices/sistemasServices/sysreporteentrega/sysreporteentrega.service';
import { SysReportePdfService } from '../../../Services/appServices/sistemasServices/sys-reporte-pdf/sys-reporte-pdf.service';
import { getDecodedAccessToken, isSistemasSoloLectura } from '../../../utilidades';
import { MenuItem } from 'primeng/api';
import Swal from 'sweetalert2';
import { extractError } from '../../../utils/error-utils';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-sis-equipos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplitButtonModule,
    SysEquipoModalComponent,
    SysEquipoDetailModalComponent,
    SysDeleteConfirmationDialogComponent,
    SysReactivarEquipoModalComponent,
    SysHistorialEquipoComponent,
    SysReportesEquipoComponent,
    SysTrasladosModalComponent
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

  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];
  currentPage: number = 1;
  totalPages: number = 1;

  totalEquipos: number = 0;
  totalBodega: number = 0;
  totalBaja: number = 0;

  isLoading: boolean = true;
  isDownloading: boolean = false;
  error: string | null = null;

  isModalOpen: boolean = false;
  selectedEquipo: SysEquipo | null = null;

  isDetailModalOpen: boolean = false;
  equipoToView: SysEquipo | null = null;

  isDeleteOptionsDialogOpen: boolean = false;
  equipoToDeleteWithOptions: SysEquipo | null = null;

  isReactivarModalOpen: boolean = false;
  equipoToReactivar: SysEquipo | null = null;

  isHistorialModalOpen: boolean = false;
  equipoToHistorial: SysEquipo | null = null;

  isTrasladosModalOpen: boolean = false;
  equipoToTraslados: SysEquipo | null = null;

  isReporteFormOpen: boolean = false;
  equipoForReporte: any = null;

  isReportesListOpen: boolean = false;
  equipoForReportesList: any = null;

  // ── Plan de Mantenimiento ──
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

  private readonly MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private planService = inject(SysplanmantenimientoService);
  private reporteService = inject(SysReporteEntregaService);
  private pdfService = inject(SysReportePdfService);
  private platformId = inject(PLATFORM_ID);

  constructor(private sysequiposService: SysequiposService) { }

  private loadBodegaData() {
    this.isLoading = true;
    this.error = null;
    this.pagedEquipos = [];
    this.sysequiposService.getEquiposEnBodega().subscribe({
      next: (response) => {
        if (response.success) {
          this.error = null;
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.totalBodega = this.equipos.length;
          this.applyFilters();
          this.restorePageFromUrl();
        } else {
          this.error = response.message || 'Error al cargar equipos en bodega';
          this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos en bodega:', err);
        this.error = extractError(err, 'cargar equipos en bodega');
        this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        this.isLoading = false;
      }
    });
  }

  private loadBajaData() {
    this.isLoading = true;
    this.error = null;
    this.pagedEquipos = [];
    this.sysequiposService.getEquiposDadosDeBaja().subscribe({
      next: (response) => {
        if (response.success) {
          this.error = null;
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.totalBaja = this.equipos.length;
          this.applyFilters();
          this.restorePageFromUrl();
        } else {
          this.error = response.message || 'Error al cargar equipos dados de baja';
          this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos dados de baja:', err);
        this.error = extractError(err, 'cargar equipos dados de baja');
        this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        this.isLoading = false;
      }
    });
  }

  private loadAllData() {
    this.isLoading = true;
    this.error = null;
    this.pagedEquipos = [];
    
    forkJoin([
      this.sysequiposService.getEquipos(),
      this.sysequiposService.getEquiposEnBodega(),
      this.sysequiposService.getEquiposDadosDeBaja()
    ]).subscribe({
      next: ([equiposRes, bodegaRes, bajaRes]) => {
        if (equiposRes?.success) {
          this.error = null;
          this.equipos = Array.isArray(equiposRes.data) ? equiposRes.data : [equiposRes.data];
          this.totalEquipos = this.equipos.length;
        } else {
          this.error = equiposRes?.message || 'Error al cargar los equipos';
          this.equipos = []; this.pagedEquipos = [];
        }
        
        if (bodegaRes?.success) {
          const bodegaData = Array.isArray(bodegaRes.data) ? bodegaRes.data : [bodegaRes.data];
          this.totalBodega = bodegaData.length;
        }
        
        if (bajaRes?.success) {
          const bajaData = Array.isArray(bajaRes.data) ? bajaRes.data : [bajaRes.data];
          this.totalBaja = bajaData.length;
        }
        
        this.applyFilters();
        this.restorePageFromUrl();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
        this.error = extractError(err, 'cargar datos iniciales');
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
    // 1. Cálculo de vista inicial (Ejecutar en Servidor y Cliente para Hidratación correcta)
    const params = this.route.snapshot.queryParams;
    let initialView: 'all' | 'bodega' | 'baja' = 'all';
    if (params['vista'] === 'bodega') initialView = 'bodega';
    else if (params['vista'] === 'baja') initialView = 'baja';
    const actionCreate = params['action'] === 'crear';

    this.selectedView = initialView;
    this.searchTerm = '';
    this.selectedActivo = undefined;

    // 2. Carga de datos (Solo en Cliente para evitar parpadeos si el SSR no tiene acceso a la API)
    if (!isPlatformBrowser(this.platformId)) return;

    if (initialView === 'bodega') {
      this.loadBodegaData();
    } else if (initialView === 'baja') {
      this.loadBajaData();
    } else {
      this.loadAllData();
    }

    if (actionCreate) {
      setTimeout(() => this.openCreateModal(), 0);
    }
  }

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN' || decoded?.rol === 'SYSTEMADMIN' || decoded?.rol === 'SISTEMASTECNICO';
  }

  get isReadOnly(): boolean {
    return isSistemasSoloLectura();
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
    this.pagedEquipos = [];

    this.sysequiposService.getEquipos(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipos = Array.isArray(response.data) ? response.data : [response.data];
          this.totalEquipos = this.equipos.length;
          this.applyFilters();
        } else {
          this.error = response.message || 'Error al cargar los equipos';
          this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.error = extractError(err, 'cargar los equipos');
        this.equipos = []; this.filteredEquipos = []; this.pagedEquipos = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = term;
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.resetSearchInput();
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
    this.searchTerm = '';
    this.selectedActivo = undefined;
    this.resetSearchInput();
    this.resetEstadoSelect();
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: null }, queryParamsHandling: 'merge', replaceUrl: true });

    if (view === 'bodega') {
      this.loadBodegaData();
    } else if (view === 'baja') {
      this.loadBajaData();
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private restorePageFromUrl() {
    const saved = Number(this.route.snapshot.queryParams['page']) || 1;
    if (saved > 1 && saved <= this.totalPages) {
      this.currentPage = saved;
      this.updatePage();
    }
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

  onPageSizeChange(event: Event) {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
    this.updatePage();
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
    this.changeView(this.selectedView);
    this.loadCounters();
  }

  async descargarInventario() {
    this.isDownloading = true;
    try {
      const blob = await this.sysequiposService.exportarInventario('todos', false, true);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Inventario_Equipos_Sistemas.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      Swal.fire('Error', 'No se pudo descargar el inventario.', 'error');
    } finally {
      this.isDownloading = false;
    }
  }

  verHojaVida(equipo: SysEquipo) {
    if (equipo.id_sysequipo) {
      this.router.navigate(['/adminsistemas/hojavida', equipo.id_sysequipo]);
    }
  }

  private buildOpciones(equipo: SysEquipo): MenuItem[] {
    const opcionHistorial   = { label: 'Ver Historial',         icon: 'fas fa-history',        command: () => this.openHistorialModal(equipo) };
    const opcionTraslados   = { label: 'Registro de Traslados', icon: 'fas fa-exchange-alt',   command: () => this.openTrasladosModal(equipo) };
    const opcionReporte     = { label: 'Reporte de Entrega',    icon: 'fas fa-file-export',    command: () => this.openReporteForm(equipo) };
    const opcionVerReportes = { label: 'Ver Reportes',          icon: 'fas fa-clipboard-list', command: () => this.openReportesList(equipo) };

    if (this.isReadOnly) {
      const opcionesLectura = [
        { label: 'Ver Detalles', icon: 'pi pi-eye', command: () => this.openDetailModal(equipo) },
        opcionVerReportes,
        opcionHistorial,
        opcionTraslados,
      ];
      if (this.selectedView === 'baja') {
        opcionesLectura.push({ label: 'Descargar PDF Baja', icon: 'fas fa-file-contract', command: () => this.descargarPdfBaja(equipo) });
      }
      return opcionesLectura;
    }

    if (this.selectedView === 'all') {
      return [
        { label: 'Ver Detalles', icon: 'pi pi-eye', command: () => this.openDetailModal(equipo) },
        { label: 'Editar', icon: 'pi pi-pencil', command: () => this.openEditModal(equipo) },
        { label: 'Plan de Mantenimiento', icon: 'pi pi-calendar', command: () => this.openPlanDialog(equipo) },
        opcionReporte,
        opcionVerReportes,
        opcionHistorial,
        opcionTraslados,
        { label: 'Enviar a Bodega / Baja', icon: 'pi pi-trash', command: () => this.confirmDelete(equipo) }
      ];
    } else if (this.selectedView === 'bodega') {
      return [
        { label: 'Ver Detalles', icon: 'pi pi-eye', command: () => this.openDetailModal(equipo) },
        { label: 'Reactivar', icon: 'pi pi-power-off', command: () => this.reactivarEquipo(equipo) },
        opcionReporte,
        opcionVerReportes,
        opcionHistorial,
        opcionTraslados,
        { label: 'Dar de Baja', icon: 'pi pi-trash', command: () => this.confirmDelete(equipo) }
      ];
    } else {
      return [
        { label: 'Ver Detalles',       icon: 'pi pi-eye',            command: () => this.openDetailModal(equipo) },
        opcionReporte,
        opcionVerReportes,
        opcionTraslados,
        { label: 'Descargar PDF Baja', icon: 'fas fa-file-contract', command: () => this.descargarPdfBaja(equipo) },
        opcionHistorial
      ];
    }
  }

  openHistorialModal(equipo: SysEquipo) {
    this.equipoToHistorial = equipo;
    this.isHistorialModalOpen = true;
  }

  closeHistorialModal() {
    this.isHistorialModalOpen = false;
    this.equipoToHistorial = null;
  }

  openTrasladosModal(equipo: SysEquipo) {
    if (equipo.id_sysequipo) {
      this.router.navigate(['/adminsistemas/traslados', equipo.id_sysequipo]);
    }
  }

  closeTrasladosModal() {
    this.isTrasladosModalOpen = false;
    this.equipoToTraslados = null;
  }

  openReporteForm(equipo: any) {
    sessionStorage.setItem('equipoParaReporte', JSON.stringify(equipo));
    sessionStorage.setItem('origenReporte', '/adminsistemas/equipos');
    this.router.navigate(['/adminsistemas/reporte-entrega']);
  }

  openReportesList(equipo: any) {
    this.equipoForReportesList = equipo;
    this.isReportesListOpen = true;
  }

  closeReportesList() {
    this.isReportesListOpen = false;
    this.equipoForReportesList = null;
  }

  openHistoricoMantenimientos(equipo: any) {
    if (!equipo?.id_sysequipo) return;
    this.router.navigate(['/adminsistemas/historico-mantenimiento', equipo.id_sysequipo]);
  }

  onRowClick(event: MouseEvent, equipo: any) {
    if ((event.target as HTMLElement).closest('td.col-opciones')) return;
    this.openHistoricoMantenimientos(equipo);
  }

  async descargarPdfBaja(equipo: any) {
    const bajaId = equipo.baja?.id_sysbaja;
    if (!bajaId) {
      Swal.fire('Sin datos', 'No se encontró el registro de baja para este equipo.', 'warning');
      return;
    }
    try {
      await this.pdfService.generarBajaEntrega(bajaId);
    } catch (e) {
      Swal.fire('Error', extractError(e, 'generar el PDF de baja del equipo'), 'error');
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
      const tipoBodega = deleteAction.data.tipo_bodega || 'Bodega Sistemas';
      this.sysequiposService.enviarABodega(id, deleteAction.data.motivo, tipoBodega, deleteAction.data.nombre_receptor, deleteAction.data.cargo_receptor, deleteAction.data.observaciones_traslado).subscribe({
        next: (response) => {
          if (this.deleteDialog) this.deleteDialog.resetSubmitting();
          if (response.success) {
            this.closeDeleteOptionsDialog();
            this.loadEquipos();
            this.loadCounters();
            Swal.fire({ icon: 'success', title: 'Enviado a Bodega', text: `Equipo "${nombreEquipo}" enviado a ${tipoBodega || 'bodega'} exitosamente`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al enviar el equipo a bodega';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
          }
        },
        error: (err) => {
          const msg = extractError(err, 'enviar el equipo a bodega');
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
          const msg = extractError(err, 'dar de baja el equipo');
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
        this.selectedPlanes = planes.map(p => ({ mes: p.mes, ano: p.ano }));
        this.updateCalculatedText();
      } else {
        this.calcularFechas();
      }
    } catch (e) {
      this.calcularFechas();
    }

    this.isPlanDialogOpen = true;
  }

  closePlanDialog() {
    this.isPlanDialogOpen = false;
    this.currentEquipoPlan = null;
  }

  calcularFechas() {
    const intv = Number(this.intervencionesAnuales);
    const mes = Number(this.mesInicio);
    const anio = Number(this.anioInicio);
    if (!intv || intv <= 0 || !mes || !anio) return;
    const interval = 12 / intv;
    const nuevos: { mes: number; ano: number }[] = [];

    for (let i = 0; i < intv; i++) {
      let calcMonth = mes + i * interval;
      const calcYear = anio + Math.floor((calcMonth - 1) / 12);
      calcMonth = ((calcMonth - 1) % 12) + 1;
      nuevos.push({ mes: Math.round(calcMonth), ano: calcYear });
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
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: extractError(e, 'guardar el plan de mantenimiento') });
    } finally {
      this.isSavingPlan = false;
    }
  }

  handleReactivarConfirm(data: ReactivarEquipoData) {
    if (!this.equipoToReactivar?.id_sysequipo) return;

    const equipo = this.equipoToReactivar;
    const equipoId = equipo.id_sysequipo!;
    const equipoNombre = equipo.nombre_equipo;
    const ubicacionFinal = data.ubicacion;

    this.sysequiposService.reactivarEquipo(equipoId, {
      ubicacion: data.ubicacion || undefined,
      ubicacion_especifica: data.ubicacion_especifica || undefined,
      nombre_receptor: data.recibidoPor || undefined,
      cargo_receptor: data.cargo_receptor || undefined,
      observaciones: data.observaciones || undefined,
      servicioDestinoId: data.servicioDestinoId || undefined
    }).subscribe({
      next: (response) => {
        if (!response.success) {
          Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'Error al reactivar el equipo' });
          this.closeReactivarModal();
          return;
        }
        this.crearReporteReactivacion(equipo, ubicacionFinal, data);
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: extractError(err, 'reactivar el equipo') });
        this.closeReactivarModal();
      }
    });
  }

  private crearReporteReactivacion(equipo: any, ubicacionNueva: string, data: ReactivarEquipoData) {
    const decoded = getDecodedAccessToken();
    const hoy = new Date().toISOString().split('T')[0];
    const ahora = new Date().toTimeString().slice(0, 5);
    const ubicacionAnterior = equipo.bodega?.ubicacion_origen || equipo.ubicacion_anterior || equipo.ubic_bod || 'Bodega';

    const reporte = {
      fecha: hoy,
      hora_llamado: ahora,
      hora_inicio: data.horaInicio || '',
      hora_terminacion: data.horaTerminacion || '',
      servicio_anterior: equipo.servicio?.nombres || '',
      ubicacion_anterior: ubicacionAnterior,
      servicio_nuevo: equipo.servicio?.nombres || '',
      ubicacion_nueva: ubicacionNueva || '',
      realizado_por: decoded ? `${decoded.nombres || ''} ${decoded.apellidos || ''}`.trim() : '',
      recibido_por: data.recibidoPor || '',
      observaciones: data.observaciones || '',
      id_sysequipo_fk: equipo.id_sysequipo,
      id_sysusuario_fk: decoded?.id
    };

    this.reporteService.create(reporte).subscribe({
      next: (res: any) => {
        const reporteId = res?.data?.id_sysreporte ?? null;
        this.closeReactivarModal();
        this.changeView('bodega');
        this.loadCounters();

        Swal.fire({
          icon: 'success',
          title: 'Reactivado',
          text: `Equipo "${equipo.nombre_equipo}" reactivado y formato de entrega generado.`,
          confirmButtonText: reporteId ? 'Descargar PDF' : 'Cerrar',
          showCancelButton: !!reporteId,
          cancelButtonText: 'Cerrar',
          confirmButtonColor: '#1a5f7a'
        }).then(result => {
          if (result.isConfirmed && reporteId) {
            this.pdfService.generarReporteEntrega(reporteId).catch(e =>
              Swal.fire('Error', extractError(e, 'generar el PDF del reporte'), 'error')
            );
          }
        });
      },
      error: (err: any) => {
        this.closeReactivarModal();
        this.changeView('bodega');
        this.loadCounters();
        Swal.fire({ icon: 'warning', title: 'Reactivado', text: `Equipo "${equipo.nombre_equipo}" reactivado, pero no se pudo generar el formato de entrega: ${extractError(err, 'crear el reporte')}` });
      }
    });
  }
}
