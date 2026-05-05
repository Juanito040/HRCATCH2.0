import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HojavidaService } from '../../../../Services/appServices/biomedicaServices/hojavida/hojavida.service';
import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
    selector: 'app-semaforizacion-garantias',
    standalone: true,
    imports: [CommonModule, TableModule, IconFieldModule, InputIconModule, InputTextModule, ButtonModule, UppercaseDirective],
    templateUrl: './semaforizacion-garantias.component.html',
    styleUrl: './semaforizacion-garantias.component.css'
})
export class SemaforizacionGarantiasComponent implements OnInit {
    @ViewChild('dt2') dt2!: Table;

    hojavidaService = inject(HojavidaService);
    router = inject(Router);

    hojasVida: any[] = [];
    loading: boolean = true;

    async ngOnInit() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const allHojasVida = await this.hojavidaService.getAllHojasVida();

            this.hojasVida = allHojasVida
                .filter(hv => {
                    if (!hv.fechaVencimientoGarantia) return false;
                    const expiry = new Date(hv.fechaVencimientoGarantia);
                    return expiry >= today;
                })
                .sort((a, b) => {
                    const dateA = new Date(a.fechaVencimientoGarantia).getTime();
                    const dateB = new Date(b.fechaVencimientoGarantia).getTime();
                    return dateA - dateB;
                });

            this.loading = false;
        } catch (error) {
            console.error('Error loading hojas de vida:', error);
            this.loading = false;
        }
    }

    onGlobalFilter(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt2.filterGlobal(target.value, 'contains');
        }
    }

    getWarrantyColor(fechaVencimiento: string): string {
        if (!fechaVencimiento) return 'inherit';

        const today = new Date();
        const expiry = new Date(fechaVencimiento);

        // Difference in months
        const diffMs = expiry.getTime() - today.getTime();
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

        if (diffMonths < 2) return '#ffcdd2'; // Light Red (faded for cell background)
        if (diffMonths < 6) return '#fff9c4'; // Light Yellow
        return '#c8e6c9'; // Light Green
    }

    getWarrantyTextColor(fechaVencimiento: string): string {
        if (!fechaVencimiento) return 'inherit';

        const today = new Date();
        const expiry = new Date(fechaVencimiento);

        const diffMs = expiry.getTime() - today.getTime();
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

        if (diffMonths < 2) return '#b71c1c'; // Dark Red
        if (diffMonths < 6) return '#827717'; // Dark Yellow/Mustard
        return '#1b5e20'; // Dark Green
    }

    verHojaVida(idEquipo: any) {
        this.router.navigate(['biomedica/hojavidaequipo/', idEquipo]);
    }
}
