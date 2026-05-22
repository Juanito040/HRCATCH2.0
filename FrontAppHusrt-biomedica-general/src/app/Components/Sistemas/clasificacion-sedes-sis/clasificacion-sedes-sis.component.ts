import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SedeService } from '../../../Services/appServices/general/sede/sede.service';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-clasificacion-sedes-sis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clasificacion-sedes-sis.component.html',
  styleUrl: './clasificacion-sedes-sis.component.css'
})
export class ClasificacionSedesSisComponent implements OnInit {

  sedes: any[] = [];
  cantidadesEquipos: { [id: number]: number | undefined } = {};
  searchText: string = '';
  filtroRelacion: 'todos' | 'con-equipos' | 'sin-equipos' = 'todos';
  isLoading: boolean = false;
  error: string | null = null;

  private sedeService = inject(SedeService);
  private servicioService = inject(ServicioService);
  private sysequiposService = inject(SysequiposService);

  constructor(private router: Router) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.sedes = await this.sedeService.getAllSedes();
      for (const sede of this.sedes) {
        this.obtenerCantidadBySede(sede.id);
      }
    } catch {
      this.error = 'Error al cargar las sedes.';
    } finally {
      this.isLoading = false;
    }
  }

  async obtenerCantidadBySede(idSede: number) {
    try {
      const servicios = await this.servicioService.getServiciosBySede(idSede);
      if (!servicios || servicios.length === 0) {
        this.cantidadesEquipos[idSede] = 0;
        return;
      }
      const requests = servicios.map((s: any) =>
        this.sysequiposService.getEquipos({ id_servicio_fk: s.id }).pipe(
          map(res => res.success ? (Array.isArray(res.data) ? res.data.length : 1) : 0),
          catchError(() => of(0))
        )
      );
      forkJoin(requests).subscribe({
        next: (counts: number[]) => {
          this.cantidadesEquipos[idSede] = counts.reduce((a, b) => a + b, 0);
        },
        error: () => { this.cantidadesEquipos[idSede] = 0; }
      });
    } catch {
      this.cantidadesEquipos[idSede] = 0;
    }
  }

  get filteredSedes(): any[] {
    let lista = this.sedes;

    // Filtro por relación (solo aplica cuando ya cargaron los conteos)
    if (this.filtroRelacion === 'con-equipos') {
      lista = lista.filter(s => (this.cantidadesEquipos[s.id] ?? 0) > 0);
    } else if (this.filtroRelacion === 'sin-equipos') {
      lista = lista.filter(s => this.cantidadesEquipos[s.id] !== undefined && this.cantidadesEquipos[s.id] === 0);
    }

    if (!this.searchText.trim()) return lista;
    const term = this.searchText.toLowerCase();
    return lista.filter(s => s.nombre?.toLowerCase().includes(term) || s.nombres?.toLowerCase().includes(term));
  }

  setFiltro(filtro: 'todos' | 'con-equipos' | 'sin-equipos') {
    this.filtroRelacion = filtro;
  }

  verEquipos(idSede: number) {
    sessionStorage.setItem('idSedeSis', String(idSede));
    this.router.navigate(['/adminsistemas/equipossede']);
  }

  volver() { this.router.navigate(['/adminsistemas']); }
}
