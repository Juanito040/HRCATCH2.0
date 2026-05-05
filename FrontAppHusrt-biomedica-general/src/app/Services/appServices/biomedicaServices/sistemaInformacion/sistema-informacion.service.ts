import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class SistemaInformacionService {

    private httpClient = inject(HttpClient);
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    getSistemasInformacion() {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/sistemasinformacion`, this.createHeaders())
        );
    }

    getSistemaById(id: number) {
        return firstValueFrom(
            this.httpClient.get<any>(`${this.baseUrl}/sistemainformacion/${id}`, this.createHeaders())
        );
    }

    createSistema(data: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${this.baseUrl}/sistemainformacion/`, data, this.createHeaders())
        );
    }

    actualizarSistema(id: number, data: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${this.baseUrl}/sistemainformacion/${id}`, data, this.createHeaders())
        );
    }

    eliminarSistema(id: number) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${this.baseUrl}/sistemainformacion/${id}`, this.createHeaders())
        );
    }

    createHeaders() {
        return {
            headers: new HttpHeaders({
                'authorization': sessionStorage.getItem('utoken')!
            })
        };
    }
}
