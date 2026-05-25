import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysRepuesto {
  id_sysrepuesto?: number;
  nombre: string;
  descripcion_tecnica?: string;
  numero_parte?: string;
  numero_serie?: string;
  id_sys_tipo_repuesto_fk?: number;
  modelo_asociado?: string;
  proveedor?: string;
  cantidad_stock?: number;
  stock_minimo?: number;
  ubicacion_fisica?: string;
  estado: 'Nuevo' | 'Usado' | 'Reacondicionado' | 'Defectuoso';
  fecha_ingreso?: string;
  costo_unitario?: number;
  is_active?: boolean;
  fecha_inactivacion?: string;
  usuario_inactivacion?: string;
  tipoRepuesto?: { id_sys_tipo_repuesto: number; nombre: string };
  id_tipo_equipo_fk?: number;
  tipoEquipoSistemas?: { id: number; nombres: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface SysRepuestoResponse {
  success: boolean;
  data: SysRepuesto | SysRepuesto[];
  message?: string;
}

export interface DescontarStockItem {
  sysRepuestoIdFk: number;
  cantidad: number;
}

export interface DescontarStockResponse {
  success: boolean;
  message: string;
  actualizados?: { id: number; nombre: string; stockAnterior: number; stockNuevo: number }[];
  errores?: string[];
}

@Injectable({ providedIn: 'root' })
export class SysRepuestosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysrepuesto`;

  getRepuestos(filters?: { is_active?: boolean; search?: string }): Observable<SysRepuestoResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<SysRepuestoResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<SysRepuestoResponse> {
    return this.http.get<SysRepuestoResponse>(`${this.apiUrl}/${id}`);
  }

  createRepuesto(repuestoData: Partial<SysRepuesto> & { observacion?: string }): Observable<SysRepuestoResponse> {
    return this.http.post<SysRepuestoResponse>(this.apiUrl, repuestoData);
  }

  updateRepuesto(id: number, repuestoData: Partial<SysRepuesto> & { observacion?: string }): Observable<SysRepuestoResponse> {
    return this.http.patch<SysRepuestoResponse>(`${this.apiUrl}/${id}`, repuestoData);
  }

  toggleActivo(id: number, observacion?: string): Observable<SysRepuestoResponse> {
    return this.http.patch<SysRepuestoResponse>(`${this.apiUrl}/${id}/toggle`, { observacion });
  }

  getByTipo(idTipo: number, filters?: { is_active?: boolean }): Observable<SysRepuestoResponse> {
    let params = new HttpParams();
    if (filters?.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
    return this.http.get<SysRepuestoResponse>(`${this.apiUrl}/tipo/${idTipo}`, { params });
  }

  descontarStock(repuestos: DescontarStockItem[], mantenimientoId?: number): Observable<DescontarStockResponse> {
    return this.http.post<DescontarStockResponse>(`${this.apiUrl}/descontar-stock`, {
      repuestos,
      mantenimientoId
    });
  }
  ajustarStockEdicion(payload: {
    repuestosEliminados: { sysRepuestoIdFk: number; cantidad: number }[];
    repuestosNuevos: { sysRepuestoIdFk: number; cantidad: number }[];
    mantenimientoId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajustar-stock-edicion`, payload);
  }

  getUsadosPorTecnico(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usados/tecnico`);
  }
}