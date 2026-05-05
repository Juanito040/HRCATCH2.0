import { Component, inject, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-homeadminsistemas',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './homeadminsistemas.component.html',
  styleUrl: './homeadminsistemas.component.css'
})
export class HomeadminsistemasComponent implements OnInit {
  router = inject(Router);
  isSystemUser: boolean = true; // true por defecto: SSR no renderiza la tarjeta

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSystemUser = getDecodedAccessToken()?.rol === 'SYSTEMUSER';
    }
  }

  irAEquipos() { this.router.navigate(['/adminsistemas/gestion']); }
  irAEquiposBodega() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'bodega' } }); }
  irAEquiposBaja() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'baja' } }); }
  irATiposEquipos() { this.router.navigate(['/adminsistemas/tiposequipo']); }
  irAMantenimientosEquipos() { this.router.navigate(['/adminsistemas/mantenimientos']); }
  irAProtocolos() { this.router.navigate(['/adminsistemas/protocolos']); }
  irAParametrizacion() { this.router.navigate(['/adminsistemas/parametrizacion']); }
  irAMesa() { this.router.navigate(['/adminmesaservicios/casos']); }
  irAUsuarios() { this.router.navigate(['/admusuarios']); }
  irACalendarioEquipo() { this.router.navigate(['/adminsistemas/planMantenimiento']); }
  irARepuestos() { this.router.navigate(['/adminsistemas/repuestos']); }
  irAServiciosSis() { this.router.navigate(['/adminsistemas/servicios']); }
  irASedesSis() { this.router.navigate(['/adminsistemas/sedes']); }
  irAIndicadores() { this.router.navigate(['/adminsistemas/indicadores']); }
  irABackups()           { this.router.navigate(['/admin/sistemasinformacion']); }
  irACalendarioBackups() { this.router.navigate(['/admin/sistemasinformacion/backups']); }
}
