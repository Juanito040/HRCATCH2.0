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
  garantia_inicio?: string;
  garantia_fin?: string;
  fecha_ingreso?: string;
  costo_unitario?: number;
  estado?: string;
  is_active?: boolean;
  fecha_inactivacion?: string;
  usuario_inactivacion?: string;
  tipoRepuesto?: { id_sys_tipo_repuesto: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface SysRepuestoResponse {
  success: boolean;
  data: SysRepuesto | SysRepuesto[];
  message?: string;
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

  createRepuesto(repuesto: Partial<SysRepuesto> & { observacion?: string }): Observable<SysRepuestoResponse> {
    return this.http.post<SysRepuestoResponse>(this.apiUrl, repuesto);
  }

  updateRepuesto(id: number, repuesto: Partial<SysRepuesto> & { observacion?: string }): Observable<SysRepuestoResponse> {
    return this.http.patch<SysRepuestoResponse>(`${this.apiUrl}/${id}`, repuesto);
  }

  toggleActivo(id: number, observacion?: string): Observable<SysRepuestoResponse> {
    return this.http.patch<SysRepuestoResponse>(`${this.apiUrl}/${id}/toggle`, { observacion });
  }
}
