
import { Component, inject, OnInit } from '@angular/core';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SedeService } from '../../../Services/appServices/general/sede/sede.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-clasificacion-servicios-sede',
    standalone: true,
    imports: [FormsModule, CommonModule, CardModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule],
    templateUrl: './clasificacion-servicios-sede.component.html',
    styleUrl: './clasificacion-servicios-sede.component.css'
})
export class ClasificacionServiciosSedeComponent implements OnInit {

    servicios!: any[];
    sede: any;
    loading: boolean = false;
    cantidadesEquipos: { [id: number]: number } = {};

    servicioServices = inject(ServicioService);
    sedeServices = inject(SedeService);
    searchText: string = '';

    constructor(private router: Router) {
    }

    async ngOnInit() {
        const idSede = sessionStorage.getItem('idSede');
        if (idSede) {
            try {
                this.loading = true;
                this.sede = await this.sedeServices.getSedeById(idSede);
                this.servicios = await this.servicioServices.getServiciosBySede(idSede);

                for (let servicio of this.servicios) {
                    this.obtenerCantidadEquipos(servicio.id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    }

    async obtenerCantidadEquipos(idServicio: number) {
        try {
            const cantidad = await this.servicioServices.getCantidadEquipos(idServicio);
            this.cantidadesEquipos[idServicio] = cantidad;
        } catch (error) {
            this.cantidadesEquipos[idServicio] = 0;
        }
    }

    filteredServicios() {
        if (!this.servicios) return [];
        return this.servicios.filter(servicio =>
            servicio.nombres.toLowerCase().includes(this.searchText.toLowerCase())
        );
    }

    viewEquiposServicio(idServicio: any) {
        sessionStorage.setItem("idServicio", idServicio);
        this.router.navigate(['biomedica/equiposservicio']);
    }
}
