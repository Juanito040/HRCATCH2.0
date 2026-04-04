import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-parametrizacion-sistemas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parametrizacion-sistemas.component.html',
  styleUrl: './parametrizacion-sistemas.component.css'
})
export class ParametrizacionSistemasComponent {
  router = inject(Router);

  isSuperAdmin: boolean = false;
  isAdminSistemas: boolean = false;

  constructor() {
    const decoded = getDecodedAccessToken();
    if (decoded?.rol === 'SUPERADMIN') this.isSuperAdmin = true;
    if (decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'AG') this.isAdminSistemas = true;
  }

  irATiposEquipo()  { this.router.navigate(['/adminsistemas/tiposequipo']); }
  irAProtocolos()   { this.router.navigate(['/adminsistemas/protocolos']); }
  irAUsuarios()     { this.router.navigate(['/admusuarios']); }
}
