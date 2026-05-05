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

export class HojavidaService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }


  getAllHojasVida() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/hojasvida`)
    )
  }

  getHojaVidaByIdEquipo(id: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/hojavidaequipo/${id}`)
    )
  }

  getHojaVidaById(id: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/hojasvida/${id}`)
    )
  }

  addHojaVida(hojaVida: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/addhojasvida`, hojaVida)
    )
  }

  updateHojaVida(id: any, hojaVida: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/hojasvida/${id}`, hojaVida)
    )
  }
}
