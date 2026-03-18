import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

export function obtenerNombreMes(numeroMes: number): string {
  const meses: string[] = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  if (numeroMes < 1 || numeroMes > 12) {
    throw new Error("El número debe estar entre 1 y 12.");
  }
  return meses[numeroMes - 1];
}

// Funcion para verificar si el usuario tiene un token valido
export function isTokenExpired(): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false; // On server, we assume it's NOT expired to avoid premature redirect flash
  }
  const token = sessionStorage.getItem('utoken');
  if (!token) {
    return true; // No token in browser = expired
  }
  const decodedToken = getDecodedAccessToken();
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);

  return decodedToken.exp < currentTime;
}

export function getDecodedAccessToken(): any {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  const token = sessionStorage.getItem('utoken');
  if (!token) {
    return null;
  }
  try {
    return jwtDecode(token);
  } catch (Error) {
    return null;
  }
}

