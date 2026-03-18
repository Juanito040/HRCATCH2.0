import { Component, inject, OnInit } from '@angular/core';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BiomedicausernavbarComponent } from '../../navbars/biomedicausernavbar/biomedicausernavbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clasificacion-tipo-equipo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clasificacion-tipo-equipo.component.html',
  styleUrl: './clasificacion-tipo-equipo.component.css'
})
export class ClasificacionTipoEquipoComponent implements OnInit {

  tiposEquipos!: any[];
  cantidadesEquipos: { [id: number]: number } = {};
  tipoEquipoServices = inject(TipoEquipoService);
  searchText: string = '';

  constructor(private router: Router) {
  }

  async ngOnInit() {
    try {
      this.tiposEquipos = await this.tipoEquipoServices.getTiposEquiposBiomedica();

      for (let tipoEquipo of this.tiposEquipos) {
        this.obtenerCantidadEquipos(tipoEquipo.id);
      }
    } catch {

    }
  }

  async obtenerCantidadEquipos(idTipoEquipo: number) {
    try {
      const cantidad = await this.tipoEquipoServices.getCantidadEquipos(idTipoEquipo);
      this.cantidadesEquipos[idTipoEquipo] = cantidad;
    } catch (error) {
      console.error(`Error al obtener la cantidad de equipos para el responsable ${idTipoEquipo}`, error);
      this.cantidadesEquipos[idTipoEquipo] = 0; // En caso de error, poner 0
    }
  }

  filteredTiposEquipos() {
    return this.tiposEquipos?.filter(tipoEquipo =>
      tipoEquipo.nombres.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  viewEquiposTipos(idServicio: any) {
    sessionStorage.setItem("idTipoEquipo", idServicio);
    this.router.navigate(['biomedica/equipostipo']);
  }

}
