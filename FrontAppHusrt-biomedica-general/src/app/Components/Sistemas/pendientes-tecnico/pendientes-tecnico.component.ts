import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from "primeng/card";
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SysReporteService } from '../../../Services/appServices/sistemasServices/sysreporte/sysreporte.service';
import { ArchivosService } from '../../../Services/appServices/general/archivos/archivos.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { SysprotocoloService } from '../../../Services/appServices/sistemasServices/sysprotocolo/sysprotocolo.service';
import { SysmantenimientoService } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';

@Component({
    selector: 'app-pendientes-tecnico',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        CardModule,
        DialogModule,
        ButtonModule,
        TooltipModule,
        TagModule,
        FormsModule,
        DatePickerModule,
        TagModule
    ],
    templateUrl: './pendientes-tecnico.component.html',
    styleUrl: './pendientes-tecnico.component.css'
})
export class SisPendientesTecnicoComponent implements OnInit {

    @ViewChild('dtPendientes') dtPendientes!: Table;

    reportesService = inject(SysReporteService);
    archivosServices = inject(ArchivosService);
    protocolosServices = inject(SysprotocoloService);
    mantenimientoServices = inject(SysmantenimientoService);
    router = inject(Router);

    pendientes: any[] = [];
    allPendientes: any[] = [];
    dateFilter: Date | undefined;
    loading: boolean = false;

    reportSelected!: any;
    rutina!: any[];
    modalReport: boolean = false;

    constructor() { }

    async ngOnInit() {
        await this.cargarPendientes();
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (Error) {
            return null;
        }
    }

    async cargarPendientes() {
        this.loading = true;
        try {
            const token = sessionStorage.getItem('utoken');
            if (token) {
                const decoded = this.getDecodedAccessToken(token);
                if (decoded && decoded.id) {
                    const reportes = await this.mantenimientoServices.getReportesUsuario(decoded.id);

                    if (reportes) {
                        // Filter: Preventivo AND (!Realizado OR (Realizado AND !rutaPdf))
                        this.allPendientes = reportes.filter((r: any) => {
                            if (r.tipoMantenimiento !== 'Preventivo') return false;

                            const noRealizado = !r.realizado;
                            const realizadoSinPdf = r.realizado && !r.rutaPdf; // Assuming rutaPdf is null/undefined/empty string if missing

                            return noRealizado || realizadoSinPdf;
                        });
                        this.filtrarPendientes();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar pendientes',
                text: 'No se pudieron cargar los mantenimientos pendientes.'
            });
        } finally {
            this.loading = false;
        }
    }

    filtrarPendientes() {
        if (!this.dateFilter) {
            this.pendientes = [...this.allPendientes];
            return;
        }

        const mesFilter = this.dateFilter.getMonth(); // 0-11
        const anioFilter = this.dateFilter.getFullYear();

        this.pendientes = this.allPendientes.filter(r => {
            // mesProgramado is 0-indexed in DB based on Admin View displaying +1
            return r.mesProgramado === mesFilter && r.añoProgramado === anioFilter;
        });
    }

    realizarReporte(idEquipo: number, idReporte: number) {
        localStorage.setItem('TipoMantenimiento', 'P');              
        localStorage.setItem('idMantenimiento', idReporte.toString());
        this.router.navigate(['adminsistemas/reporteMantenimiento', idEquipo]);
    }

    // Reuse modal logic
    async viewModalReport(reporte: any) {
        this.modalReport = true;
        try {
            this.reportSelected = await this.reportesService.getById(reporte.id);
            this.rutina = await this.protocolosServices.getCumplimientoProtocoloMantenimiento(this.reportSelected.id);
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

    onGlobalFilter(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dtPendientes.filterGlobal(target.value, 'contains');
        }
    }

    getStatus(report: any) {
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth(); // 0-11
        const anioActual = fechaActual.getFullYear();

        const mesProg = report.mesProgramado; // 0-11 (DB)
        const anioProg = report['añoProgramado'];

        // Logic:
        // If Year Actual > Year Prog: Overdue -> PENDIENTE
        // If Year Actual == Year Prog:
        //    If Month Actual > Month Prog: Overdue -> PENDIENTE
        //    If Month Actual == Month Prog: PROGRAMADO
        //    If Month Actual < Month Prog: PROGRAMADO (Future)
        // If Year Actual < Year Prog: PROGRAMADO (Future)

        if (anioActual > anioProg) {
            return { label: 'PENDIENTE', severity: 'danger' };
        } else if (anioActual === anioProg) {
            if (mesActual > mesProg) {
                return { label: 'PENDIENTE', severity: 'danger' };
            } else {
                return { label: 'PROGRAMADO', severity: 'warning' }; // Month Actual <= Month Prog
            }
        } else {
            return { label: 'PROGRAMADO', severity: 'warning' };
        }
    }
}

