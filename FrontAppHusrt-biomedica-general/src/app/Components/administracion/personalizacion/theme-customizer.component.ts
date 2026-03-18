import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ThemeService, ThemeConfig } from '../../../Services/theme/theme.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
    selector: 'app-theme-customizer',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, SelectModule, DividerModule],
    templateUrl: './theme-customizer.component.html',
    styleUrl: './theme-customizer.component.css'
})
export class ThemeCustomizerComponent implements OnInit {
    themeService = inject(ThemeService);
    router = inject(Router);

    config: ThemeConfig = {
        primaryColor: '#0056b3',
        primaryDark: '#004494',
        bgApp: '#f4f7f6',
        bgSurface: '#ffffff',
        textColor: '#333333',
        textSecondary: '#6c757d',
        borderRadius: '0.5rem',
        fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        cardPrimaryStart: '#42a5f5',
        cardPrimaryEnd: '#1e88e5',
        cardSuccessStart: '#66bb6a',
        cardSuccessEnd: '#43a047',
        cardWarningStart: '#ffa726',
        cardWarningEnd: '#fb8c00',
        cardDangerStart: '#ef5350',
        cardDangerEnd: '#e53935',
        heroStart: '#1e3c72',
        heroEnd: '#2a5298',
        successColor: '#198754',
        warningColor: '#ffc107',
        dangerColor: '#dc3545',
        infoColor: '#0dcaf0',
        navbarBg: '#ffffff',
        navbarTextColor: '#333333',
        tableHeaderBg: '#f8f9fa',
        tableHeaderTextColor: '#333333',
        loginBgStart: '#1e3c72',
        loginBgEnd: '#2a5298',
        appName: 'AppHusrt',
        hospitalName: 'Hospital Universitario San Rafael de Tunja'
    };

    fonts = [
        { label: 'Roboto (Default)', value: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
        { label: 'Inter', value: "'Inter', sans-serif" },
        { label: 'Open Sans', value: "'Open Sans', sans-serif" },
        { label: 'Montserrat', value: "'Montserrat', sans-serif" },
        { label: 'Poppins', value: "'Poppins', sans-serif" },
        { label: 'Arial', value: 'Arial, sans-serif' }
    ];

    ngOnInit() {
        this.config = this.themeService.getThemeConfig();
    }

    applyPreview() {
        this.themeService.saveThemeConfig(this.config);
    }

    saveTheme() {
        this.themeService.saveThemeConfig(this.config);
        Swal.fire({
            title: '¡Guardado!',
            text: 'La configuración de estilo ha sido aplicada y guardada.',
            icon: 'success',
            confirmButtonColor: this.config.primaryColor
        });
    }

    resetDefaults() {
        Swal.fire({
            title: '¿Restablecer estilos?',
            text: 'Se volverá a los colores y fuentes originales del aplicativo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, restablecer',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.themeService.resetToDefaults();
                this.config = this.themeService.getThemeConfig();
                Swal.fire('Restablecido', 'Se han restaurado los valores por defecto.', 'success');
            }
        });
    }

    goBack() {
        this.router.navigate(['/superadmin']);
    }
}
