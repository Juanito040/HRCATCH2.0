import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes'

@Injectable({
  providedIn: 'root'
})
export class EquiposService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  addEquipo(equipo: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/addequipo`, equipo)
    );
  }

  updateEquipo(id: any, equipo: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/Actequipo/${id}`, equipo)
    );
  }

  getAllEquipos() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos`)
    )
  }

  getAllEquiposSeries() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/seriesequipos`)
    )
  }

  getEquipoById(id: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/equipo/${id}`)
    )
  }

  getAllEquiposBajas() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/bajas`)
    )
  }

  getAllEquiposComodatos(idResponsable: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/responsable/${idResponsable}`)
    )
  }

  getAllEquiposTipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/tipo/${idTipoEquipo}`)
    )
  }

  getAllEquiposServicio(idServicio: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/servicio/${idServicio}`)
    )
  }

  getAllEquiposSede(idSede: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/sede/${idSede}`)
    )
  }

  getAllEquiposRiesgo(riesgo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/riesgo/${riesgo}`)
    )
  }

  getCantidadEquiposRiesgo(riesgo: string) {
    return firstValueFrom(
      this.httpClient.get<number>(`${this.baseUrl}/cantidadequiposriesgo/${riesgo}`)
    )
  }

  getTrazabilidadByEquipo(idEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/trazabilidad/equipo/${idEquipo}`)
    )
  }

  createTrazabilidad(trazabilidad: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/trazabilidad`, trazabilidad)
    )
  }

  getHistorialUnificado(idEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/historial/equipo/${idEquipo}`)
    )
  }

  exportarInventario(): Promise<Blob> {
    return firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/exportarInventario`, { responseType: 'blob' })
    );
  }

  getEquiposPatron() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/equipos/patron`)
    )
  }

}
