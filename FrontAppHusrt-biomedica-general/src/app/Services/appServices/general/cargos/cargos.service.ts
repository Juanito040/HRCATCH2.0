import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class CargosService {
    private url = API_URL + '/cargos';

    constructor(private http: HttpClient) { }

    private createHeaders() {
        return {
            headers: new HttpHeaders({
                'Authorization': sessionStorage.getItem('utoken') || ''
            })
        };
    }

    getCargos(): Observable<any[]> {
        return this.http.get<any[]>(this.url, this.createHeaders());
    }

    createCargo(cargo: any): Observable<any> {
        return this.http.post<any>(this.url, cargo, this.createHeaders());
    }

    updateCargo(id: number, cargo: any): Observable<any> {
        return this.http.put<any>(`${this.url}/${id}`, cargo, this.createHeaders());
    }

    deleteCargo(id: number): Observable<any> {
        return this.http.delete<any>(`${this.url}/${id}`, this.createHeaders());
    }
}
