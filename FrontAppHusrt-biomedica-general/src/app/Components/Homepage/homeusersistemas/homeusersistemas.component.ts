import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-homeusersistemas',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './homeusersistemas.component.html',
  styleUrl: './homeusersistemas.component.css'
})
export class HomeusersistemasComponent {
  router = inject(Router);
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

  irAEquipos() { this.router.navigate(['/adminsistemas/equipos']); }
  irAEquiposBodega() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'bodega' } }); }
  irAEquiposBaja() { this.router.navigate(['/adminsistemas/equipos'], { queryParams: { vista: 'baja' } }); }
  irATiposEquipos() { this.router.navigate(['/adminsistemas/tiposequipo']); }
  showViewMantenimientoSistemas() {
    const rol = this.getRole();
    if (rol === 'SYSTEMASTECNICO') {
      this.router.navigate(['adminsistemas/tecnico/mantenimiento']);
    } else {
      this.router.navigate(['/adminsistemas/mantenimiento']);
    }
  }
    irAServiciosSis()          { this.router.navigate(['/adminsistemas/servicios']); }
  irASedesSis()              { this.router.navigate(['/adminsistemas/sedes']); }
  irACalendarioEquipo()      { this.router.navigate(['/adminsistemas/planMantenimiento']); }
  irARepuestos()             { this.router.navigate(['/adminsistemas/repuestos']); }
  irAIndicadores() { this.router.navigate(['/adminsistemas/indicadores']); }
  irABackups()           { this.router.navigate(['/admin/sistemasinformacion']); }
  irACalendarioBackups() { this.router.navigate(['/admin/sistemasinformacion/backups']); }
}
