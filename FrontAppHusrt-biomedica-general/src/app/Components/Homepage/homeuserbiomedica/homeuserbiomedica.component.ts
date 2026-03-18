import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-homeuserbiomedica',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homeuserbiomedica.component.html',
  styleUrl: './homeuserbiomedica.component.css'
})
export class HomeuserbiomedicaComponent {

  constructor(private router: Router) {
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  getRole(): string | null {
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded = this.getDecodedAccessToken(token);
      return decoded ? decoded.rol : null;
    }
    return null;
  }

  showViewInventarioBio() {
    this.router.navigate(['/biomedica/inventario']);
  }

  showViewMantenimientoBio() {
    const rol = this.getRole();
    if (rol === 'BIOMEDICATECNICO') {
      this.router.navigate(['/biomedica/tecnico/mantenimiento']);
    } else {
      this.router.navigate(['/biomedica/mantenimiento']);
    }
  }

  showViewSemaforizacionBio() {
    this.router.navigate(['/biomedica/semaforizacion']);
  }

  showViewIndicadoresBio() {
    this.router.navigate(['/biomedica/indicadores']);
  }

  showViewCalendarioBio() {
    this.router.navigate(['/biomedica/calendario']);
  }

  showViewActividadesMetrologicasBio() {
    this.router.navigate(['/biomedica/actividadesmetrologicas']);
  }
}
