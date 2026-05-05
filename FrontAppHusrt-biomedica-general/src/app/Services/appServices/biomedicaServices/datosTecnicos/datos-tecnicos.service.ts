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

export class DatosTecnicosService {

    private httpClient = inject(HttpClient);
    private router = inject(Router);
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    getDatosTecnicos() {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/datostecnicos`)
        )
    }

    getDatosTecnicosById(id: any) {
        return firstValueFrom(
            this.httpClient.get<any>(`${this.baseUrl}/datostecnicos/${id}`)
        )
    }

    addDatosTecnicos(datosTecnicos: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${this.baseUrl}/datostecnicos`, datosTecnicos)
        )
    }

    updateDatosTecnicos(id: any, datosTecnicos: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${this.baseUrl}/datostecnicos/${id}`, datosTecnicos)
        )
    }
}
