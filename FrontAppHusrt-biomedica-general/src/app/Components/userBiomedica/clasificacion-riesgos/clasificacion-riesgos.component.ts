import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquiposService } from '../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-clasificacion-riesgos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './clasificacion-riesgos.component.html',
    styleUrl: './clasificacion-riesgos.component.css'
})
export class ClasificacionRiesgosComponent implements OnInit {

    equiposService = inject(EquiposService);
    router = inject(Router);

    riesgos = ['I', 'IIA', 'IIB', 'III', 'NA'];
    cantidadesEquipos: { [key: string]: number } = {};

    async ngOnInit() {
        for (let riesgo of this.riesgos) {
            this.obtenerCantidadEquipos(riesgo);
        }
    }

    async obtenerCantidadEquipos(riesgo: string) {
        try {
            const cantidad = await this.equiposService.getCantidadEquiposRiesgo(riesgo);
            this.cantidadesEquipos[riesgo] = cantidad;
        } catch (error) {
            console.error(`Error al obtener la cantidad de equipos para el riesgo ${riesgo}`, error);
            this.cantidadesEquipos[riesgo] = 0;
        }
    }

    viewEquiposRiesgo(riesgo: string) {
        sessionStorage.setItem("riesgoSelected", riesgo);
        this.router.navigate(['biomedica/equiposriesgo']);
    }

    obtenerColor(riesgo: string): string {
        switch (riesgo) {
            case 'I': return 'gradient-green';
            case 'IIA': return 'gradient-teal';
            case 'IIB': return 'gradient-yellow';
            case 'III': return 'gradient-orange';
            case 'NA': return 'gradient-gray';
            default: return 'gradient-blue';
        }
    }
}
