import { Component, inject, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SysEquipoModalComponent } from '../equipo-modal/equipo-modal.component';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clasificacion-tipo-equipo-sis',
  standalone: true,
  imports: [FormsModule, CommonModule, SysEquipoModalComponent],
  templateUrl: './clasificacion-tipo-equipo-sis.component.html',
  styleUrl: './clasificacion-tipo-equipo-sis.component.css'
})
export class ClasificacionTipoEquipoSisComponent implements OnInit {

  tiposEquipos: any[] = [];
  cantidadesEquipos: { [id: number]: number } = {};
  searchText: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  isModalOpen: boolean = false;
  isExporting: boolean = false;
  isExportMenuOpen: boolean = false;

  private tipoEquipoService = inject(TipoEquipoService);
  private sysequiposService = inject(SysequiposService);
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


  openCreateModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onEquipoSaved() {
    this.isModalOpen = false;
    for (const tipo of this.tiposEquipos) {
      this.obtenerCantidad(tipo.id);
    }
  }

  toggleExportMenu(event: Event) {
    event.stopPropagation();
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isExportMenuOpen = false;
  }

  async descargarInventario(tipo: 'todos' | 'bodega' | 'activo' | 'inactivo' | any) {
    this.isExportMenuOpen = false;
    this.isExporting = true;
    try {
      const blob = await this.sysequiposService.exportarInventario(tipo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tipo === 'bodega' ? 'Inventario_Sistemas_Bodega.xlsx' : tipo === 'activo' ? 'Inventario_Sistemas_Activo.xlsx' : tipo === 'inactivo' ? 'Inventario_Sistemas_Inactivo.xlsx' : 'Inventario_Sistemas_Todos.xlsx' ;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire('Error', 'No se pudo descargar el inventario.', 'error');
    } finally {
      this.isExporting = false;
    }
  }
}
