import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysAuditoriaRepuesto {
  id?: number;
  tabla_origen: 'SysRepuesto' | 'SysTipoRepuesto';
  id_registro: number;
  nombre_item?: string;
  usuario: string;
  rol?: string;
  accion: 'creacion' | 'edicion' | 'activacion' | 'inactivacion';
  observacion?: string;
  fecha_hora: string;
}

export interface SysAuditoriaResponse {
  success: boolean;
  data: SysAuditoriaRepuesto[];
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SysAuditoriaRepuestoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysauditoria-repuesto`;

  getHistorial(filters?: { tabla_origen?: string; id_registro?: number }): Observable<SysAuditoriaResponse> {
    let params = new HttpParams();
    if (filters?.tabla_origen) params = params.set('tabla_origen', filters.tabla_origen);
    if (filters?.id_registro !== undefined) params = params.set('id_registro', filters.id_registro.toString());
    return this.http.get<SysAuditoriaResponse>(this.apiUrl, { params });
  }
}
