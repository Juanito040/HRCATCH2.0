import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';

@Component({
  selector: 'app-sys-traslados-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traslados-modal.component.html',
  styleUrls: ['./traslados-modal.component.css']
})
export class SysTrasladosModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() equipo: any = null;
  @Output() closed = new EventEmitter<void>();

  traslados: any[] = [];
  isLoading = false;
  error: string | null = null;
  filtroTipo: 'TODOS' | 'BODEGA' | 'REACTIVACION' = 'TODOS';

  constructor(private sysequiposService: SysequiposService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue && this.equipo?.id_sysequipo) {
      this.cargarTraslados();
    }
    if (!changes['isOpen']?.currentValue) {
      this.traslados = [];
      this.error = null;
      this.filtroTipo = 'TODOS';
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  cargarTraslados() {
    if (!this.equipo?.id_sysequipo) return;
    this.isLoading = true;
    this.error = null;
    this.sysequiposService.getTraslados(this.equipo.id_sysequipo).then(res => {
      this.traslados = res?.data || [];
      this.isLoading = false;
    }).catch(() => {
      this.error = 'No se pudo cargar el registro de traslados.';
      this.isLoading = false;
    });
  }

  get trasladosFiltrados(): any[] {
    if (this.filtroTipo === 'TODOS') return this.traslados;
    return this.traslados.filter(t => t.tipo === this.filtroTipo);
  }

  contarPorTipo(tipo: string): number {
    return this.traslados.filter(t => t.tipo === tipo).length;
  }

  setFiltro(tipo: 'TODOS' | 'BODEGA' | 'REACTIVACION') {
    this.filtroTipo = tipo;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  getNombreUsuario(traslado: any): string {
    if (!traslado.usuario) return 'Sistema';
    const u = traslado.usuario;
    return `${u.nombres || ''} ${u.apellidos || ''}`.trim() || 'Usuario';
  }

  close() {
    this.closed.emit();
  }
}
