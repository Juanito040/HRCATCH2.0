import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constantes';

@Injectable({
    providedIn: 'root'
})
export class MesaService {
    private apiUrl = `${API_URL}/api/mesa`;

    constructor(private http: HttpClient) { }

    createHeaders() {
        return {
            headers: new HttpHeaders({
                'authorization': sessionStorage.getItem('utoken') || ''
            })
        }
    }

    // --- Parametrización ---
    getCategorias(servicioId: number, activeOnly: boolean = false): Observable<any[]> {
        let params = new HttpParams();
        if (activeOnly) {
            params = params.set('activo', 'true');
        }

        // We need to merge auth headers with params options
        const options = {
            headers: new HttpHeaders({
                'authorization': sessionStorage.getItem('utoken') || ''
            }),
            params: params
        };

        return this.http.get<any[]>(`${this.apiUrl}/config/categorias/${servicioId}`, options);
    }

    createCategoria(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/config/categorias`, data, this.createHeaders());
    }

    toggleCategoria(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/config/categorias/${id}/toggle`, {}, this.createHeaders());
    }

    createSubcategoria(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/config/subcategorias`, data, this.createHeaders());
    }

    toggleSubcategoria(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/config/subcategorias/${id}/toggle`, {}, this.createHeaders());
    }

    getRoles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/config/roles`, this.createHeaders());
    }

    // --- Usuarios y Roles ---
    getUsersByServicio(servicioId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/config/usuarios/servicio/${servicioId}`, this.createHeaders());
    }

    assignRole(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/config/usuarios/asignar`, data, this.createHeaders());
    }

    getUserServices(usuarioId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/config/usuarios/${usuarioId}/servicios`, this.createHeaders());
    }

    // --- Casos ---
    createCaso(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos`, data, this.createHeaders());
    }

    getCasos(filters: any): Observable<any[]> {
        let params = new HttpParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params = params.append(key, filters[key]);
        });
        const options = { params, ...this.createHeaders() };
        return this.http.get<any[]>(`${this.apiUrl}/casos`, options);
    }

    getCasoById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/casos/${id}`, this.createHeaders());
    }

    changeState(id: number, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/casos/${id}/estado`, data, this.createHeaders());
    }

    updateCasoDetails(id: number, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/casos/${id}/detalles`, data, this.createHeaders());
    }

    // --- Interacciones ---
    addMensaje(casoId: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos/${casoId}/mensajes`, data, this.createHeaders());
    }

    assignResolutor(casoId: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos/${casoId}/asignar`, data, this.createHeaders());
    }

    removeResolutor(casoId: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos/${casoId}/desasignar`, data, this.createHeaders());
    }

    closeCaso(casoId: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos/${casoId}/cerrar`, data, this.createHeaders());
    }

    rateCaso(casoId: number, data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/casos/${casoId}/calificar`, data, this.createHeaders());
    }
}
