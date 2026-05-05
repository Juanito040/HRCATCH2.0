import { Component, inject, OnInit } from '@angular/core';
import { ResponsableService } from '../../../Services/appServices/biomedicaServices/responsable/responsable.service';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clasificacion-comodatos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clasificacion-comodatos.component.html',
  styleUrl: './clasificacion-comodatos.component.css'
})
export class ClasificacionComodatosComponent {

  responsables!: any[];
  cantidadesEquipos: { [id: number]: number } = {};
  responsableServices = inject(ResponsableService)
  searchText: string = '';

  constructor(private router: Router) {
  }

  async ngOnInit() {
    try {
      this.responsables = await this.responsableServices.getAllResponsablesComodatos();


      for (let responsable of this.responsables) {
        this.obtenerCantidadEquipos(responsable.id);
      }
    } catch {

    }
  }

  async obtenerCantidadEquipos(idResponsable: number) {
    try {
      const cantidad = await this.responsableServices.getCantidadEquipos(idResponsable);
      this.cantidadesEquipos[idResponsable] = cantidad;
    } catch (error) {
      console.error(`Error al obtener la cantidad de equipos para el responsable ${idResponsable}`, error);
      this.cantidadesEquipos[idResponsable] = 0; // En caso de error, poner 0
    }
  }


  filteredResponsable() {
    return this.responsables.filter(responsable =>
      responsable.nombres.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  viewEquiposComodatos(idServicio: any) {
    sessionStorage.setItem("idResponsable", idServicio);
    this.router.navigate(['biomedica/equiposcomodatos']);
  }
}
