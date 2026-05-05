import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SysequiposService, SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SysplanmantenimientoService } from '../../../Services/appServices/sistemasServices/sysplanmantenimiento/sysplanmantenimiento.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysEquipoDetailModalComponent } from '../equipo-detail-modal/equipo-detail-modal.component';
import { SysHistorialEquipoComponent } from '../historial-equipo/historial-equipo.component';
import { SysDeleteConfirmationDialogComponent, DeleteAction } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { getDecodedAccessToken } from '../../../utilidades';
import { MenuItem } from 'primeng/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-equipos-tipo-sis',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, SplitButtonModule, IconFieldModule, InputIconModule, InputTextModule, ButtonModule, TagModule,
    SysEquipoModalComponent, SysEquipoDetailModalComponent, SysHistorialEquipoComponent,
    SysDeleteConfirmationDialogComponent
  ],
  templateUrl: './equipos-tipo-sis.component.html',
  styleUrl: './equipos-tipo-sis.component.css'
})
export class EquiposTipoSisComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild(SysDeleteConfirmationDialogComponent) deleteDialog!: SysDeleteConfirmationDialogComponent;

  equipos: any[] = [];
  tipoNombre: string = '';
  idTipo: number = 0;

  isLoading: boolean = false;
  error: string | null = null;

  isModalOpen: boolean = false;
  selectedEquipo: SysEquipo | null = null;
  isDetailModalOpen: boolean = false;
  equipoToView: SysEquipo | null = null;

  isHistorialModalOpen: boolean = false;
  equipoToHistorial: SysEquipo | null = null;

  isReporteFormOpen: boolean = false;
  equipoForReporte: any = null;

  isDeleteOptionsDialogOpen: boolean = false;
  equipoToDeleteWithOptions: SysEquipo | null = null;
  deleteDialogMode: 'bodega' | 'baja' = 'bodega';

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

  private readonly MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  private router = inject(Router);
  private sysequiposService = inject(SysequiposService);
  private tipoEquipoService = inject(TipoEquipoService);
  private planService = inject(SysplanmantenimientoService);

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN';
  }

  ngOnInit() {
    if (typeof sessionStorage === 'undefined') return;
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
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.equipos = this.withOpciones(data);
        } else {
          this.error = response.message || 'Error al cargar los equipos';
          this.equipos = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor.';
        this.equipos = [];
        this.isLoading = false;
      }
    });
  }

  onGlobalFilter(event: Event) {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  private buildOpciones(equipo: SysEquipo): MenuItem[] {
    return [
      { label: 'Ver Detalles',          icon: 'pi pi-eye',      command: () => this.openDetailModal(equipo) },
      { label: 'Editar',                icon: 'pi pi-pencil',   command: () => this.openEditModal(equipo) },
      { label: 'Plan de Mantenimiento', icon: 'pi pi-calendar', command: () => this.openPlanDialog(equipo) },
      { label: 'Nuevo Reporte de Casos', icon: 'pi pi-plus',    command: () => this.router.navigate(['/adminsistemas/nuevoreporte', equipo.id_sysequipo]) },
      { label: 'Ver Reportes de Casos',  icon: 'pi pi-list',    command: () => this.router.navigate(['/adminsistemas/reportesequipo', equipo.id_sysequipo]) },
      { label: 'Ver Historial',         icon: 'pi pi-history',  command: () => this.openHistorialModal(equipo) },
      { label: 'Enviar a Bodega',       icon: 'pi pi-inbox',    command: () => this.confirmBodega(equipo) },
      { label: 'Dar de Baja',           icon: 'pi pi-ban',      command: () => this.confirmBaja(equipo) },
    ];
  }

  private withOpciones(equipos: SysEquipo[]): any[] {
    return equipos.map(e => ({ ...e, opciones: this.buildOpciones(e) }));
  }

  getEstadoSeverity(activo: any): 'success' | 'danger' {
    return Number(activo) === 1 || activo === true ? 'success' : 'danger';
  }

  formatEstado(activo: any): string {
    return Number(activo) === 1 || activo === true ? 'Activo' : 'Inactivo';
  }

  confirmBodega(equipo: SysEquipo) {
    this.equipoToDeleteWithOptions = equipo;
    this.deleteDialogMode = 'bodega';
    this.isDeleteOptionsDialogOpen = true;
  }

  confirmBaja(equipo: SysEquipo) {
    this.equipoToDeleteWithOptions = equipo;
    this.deleteDialogMode = 'baja';
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
            Swal.fire({ icon: 'success', title: 'Enviado a Bodega', text: `Equipo "${nombreEquipo}" enviado a bodega exitosamente`, timer: 2000, showConfirmButton: false });
          } else {
            const msg = response.message || 'Error al enviar el equipo a bodega';
            if (this.deleteDialog) this.deleteDialog.showError(msg);
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al conectar con el servidor.';
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
  }

  openHistorialModal(equipo: SysEquipo) {
    this.equipoToHistorial = equipo;
    this.isHistorialModalOpen = true;
  }

  closeHistorialModal() {
    this.isHistorialModalOpen = false;
    this.equipoToHistorial = null;
  }

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

  // ── Plan de Mantenimiento ──

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
    } catch {
      this.calcularFechas();
    }

    this.isPlanDialogOpen = true;
  }

  closePlanDialog() {
    this.isPlanDialogOpen = false;
    this.currentEquipoPlan = null;
  }

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
}
