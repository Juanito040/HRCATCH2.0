import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_SERVINTE_URL } from '../../constantes';



@Injectable({
  providedIn: 'root'
})
export class EntidadService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() { }

  getentidadPaciente(idPaciente: String){
    const url = API_SERVINTE_URL + '/EntidadPaciente/' + idPaciente + '';
    return firstValueFrom(this.httpClient.get<any[]>(url))
  }

  getEAPBEntidad(nombreEmpresa: string){
    const url = API_SERVINTE_URL + '/Entidad/' + nombreEmpresa + '';
    return firstValueFrom(this.httpClient.get<any[]>(url));
  }

  getConsultasPediatria(object: any){
    const url = API_SERVINTE_URL + '/evolucionesespecialistas';
    return firstValueFrom(this.httpClient.post<any[]>(url, object));
  }

  getPacientesCirugia(){
    const url = API_SERVINTE_URL + '/pacientescirugia';
    return firstValueFrom(this.httpClient.get<any[]>(url));
  }

  getDatosCirugiaPaciente(episodio: string){
    const url = API_SERVINTE_URL + '/datoscirugiapaciente/' + episodio + '';
    return firstValueFrom(this.httpClient.get<any[]>(url));
  }
}
