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

  registrarMovimiento(data: Partial<SysMovimientoStock>): Observable<{ success: boolean; message: string; data: SysMovimientoStock }> {
    return this.http.post<{ success: boolean; message: string; data: SysMovimientoStock }>(this.apiUrl, data);
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
}
