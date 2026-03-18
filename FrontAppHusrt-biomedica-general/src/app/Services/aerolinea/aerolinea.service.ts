import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { json } from 'stream/consumers';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AerolineaService {

  private apiUrl = 'http://172.31.38.166:3030/';
  http = inject(HttpClient);

  constructor() { }

  addUser(data: any){
    return firstValueFrom(this.http.post<any>(this.apiUrl + 'adduser', data));
  }

  downloadPdf(data: any): Observable<Blob> {
    return this.http.post(this.apiUrl + 'downloadTicket', data, { responseType: 'blob' });
  }
}

