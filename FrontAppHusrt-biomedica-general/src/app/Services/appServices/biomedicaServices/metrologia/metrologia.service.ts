import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes'

@Injectable({
  providedIn: 'root'
})

export class MetrologiaService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() { }

  getReportesMetrologiaEquipo(idEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/actividadesequipo/${idEquipo}`)
    )
  }

  getPlanMetrologiaEquipo(idEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/planmetrologiaequipo/${idEquipo}`)
    )
  }

  getReportesActividadesMesAño(date: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/reportesMetrologicosmes`, date)
    )
  }

  getPlanActividadesMesAño(date: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/planactividadmetrologicames`, date)
    )
  }

  getPlanAMetrologicasTipoEquipo(idTipoEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/planametrologicastipoequipo/` + idTipoEquipo)
    )
  }

  getPlanAMetrologicasServicio(idServicio: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/planametrologicasservicio/` + idServicio)
    )
  }

  programarActividadesMetrologicasMes(date: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/programacionmetrologiames`, date)
    )
  }

  updateActividadMetrologica(id: any, formData: FormData) {
    return firstValueFrom(
      this.httpClient.put<any>(`${API_URL}/actactividad/${id}`, formData)
    )
  }

  registrarActividadConArchivo(formData: FormData) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/addactividadWithFile`, formData)
    )
  }

  getScheduledMetrologyMonths() {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/programacion-metrologia-meses`)
    )
  }
}
