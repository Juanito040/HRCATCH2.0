import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysEquipo {
  id_sysequipo?: number;
  nombre_equipo: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  placa_inventario?: string;
  codigo?: string;
  ubicacion?: string;
  ubicacion_especifica?: string;
  ubicacion_anterior?: string;
  activo?: number;
  ano_ingreso?: number;
  dias_mantenimiento?: number;
  periodicidad?: number;
  estado_baja?: number;
  administrable?: number;
  direccionamiento_Vlan?: string;
  numero_puertos?: number;
  mtto?: number;
  id_servicio_fk?: number;
  id_tipo_equipo_fk?: number;
  id_usuario_fk?: number;
  servicio?: any;
  tipoEquipo?: any;
  usuario?: any;
  hojaVida?: any;
  baja?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface SysEquipoResponse {
  success: boolean;
  data: SysEquipo | SysEquipo[];
  message?: string;
  count?: number;
}

@Injectable({ providedIn: 'root' })
export class SysequiposService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysequipo`;

  getEquipos(filters?: { activo?: boolean; id_servicio_fk?: number; id_tipo_equipo_fk?: number; search?: string; includeAll?: boolean; }): Observable<SysEquipoResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      if (filters.id_servicio_fk) params = params.set('id_servicio_fk', filters.id_servicio_fk.toString());
      if (filters.id_tipo_equipo_fk) params = params.set('id_tipo_equipo_fk', filters.id_tipo_equipo_fk.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.includeAll) params = params.set('includeAll', 'true');
    }
    return this.http.get<SysEquipoResponse>(this.apiUrl, { params });
  }

  getEquipoById(id: number): Observable<SysEquipoResponse> {
    return this.http.get<SysEquipoResponse>(`${this.apiUrl}/${id}`);
  }

  createEquipo(equipo: any): Observable<SysEquipoResponse> {
    return this.http.post<SysEquipoResponse>(this.apiUrl, equipo);
  }

  updateEquipo(id: number, equipo: Partial<SysEquipo>): Observable<SysEquipoResponse> {
    return this.http.patch<SysEquipoResponse>(`${this.apiUrl}/${id}`, equipo);
  }

  enviarABodega(id: number, motivo?: string): Observable<SysEquipoResponse> {
    return this.http.delete<SysEquipoResponse>(`${this.apiUrl}/${id}`, { body: { motivo } });
  }

  darDeBaja(id: number, data: { justificacion_baja: string; accesorios_reutilizables?: string; id_usuario?: number; password: string; }): Observable<SysEquipoResponse> {
    return this.http.post<SysEquipoResponse>(`${this.apiUrl}/${id}/hard-delete`, data);
  }

  getEquiposEnBodega(): Observable<SysEquipoResponse> {
    return this.http.get<SysEquipoResponse>(`${this.apiUrl}/bodega`);
  }

  getEquiposDadosDeBaja(): Observable<SysEquipoResponse> {
    return this.http.get<SysEquipoResponse>(`${this.apiUrl}/dados-baja`);
  }

  reactivarEquipo(id: number): Observable<SysEquipoResponse> {
    return this.http.patch<SysEquipoResponse>(`${this.apiUrl}/${id}/reactivar`, {});
  }
}
