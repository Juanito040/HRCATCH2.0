import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-gestion-operativa',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './gestion-operativa.component.html',
    styleUrl: './gestion-operativa.component.css'
})
export class GestionOperativaComponent {
    router = inject(Router);

    constructor() { }

    showViewInventarioBio() { this.router.navigate(['/biomedica/inventario']); }
    showViewMantenimientoBio() { this.router.navigate(['/biomedica/mantenimiento']); }
    showViewSemaforizacionBio() { this.router.navigate(['/biomedica/semaforizacion']); }
    showViewIndicadoresBio() { this.router.navigate(['/biomedica/indicadores']); }
    showViewCalendarioBio() { this.router.navigate(['/biomedica/calendario']); }
    showViewActividadesMetrologicasBio() { this.router.navigate(['/biomedica/actividadesmetrologicas']); }
}
