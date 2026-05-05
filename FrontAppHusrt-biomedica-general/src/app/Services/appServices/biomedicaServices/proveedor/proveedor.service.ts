import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {

    private httpClient = inject(HttpClient);
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    getProveedores() {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/proveedores`, this.createHeaders())
        );
    }

    getProveedorById(id: number) {
        return firstValueFrom(
            this.httpClient.get<any>(`${this.baseUrl}/proveedor/${id}`, this.createHeaders())
        );
    }

    createProveedor(proveedor: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${this.baseUrl}/proveedor/`, proveedor, this.createHeaders())
        );
    }

    actualizarProveedor(id: number, proveedor: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${this.baseUrl}/proveedor/${id}`, proveedor, this.createHeaders())
        );
    }

    eliminarProveedor(id: number) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${this.baseUrl}/proveedor/${id}`, this.createHeaders())
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
