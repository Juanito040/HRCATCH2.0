import { Component, inject, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';
import { PdfGeneratorService } from '../../../../Services/appServices/biomedicaServices/pdf-generator/pdf-generator.service';
import { ReportesService } from '../../../../Services/appServices/biomedicaServices/reportes/reportes.service';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { ProtocolosService } from '../../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { MetrologiaService } from '../../../../Services/appServices/biomedicaServices/metrologia/metrologia.service';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Dialog } from "primeng/dialog";
import { CardModule } from "primeng/card";
import { ArchivosService } from '../../../../Services/appServices/general/archivos/archivos.service'
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-ver-reporte',
  standalone: true,
  imports: [TableModule, IconFieldModule, InputIconModule, InputTextModule, SplitButtonModule, ButtonModule, CommonModule, Dialog, CardModule, PanelModule, TabViewModule, TagModule, TooltipModule],
  templateUrl: './ver-reporte.component.html',
  styleUrl: './ver-reporte.component.css'
})
export class VerReporteComponent implements OnInit {
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('dt3') dt3!: Table;
  pdfGeneratorService = inject(PdfGeneratorService);
  idEquipo: string | null = null;
  reportes!: any[];
  rutina!: any[];
  equipo!: any;
  metrologiaService = inject(MetrologiaService);
  metrologiaReportes: any[] = [];

  reporteServices = inject(ReportesService);
  equipoService = inject(EquiposService);
  archivosServices = inject(ArchivosService);
  protocolosServices = inject(ProtocolosService);
  router = inject(Router);
  loading: boolean = false;
  modalReport: boolean = false;
  reportSelected: any = null;
  selectedFile: File | null = null;
  userRole: string = '';
  isTecnico: boolean = false;

  constructor(private route: ActivatedRoute) { }

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

  userId: any = null;

  async ngOnInit() {
    this.idEquipo = this.route.snapshot.paramMap.get('id');
    const token = sessionStorage.getItem('utoken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userId = decoded.id;
        this.userRole = decoded.rol;
        this.isTecnico = this.userRole === 'BIOMEDICATECNICO';
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    try {
      this.equipo = await this.equipoService.getEquipoById(this.idEquipo);

      const resReportes = await this.reporteServices.getReportesEquipo(this.idEquipo);
      if (resReportes && Array.isArray(resReportes)) {
        this.reportes = resReportes.sort((a: any, b: any) => {
          const dateA = a.fechaRealizado ? new Date(a.fechaRealizado).getTime() : Infinity;
          const dateB = b.fechaRealizado ? new Date(b.fechaRealizado).getTime() : Infinity;
          return dateB - dateA;
        });
      }

      // Fetch Metrology Reports
      const resMetrologia = await this.metrologiaService.getReportesMetrologiaEquipo(this.idEquipo);
      if (resMetrologia && Array.isArray(resMetrologia)) {
        this.metrologiaReportes = resMetrologia.sort((a: any, b: any) => {
          const dateA = a.fechaRealizado ? new Date(a.fechaRealizado).getTime() : Infinity;
          const dateB = b.fechaRealizado ? new Date(b.fechaRealizado).getTime() : Infinity;
          return dateB - dateA;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  verHojaVida() {
    this.router.navigate(['biomedica/hojavidaequipo/', this.idEquipo]);
  }

  // ... existing code ...

  async viewModalReport(reporte: any) {
    this.modalReport = true;
    try {
      this.reportSelected = await this.reporteServices.getReporteById(reporte.id);
    } catch (error) {
      console.error('Error fetching report details:', error);
      this.reportSelected = reporte; // Fallback
    }
    this.rutina = await this.protocolosServices.getCumplimientoProtocoloReporte(this.reportSelected.id);
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  onGlobalFilterMetrologia(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt3.filterGlobal(target.value, 'contains');
    }
  }

  editarReporte(idReporte: any, idEquipo: any) {
    sessionStorage.setItem('TipoMantenimiento', 'P');
    sessionStorage.setItem('idReporte', idReporte.toString());
    this.router.navigate(['biomedica/nuevoreporte/', idEquipo]);
  }

  isGuest(): boolean {
    const token = sessionStorage.getItem('utoken');
    if (!token) return true;
    try {
      const decoded: any = jwtDecode(token);
      return decoded?.rol === 'INVITADO';
    } catch {
      return true;
    }
  }

  descargarFormato() {
    if (this.reportSelected) {
      if (this.reportSelected.tipoMantenimiento === 'Preventivo') {
        // Now compliance is pre-loaded by backend in reportSelected.cumplimientoProtocolo
        // We ensure data structure consistency for the PDF generator
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
      const res = await this.reporteServices.uploadReportePdf(this.reportSelected.id, this.selectedFile);
      Swal.fire('Éxito', 'Reporte PDF subido correctamente', 'success');
      this.reportSelected.rutaPdf = res.rutaPdf;
      this.selectedFile = null;
    } catch (error) {
      console.error('Error al subir PDF:', error);
      Swal.fire('Error', 'No se pudo subir el archivo PDF', 'error');
    }
  }
}
