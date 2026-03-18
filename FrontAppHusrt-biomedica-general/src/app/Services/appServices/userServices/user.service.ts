import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { firstValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { isTokenExpired, getDecodedAccessToken } from '../../../utilidades';
import { API_URL } from '../../../constantes'


@Injectable({
  providedIn: 'root'
})


export class UserService {

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  isLoggedIn(): boolean {
    return !isTokenExpired();
  }

  getToken() {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('utoken');
    }
    return null;
  }

  registro(formValue: any) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/adduser`, formValue)
    )
  }

  recuperarContrasena(email: String) {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/olvidocontrasena`, { email })
    )
  }

  cambiarContrasena(formValue: any) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/cambiarcontrasena`, formValue)
    )
  }

  update(formValue: any, idUser: number) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/users/update/` + idUser, formValue)
    )
  }

  desactivarUsuario(idUser: number) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/desactivarusuario/` + idUser, {})
    )
  }

  activarUsuario(idUser: number) {
    return firstValueFrom(
      this.httpClient.put<any>(`${this.baseUrl}/activarusuario/` + idUser, {})
    )
  }


  getNameUSer(idUser: number) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/nombreusuario/` + idUser)
    )
  }

  getUserProfil(idUser: any) {
    return firstValueFrom(
      this.httpClient.get<any>(`${this.baseUrl}/userprofil/` + idUser)
    );
  }

  async login(formValue: any) {
    const response = await firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/login`, formValue)
    );
    if (response && response.token) {
      sessionStorage.setItem('utoken', response.token);
      this.setupSessionTimer();
    }
    return response;
  }

  loginInvitado() {
    return firstValueFrom(
      this.httpClient.post<any>(`${this.baseUrl}/login/invitado`, {})
    )
  }

  getAllUsers() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/users`)
    )
  }

  getAllRoles() {
    return firstValueFrom(
      this.httpClient.get<any[]>(`${this.baseUrl}/roles`)
    )
  }

  private sessionTimer: any;
  private warningTimer: any;

  logout() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    Swal.fire({
      icon: 'info',
      title: 'Sesión Finalizada',
      text: 'Su sesión ha sido cerrada automáticamente.',
      confirmButtonText: 'Ok'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  setupSessionTimer() {
    const token = this.getToken();
    if (!token) return;

    // Clear any existing timers
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = (decoded.exp - currentTime) * 1000;

      if (timeLeft <= 0) {
        this.logout();
      } else {
        // Warning 5 minutes before (if more than 5 mins left)
        const warningTime = 5 * 60 * 1000;
        if (timeLeft > warningTime) {
          this.warningTimer = setTimeout(() => {
            Swal.fire({
              icon: 'warning',
              title: 'Su sesión expirará pronto',
              text: 'Su sesión se cerrará en 5 minutos. Asegúrese de guardar sus cambios.',
              timer: 10000,
              toast: true,
              position: 'top-end',
              showConfirmButton: false
            });
          }, timeLeft - warningTime);
        }

        this.sessionTimer = setTimeout(() => {
          this.logout();
        }, timeLeft);
      }
    } catch (e) {
      console.error('Error decoding token for timer:', e);
    }
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

}

