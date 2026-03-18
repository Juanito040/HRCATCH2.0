import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MesaadminnavbarComponent } from '../../navbars/mesaadminnavbar/mesaadminnavbar.component';
import { jwtDecode } from 'jwt-decode';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-homeadminmesaservicios',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homeadminmesaservicios.component.html',
  styleUrl: './homeadminmesaservicios.component.css'
})
export class HomeadminmesaserviciosComponent {

  constructor(private router: Router) { }

  userRole: string = '';

  ngOnInit() {
    this.extractUser();
  }

  extractUser() {
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded.rol;
    }
  }

  viewCategorias() {
    this.router.navigate(['/adminmesaservicios/config/categorias']);
  }

  viewRoles() {
    this.router.navigate(['/adminmesaservicios/config/roles']);
  }

  viewCasos() {
    this.router.navigate(['/adminmesaservicios/casos']);
  }

  viewIndicadores() {
    // Placeholder for Phase 6
    // this.router.navigate(['/adminmesaservicios/indicadores']);
  }
}
