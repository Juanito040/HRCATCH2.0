import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { PdfGeneratorService } from '../../../Services/appServices/biomedicaServices/pdf-generator/pdf-generator.service';
import { BiomedicausernavbarComponent } from "../../navbars/biomedicausernavbar/biomedicausernavbar.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from "primeng/card";
import { DialogModule } from 'primeng/dialog';
import { ReportesService } from '../../../Services/appServices/biomedicaServices/reportes/reportes.service';
import { ArchivosService } from '../../../Services/appServices/general/archivos/archivos.service';
import { ProtocolosService } from '../../../Services/appServices/biomedicaServices/protocolos/protocolos.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { TagModule } from 'primeng/tag';


import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-mantenimiento-tecnico',
    standalone: true,
    imports: [CommonModule, TabsModule, TableModule, IconFieldModule, InputIconModule, InputTextModule, CardModule, DialogModule, ButtonModule, TooltipModule, DatePickerModule, FormsModule, TagModule],
    templateUrl: './mantenimiento-tecnico.component.html',
    styleUrl: './mantenimiento-tecnico.component.css'
})
export class MantenimientoTecnicoComponent implements OnInit {

    @ViewChild('dtPendientes') dtPendientes!: Table;
    @ViewChild('dtEjecutados') dtEjecutados!: Table;

    reportesService = inject(ReportesService);
    archivosServices = inject(ArchivosService);
    protocolosServices = inject(ProtocolosService);
    pdfGeneratorService = inject(PdfGeneratorService);
    router = inject(Router);

    // Listas para la vista
    preventivosPendientes: any[] = [];
    preventivosEjecutados: any[] = [];
    correctivos: any[] = [];

    // Listas con todos los datos
    allPreventivos: any[] = [];
    allCorrectivos: any[] = [];

    // Control de tabs principales
    panelPreventivos: boolean = true;
    panelCorrectivos: boolean = false;

    // Control de sub-tabs Preventivos
    panelPendientes: boolean = true;
    panelEjecutados: boolean = false;

    loading: boolean = false;

    reportSelected!: any;
    rutina!: any[];
    modalReport: boolean = false;
    selectedFile: File | null = null;

    // Dates for each panel
    datePreventivo: Date | undefined;
    dateCorrectivo: Date | undefined;

    constructor() { }

    async ngOnInit() {
        this.datePreventivo = new Date();
        this.dateCorrectivo = new Date();
        await this.cargarReportes();
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (Error) {
            return null;
        }
    }

    async cargarReportes() {
        this.loading = true;
        try {
            const token = sessionStorage.getItem('utoken');
            if (token) {
                const decoded = this.getDecodedAccessToken(token);
                if (decoded && decoded.id) {
                    const reportes = await this.reportesService.getReportesUsuario(decoded.id);

                    if (reportes) {
                        this.allPreventivos = reportes.filter((r: any) => r.tipoMantenimiento === 'Preventivo');
                        this.allCorrectivos = reportes.filter((r: any) => r.tipoMantenimiento === 'Correctivo');

                        this.filtrarPreventivos();
                        this.filtrarCorrectivos();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar reportes',
                text: 'No se pudieron cargar sus reportes asignados.'
            });
        } finally {
            this.loading = false;
        }
    }

    filtrarPreventivos() {
        let filtered = [...this.allPreventivos];

        if (this.datePreventivo) {
            const mesFilter = this.datePreventivo.getMonth(); // 0-11
            const anioFilter = this.datePreventivo.getFullYear();

            filtered = filtered.filter((r: any) => {
                if (!r.mesProgramado || !r.añoProgramado) return false;
                // mesProgramado is 1-12, mesFilter is 0-11
                return r.mesProgramado === (mesFilter + 1) && r.añoProgramado === anioFilter;
            });
        }

        this.preventivosPendientes = filtered.filter(r => !r.realizado);
        this.preventivosEjecutados = filtered.filter(r => r.realizado);
    }

    filtrarCorrectivos() {
        if (!this.dateCorrectivo) {
            this.correctivos = [...this.allCorrectivos];
            return;
        }

        const mesFilter = this.dateCorrectivo.getMonth(); // 0-11
        const anioFilter = this.dateCorrectivo.getFullYear();

        this.correctivos = this.allCorrectivos.filter((r: any) => {
            if (!r.fechaRealizado) return false;

            // fechaRealizado expected as 'YYYY-MM-DD'
            // Using string split is safer than Date() to avoid timezone shifts
            const parts = r.fechaRealizado.split('-');
            if (parts.length !== 3) return false;

            const anio = parseInt(parts[0], 10);
            const mes = parseInt(parts[1], 10) - 1; // 0-11

            return mes === mesFilter && anio === anioFilter;
        });
    }

    viewPreventivos() {
        this.panelPreventivos = true;
        this.panelCorrectivos = false;
    }

    viewCorrectivos() {
        this.panelPreventivos = false;
        this.panelCorrectivos = true;
    }

    viewPendientes() {
        this.panelPendientes = true;
        this.panelEjecutados = false;
    }

    viewEjecutados() {
        this.panelPendientes = false;
        this.panelEjecutados = true;
    }

    // Same logic as ManteniminetoComponent for viewing details
    async viewModalReport(reporte: any) {
        this.modalReport = true;
        try {
            this.reportSelected = await this.reportesService.getReporteById(reporte.id); // Assuming passing object or ID
            // Note: ManteniminetoComponent passed 'reporte' which seemed to be an ID in some contexts or object in others.
            // Let's assume it's the ID if getReporteById expects an ID.
            // Actually ManteniminetoComponent passed 'reporte' directly to getReporteById. 
            // If 'reporte' is the object from the table, we should use 'reporte.id'.
            this.rutina = await this.protocolosServices.getCumplimientoProtocoloReporte(this.reportSelected.id);
        } catch (e) {
            console.error(e);
        }
    }

    async viewPdf(ruta: string) {
        try {
            const blob = await this.archivosServices.getArchivo(ruta);
            if (blob.type === 'application/pdf') {
                const objectUrl = URL.createObjectURL(blob);
                window.open(objectUrl, '_blank');
            } else {
                const errorText = await blob.text();
                console.error('No se recibió un PDF:', errorText);
            }
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
        }
    }

    onGlobalFilter(event: Event, table: Table): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            table.filterGlobal(target.value, 'contains');
        }
    }

    realizarReporte(idEquipo: number, idReporte: number) {
        sessionStorage.setItem('TipoMantenimiento', 'P'); // Assuming Preventive for assigned tasks? Or could be Corrective
        sessionStorage.setItem('idReporte', idReporte.toString());
        this.router.navigate(['biomedica/nuevoreporte/', idEquipo]);
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
            await this.cargarReportes(); // Actualizar la tabla para que cambie el botón
        } catch (error) {
            console.error('Error al subir PDF:', error);
            Swal.fire('Error', 'No se pudo subir el archivo PDF', 'error');
        }
    }

    descargarFormato() {
        if (this.reportSelected) {
            if (this.reportSelected.tipoMantenimiento === 'Preventivo') {
                this.pdfGeneratorService.generateReportePreventivo(this.reportSelected);
            } else {
                this.pdfGeneratorService.generateReporteCorrectivo(this.reportSelected);
            }
        }
    }

    editarReporte() {
        if (!this.reportSelected) return;

        let tipo = 'C';
        if (this.reportSelected.tipoMantenimiento === 'Preventivo') {
            tipo = 'P';
        }

        sessionStorage.setItem('TipoMantenimiento', tipo);
        sessionStorage.setItem('idReporte', this.reportSelected.id.toString());

        this.modalReport = false;
        this.router.navigate(['biomedica/nuevoreporte/', this.reportSelected.equipo.id]);
    }
}
