import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../../constantes';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DocumentosService {
    private httpClient = inject(HttpClient);

    constructor() { }

    getDocumentosByEquipo(idEquipo: any) {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${API_URL}/documentos/equipo/${idEquipo}`)
        );
    }

    addDocumento(formData: FormData) {
        return firstValueFrom(
            this.httpClient.post<any>(`${API_URL}/adddocumento`, formData)
        );
    }

    deleteDocumento(id: any) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${API_URL}/documentos/${id}`)
        );
    }
}
