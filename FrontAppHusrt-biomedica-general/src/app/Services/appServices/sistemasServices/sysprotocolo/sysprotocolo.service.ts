import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface SysProtocoloPreventivo {
  id_sysprotocolo?: number;
  paso: string;
  estado?: boolean;
  id_tipo_equipo_fk: number;
  tipoEquipo?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SysprotocoloService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/sysprotocolo`;

  getAll(): Promise<SysProtocoloPreventivo[]> {
    return firstValueFrom(this.http.get<SysProtocoloPreventivo[]>(this.apiUrl));
  }

  getById(id: number): Promise<SysProtocoloPreventivo> {
    return firstValueFrom(this.http.get<SysProtocoloPreventivo>(`${this.apiUrl}/${id}`));
  }

  getByTipoEquipo(idTipo: number): Promise<SysProtocoloPreventivo[]> {
    return firstValueFrom(this.http.get<SysProtocoloPreventivo[]>(`${this.apiUrl}/tipoequipo/${idTipo}`));
  }

  getActivosByTipoEquipo(idTipo: number): Promise<SysProtocoloPreventivo[]> {
    return firstValueFrom(this.http.get<SysProtocoloPreventivo[]>(`${this.apiUrl}/activo/tipoequipo/${idTipo}`));
  }

  create(protocolo: Partial<SysProtocoloPreventivo>): Promise<SysProtocoloPreventivo> {
    return firstValueFrom(this.http.post<SysProtocoloPreventivo>(this.apiUrl, protocolo));
  }

  update(id: number, protocolo: Partial<SysProtocoloPreventivo>): Promise<SysProtocoloPreventivo> {
    return firstValueFrom(this.http.put<SysProtocoloPreventivo>(`${this.apiUrl}/${id}`, protocolo));
  }

  delete(id: number): Promise<{ mensaje: string }> {
    return firstValueFrom(this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`));
  }
  getCumplimientoProtocoloMantenimiento(idMantenimiento: any) {
    return firstValueFrom(
      this.http.get<any[]>(`${API_URL}/cumplimientos/mantenimiento/` + idMantenimiento)
    )
  }
  addCumplimientoProtocolo(protocolo: any) {
    return firstValueFrom(
      this.http.post<any>(`${API_URL}/syscumplimiento/addcumplimiento`, protocolo)
    )
  }
}
