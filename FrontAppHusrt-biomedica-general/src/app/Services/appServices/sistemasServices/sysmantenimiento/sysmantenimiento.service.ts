import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

// ── Interfaces alineadas con la respuesta real del backend ──────────────────

export interface SysMantenimiento {
  id?: number;                        // era id_sysmtto, el backend retorna 'id'
  añoProgramado?: number;
  mesProgramado?: number;
  fechaRealizado?: string;            // era 'fecha'
  horaInicio?: string;               // camelCase como el backend
  fechaFin?: string;
  horaTerminacion?: string;
  horaTotal?: string;
  tipoMantenimiento?: string;        // era number, el backend retorna string: "Preventivo"
  tipoFalla?: string;                // era number, el backend retorna string o null
  estadoOperativo?: string;
  motivo?: string;
  trabajoRealizado?: string;
  calificacion?: any;
  nombreRecibio?: string;
  cedulaRecibio?: string;
  observaciones?: string;
  mantenimientoPropio?: any;
  realizado?: any;
  rutaPdf?: string;
  id_sysequipo_fk?: number;
  usuarioIdFk?: number;
  servicioIdFk?: number;
  equipo?: {
    id_sysequipo: number;
    nombre_equipo: string;
    marca: string;
    modelo: string;
    serie: string;
    placa_inventario: string;
    ubicacion?: string;
    ubicacion_especifica?: string;
  };
  servicio?: {
    id: number;
    nombres: string;
    ubicacion?: string;
  };
  usuario?: {
    id: number;
    nombres: string;
    apellidos: string;
  } | null;

  valoresMediciones?: any[];
  repuestos?: any[];

  createdAt?: string;
  updatedAt?: string;
}

// El backend retorna array directo, NO envuelto en { success, data }
export type SysMantenimientoListResponse = SysMantenimiento[];

// Para endpoints que sí retornan { success, data } (create, update, delete)
export interface SysMantenimientoResponse {
  success: boolean;
  data?: SysMantenimiento;
  message?: string;
  count?: number;
  error?: string;
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
  private apiUrl = `${API_URL}/sysreporte`;

  // GET /sysreporte → retorna array directo
  getAll(filters?: {
    id_equipo?: number;
    tipo_mantenimiento?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<SysMantenimiento[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.id_equipo) params = params.set('id_equipo', filters.id_equipo.toString());
      if (filters.tipo_mantenimiento) params = params.set('tipo_mantenimiento', filters.tipo_mantenimiento);
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    }
    return this.http.get<SysMantenimiento[]>(this.apiUrl, { params });
  }

  async getById(id: number): Promise<SysMantenimiento> {
    return firstValueFrom(
      this.http.get<SysMantenimiento>(`${this.apiUrl}/${id}`)
    );
  }

  getByEquipo(idEquipo: number): Observable<SysMantenimiento[]> {
    return this.http.get<SysMantenimiento[]>(`${this.apiUrl}/equipo/${idEquipo}`);
  }

  getByTecnico(idUsuario: number, filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<SysMantenimiento[]> {
    let params = new HttpParams();
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    return this.http.get<SysMantenimiento[]>(`${this.apiUrl}/tecnico/${idUsuario}`, { params });
  }

  getDashboard(filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<DashboardMantenimientoResponse> {
    let params = new HttpParams();
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    return this.http.get<DashboardMantenimientoResponse>(`${this.apiUrl}/dashboard`, { params });
  }

  create(mantenimiento: Partial<SysMantenimiento>): Promise<SysMantenimientoResponse> {
    return firstValueFrom(
      this.http.post<SysMantenimientoResponse>(this.apiUrl, mantenimiento)
    );
  }

  update(id: number, mantenimiento: Partial<SysMantenimiento>): Promise<SysMantenimientoResponse> {
    return firstValueFrom(
      this.http.put<SysMantenimientoResponse>(`${this.apiUrl}/${id}`, mantenimiento)
    );
  }
  delete(id: number): Observable<SysMantenimientoResponse> {
    return this.http.delete<SysMantenimientoResponse>(`${this.apiUrl}/${id}`);
  }

  // Catálogos — retornan { success: true, data: [...] }
  getTiposMantenimiento(): Observable<{ success: boolean; data: CatalogoItem[] }> {
    return this.http.get<{ success: boolean; data: CatalogoItem[] }>(
      `${this.apiUrl}/catalogos/tipos-mantenimiento`
    );
  }

  getTiposFalla(): Observable<{ success: boolean; data: CatalogoItem[] }> {
    return this.http.get<{ success: boolean; data: CatalogoItem[] }>(
      `${this.apiUrl}/catalogos/tipos-falla`
    );
  }
}