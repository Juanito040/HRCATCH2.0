import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysMantenimiento {
  id_sysmtto?: number;
  numero_reporte?: string;
  mesProgramado?: number;
  añoProgramado?: number;
  fecha?: string;
  hora_llamado?: string;
  hora_inicio?: string;
  hora_terminacion?: string;
  tipo_mantenimiento?: number;
  tipo_falla?: number;
  mphardware?: boolean;
  mpsoftware?: boolean;
  rutinah?: string;
  rutinas?: string;
  observacionesh?: string;
  observacioness?: string;
  autor_realizado?: string;
  autor_recibido?: string;
  tiempo_fuera_servicio?: number;
  dano?: boolean;
  entega?: boolean;
  rutahardware?: string;
  rutasoftware?: string;
  rutaentrega?: string;
  id_sysequipo_fk?: number;
  id_sysusuario_fk?: number;
  equipo?: any;
  usuario?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface SysMantenimientoResponse {
  success: boolean;
  data: SysMantenimiento | SysMantenimiento[];
  message?: string;
  count?: number;
}

export interface DashboardMantenimientoResponse {
  success: boolean;
  data: {
    total: number;
    estadisticasTipo: { tipo: string; cantidad: number }[];
    mantenimientosRecientes: SysMantenimiento[];
    fecha_inicio: string;
    fecha_fin: string;
  };
}

export interface CatalogoItem {
  value: number;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class SysmantenimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysmantenimiento`;

  getAll(filters?: { id_equipo?: number; tipo_mantenimiento?: number; fecha_inicio?: string; fecha_fin?: string }): Observable<SysMantenimientoResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.id_equipo) params = params.set('id_equipo', filters.id_equipo.toString());
      if (filters.tipo_mantenimiento) params = params.set('tipo_mantenimiento', filters.tipo_mantenimiento.toString());
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    }
    return this.http.get<SysMantenimientoResponse>(this.apiUrl, { params });
  }

  async getById(id: any) {
    return firstValueFrom(
          this.http.get<any>(`${API_URL}/sysmantenimiento/${id}`)
        )
  }

  getByEquipo(idEquipo: number): Observable<SysMantenimientoResponse> {
    return this.http.get<SysMantenimientoResponse>(`${this.apiUrl}/equipo/${idEquipo}`);
  }

  getByTecnico(idUsuario: number, filters?: { fecha_inicio?: string; fecha_fin?: string }): Observable<SysMantenimientoResponse> {
    let params = new HttpParams();
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    return this.http.get<SysMantenimientoResponse>(`${this.apiUrl}/tecnico/${idUsuario}`, { params });
  }

  getDashboard(filters?: { fecha_inicio?: string; fecha_fin?: string }): Observable<DashboardMantenimientoResponse> {
    let params = new HttpParams();
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    return this.http.get<DashboardMantenimientoResponse>(`${this.apiUrl}/dashboard`, { params });
  }

  create(mantenimiento: Partial<SysMantenimiento>): Observable<SysMantenimientoResponse> {
    return this.http.post<SysMantenimientoResponse>(this.apiUrl, mantenimiento);
  }

  update(id: number, mantenimiento: Partial<SysMantenimiento>): Observable<SysMantenimientoResponse> {
    return this.http.put<SysMantenimientoResponse>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  delete(id: number): Observable<SysMantenimientoResponse> {
    return this.http.delete<SysMantenimientoResponse>(`${this.apiUrl}/${id}`);
  }

  getTiposMantenimiento(): Observable<{ success: boolean; data: CatalogoItem[] }> {
    return this.http.get<{ success: boolean; data: CatalogoItem[] }>(`${this.apiUrl}/catalogos/tipos-mantenimiento`);
  }

  getTiposFalla(): Observable<{ success: boolean; data: CatalogoItem[] }> {
    return this.http.get<{ success: boolean; data: CatalogoItem[] }>(`${this.apiUrl}/catalogos/tipos-falla`);
  }
}
