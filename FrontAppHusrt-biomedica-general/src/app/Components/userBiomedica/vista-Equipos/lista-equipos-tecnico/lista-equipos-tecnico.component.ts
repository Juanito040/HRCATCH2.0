import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BiomedicausernavbarComponent } from '../../../navbars/biomedicausernavbar/biomedicausernavbar.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { obtenerNombreMes } from '../../../../utilidades';

@Component({
    selector: 'app-lista-equipos-tecnico',
    standalone: true,
    imports: [TableModule, CommonModule, IconFieldModule,
        InputIconModule, InputTextModule, SplitButtonModule],
    templateUrl: './lista-equipos-tecnico.component.html',
    styleUrl: './lista-equipos-tecnico.component.css'
})
export class ListaEquiposTecnicoComponent implements OnInit {

    @ViewChild('dt2') dt2!: Table;
    equipos!: any[];
    loading: boolean = false;
    equipoServices = inject(EquiposService);

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
            this.equipos = data.map((equipo: any) => ({
                ...equipo,
                opciones: [
                    {
                        label: 'Ver Hoja de Vida',
                        icon: 'pi pi-eye',
                        command: () => this.verHojaVida(equipo.id)
                    },
                    {
                        label: 'Ver Reportes',
                        icon: 'pi pi-external-link',
                        command: () => this.verReportes(equipo.id)
                    }
                ]
            }));
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

    verHojaVida(id: number) {
        this.router.navigate(['biomedica/hojavidaequipo', id]);
    }

    verReportes(id: number) {
        this.router.navigate(['biomedica/reportesequipo/', id]);
    }

    obtenerMesesConCumplimiento(equipo: any): { mes: string, completado: boolean, year: number }[] {
        if (!equipo.planesMantenimiento || equipo.planesMantenimiento.length === 0) return [];

        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        return equipo.planesMantenimiento.map((p: any) => {
            const mesNum = typeof p === 'object' ? p.mes : p;
            const yearNum = typeof p === 'object' ? p.ano : new Date().getFullYear();

            const reporteEncontrado = equipo.reportesMantenimiento?.find((r: any) => {
                if (!r.fecha) return false;
                const fechaR = new Date(r.fecha);
                return (fechaR.getMonth() + 1) === mesNum && fechaR.getFullYear() === yearNum;
            });

            return {
                mes: meses[mesNum - 1],
                completado: !!reporteEncontrado,
                year: yearNum
            };
        });
    }
}
