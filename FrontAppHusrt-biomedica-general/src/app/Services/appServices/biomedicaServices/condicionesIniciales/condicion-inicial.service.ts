import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
    providedIn: 'root'
})
export class CondicionInicialService {

    private http = inject(HttpClient);
    private url = API_URL + '/condicionesiniciales';

    constructor() { }

    getAll(): Promise<any> {
        return firstValueFrom(this.http.get(this.url));
    }

    getActive(): Promise<any> {
        return firstValueFrom(this.http.get(this.url + '/activas'));
    }

    create(condicion: any): Promise<any> {
        return firstValueFrom(this.http.post(this.url, condicion));
    }

    update(id: number, condicion: any): Promise<any> {
        return firstValueFrom(this.http.put(this.url + '/' + id, condicion));
    }

    delete(id: number): Promise<any> {
        return firstValueFrom(this.http.delete(this.url + '/' + id));
    }
}

