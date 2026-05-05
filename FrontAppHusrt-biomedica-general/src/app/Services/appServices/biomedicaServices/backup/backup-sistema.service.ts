import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class BackupSistemaService {

    private httpClient = inject(HttpClient);
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    getBackupsPorSistema(id: number) {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/backups/${id}`, this.createHeaders())
        );
    }

    getBackupsPorMes(id: number, mes: number, anio: number) {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/backups/${id}/mes?mes=${mes}&anio=${anio}`, this.createHeaders())
        );
    }

    createBackup(data: any) {
        return firstValueFrom(
            this.httpClient.post<any>(`${this.baseUrl}/backups`, data, this.createHeaders())
        );
    }

    updateBackup(id: number, data: any) {
        return firstValueFrom(
            this.httpClient.put<any>(`${this.baseUrl}/backups/${id}`, data, this.createHeaders())
        );
    }

    deleteBackup(id: number) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${this.baseUrl}/backups/${id}`, this.createHeaders())
        );
    }

    deleteAllBackupsBySistema(sistemaId: number) {
        return firstValueFrom(
            this.httpClient.delete<any>(`${this.baseUrl}/backups/sistema/${sistemaId}`, this.createHeaders())
        );
    }

    getBackupsTodosMes(mes: number, anio: number) {
        return firstValueFrom(
            this.httpClient.get<any[]>(`${this.baseUrl}/backups/todos/mes?mes=${mes}&anio=${anio}`, this.createHeaders())
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
