
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { SedeService } from '../../../../Services/appServices/general/sede/sede.service';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { getDecodedAccessToken, obtenerNombreMes } from '../../../../utilidades';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HistorialEquiposComponent } from '../historial-equipos/historial-equipos.component';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-equipos-sede',
    standalone: true,
    imports: [FormsModule, CommonModule, TableModule,
        SplitButtonModule, SpeedDialModule, IconFieldModule, InputIconModule, InputTextModule, DialogModule, MultiSelectModule, SelectModule, InputNumberModule, ButtonModule],
    providers: [DialogService],
    templateUrl: './equipos-sede.component.html',
    styleUrl: './equipos-sede.component.css'
})
export class EquiposSedeComponent implements OnInit {

    @ViewChild('dt2') dt2!: Table;
    equipos!: any[];
    sede!: any;
    loading: boolean = false;
    ref: DynamicDialogRef | undefined;

    // Variables para el modal de edición de plan
    displayPlanDialog: boolean = false;
    currentEquipo: any = null;
    selectedMonths: any[] = [];
    selectedPlans: any[] = []; // Array of objects { mes, ano }
    periodicidad: number = 0; // Legacy field
    intervencionesAnuales: number = 1;
    mesInicio: number = 1;
    anioInicio: number = new Date().getFullYear();
    calculatedMonthsText: string = '';

    intervencionOptions = [
        { name: '1 vez al año (Anual)', value: 1 },
        { name: '2 veces al año (Semestral)', value: 2 },
        { name: '3 veces al año (Cuatrimestral)', value: 3 },
        { name: '4 veces al año (Trimestral)', value: 4 }
    ];

    anioOptions = Array.from({ length: 11 }, (_, i) => ({ name: (new Date().getFullYear() + i).toString(), value: new Date().getFullYear() + i }));

    monthOptions: any[] = [
        { name: 'Enero', value: 1 },
        { name: 'Febrero', value: 2 },
        { name: 'Marzo', value: 3 },
        { name: 'Abril', value: 4 },
        { name: 'Mayo', value: 5 },
        { name: 'Junio', value: 6 },
        { name: 'Julio', value: 7 },
        { name: 'Agosto', value: 8 },
        { name: 'Septiembre', value: 9 },
        { name: 'Octubre', value: 10 },
        { name: 'Noviembre', value: 11 },
        { name: 'Diciembre', value: 12 }
    ];

    equipoServices = inject(EquiposService);
    sedeServices = inject(SedeService);

    constructor(
        private router: Router,
        public dialogService: DialogService
    ) { }

    async ngOnInit() {
        if (typeof sessionStorage === 'undefined') return;
        const idSede = sessionStorage.getItem('idSede');
        if (idSede) {
            this.loading = true;
            try {
                const equiposData = await this.equipoServices.getAllEquiposSede(idSede);
                this.sede = await this.sedeServices.getSedeById(idSede);

                this.equipos = this.mapEquipos(equiposData);
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    }

    mapEquipos(datos: any[]): any[] {
        return datos.map((equipo: any) => ({
            ...equipo,
            opcionesHV: [
                {
                    label: 'Editar',
                    icon: 'pi pi-pencil',
                    command: () => this.editarEquipo(equipo.id),
                    visible: ['BIOMEDICAADMIN', 'SUPERADMIN', 'BIOMEDICAUSER'].includes(getDecodedAccessToken().rol)
                },
                {
                    label: 'Editar Plan Mantenimiento',
                    icon: 'pi pi-calendar',
                    command: () => this.openPlanDialog(equipo),
                    visible: ['BIOMEDICAADMIN', 'SUPERADMIN'].includes(getDecodedAccessToken().rol)
                },
                {
                    label: 'Ver Hoja de Vida',
                    icon: 'pi pi-eye',
                    command: () => this.verHojaVida(equipo.id)
                },
                {
                    label: 'Reportes',
                    icon: 'pi pi-external-link',
                    command: () => this.verReportes(equipo.id)
                },
                {
                    label: 'Nuevo reporte',
                    icon: 'pi pi-upload',
                    command: () => this.nuevoReporte(equipo.id),
                    visible: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'BIOMEDICATECNICO'].includes(getDecodedAccessToken().rol)
                },
                {
                    label: 'Historial',
                    icon: 'pi pi-history',
                    command: () => this.verHistorial(equipo.id)
                }
            ]
        }));
    }

    onGlobalFilter(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt2.filterGlobal(target.value, 'contains');
        }
    }

    verHojaVida(id: number) {
        this.router.navigate(['biomedica/hojavidaequipo', id]);
    }

    editarEquipo(id: number) {
        this.router.navigate(['biomedica/adminequipos/edit/', id]);
    }

    nuevoReporte(id: number) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('TipoMantenimiento', 'C');
        this.router.navigate(['biomedica/nuevoreporte/', id]);
    }

    verReportes(id: number) {
        this.router.navigate(['biomedica/reportesequipo/', id]);
    }

    verHistorial(id: number) {
        this.ref = this.dialogService.open(HistorialEquiposComponent, {
            header: 'Historial de Cambios',
            width: '50vw',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
            data: {
                idEquipo: id
            }
        });
    }

    obtenerMesesTexto(planes: any[]): string {
        if (!planes || planes.length === 0) {
            return 'Sin programación';
        }
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        // Filter duplicates and sort
        const uniqueMeses = [...new Set(planes.map(p => p.mes))].sort((a: any, b: any) => a - b);

        return uniqueMeses.map((m: any) => meses[m - 1]).join(', ');
    }

    obtenerMesesConCumplimiento(equipo: any): any[] {
        const planes = equipo.planesMantenimiento || [];
        const reportes = equipo.reporte || [];
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const meses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        return planes.map((p: any) => {
            const m = typeof p === 'object' ? p.mes : p;
            const y = typeof p === 'object' ? p.ano : currentYear;

            const reporte = reportes.find((r: any) => r.mesProgramado === m && (r.añoProgramado === y || !r.añoProgramado));
            let color = '';

            if (reporte) {
                if (reporte.realizado) {
                    color = '#2ecc71'; // Verde (Realizado)
                } else {
                    if (currentYear > y || (currentYear === y && currentMonth > m)) {
                        color = '#e74c3c'; // Rojo (Vencido)
                    } else {
                        color = '#f1c40f'; // Amarillo (Pendiente)
                    }
                }
            } else {
                if (currentYear > y || (currentYear === y && currentMonth > m)) {
                    color = '#e74c3c'; // Rojo (Vencido)
                } else if (currentYear === y && currentMonth === m) {
                    color = '#f1c40f'; // Amarillo (Este mes)
                } else {
                    color = '#3498db'; // Azul (Futuro)
                }
            }

            const mesNombre = meses[m - 1];
            const mostrarAnio = y !== currentYear;

            return {
                mes: mostrarAnio ? `${mesNombre} ${y}` : mesNombre,
                color: color
            };
        });
    }

    obtenerColorRiesgo(riesgo: string): string {
        switch (riesgo) {
            case 'I': return '#4caf50'; // Verde
            case 'IIA': return '#90EE90'; // Verde claro
            case 'IIB': return '#ffff00'; // Amarillo
            case 'III': return '#ffcc80'; // Naranja claro
            default: return 'transparent';
        }
    }

    openPlanDialog(equipo: any) {
        this.currentEquipo = equipo;
        this.displayPlanDialog = true;

        if (equipo.planesMantenimiento && equipo.planesMantenimiento.length > 0) {
            const firstPlan = equipo.planesMantenimiento[0];
            this.mesInicio = firstPlan.mes || 1;
            this.anioInicio = firstPlan.ano || new Date().getFullYear();
            this.intervencionesAnuales = equipo.periodicidadM || 1;
            this.selectedPlans = equipo.planesMantenimiento;
        } else {
            this.mesInicio = new Date().getMonth() + 1;
            this.anioInicio = new Date().getFullYear();
            this.intervencionesAnuales = 1;
            this.selectedPlans = [];
        }

        this.calcularFechas();
    }

    calcularFechas() {
        if (!this.intervencionesAnuales || this.intervencionesAnuales <= 0) {
            this.calculatedMonthsText = 'Intervenciones no válidas';
            return;
        }

        const interval = 12 / this.intervencionesAnuales;
        const nuevosPlanes = [];
        let m = this.mesInicio;
        let y = this.anioInicio;

        for (let i = 0; i < this.intervencionesAnuales; i++) {
            let calcMonth = m + (i * interval);
            let calcYear = y + Math.floor((calcMonth - 1) / 12);
            calcMonth = ((calcMonth - 1) % 12) + 1;

            nuevosPlanes.push({ mes: Math.floor(calcMonth), ano: calcYear });
        }

        this.selectedPlans = nuevosPlanes;
        this.updateCalculatedText();
    }

    updateCalculatedText() {
        if (!this.selectedPlans || this.selectedPlans.length === 0) {
            this.calculatedMonthsText = 'Sin fechas seleccionadas';
            return;
        }

        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const textPlanes = this.selectedPlans.map(p => `${meses[p.mes - 1]} ${p.ano}`).join(', ');
        this.calculatedMonthsText = `Ciclo calculado: ${textPlanes}`;
    }

    async savePlan() {
        if (!this.currentEquipo) return;

        try {
            // Reconstruimos el array de planes basados en selectedMonths

            const equipoUpdate = {
                ...this.currentEquipo,
                periodicidadM: this.intervencionesAnuales,
                planesMantenimiento: this.selectedPlans
            };

            await this.equipoServices.updateEquipo(this.currentEquipo.id, equipoUpdate);

            Swal.fire(
                'Actualizado!',
                'El plan de mantenimiento ha sido actualizado.',
                'success'
            );

            this.displayPlanDialog = false;
            // Recargar equipos para mostrar cambios
            const idSede = sessionStorage.getItem('idSede');
            if (idSede) {
                const equiposData = await this.equipoServices.getAllEquiposSede(idSede);
                this.equipos = this.mapEquipos(equiposData);
            }
        } catch (error) {
            console.error(error);
            Swal.fire(
                'Error!',
                'Hubo un problema al actualizar el plan.',
                'error'
            );
        }
    }
}
