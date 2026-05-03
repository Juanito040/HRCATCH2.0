import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { API_URL } from './constantes';

interface AccesoModuloResponse {
  puedeAcceder: boolean;
  rol: string | null;
  sistemasAsignados: number;
}

export const sistemasModuloAccessGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const http = inject(HttpClient);

  if (!isPlatformBrowser(platformId)) return true;

  return http.get<AccesoModuloResponse>(`${API_URL}/usuarios/me/acceso-modulo-sistemas`).pipe(
    map(res => {
      if (res.puedeAcceder) return true;
      router.navigate(['/access-denied']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/access-denied']);
      return of(false);
    })
  );
};
