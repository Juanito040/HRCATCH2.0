import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../constantes';

@Injectable({ providedIn: 'root' })
export class SysTipoUsoService {
  private http = inject(HttpClient);
  private base = `${API_URL}/systipouso`;

  getAll(): Promise<any[]> {
    return firstValueFrom(this.http.get<any>(this.base)).then(r => r.data ?? r);
  }

  create(nombre: string): Promise<any> {
    return firstValueFrom(this.http.post<any>(this.base, { nombre }));
  }

  update(id: number, nombre: string): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.base}/${id}`, { nombre }));
  }

  delete(id: number): Promise<any> {
    return firstValueFrom(this.http.delete<any>(`${this.base}/${id}`));
  }
}
