import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysHojaVida {
  id_syshoja_vida?: number;
  ip?: string;
  mac?: string;
  procesador?: string;
  ram?: string;
  disco_duro?: string;
  sistema_operativo?: string;
  office?: string;
  tonner?: string;
  nombre_usuario?: string;
  vendedor?: string;
  tipo_uso?: string;
  fecha_compra?: string;
  fecha_instalacion?: string;
  costo_compra?: string;
  contrato?: string;
  observaciones?: string;
  foto?: string;
  compraddirecta?: boolean;
  convenio?: boolean;
  donado?: boolean;
  comodato?: boolean;
  id_sysequipo_fk?: number;
  equipo?: any;
}

@Injectable({ providedIn: 'root' })
export class SysHojaVidaService {
  private http = inject(HttpClient);
  private base = `${API_URL}/syshojavida`;

  getByEquipo(equipoId: number): Observable<any> {
    return this.http.get(`${this.base}/equipo/${equipoId}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.base}/`);
  }

  create(data: SysHojaVida): Observable<any> {
    return this.http.post(`${this.base}/`, data);
  }

  upsertByEquipo(equipoId: number, data: SysHojaVida): Observable<any> {
    return this.http.put(`${this.base}/equipo/${equipoId}`, data);
  }

  update(id: number, data: SysHojaVida): Observable<any> {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
