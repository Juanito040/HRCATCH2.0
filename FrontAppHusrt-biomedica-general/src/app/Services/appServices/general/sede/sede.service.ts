import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  router = inject(Router);
  httpClient = inject(HttpClient);

  constructor() { }

  getAllSedes() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${API_URL}/sedes`)
    )
  }

  getSedeById(id: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/sedes/${id}`)
    )
  }

}
