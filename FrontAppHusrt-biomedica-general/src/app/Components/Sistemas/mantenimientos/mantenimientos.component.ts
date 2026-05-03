import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { getDecodedAccessToken } from '../../../../app/utilidades';
import Swal from 'sweetalert2';
import { extractError } from '../../../utils/error-utils';

import {
  SysmantenimientoService,
  SysMantenimiento,
} from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { ArchivosService } from '../../../Services/appServices/general/archivos/archivos.service';
import { SysHistorialEquipoComponent } from '../historial-equipo/historial-equipo.component';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-sis-mantenimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    CardModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    SysHistorialEquipoComponent,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.css']
})
export class SisMantenimientosComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  router = inject(Router);
  private mantenimientoService = inject(SysmantenimientoService);
  private archivosService = inject(ArchivosService);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  // ── Datos ─────────────────────────────────────────────────────────────────
  mantenimientos: SysMantenimiento[] = [];
  displayRecords: SysMantenimiento[] = [];

  // ── UI State ──────────────────────────────────────────────────────────────
  isLoading = false;
  isModalLoading = false;           // spinner solo para el modal
  error: string | null = null;
  activeTab: 'todos' | 'Preventivo' | 'Correctivo' | 'Predictivo' = 'todos';

  isAdmin = false;
  showAdminModal = false;
  adminForm!: FormGroup;
  users: any[] = [];
  reporteAdminSelected: any;


  // ── Filtros ───────────────────────────────────────────────────────────────
  filterFechaInicio = '';
  filterFechaFin = '';

  // ── Modal Ver ─────────────────────────────────────────────────────────────
  modalReport = false;
  reportSelected: SysMantenimiento | undefined = undefined;
  selectedFile: File | null = null;

  // ── Modal Historial ───────────────────────────────────────────────────────
  isHistorialOpen = false;
  equipoParaHistorial: any = null;


  // ── Stats ─────────────────────────────────────────────────────────────────
  stats = { total: 0, realizados: 0, programados: 0, pendientes: 0, correctivos: 0 };

  // ─────────────────────────────────────────────────────────────────────────

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 }, { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 }, { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];
  async ngOnInit() {
    this.adminForm = this.fb.group({
      usuarioIdFk: ['', Validators.required],
      mesProgramado: ['', Validators.required],
      añoProgramado: ['', Validators.required]
    });
    this.checkRole();
    if (this.isAdmin) this.loadUsers();
    this.loadMantenimientos();
  }

  // ── Carga principal ───────────────────────────────────────────────────────

  loadMantenimientos() {
    this.isLoading = true;
    const filters: any = {};
    if (this.filterFechaInicio) filters.fecha_inicio = this.filterFechaInicio;
    if (this.filterFechaFin) filters.fecha_fin = this.filterFechaFin;

    this.mantenimientoService.getAll(filters).subscribe({
      next: (res: any) => {
        const raw: SysMantenimiento[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.mantenimientos = raw.map(m => ({ ...m, _status: this.getReportStatus(m) }));
        this.calculateStats();
        this.updateDisplayRecords();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor';
        this.isLoading = false;
      }
    });
  }

  // ── Estado del registro ────────────────────────────────────────────────────

  getReportStatus(m: SysMantenimiento): string {
    const realizado = !!m.fechaRealizado;
    if (realizado) return m.rutaPdf ? 'COMPLETADO' : 'REALIZADO';
    const vencido = !this.verificarVencimiento(m.mesProgramado, m.añoProgramado);
    return vencido ? 'PENDIENTE' : 'PROGRAMADO';
  }

  verificarVencimiento(mes: number | undefined, anio: number | undefined): boolean {
    if (!mes || !anio) return true;
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();
    if (anioActual < anio) return true;
    if (anioActual === anio && mesActual <= mes) return true;
    return false;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  calculateStats() {
    this.stats.total = this.mantenimientos.length;
    this.stats.realizados = this.mantenimientos.filter(m => !!m.fechaRealizado).length;
    this.stats.programados = this.mantenimientos.filter(m => (m as any)._status === 'PROGRAMADO').length;
    this.stats.pendientes = this.mantenimientos.filter(m => (m as any)._status === 'PENDIENTE').length;
    this.stats.correctivos = this.mantenimientos.filter(m => m.tipoMantenimiento === 'Correctivo').length;
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  switchTab(tab: 'todos' | 'Preventivo' | 'Correctivo' | 'Predictivo') {
    this.activeTab = tab;
    this.updateDisplayRecords();
  }

  updateDisplayRecords() {
    this.displayRecords = this.activeTab === 'todos'
      ? this.mantenimientos
      : this.mantenimientos.filter(m => m.tipoMantenimiento === this.activeTab);
  }

  // ── Filtros ────────────────────────────────────────────────────────────────

  applyFilters() { this.loadMantenimientos(); }

  clearFilters() {
    this.filterFechaInicio = '';
    this.filterFechaFin = '';
    this.loadMantenimientos();
  }

  // ── Búsqueda global ────────────────────────────────────────────────────────

  onGlobalFilter(event: Event) {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // ── Modal Ver Detalles ────────────────────────────────────────────────────
  // CLAVE: primero cargamos la data, y solo cuando está lista abrimos el modal.
  // Así el template nunca ve reportSelected como undefined dentro del dialog.

  async viewModalReport(id: number) {
    if (!id) return;
    this.isModalLoading = true;
    this.reportSelected = undefined;
    try {
      const res: any = await this.mantenimientoService.getById(id);
      // El backend retorna { success: true, data: {...} } — desempacamos .data
      this.reportSelected = res?.data ?? res;
      this.modalReport = true;
    } catch (err) {
      Swal.fire('Error', extractError(err, 'cargar la información del mantenimiento'), 'error');
    } finally {
      this.isModalLoading = false;
    }
  }

  // ── Acciones de navegación ────────────────────────────────────────────────

  nuevoReporte(idSysEquipo: number, tipoMantenimiento: string | undefined) {
    localStorage.setItem('TipoMantenimiento', this.mapTipoToCode(tipoMantenimiento));
    localStorage.removeItem('idMantenimiento');
    this.router.navigate(['adminsistemas/reporteMantenimiento', idSysEquipo]);
  }

  editarMantenimiento(idSysEquipo: number, idMantenimiento: number, tipoMantenimiento: string | undefined) {
    localStorage.setItem('TipoMantenimiento', this.mapTipoToCode(tipoMantenimiento));
    localStorage.setItem('idMantenimiento', idMantenimiento.toString());
    this.router.navigate(['adminsistemas/reporteMantenimiento', idSysEquipo]);
  }

  editarReporte() {
    if (!this.reportSelected?.equipo?.id_sysequipo || !this.reportSelected?.id) return;
    this.modalReport = false;
    this.editarMantenimiento(
      this.reportSelected.equipo.id_sysequipo,
      this.reportSelected.id,
      this.reportSelected.tipoMantenimiento
    );
  }

  verHistorialEquipo(equipo: any) {
    if (!equipo) return;
    this.equipoParaHistorial = equipo;
    this.isHistorialOpen = true;
  }

  closeHistorial() {
    this.isHistorialOpen = false;
    this.equipoParaHistorial = null;
  }

  openHistoricoMantenimientos(equipo: any) {
    if (!equipo?.id_sysequipo) return;
    this.router.navigate(['/adminsistemas/historico-mantenimiento', equipo.id_sysequipo]);
  }

  private mapTipoToCode(tipo: string | undefined): string {
    if (tipo === 'Correctivo') return 'C';
    if (tipo === 'Predictivo') return 'PD';
    return 'P';
  }

  // ── PDF ───────────────────────────────────────────────────────────────────

  async viewPdf(ruta: string | undefined) {
    if (!ruta) return;
    try {
      const blob = await this.archivosService.getArchivo(ruta);
      if (blob.type === 'application/pdf') {
        window.open(URL.createObjectURL(blob), '_blank');
      }
    } catch (err) {
      Swal.fire('Error', extractError(err, 'abrir el PDF del mantenimiento'), 'error');
    }
  }

  async viewPdfMantenimiento(id: number | undefined) {
    if (!id) return;
    const m = this.mantenimientos.find(x => x.id === id);
    if (m?.adjunto_url) {
      await this.viewPdf(m.adjunto_url);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async subirPdf() {
    Swal.fire('Próximamente', 'La subida de PDF se habilitará pronto.', 'info');
    this.selectedFile = null;
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────

  confirmDelete(m: SysMantenimiento) {
    Swal.fire({
      title: '¿Eliminar mantenimiento?',
      text: `¿Está seguro de eliminar el reporte #${m.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed && m.id) {
        this.mantenimientoService.delete(m.id).subscribe({
          next: res => {
            if (res.success) {
              Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Mantenimiento eliminado exitosamente', timer: 2000, showConfirmButton: false });
              this.loadMantenimientos();
            }
          },
          error: (err: any) => Swal.fire({ icon: 'error', title: 'Error', text: extractError(err, 'eliminar el mantenimiento') })
        });
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getMesProgramado(mes: number | undefined): string {
    if (!mes) return '—';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1] ?? '—';
  }

  getFechaProgramada(m: SysMantenimiento): string {
    const mes = this.getMesProgramado(m.mesProgramado);
    const anio = (m as any).añoProgramado;
    return anio ? `${mes} ${anio}` : mes;
  }

  getTipoSeverity(tipo: string | undefined): 'success' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'info' | 'secondary'> = {
      'Preventivo': 'success',
      'Correctivo': 'danger',
      'Predictivo': 'info',
    };
    return tipo ? (map[tipo] ?? 'secondary') : 'secondary';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warn'> = {
      'COMPLETADO': 'success',
      'REALIZADO': 'info',
      'PENDIENTE': 'danger',
      'PROGRAMADO': 'warn',
    };
    return map[status] ?? 'secondary';
  }
  checkRole() {
    const token = getDecodedAccessToken();
    if (token && (token.rol === 'SUPERADMIN' || token.rol === 'SISTEMASADMIN')) {
      this.isAdmin = true;
    }
  }

  async loadUsers() {
    try {
      const users = await this.userService.getAllUsers();
      this.users = users.filter((u: any) => u.rolId === 10);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  openAdminEdit(m: SysMantenimiento) {
    this.reporteAdminSelected = m;
    this.adminForm.patchValue({
      usuarioIdFk: m.usuarioIdFk,
      mesProgramado: m.mesProgramado,
      añoProgramado: m.añoProgramado
    });
    this.showAdminModal = true;
  }

 async saveAdminEdit() {
  if (this.adminForm.invalid) return;
  try {
    await this.mantenimientoService.update(
      this.reporteAdminSelected.id,
      this.adminForm.value
    );
    Swal.fire('Actualizado', 'Reporte actualizado correctamente', 'success');
    this.showAdminModal = false;
    this.loadMantenimientos();
  } catch {
    Swal.fire('Error', 'No se pudo actualizar el reporte', 'error');
  }
}
}