import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL } from '../../../../constantes';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() { }

  getArchivo(ruta: string) {
    return firstValueFrom(
      this.httpClient.post(`${API_URL}/obtenerarchivopdf`, { ruta: ruta }, {
        responseType: 'blob'
      })
    );
  }
}
