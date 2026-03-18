import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BiomedicausernavbarComponent } from '../../../navbars/biomedicausernavbar/biomedicausernavbar.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { PermissionsService } from '../../../../Services/auth/permissions.service';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { obtenerNombreMes } from '../../../../utilidades';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
    selector: 'app-lista-equipos',
    standalone: true,
    imports: [TableModule, CommonModule, IconFieldModule,
        InputIconModule, InputTextModule, SplitButtonModule, ButtonModule, TooltipModule, ToolbarModule, TagModule,
        DialogModule, MultiSelectModule, FormsModule, SelectModule, InputNumberModule, UppercaseDirective],
    templateUrl: './lista-equipos.component.html',
    styleUrl: './lista-equipos.component.css'
})
export class ListaEquiposComponent implements OnInit {

    @ViewChild('dt2') dt2!: Table;
    equipos!: any[];
    loading: boolean = false;
    equipoServices = inject(EquiposService);
    permissionsService = inject(PermissionsService);

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

    constructor(
        private router: Router,
    ) { }

    async ngOnInit() {
        this.cargarEquipos();
    }

    async cargarEquipos() {
        this.loading = true;
        try {
            const data = await this.equipoServices.getAllEquipos();

            const canEdit = this.permissionsService.canEdit();
            const canDelete = this.permissionsService.canDelete();
            const isTecnico = this.permissionsService.isTecnico();

            this.equipos = data.map((equipo: any) => {
                const opciones: MenuItem[] = [];

                if (canEdit) {
                    opciones.push({
                        label: 'Editar',
                        icon: 'pi pi-pencil',
                        command: () => this.editarEquipo(equipo.id)
                    },
                        {
                            label: 'Editar Plan Mantenimiento',
                            icon: 'pi pi-calendar',
                            command: () => this.openPlanDialog(equipo)
                        });
                }

                if (canDelete) {
                    opciones.push({
                        label: 'Desactivar',
                        icon: 'pi pi-trash',
                        command: () => this.desactivarEquipo(equipo)
                    });
                }

                // Options available for everyone (including Tecnico)
                opciones.push(
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
                        command: () => this.nuevoReporte(equipo.id)
                    }
                );

                return {
                    ...equipo,
                    opciones: opciones
                };
            });
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    }

    onGlobalFilter(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt2.filterGlobal(target.value, 'contains');
        }
    }

    editarEquipo(id: number) {
        this.router.navigate(['biomedica/adminequipos/edit/', id]);
    }

    async desactivarEquipo(equipo: any) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas desactivar el equipo ${equipo.nombres} con serie ${equipo.serie}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, desactivar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const equipoUpdate = { ...equipo, estadoBaja: true };
                    await this.equipoServices.updateEquipo(equipo.id, equipoUpdate);
                    Swal.fire(
                        'Desactivado!',
                        'El equipo ha sido desactivado.',
                        'success'
                    );
                    this.cargarEquipos();
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'Hubo un problema al desactivar el equipo.',
                        'error'
                    );
                }
            }
        });
    }

    verHojaVida(id: number) {
        this.router.navigate(['biomedica/hojavidaequipo', id]);
    }

    verReportes(id: number) {
        this.router.navigate(['biomedica/reportesequipo/', id]);
    }

    nuevoReporte(id: number) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('TipoMantenimiento', 'C');
        this.router.navigate(['biomedica/nuevoreporte/', id]);
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
            this.cargarEquipos(); // Recargar para mostrar cambios
        } catch (error) {
            console.error(error);
            Swal.fire(
                'Error!',
                'Hubo un problema al actualizar el plan.',
                'error'
            );
        }
    }

    async descargarInventario() {
        this.loading = true;
        try {
            const blob = await this.equipoServices.exportarInventario();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Inventario_Equipos.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando inventario:', error);
            Swal.fire('Error', 'No se pudo descargar el inventario.', 'error');
        } finally {
            this.loading = false;
        }
    }
}
