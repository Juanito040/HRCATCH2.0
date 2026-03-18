import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../constantes';
import { isTokenExpired } from '../../../../utilidades';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;

  }

  getAllServicios() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/servicios`)
    )
  }

  getAllServiciosActivos() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/serviciosactivos`)
    )
  }

  getServiciosBySede(idSede: any) {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/servicios/sede/${idSede}`)
    )
  }

  getCantidadEquipos(idServicio: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/cantidadequiposserv/${idServicio}`)
    )
  }

  getServicio(idServicio: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/servicios/${idServicio}`)
    )
  }

  activarServicio(idServicio: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/servicios/activar/${idServicio}`, {})
    )
  }

  desactivarServicio(idServicio: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/servicios/desactivar/${idServicio}`, {})
    )
  }

  actualizarServicio(idServicio: any, data: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/servicios/${idServicio}`, data)
    )
  }

  createServicio(data: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/addservicio`, data)
    )
  }
}
