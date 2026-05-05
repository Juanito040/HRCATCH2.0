import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../constantes'
import { isTokenExpired } from '../../../../utilidades';

@Injectable({
  providedIn: 'root'
})

export class ResponsableService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;

  }

  getAllResponsablesComodatos() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/responsablescomodatos`)
    )
  }

  getAllResponsables() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/responsablestodos`)
    )
  }

  getCantidadEquipos(idResponsable: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/cantidadequiposprov/${idResponsable}`)
    )
  }

  getResponsableComodatos(idResponsable: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/responsable/${idResponsable}`)
    )
  }

  getResponsableById(id: number) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/responsable/${id}`)
    );
  }

  createResponsable(responsable: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/addresponsable`, responsable)
    );
  }

  updateResponsable(id: number, responsable: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/responsable/${id}`, responsable)
    );
  }

  deleteResponsable(id: number) {
    return firstValueFrom(
      this.httpClient.delete<any>(`${this.baseUrl}/responsable/${id}`)
    );
  }
}
