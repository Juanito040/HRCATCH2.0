import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-homeadminbiomedica',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homeadminbiomedica.component.html',
  styleUrl: './homeadminbiomedica.component.css'
})
export class HomeadminbiomedicaComponent {

  router = inject(Router);
  isAdminBiomedica: boolean = false;

  constructor() {
    this.checkRole();
  }

  checkRole() {
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded = getDecodedAccessToken();
      if (decoded?.rol === 'BIOMEDICAADMIN') {
        this.isAdminBiomedica = true;
      }
    }
  }

  // Operativa
  showViewGestionOperativa() { this.router.navigate(['/gestion-operativa']); }

  // Parametrizacion
  showViewParametrizacion() { this.router.navigate(['/parametrizacion']); }


}
