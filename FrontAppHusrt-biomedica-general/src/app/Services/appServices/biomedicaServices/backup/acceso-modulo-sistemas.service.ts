import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API_URL } from '../../../../constantes';

export interface AccesoModuloSistemas {
    puedeAcceder: boolean;
    rol: string | null;
    sistemasAsignados: number;
}

@Injectable({ providedIn: 'root' })
export class AccesoModuloSistemasService {
    private http = inject(HttpClient);
    private cache$?: Observable<AccesoModuloSistemas>;

    obtenerAcceso(): Observable<AccesoModuloSistemas> {
        if (!this.cache$) {
            this.cache$ = this.http
                .get<AccesoModuloSistemas>(`${API_URL}/usuarios/me/acceso-modulo-sistemas`)
                .pipe(shareReplay(1));
        }
        return this.cache$;
    }

    invalidar(): void {
        this.cache$ = undefined;
    }
}
