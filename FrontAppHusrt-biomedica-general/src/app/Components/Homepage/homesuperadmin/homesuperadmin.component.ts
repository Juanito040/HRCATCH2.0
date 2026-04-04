import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';



@Component({
  selector: 'app-homesuperadmin',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homesuperadmin.component.html',
  styleUrl: './homesuperadmin.component.css'
})
export class HomesuperadminComponent {

  constructor(
    private router: Router
  ) { }

  viewParametrizacion() {
    this.router.navigate(['/parametrizacion']);
  }

  viewGestionBiomedica() {
    this.router.navigate(['/gestion-operativa']);
  }

  viewMesaServicios() {
    this.router.navigate(['/adminmesaservicios']);
  }

  viewGestionSistemas() {
    this.router.navigate(['/adminsistemas/gestion']);
  }

  viewParametrizacionSIS() {
    this.router.navigate(['/adminsistemas/parametrizacion']);
  }

  viewGestionMantenimiento() {
    // Ejemplo: this.router.navigate(['/mantenimiento/home']);
  }

  viewPersonalizacion() {
    this.router.navigate(['/personalizacion']);
  }
}
