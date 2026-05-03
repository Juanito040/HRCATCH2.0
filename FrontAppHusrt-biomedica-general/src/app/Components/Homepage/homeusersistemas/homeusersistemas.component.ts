import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-homeusersistemas',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './homeusersistemas.component.html',
  styleUrl: './homeusersistemas.component.css'
})
export class HomeusersistemasComponent {
  router = inject(Router);

  irAEquipos()            { this.router.navigate(['/adminsistemas/equipos']); }
  irAEquiposBodega()      { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'bodega' } }); }
  irAEquiposBaja()        { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'baja' } }); }
  irATiposEquipos()          { this.router.navigate(['/adminsistemas/tiposequipo']); }
  irAMantenimientosEquipos() { this.router.navigate(['/adminsistemas/mantenimientos']); }
  irAServiciosSis()          { this.router.navigate(['/adminsistemas/servicios']); }
  irASedesSis()              { this.router.navigate(['/adminsistemas/sedes']); }
  irACalendarioEquipo()      { this.router.navigate(['/adminsistemas/planMantenimiento']); }
  irARepuestos()             { this.router.navigate(['/adminsistemas/repuestos']); }
  irAIndicadores() { this.router.navigate(['/adminsistemas/indicadores']); }
}
