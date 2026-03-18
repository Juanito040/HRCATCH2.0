import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../../constantes';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TipoDocumentoService {
    private httpClient = inject(HttpClient);

    constructor() { }

    getAllTiposDocumento() {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${API_URL}/tiposdocumento`)
        );
    }

    addTipoDocumento(tipoDocumento: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${API_URL}/addtiposdocumento`, tipoDocumento)
        );
    }

    updateTipoDocumento(id: any, tipoDocumento: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${API_URL}/tiposdocumento/${id}`, tipoDocumento)
        );
    }

    deleteTipoDocumento(id: any) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${API_URL}/tiposdocumento/${id}`)
        );
    }
}
