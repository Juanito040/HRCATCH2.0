import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysPlanMantenimiento {
  id_sysplan?: number;
  id_sysequipo_fk: number;
  mes: number;
  ano: number;
  rango_inicio?: number;
  rango_fin?: number;
  equipo?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SysplanmantenimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysplanmantenimiento`;

  getAll(): Promise<SysPlanMantenimiento[]> {
    return firstValueFrom(this.http.get<SysPlanMantenimiento[]>(this.apiUrl));
  }

  getById(id: number): Promise<SysPlanMantenimiento> {
    return firstValueFrom(this.http.get<SysPlanMantenimiento>(`${this.apiUrl}/${id}`));
  }

  getByEquipo(idEquipo: number): Promise<SysPlanMantenimiento[]> {
    return firstValueFrom(this.http.get<SysPlanMantenimiento[]>(`${this.apiUrl}/equipo/${idEquipo}`));
  }

  getByMes(mes: number, ano: number): Promise<SysPlanMantenimiento[]> {
    return firstValueFrom(this.http.post<SysPlanMantenimiento[]>(`${this.apiUrl}/mes`, { mes, ano }));
  }

  create(plan: Partial<SysPlanMantenimiento>): Promise<SysPlanMantenimiento> {
    return firstValueFrom(this.http.post<SysPlanMantenimiento>(this.apiUrl, plan));
  }

  update(id: number, plan: Partial<SysPlanMantenimiento>): Promise<SysPlanMantenimiento> {
    return firstValueFrom(this.http.put<SysPlanMantenimiento>(`${this.apiUrl}/${id}`, plan));
  }

  delete(id: number): Promise<{ mensaje: string }> {
    return firstValueFrom(this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`));
  }

  reemplazarPlanesEquipo(idEquipo: number, planes: Partial<SysPlanMantenimiento>[]): Promise<SysPlanMantenimiento[]> {
    return firstValueFrom(this.http.put<SysPlanMantenimiento[]>(`${this.apiUrl}/equipo/${idEquipo}/reemplazar`, { planes }));
  }
  getScheduledMonths() {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/programacionPreventivaMeses`)
    )
  }
    getPlanMantenimientoTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/planmantenimientotipoequipo/` + idTipoEquipo)
    )
  }
    getPlanMantenimientoServicio(idServicio: any) {
    return firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/planmantenimientoservicio/` + idServicio)
    )
  }
   programacionMantenimiento(date: any) {
    return firstValueFrom(
      this.http.post<any>(`${API_URL}/sysprogramacion/programacion-preventivos`, date)
    )
  }
}
