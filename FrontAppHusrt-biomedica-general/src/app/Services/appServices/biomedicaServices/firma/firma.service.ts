import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../../constantes';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirmaService {

    private httpClient = inject(HttpClient);

    constructor() { }

    guardarFirma(image: string, idUsuario: number) {
        return firstValueFrom(
            this.httpClient.post<any>(`${API_URL}/firma`, { image, idUsuario })
        );
    }

    getFirma(idUsuario: number) {
        return firstValueFrom(
            this.httpClient.get<any>(`${API_URL}/firma/${idUsuario}`)
        );
    }

    getFirmaImage(idUsuario: number) {
        return firstValueFrom(
            this.httpClient.post(`${API_URL}/firma/ver`, { idUsuario }, { responseType: 'blob' })
        );
    }
}
