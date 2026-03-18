import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class FabricanteService {

    private httpClient = inject(HttpClient);
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    getFabricantes() {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/fabricantes`, this.createHeaders())
        );
    }

    getFabricanteById(id: number) {
        return firstValueFrom(
            this.httpClient.get<any>(`${this.baseUrl}/fabricante/${id}`, this.createHeaders())
        );
    }

    createFabricante(fabricante: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${this.baseUrl}/fabricante/`, fabricante, this.createHeaders())
        );
    }

    actualizarFabricante(id: number, fabricante: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${this.baseUrl}/fabricante/${id}`, fabricante, this.createHeaders())
        );
    }

    eliminarFabricante(id: number) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${this.baseUrl}/fabricante/${id}`, this.createHeaders())
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
