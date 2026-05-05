
import { Component, inject, OnInit } from '@angular/core';
import { SedeService } from '../../../Services/appServices/general/sede/sede.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-clasificacion-sedes',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './clasificacion-sedes.component.html',
    styleUrl: './clasificacion-sedes.component.css'
})
export class ClasificacionSedesComponent implements OnInit {

    sedes!: any[];
    sedeServices = inject(SedeService)
    searchText: string = '';

    constructor(private router: Router) {
    }

    async ngOnInit() {
        try {
            this.sedes = await this.sedeServices.getAllSedes();
        } catch {

        }
    }

    filteredSedes() {
        return this.sedes.filter(sede =>
            sede.nombres.toLowerCase().includes(this.searchText.toLowerCase())
        );
    }

    viewServiciosSede(idSede: any) {
        sessionStorage.setItem("idSede", idSede);
        this.router.navigate(['biomedica/serviciossede']);
    }
}
