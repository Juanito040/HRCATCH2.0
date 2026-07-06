import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysMovimientoStock {
  id?: number;
  id_repuesto_fk: number;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  stock_antes: number;
  stock_despues: number;
  motivo: string;
  referencia?: string;
  usuario?: string;
  fecha_movimiento?: string;
  factura_ruta?: string;
  garantia_inicio?: string;
  garantia_fin?: string;
  repuesto?: {
    id_sysrepuesto: number;
    nombre: string;
    numero_parte?: string;
    cantidad_stock: number;
    stock_minimo: number;
    tipoRepuesto?: { nombre: string };
  };
}

export interface MovimientoFiltros {
  id_repuesto?: number;
  tipo?: 'ingreso' | 'egreso';
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface HistorialPorTipoItem {
  id_tipo: number;
  nombre: string;
  total_unidades: number;
  total_movimientos: number;
}

export interface TopRepuestoItem {
  id: number;
  nombre: string;
  tipo: string;
  total_unidades: number;
  total_movimientos: number;
}

export interface TendenciaMensualItem {
  mes: string;
  total_unidades: number;
}

export interface DetalleEgresoItem {
  id: number;
  fecha: string;
  repuesto: string;
  tipo_repuesto: string;
  cantidad: number;
  motivo: string;
  referencia?: string;
  usuario?: string;
}

export interface HistorialPorTipoResponse {
  totalUnidades: number;
  totalMovimientos: number;
  porTipo: HistorialPorTipoItem[];
  topRepuestos: TopRepuestoItem[];
  tendenciaMensual: TendenciaMensualItem[];
  detalle: DetalleEgresoItem[];
}

@Injectable({ providedIn: 'root' })
export class SysMovimientosStockService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysmovimientosstock`;

  getMovimientos(filtros?: MovimientoFiltros): Observable<{ success: boolean; data: SysMovimientoStock[] }> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.id_repuesto) params = params.set('id_repuesto', filtros.id_repuesto.toString());
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get<{ success: boolean; data: SysMovimientoStock[] }>(this.apiUrl, { params });
  }

  getAlertas(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/alertas`);
  }

  registrarMovimiento(data: FormData | Partial<SysMovimientoStock>): Observable<{ success: boolean; message: string; data: SysMovimientoStock }> {
    return this.http.post<{ success: boolean; message: string; data: SysMovimientoStock }>(this.apiUrl, data);
  }

  descargarFactura(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/descargar-factura/${id}`, { responseType: 'blob' });
  }

  exportarCSV(filtros?: MovimientoFiltros): Observable<Blob> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.id_repuesto) params = params.set('id_repuesto', filtros.id_repuesto.toString());
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get(`${this.apiUrl}/exportar`, { params, responseType: 'blob' });
  }

  getHistorialPorTipo(fechaDesde?: string, fechaHasta?: string): Observable<{ success: boolean; data: HistorialPorTipoResponse }> {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return this.http.get<{ success: boolean; data: HistorialPorTipoResponse }>(`${this.apiUrl}/historial-por-tipo`, { params });
  }
}
