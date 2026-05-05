import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
import { API_URL } from '../../../../constantes'
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() {

  }

  getReportesEquipo(idEquipo: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/reportes/equipo/${idEquipo}`)
    )
  }

  getReportesPreventivosMesAño(date: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/reportes/preventivosmes`, date)
    )
  }

  getReportesCorrectivosMesAño(date: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/reportes/correctivosmes`, date)
    )
  }

  getReportesPreventivosRango(data: { mesInicio: number, mesFin: number, anio: number }) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/reportes/preventivosrango`, data)
    )
  }

  getReportesCorrectivosRango(data: { mesInicio: number, mesFin: number, anio: number }) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/reportes/correctivosrango`, data)
    )
  }

  getPreventivoProgramado(idReporte: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/reporte/${idReporte}`)
    )
  }

  ActualizarPreventivoProgramado(idReporte: any, reporte: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${API_URL}/actualizarreporte/${idReporte}`, reporte)
    )
  }

  CrearReporteCorrectivo(reporte: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/addreporte`, reporte)
    )
  }

  getReporteById(idReporte: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/reporte/${idReporte}`)
    )
  }

  getReportesPorRango(inicio: string, fin: string, limit = 1000, offset = 0) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/reportes/rango`, {
        params: { inicio, fin, limit, offset } as any
      })
    );
  }

  getReportesUsuario(idUsuario: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${API_URL}/reportes/usuario/${idUsuario}`)
    )
  }

  uploadReportePdf(id: any, file: File) {
    const formData = new FormData();
    formData.append('reportePdf', file);
    return firstValueFrom(
      this.httpClient.post<any>(`${API_URL}/uploadreportepdf/${id}`, formData)
    );
  }
}
