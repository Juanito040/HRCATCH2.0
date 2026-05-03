import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { isTokenExpired } from '../../../../utilidades';

import { API_URL } from '../../../../constantes';

@Injectable({
  providedIn: 'root'
})
export class TipoEquipoService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;

  }

  getAllTiposEquipos() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/tiposequipo`)
    )
  }

  activarTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/tiposequipo/activar/` + idTipoEquipo, {})
    )
  }

  desactivarTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/tiposequipo/desactivar/` + idTipoEquipo, {})
    )
  }

  getCantidadEquipos(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/cantidadequipostipo/${idTipoEquipo}`)
    )
  }

  getAllTiposEquiposBiomedica() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/alltiposequipoBio`)
    )
  }

  getTiposEquiposBiomedica() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/tiposequipoBio`)
    )
  }

  getTiposEquiposSistemas() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/tiposequipoSis`)
    )
  }

  getCantidadEquiposSistemas(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/cantidadequipostiposis/${idTipoEquipo}`)
    )
  }

  getTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/tiposequipo/${idTipoEquipo}`)
    )
  }

  actualizarTipoEquipo(idTipoEquipo: any, data: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/tiposequipo/${idTipoEquipo}`, data)
    )
  }

  crearTipoEquipo(data: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/addtiposequipo`, data)
    )
  }

  // Mediciones específicas
  getMediciones(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/tiposequipo/${idTipoEquipo}/mediciones`)
    )
  }

  createMedicion(data: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/tiposequipo/mediciones`, data)
    )
  }

  updateMedicion(idMedicion: any, data: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/tiposequipo/mediciones/${idMedicion}`, data)
    )
  }

  deleteMedicion(idMedicion: any) {
    return firstValueFrom(
      this.httpClient.delete<any>(`${this.baseUrl}/tiposequipo/mediciones/${idMedicion}`)
    )
  }
}
