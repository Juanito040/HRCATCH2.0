import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

export interface DeleteAction {
  action: 'bodega' | 'baja';
  data: { motivo?: string; tipo_bodega?: string; nombre_receptor?: string; cargo_receptor?: string; observaciones_traslado?: string; justificacion_baja?: string; accesorios_reutilizables?: string; id_usuario?: number; password?: string; };
}

@Component({
  selector: 'app-sys-delete-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.css']
})
export class SysDeleteConfirmationDialogComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() itemName = '';
  @Input() itemType = 'equipo';
  @Input() isAdmin = false;
  @Input() hideBodegaOption = false;
  @Input() hideBajaOption = false;
  @Input() initialAction: 'bodega' | 'baja' | null = null;
  @Input() equipo: any = null;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<DeleteAction>();

  selectedAction: 'bodega' | 'baja' = 'bodega';
  password = '';
  passwordError = '';
  isSubmitting = false;
  motivo = '';
  tipoBodega = 'Bodega Sistemas';
  nombre_receptor = '';
  cargo_receptor = '';
  observaciones_traslado = '';
  justificacion_baja = '';
  accesorios_reutilizables = '';

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue === true) {
      this.selectedAction = this.initialAction ?? (this.hideBodegaOption ? 'baja' : 'bodega');
      this.password = '';
      this.passwordError = '';
      this.motivo = '';
      this.tipoBodega = 'Bodega Sistemas';
      this.nombre_receptor = '';
      this.cargo_receptor = '';
      this.observaciones_traslado = '';
      this.justificacion_baja = '';
      this.accesorios_reutilizables = '';
      this.isSubmitting = false;
    }
  }

  close() { this.resetForm(); this.closed.emit(); }

  confirm() {
    if (this.selectedAction === 'baja') {
      if (!this.password) {
        this.passwordError = 'La contraseña es requerida para dar de baja';
        Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa la contraseña de administrador', confirmButtonText: 'Entendido' });
        return;
      }
      if (!this.justificacion_baja) {
        this.passwordError = 'La justificación es requerida';
        Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa una justificación para la baja permanente', confirmButtonText: 'Entendido' });
        return;
      }
    }
    if (this.selectedAction === 'bodega' && !this.motivo) {
      this.passwordError = 'El motivo es requerido para enviar a bodega';
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Debes indicar el motivo por el cual se envía el equipo a bodega', confirmButtonText: 'Entendido' });
      return;
    }
    if (this.selectedAction === 'bodega' && !this.nombre_receptor) {
      this.passwordError = 'El nombre del receptor es requerido';
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa el nombre de quien recibe el equipo en bodega', confirmButtonText: 'Entendido' });
      return;
    }
    if (this.selectedAction === 'bodega' && !this.cargo_receptor) {
      this.passwordError = 'El cargo del receptor es requerido';
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa el cargo de quien recibe el equipo en bodega', confirmButtonText: 'Entendido' });
      return;
    }
    this.isSubmitting = true;
    this.confirmed.emit({
      action: this.selectedAction,
      data: {
        motivo: this.selectedAction === 'bodega' ? this.motivo : undefined,
        tipo_bodega: this.selectedAction === 'bodega' ? this.tipoBodega : undefined,
        nombre_receptor: this.selectedAction === 'bodega' ? this.nombre_receptor : undefined,
        cargo_receptor: this.selectedAction === 'bodega' ? this.cargo_receptor : undefined,
        observaciones_traslado: this.selectedAction === 'bodega' ? this.observaciones_traslado : undefined,
        justificacion_baja: this.selectedAction === 'baja' ? this.justificacion_baja : undefined,
        accesorios_reutilizables: this.selectedAction === 'baja' ? this.accesorios_reutilizables : undefined,
        password: this.selectedAction === 'baja' ? this.password : undefined
      }
    });
  }

  onActionChange() { this.password = ''; this.passwordError = ''; this.motivo = ''; this.tipoBodega = 'Bodega Sistemas'; this.nombre_receptor = ''; this.cargo_receptor = ''; this.observaciones_traslado = ''; this.justificacion_baja = ''; this.accesorios_reutilizables = ''; }
  onPasswordInput() { this.passwordError = ''; }
  resetForm() { this.selectedAction = this.initialAction ?? (this.hideBodegaOption ? 'baja' : 'bodega'); this.password = ''; this.passwordError = ''; this.isSubmitting = false; this.motivo = ''; this.tipoBodega = 'Bodega Sistemas'; this.nombre_receptor = ''; this.cargo_receptor = ''; this.observaciones_traslado = ''; this.justificacion_baja = ''; this.accesorios_reutilizables = ''; }
  resetSubmitting() { this.isSubmitting = false; }
  showError(message: string) { this.passwordError = message; this.isSubmitting = false; }

  get dialogTitle() { return `Confirmar acción sobre ${this.itemType}`; }
  get confirmationMessage() { return `¿Qué deseas hacer con "${this.itemName}"?`; }
  get confirmButtonText() { return this.selectedAction === 'bodega' ? 'Enviar a Bodega' : 'Dar de Baja'; }
  get confirmButtonClass() { return this.selectedAction === 'bodega' ? 'btn-warning' : 'btn-danger'; }
}
