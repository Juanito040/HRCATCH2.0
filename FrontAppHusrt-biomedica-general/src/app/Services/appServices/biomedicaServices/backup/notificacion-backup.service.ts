import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject, Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class NotificacionBackupService {

    private httpClient = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    private _alertas$ = new BehaviorSubject<any[]>([]);
    alertas$: Observable<any[]> = this._alertas$.asObservable();
    conteoAlertas: number = 0;
    private pollingId: any = null;

    async cargarAlertas(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;
        try {
            const respuesta = await firstValueFrom(
                this.httpClient.get<any[]>(`${API_URL}/backups/alertas`, this.createHeaders())
            );
            const alertas = Array.isArray(respuesta) ? respuesta : [];
            this._alertas$.next(alertas);
            this.conteoAlertas = alertas.length;
        } catch (err) {
            console.error('[NotificacionBackupService] Error al cargar alertas:', err);
        }
    }

    iniciarPolling(intervalMs: number = 60000): void {
        this.detenerPolling();
        this.cargarAlertas();
        this.pollingId = setInterval(() => this.cargarAlertas(), intervalMs);
    }

    eliminarAlertaPorSistema(sistemaId: number): void {
        const actuales = this._alertas$.getValue();
        const nuevas = actuales.filter(a => a.sistemaId !== sistemaId);
        this._alertas$.next(nuevas);
        this.conteoAlertas = nuevas.length;
    }

    detenerPolling(): void {
        clearInterval(this.pollingId);
    }

    private createHeaders(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({
                'authorization': sessionStorage.getItem('utoken')!
            })
        };
    }
}
