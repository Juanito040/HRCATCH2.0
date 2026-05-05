import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { PdfGeneratorService } from '../../../Services/appServices/biomedicaServices/pdf-generator/pdf-generator.service';
import { CommonModule, Location } from '@angular/common';
import { BiomedicausernavbarComponent } from "../../navbars/biomedicausernavbar/biomedicausernavbar.component";
import { ArchivosService } from '../../../Services/appServices/general/archivos/archivos.service'
import Swal from 'sweetalert2';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, Table } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from "primeng/card";
import { Router } from '@angular/router';
import { DialogModule } from "primeng/dialog";
import { ProtocolosService } from '../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { UserService } from './../../../Services/appServices/userServices/user.service';
import { ReportesService } from './../../../Services/appServices/biomedicaServices/reportes/reportes.service';
import { getDecodedAccessToken } from '../../../utilidades';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-mantenimineto',
  standalone: true,
  imports: [CommonModule, TabsModule, FormsModule, ReactiveFormsModule,
    TableModule, IconFieldModule, InputIconModule, InputTextModule, CalendarModule, CardModule, SelectModule, ButtonModule, DialogModule],
  templateUrl: './mantenimineto.component.html',
  styleUrl: './mantenimineto.component.css'
})
export class ManteniminetoComponent implements OnInit {

  @ViewChild('dt2') dt2!: Table;
  pdfGeneratorService = inject(PdfGeneratorService);
  date: Date | undefined;
  reportesService = inject(ReportesService);
  userService = inject(UserService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  archivosServices = inject(ArchivosService);
  protocolosServices = inject(ProtocolosService);
  loading: boolean = false;
  fechaActual = new Date();
  mesInicio: number = this.fechaActual.getMonth() + 1;
  mesFin: number = this.fechaActual.getMonth() + 1;
  anio: number = this.fechaActual.getFullYear();

  preventivos: any[] = [];
  preventivosRealizados: any[] = [];
  preventivosPendientes: any[] = [];
  correctivos: any[] = [];

  panelPreventivos: boolean = true;
  panelCorrectivos: boolean = false;
  panelMetas: boolean = false;

  panelRealizados: boolean = true;
  panelPendientes: boolean = false;

  reportSelected!: any;
  rutina!: any[];
  modalReport: boolean = false;
  selectedFile: File | null = null;



  // Admin Variables
  isAdmin: boolean = false;
  showAdminModal: boolean = false;
  adminForm: FormGroup;
  users: any[] = [];
  reporteAdminSelected: any;

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  constructor(private location: Location) {
    this.adminForm = this.formBuilder.group({
      usuarioIdFk: ['', Validators.required],
      mesProgramado: ['', Validators.required],
      añoProgramado: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.date = new Date();
    this.checkRole();
    if (this.isAdmin) {
      this.loadUsers();
    }

    // Initial Load
    this.setDate();
  }

  checkRole() {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('utoken') : null;
    if (token) {
      const decoded: any = getDecodedAccessToken();
      if (decoded && (decoded.rol === 'SUPERADMIN' || decoded.rol === 'BIOMEDICAADMIN')) {
        this.isAdmin = true;
      }
    }
  }

  async loadUsers() {
    try {
      const users = await this.userService.getAllUsers();
      this.users = users.filter((user: any) => user.rolId === 7 || user.rolId === 6);
    } catch (error) {
      console.error('Error loading users', error);
    }
  }

  openAdminEdit(reporte: any) {
    this.reporteAdminSelected = reporte;
    this.adminForm.patchValue({
      usuarioIdFk: reporte.usuarioIdFk,
      mesProgramado: reporte.mesProgramado,
      añoProgramado: reporte.añoProgramado || reporte.anioProgramado // handle potential naming diff
    });
    this.showAdminModal = true;
  }

  async saveAdminEdit() {
    if (this.adminForm.invalid) return;

    try {
      await this.reportesService.ActualizarPreventivoProgramado(this.reporteAdminSelected.id, this.adminForm.value);
      Swal.fire('Actualizado', 'Reporte actualizado correctamente', 'success');
      this.showAdminModal = false;
      this.setDate(); // Refresh data
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el reporte', 'error');
    }
  }

  async setDate() {
    if (this.anio && this.mesInicio && this.mesFin) {
      this.loading = true;
      try {
        if (this.mesInicio === this.mesFin) {
          // Single month search (legacy behavior)
          this.preventivos = await this.reportesService.getReportesPreventivosMesAño({ mes: this.mesInicio, anio: this.anio });
          this.correctivos = await this.reportesService.getReportesCorrectivosMesAño({ mes: this.mesInicio, anio: this.anio });
        } else {
          // Range search
          this.preventivos = await this.reportesService.getReportesPreventivosRango({
            mesInicio: this.mesInicio,
            mesFin: this.mesFin,
            anio: this.anio
          });
          this.correctivos = await this.reportesService.getReportesCorrectivosRango({
            mesInicio: this.mesInicio,
            mesFin: this.mesFin,
            anio: this.anio
          });
        }

        // Populate pre-filtered arrays for Metas panel
        this.preventivosRealizados = this.preventivos.filter(r => r.realizado);
        this.preventivosPendientes = this.preventivos.filter(r => !r.realizado);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error cargando reportes',
          text: 'No se pudo cargar la información.'
        });
      } finally {
        this.loading = false;
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Seleccione año, mes inicio y mes fin.'
      });
    }
  }

  viewPreventivos() {
    this.panelPreventivos = true;
    this.panelCorrectivos = false;
    this.panelMetas = false;
  }
  viewCorrectivos() {
    this.panelPreventivos = false;
    this.panelCorrectivos = true;
    this.panelMetas = false;
  }
  viewMetas() {
    this.panelPreventivos = false;
    this.panelCorrectivos = false;
    this.panelMetas = true;
  }

  panelRealizadosView() {
    this.panelRealizados = true;
    this.panelPendientes = false;
  }

  panelPendientesView() {
    this.panelRealizados = false;
    this.panelPendientes = true;
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  nuevoReporte(idEquipo: number, idReporte: number) {
    sessionStorage.setItem('TipoMantenimiento', 'P');
    sessionStorage.setItem('idReporte', idReporte.toString());
    this.router.navigate(['biomedica/nuevoreporte/', idEquipo]);
  }

  obtenerNombreMes(numeroMes: number): string {
    const meses: string[] = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    if (numeroMes < 1 || numeroMes > 12) {
      throw new Error("El número debe estar entre 1 y 12.");
    }
    return meses[numeroMes - 1];
  }

  goBack(): void {
    this.location.back();
  }

  verReportesEquipo(id: number) {

    this.router.navigate(['/biomedica/reportesequipo/', id]);
  }

  verificarVencimiento(mes: any, anio: any): boolean {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    if (anioActual < anio) return true;

    if (anioActual === anio && mesActual <= mes) return true;

    return false;
  }

  async viewModalReport(reporte: any) {
    this.loading = true;
    try {
      const id = (reporte && typeof reporte === 'object') ? reporte.id : reporte;
      this.reportSelected = await this.reportesService.getReporteById(id);
      this.rutina = await this.protocolosServices.getCumplimientoProtocoloReporte(id);
      this.modalReport = true;
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar la información del reporte.', 'error');
    } finally {
      this.loading = false;
    }
  }

  async viewPdf(ruta: string) {
    try {
      const blob = await this.archivosServices.getArchivo(ruta);
      if (blob.type === 'application/pdf') {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank'); // Abre el PDF en nueva pestaña
      } else {
        const errorText = await blob.text();
        console.error('No se recibió un PDF:', errorText);
      }
    } catch (error) {
      console.error('Error al obtener el PDF:', error);
    }
  }

  editarReporte() {
    if (!this.reportSelected) return;

    // Determinar tipo de mantenimiento basado en el reporte seleccionado
    // Asumimos 'Preventivo' si tiene 'Preventivo' en tipoMantenimiento, 'Correctivo' si no.
    // O mejor, usar la propiedad tipoMantenimiento si coincide con lo esperado ('Preventivo', 'Correctivo')
    let tipo = 'C';
    if (this.reportSelected.tipoMantenimiento === 'Preventivo') {
      tipo = 'P';
    }
    // Si hay otros tipos, ajustar lógica. Por ahora P o C.

    sessionStorage.setItem('TipoMantenimiento', tipo);
    sessionStorage.setItem('idReporte', this.reportSelected.id.toString());

    this.modalReport = false; // Cerrar modal
    this.router.navigate(['biomedica/nuevoreporte/', this.reportSelected.equipo.id]);
  }
  descargarFormato() {
    if (this.reportSelected) {
      if (this.reportSelected.tipoMantenimiento === 'Preventivo') {
        // Enforce alias consistency for PDF generator if needed, 
        // though backend now uses 'cumplimientoProtocolo'
        this.pdfGeneratorService.generateReportePreventivo(this.reportSelected);
      } else {
        this.pdfGeneratorService.generateReporteCorrectivo(this.reportSelected);
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async subirPdf() {
    if (!this.selectedFile || !this.reportSelected) return;

    try {
      const res = await this.reportesService.uploadReportePdf(this.reportSelected.id, this.selectedFile);
      Swal.fire('Éxito', 'Reporte PDF subido correctamente', 'success');
      this.reportSelected.rutaPdf = res.rutaPdf;
      this.selectedFile = null;
      await this.setDate(); // Actualizar la tabla para que cambie el botón
    } catch (error) {
      console.error('Error al subir PDF:', error);
      Swal.fire('Error', 'No se pudo subir el archivo PDF', 'error');
    }
  }
}
