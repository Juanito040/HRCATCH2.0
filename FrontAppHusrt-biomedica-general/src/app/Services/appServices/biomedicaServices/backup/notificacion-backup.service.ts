import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject, Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class NotificacionBackupService {

    private httpClient = inject(HttpClient);

    private _alertas$ = new BehaviorSubject<any[]>([]);
    alertas$: Observable<any[]> = this._alertas$.asObservable();
    conteoAlertas: number = 0;
    private pollingId: any = null;

    async cargarAlertas(): Promise<void> {
        const alertas = await firstValueFrom(
            this.httpClient.get<any[]>(`${API_URL}/backups/alertas`, this.createHeaders())
        );
        this._alertas$.next(alertas);
        this.conteoAlertas = alertas.length;
    }

    iniciarPolling(intervalMs: number = 60000): void {
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
