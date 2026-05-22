import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface EventoTrazabilidad {
  accion: 'CREACION' | 'EDICION' | 'BODEGA' | 'BAJA' | 'REACTIVACION' | string;
  detalles: string | null;
  fecha: string;
  usuario?: { id?: number; nombres?: string; apellidos?: string; email?: string } | null;
  fuente?: string;
  extra?: string;
  equipo?: { id_sysequipo?: number; nombre_equipo?: string; marca?: string; modelo?: string; serie?: string };
}

export interface TrazabilidadResponse {
  success: boolean;
  data: EventoTrazabilidad[];
  count?: number;
}

export interface TrazabilidadGlobalFilters {
  accion?: string;
  equipoId?: number;
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class SysTrazabilidadService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/systrazabilidad`;

  getHistorialEquipo(equipoId: number): Observable<TrazabilidadResponse> {
    return this.http.get<TrazabilidadResponse>(`${this.apiUrl}/equipo/${equipoId}`);
  }

  getTrazabilidadGlobal(filters?: TrazabilidadGlobalFilters): Observable<TrazabilidadResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.accion) params = params.set('accion', filters.accion);
      if (filters.equipoId) params = params.set('equipoId', filters.equipoId.toString());
      if (filters.desde) params = params.set('desde', filters.desde);
      if (filters.hasta) params = params.set('hasta', filters.hasta);
    }
    return this.http.get<TrazabilidadResponse>(this.apiUrl, { params });
  }
}
