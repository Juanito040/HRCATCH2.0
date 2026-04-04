import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes'

@Injectable({
  providedIn: 'root'
})
export class ProtocolosService {

  private httpClient = inject(HttpClient);

  constructor() { }

  getProtocoloTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${API_URL}/protocolos/tipoequipo/` + idTipoEquipo)
    )
  }

  getProtocoloActivoTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${API_URL}/protocolosactivo/tipoequipo/` + idTipoEquipo)
    )
  }

  addCumplimientoProtocolo(protocolo: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/addcumplimiento`, protocolo)
    )
  }

  getCumplimientoProtocoloReporte(idReporte: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${API_URL}/cumplimientos/reporte/` + idReporte)
    )
  }
  getCumplimientoProtocoloMantenimiento(idMantenimiento: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${API_URL}/cumplimientos/mantenimiento/` + idMantenimiento)
    )
  }

  updateProtocolo(id: any, protocolo: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${API_URL}/actprotocolo/` + id, protocolo)
    )
  }

  createProtocolo(protocolo: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/addprotocolo`, protocolo)
    )
  }
}
