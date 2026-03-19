import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-homeadminsistemas',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homeadminsistemas.component.html',
  styleUrl: './homeadminsistemas.component.css'
})
export class HomeadminsistemasComponent {
  router = inject(Router);

  irAEquipos() { this.router.navigate(['/adminsistemas/equipos']); }
  irAEquiposBodega() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'bodega' } }); }
  irAEquiposBaja() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'baja' } }); }
  irATiposEquipos() { this.router.navigate(['/adminsistemas/tiposequipo']); }
  irAMantenimientosEquipos() { this.router.navigate(['/adminsistemas/mantenimientos']); }
  irAMesa() { this.router.navigate(['/adminmesaservicios/casos']); }
  irAUsuarios() { this.router.navigate(['/admusuarios']); }
}
