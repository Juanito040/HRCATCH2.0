import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';

@Component({
  selector: 'app-clasificacion-tipo-equipo-sis',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clasificacion-tipo-equipo-sis.component.html',
  styleUrl: './clasificacion-tipo-equipo-sis.component.css'
})
export class ClasificacionTipoEquipoSisComponent implements OnInit {

  tiposEquipos: any[] = [];
  cantidadesEquipos: { [id: number]: number } = {};
  searchText: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  private tipoEquipoService = inject(TipoEquipoService);
  constructor(private router: Router) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.tiposEquipos = await this.tipoEquipoService.getTiposEquiposSistemas();
      for (const tipo of this.tiposEquipos) {
        this.obtenerCantidad(tipo.id);
      }
    } catch {
      this.error = 'Error al cargar los tipos de equipo.';
    } finally {
      this.isLoading = false;
    }
  }

  async obtenerCantidad(idTipo: number) {
    try {
      this.cantidadesEquipos[idTipo] = await this.tipoEquipoService.getCantidadEquiposSistemas(idTipo);
    } catch {
      this.cantidadesEquipos[idTipo] = 0;
    }
  }

  get filteredTipos(): any[] {
    if (!this.searchText.trim()) return this.tiposEquipos;
    const term = this.searchText.toLowerCase();
    return this.tiposEquipos.filter(t => t.nombres.toLowerCase().includes(term));
  }

  verEquipos(idTipo: number) {
    sessionStorage.setItem('idTipoEquipoSis', String(idTipo));
    this.router.navigate(['/adminsistemas/equipostipo']);
  }
}
