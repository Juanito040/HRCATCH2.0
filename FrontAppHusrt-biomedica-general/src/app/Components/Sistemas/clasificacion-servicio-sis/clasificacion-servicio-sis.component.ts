import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-clasificacion-servicio-sis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clasificacion-servicio-sis.component.html',
  styleUrl: './clasificacion-servicio-sis.component.css'
})
export class ClasificacionServicioSisComponent implements OnInit {

  servicios: any[] = [];
  cantidadesEquipos: { [id: number]: number | undefined } = {};
  searchText: string = '';
  filtroRelacion: 'todos' | 'con-equipos' | 'sin-equipos' = 'todos';
  isLoading: boolean = false;
  error: string | null = null;

  private servicioService = inject(ServicioService);
  private sysequiposService = inject(SysequiposService);

  constructor(private router: Router) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.servicios = await this.servicioService.getAllServiciosActivos();
      for (const servicio of this.servicios) {
        this.obtenerCantidad(servicio.id);
      }
    } catch {
      this.error = 'Error al cargar los servicios.';
    } finally {
      this.isLoading = false;
    }
  }

  obtenerCantidad(idServicio: number) {
    this.sysequiposService.getEquipos({ id_servicio_fk: idServicio }).subscribe({
      next: (response) => {
        if (response.success) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.cantidadesEquipos[idServicio] = data.length;
        } else {
          this.cantidadesEquipos[idServicio] = 0;
        }
      },
      error: () => { this.cantidadesEquipos[idServicio] = 0; }
    });
  }

  get filteredServicios(): any[] {
    let lista = this.servicios;

    if (this.filtroRelacion === 'con-equipos') {
      lista = lista.filter(s => (this.cantidadesEquipos[s.id] ?? 0) > 0);
    } else if (this.filtroRelacion === 'sin-equipos') {
      lista = lista.filter(s => this.cantidadesEquipos[s.id] !== undefined && this.cantidadesEquipos[s.id] === 0);
    }

    if (!this.searchText.trim()) return lista;
    const term = this.searchText.toLowerCase();
    return lista.filter(s => s.nombres?.toLowerCase().includes(term));
  }

  setFiltro(filtro: 'todos' | 'con-equipos' | 'sin-equipos') {
    this.filtroRelacion = filtro;
  }

  verEquipos(idServicio: number) {
    sessionStorage.setItem('idServicioSis', String(idServicio));
    this.router.navigate(['/adminsistemas/equiposservicio']);
  }

  volver() { this.router.navigate(['/adminsistemas']); }
}
