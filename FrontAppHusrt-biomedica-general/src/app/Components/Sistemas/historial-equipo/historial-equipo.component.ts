import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SysTrazabilidadService, EventoTrazabilidad } from '../../../Services/appServices/sistemasServices/systrazabilidad/systrazabilidad.service';
import { SysEquipo } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';

interface CambioCampo {
  campo: string;
  anterior: any;
  nuevo: any;
}

interface EventoTimeline extends EventoTrazabilidad {
  cambios?: CambioCampo[];
}

@Component({
  selector: 'app-sys-historial-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-equipo.component.html',
  styleUrls: ['./historial-equipo.component.css']
})
export class SysHistorialEquipoComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() equipo: SysEquipo | null = null;
  @Output() closed = new EventEmitter<void>();

  eventos: EventoTimeline[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private trazabilidadService: SysTrazabilidadService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && typeof document !== 'undefined') {
      document.body.style.overflow = changes['isOpen'].currentValue ? 'hidden' : '';
    }
    if (changes['isOpen']?.currentValue && this.equipo?.id_sysequipo) {
      this.cargarHistorial();
    }
    if (!changes['isOpen']?.currentValue) {
      this.eventos = [];
      this.error = null;
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  cargarHistorial() {
    if (!this.equipo?.id_sysequipo) return;
    this.isLoading = true;
    this.error = null;

    this.trazabilidadService.getHistorialEquipo(this.equipo.id_sysequipo).subscribe({
      next: (res) => {
        const eventosBase = res.data || [];

        // Agregar evento sintético de creación si no existe en historial
        const tieneCre = eventosBase.some(e => e.accion === 'CREACION');
        if (!tieneCre && this.equipo?.createdAt) {
          eventosBase.push({
            accion: 'CREACION',
            detalles: `Equipo registrado en el sistema`,
            fecha: this.equipo.createdAt,
            usuario: null,
            fuente: 'sintetico'
          });
        }

        this.eventos = eventosBase
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .map(e => ({ ...e, cambios: this.parseCambios(e) }));

        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el historial del equipo.';
        this.isLoading = false;
      }
    });
  }

  private parseCambios(evento: EventoTrazabilidad): CambioCampo[] | undefined {
    if (evento.accion !== 'EDICION' || !evento.detalles) return undefined;
    try {
      const parsed = JSON.parse(evento.detalles);
      if (!Array.isArray(parsed)) return undefined;
      const norm = (v: any) => (v === null || v === undefined || v === '') ? null : String(v);
      return parsed.filter(c => norm(c.anterior) !== norm(c.nuevo));
    } catch {
      return undefined;
    }
  }

  getIconClase(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'fas fa-plus-circle',
      EDICION: 'fas fa-pencil-alt',
      BODEGA: 'fas fa-warehouse',
      BAJA: 'fas fa-ban',
      REACTIVACION: 'fas fa-power-off'
    };
    return mapa[accion] || 'fas fa-circle';
  }

  getColorClase(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'evento-creacion',
      EDICION: 'evento-edicion',
      BODEGA: 'evento-bodega',
      BAJA: 'evento-baja',
      REACTIVACION: 'evento-reactivacion'
    };
    return mapa[accion] || 'evento-default';
  }

  getEtiqueta(accion: string): string {
    const mapa: Record<string, string> = {
      CREACION: 'Creación',
      EDICION: 'Edición',
      BODEGA: 'Enviado a Bodega',
      BAJA: 'Dado de Baja',
      REACTIVACION: 'Reactivado'
    };
    return mapa[accion] || accion;
  }

  formatNombreCampo(campo: string): string {
    const mapa: Record<string, string> = {
      nombre_equipo: 'Nombre del equipo',
      marca: 'Marca',
      modelo: 'Modelo',
      serie: 'Serie',
      placa_inventario: 'Placa de inventario',
      codigo: 'Código',
      ubicacion: 'Ubicación',
      ubicacion_especifica: 'Ubicación específica',
      activo: 'Estado activo',
      id_servicio_fk: 'Servicio',
      id_tipo_equipo_fk: 'Tipo de equipo',
      id_usuario_fk: 'Usuario responsable'
    };
    return mapa[campo] || campo;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha desconocida';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      + ' – ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  getNombreUsuario(evento: EventoTimeline): string {
    if (!evento.usuario) return 'Sistema';
    const u = evento.usuario;
    return `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.email || 'Usuario desconocido';
  }

  close() {
    this.closed.emit();
  }
}
