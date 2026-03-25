import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysTipoRepuesto {
  id_sys_tipo_repuesto?: number;
  nombre: string;
  descripcion?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SysTipoRepuestoResponse {
  success: boolean;
  data: SysTipoRepuesto | SysTipoRepuesto[];
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SysTipoRepuestosService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/systiporepuesto`;

  getTipos(): Observable<SysTipoRepuestoResponse> {
    return this.http.get<SysTipoRepuestoResponse>(this.apiUrl);
  }

  getById(id: number): Observable<SysTipoRepuestoResponse> {
    return this.http.get<SysTipoRepuestoResponse>(`${this.apiUrl}/${id}`);
  }

  createTipo(tipo: Partial<SysTipoRepuesto>): Observable<SysTipoRepuestoResponse> {
    return this.http.post<SysTipoRepuestoResponse>(this.apiUrl, tipo);
  }

  updateTipo(id: number, tipo: Partial<SysTipoRepuesto>): Observable<SysTipoRepuestoResponse> {
    return this.http.patch<SysTipoRepuestoResponse>(`${this.apiUrl}/${id}`, tipo);
  }

  toggleActivo(id: number): Observable<SysTipoRepuestoResponse> {
    return this.http.patch<SysTipoRepuestoResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  deleteTipo(id: number): Observable<SysTipoRepuestoResponse> {
    return this.http.delete<SysTipoRepuestoResponse>(`${this.apiUrl}/${id}`);
  }
}
