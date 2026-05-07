import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { SysprotocoloService, SysProtocoloPreventivo } from '../../../Services/appServices/sistemasServices/sysprotocolo/sysprotocolo.service';
import Swal from 'sweetalert2';
import { extractError } from '../../../utils/error-utils';

@Component({
  selector: 'app-sys-protocolos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './protocolos.component.html',
  styleUrls: ['./protocolos.component.css']
})
export class SysProtocolosComponent implements OnInit {
  private tipoEquipoService = inject(TipoEquipoService);
  private protocoloService = inject(SysprotocoloService);
  private router = inject(Router);

  tiposEquipo: any[] = [];
  selectedTipoEquipoId: number | null = null;
  protocolos: SysProtocoloPreventivo[] = [];
  isLoading = false;
  isLoadingProtocolos = false;

  // Dialog
  isDialogOpen = false;
  isEditing = false;
  isSaving = false;
  currentProtocolo: Partial<SysProtocoloPreventivo> = {};
  dialogError: string | null = null;

  readonly MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  async ngOnInit() {
    await this.cargarTiposEquipo();
  }

  async cargarTiposEquipo() {
    this.isLoading = true;
    try {
      const data = await this.tipoEquipoService.getTiposEquiposSistemas();
      this.tiposEquipo = Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Error al cargar tipos de equipo', e);
    } finally {
      this.isLoading = false;
    }
  }

  async onTipoEquipoChange() {
    if (!this.selectedTipoEquipoId) {
      this.protocolos = [];
      return;
    }
    this.isLoadingProtocolos = true;
    try {
      this.protocolos = await this.protocoloService.getByTipoEquipo(this.selectedTipoEquipoId);
    } catch (e) {
      console.error('Error al cargar protocolos', e);
      this.protocolos = [];
    } finally {
      this.isLoadingProtocolos = false;
    }
  }

  openAddDialog() {
    if (!this.selectedTipoEquipoId) {
      Swal.fire('Atención', 'Selecciona un tipo de equipo primero.', 'warning');
      return;
    }
    this.isEditing = false;
    this.currentProtocolo = { id_tipo_equipo_fk: this.selectedTipoEquipoId, estado: true, paso: '' };
    this.dialogError = null;
    this.isDialogOpen = true;
  }

  openEditDialog(protocolo: SysProtocoloPreventivo) {
    this.isEditing = true;
    this.currentProtocolo = { ...protocolo };
    this.dialogError = null;
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
    this.currentProtocolo = {};
    this.dialogError = null;
  }

  async saveProtocolo() {
    if (!this.currentProtocolo.paso?.trim()) {
      this.dialogError = 'El paso no puede estar vacío.';
      return;
    }
    this.isSaving = true;
    this.dialogError = null;
    try {
      if (this.isEditing && this.currentProtocolo.id_sysprotocolo) {
        await this.protocoloService.update(this.currentProtocolo.id_sysprotocolo, this.currentProtocolo);
      } else {
        await this.protocoloService.create(this.currentProtocolo);
      }
      this.closeDialog();
      await this.onTipoEquipoChange();
      Swal.fire({ icon: 'success', title: this.isEditing ? 'Paso actualizado' : 'Paso agregado', timer: 1500, showConfirmButton: false });
    } catch (e) {
      this.dialogError = 'Error al guardar el protocolo. Intente nuevamente.';
    } finally {
      this.isSaving = false;
    }
  }

  async toggleEstado(protocolo: SysProtocoloPreventivo) {
    try {
      await this.protocoloService.update(protocolo.id_sysprotocolo!, { estado: !protocolo.estado });
      await this.onTipoEquipoChange();
    } catch (e) {
      Swal.fire('Error', extractError(e, 'cambiar el estado del protocolo'), 'error');
    }
  }

  async deleteProtocolo(protocolo: SysProtocoloPreventivo) {
    const result = await Swal.fire({
      title: '¿Eliminar paso?',
      text: `"${protocolo.paso?.substring(0, 60)}..."`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await this.protocoloService.delete(protocolo.id_sysprotocolo!);
      await this.onTipoEquipoChange();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire('Error', extractError(e, 'eliminar el paso del protocolo'), 'error');
    }
  }

  get activeCount(): number {
    return this.protocolos.filter(p => p.estado).length;
  }

  toggleCurrentEstado() {
    this.currentProtocolo.estado = !this.currentProtocolo.estado;
  }

  volver() {
    this.router.navigate(['/adminsistemas']);
  }

  getTipoNombre(): string {
    if (!this.selectedTipoEquipoId) return '';
    const tipo = this.tiposEquipo.find(t => t.id === this.selectedTipoEquipoId || t.id_tipo_equipo === this.selectedTipoEquipoId);
    return tipo ? (tipo.nombres || tipo.nombre || '') : '';
  }
}
