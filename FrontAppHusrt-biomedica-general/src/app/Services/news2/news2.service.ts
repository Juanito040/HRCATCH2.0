import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';

import { API_SERVINTE_URL } from '../../constantes';

@Injectable({
  providedIn: 'root'
})
export class News2Service {

  http = inject(HttpClient);

  getServicios(){
    const url = API_SERVINTE_URL + '/ubicacionesconpacientes';
    return firstValueFrom(this.http.get<any[]>(url));
  }

  getPacientesServicio(ubicacion: any){
    const url = API_SERVINTE_URL + '/pascientesubicacion/' + ubicacion.ubicod;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  getSignosPaciente(epipac: any){
    const url = API_SERVINTE_URL + '/signospaciente/' + epipac;
    return firstValueFrom(this.http.get<any>(url));
  }
}
