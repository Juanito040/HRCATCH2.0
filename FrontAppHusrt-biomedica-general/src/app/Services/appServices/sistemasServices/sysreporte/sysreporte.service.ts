import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysReporte {
  id_sysreporte?: number;
  fecha?: string;
  hora_llamado?: string;
  hora_inicio?: string;
  hora_terminacion?: string;
  servicio_anterior?: string;
  ubicacion_anterior?: string;
  servicio_nuevo?: string;
  ubicacion_nueva?: string;
  ubicacion_especifica?: string;
  realizado_por?: string;
  recibido_por?: string;
  observaciones?: string;
  id_sysequipo_fk?: number;
  id_sysusuario_fk?: number;
  equipo?: any;
  usuario?: any;
}

@Injectable({ providedIn: 'root' })
export class SysReporteService {
  private http = inject(HttpClient);
  private base = `${API_URL}/sysreporte`;

  getAll(equipoId?: number): Observable<any> {
    const params = equipoId ? `?equipoId=${equipoId}` : '';
    return this.http.get(`${this.base}/${params}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(data: SysReporte): Observable<any> {
    return this.http.post(`${this.base}/`, data);
  }

  update(id: number, data: SysReporte): Observable<any> {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  descargarPdfReporte(id: number): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.base}/${id}/pdf`, { responseType: 'blob' })
    );
  }

  descargarPdfBaja(bajaId: number): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`${this.base}/baja/${bajaId}/pdf`, { responseType: 'blob' })
    );
  }
}
