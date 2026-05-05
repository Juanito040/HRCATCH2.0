import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ThemeConfig {
    primaryColor: string;
    primaryDark: string;
    bgApp: string;
    bgSurface: string;
    textColor: string;
    textSecondary: string;
    borderRadius: string;
    fontFamily: string;
    // Card Themes (Gradients)
    cardPrimaryStart: string;
    cardPrimaryEnd: string;
    cardSuccessStart: string;
    cardSuccessEnd: string;
    cardWarningStart: string;
    cardWarningEnd: string;
    cardDangerStart: string;
    cardDangerEnd: string;
    // Hero Section (Titles)
    heroStart: string;
    heroEnd: string;
    // Semantic Colors
    successColor: string;
    warningColor: string;
    dangerColor: string;
    infoColor: string;
    // Navigation
    navbarBg: string;
    navbarTextColor: string;
    // Tables
    tableHeaderBg: string;
    tableHeaderTextColor: string;
    // Login
    loginBgStart: string;
    loginBgEnd: string;
    // Metadata
    appName: string;
    hospitalName: string;
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'app_theme_config';
    private platformId = inject(PLATFORM_ID);

    private readonly defaults: ThemeConfig = {
        primaryColor: '#0056b3',
        primaryDark: '#004494',
        bgApp: '#ffffff',
        bgSurface: '#ffffff',
        textColor: '#333333',
        textSecondary: '#6c757d',
        borderRadius: '0.5rem',
        fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        // Default Gradients
        cardPrimaryStart: '#0056b3',
        cardPrimaryEnd: '#004494',
        cardSuccessStart: '#198754',
        cardSuccessEnd: '#146c43',
        cardWarningStart: '#ffc107',
        cardWarningEnd: '#e0a800',
        cardDangerStart: '#dc3545',
        cardDangerEnd: '#b02a37',
        // Hero Defaults
        heroStart: '#0056b3',
        heroEnd: '#004494',
        // Semantic Defaults
        successColor: '#198754',
        warningColor: '#ffc107',
        dangerColor: '#dc3545',
        infoColor: '#0dcaf0',
        // Navigation Defaults
        navbarBg: '#ffffff',
        navbarTextColor: '#333333',
        // Tables Defaults
        tableHeaderBg: '#f8f9fa',
        tableHeaderTextColor: '#333333',
        // Login Defaults
        loginBgStart: '#ffffff',
        loginBgEnd: '#ffffff',
        // Metadata Defaults
        appName: 'AppHusrt',
        hospitalName: 'Hospital Universitario San Rafael de Tunja'
    };

    constructor() { }

    applyTheme() {
        if (isPlatformBrowser(this.platformId)) {
            const config = this.getThemeConfig();
            const root = document.documentElement;

            root.style.setProperty('--primary-color', config.primaryColor);
            root.style.setProperty('--primary-dark', config.primaryDark);
            root.style.setProperty('--bg-app', config.bgApp);
            root.style.setProperty('--bg-surface', config.bgSurface);
            root.style.setProperty('--text-color', config.textColor);
            root.style.setProperty('--text-secondary', config.textSecondary);
            root.style.setProperty('--border-radius', config.borderRadius);
            root.style.setProperty('font-family', config.fontFamily);

            // Card Gradients
            root.style.setProperty('--card-primary-start', config.cardPrimaryStart);
            root.style.setProperty('--card-primary-end', config.cardPrimaryEnd);
            root.style.setProperty('--card-success-start', config.cardSuccessStart);
            root.style.setProperty('--card-success-end', config.cardSuccessEnd);
            root.style.setProperty('--card-warning-start', config.cardWarningStart);
            root.style.setProperty('--card-warning-end', config.cardWarningEnd);
            root.style.setProperty('--card-danger-start', config.cardDangerStart);
            root.style.setProperty('--card-danger-end', config.cardDangerEnd);

            // Hero Gradients
            root.style.setProperty('--hero-start', config.heroStart);
            root.style.setProperty('--hero-end', config.heroEnd);

            // Semantic Colors
            root.style.setProperty('--success-color', config.successColor);
            root.style.setProperty('--warning-color', config.warningColor);
            root.style.setProperty('--danger-color', config.dangerColor);
            root.style.setProperty('--info-color', config.infoColor);

            // Navigation
            root.style.setProperty('--navbar-bg', config.navbarBg);
            root.style.setProperty('--navbar-text', config.navbarTextColor);

            // Tables
            root.style.setProperty('--table-header-bg', config.tableHeaderBg);
            root.style.setProperty('--table-header-text', config.tableHeaderTextColor);

            // Login
            root.style.setProperty('--login-bg-start', config.loginBgStart);
            root.style.setProperty('--login-bg-end', config.loginBgEnd);

            // Metadata as CSS variables (mostly for branding consistency)
            root.style.setProperty('--app-name', `"${config.appName}"`);
            root.style.setProperty('--hospital-name', `"${config.hospitalName}"`);

            // Derived variables for better UI
            root.style.setProperty('--primary-50', config.primaryColor + '10'); // 10% opacity
            root.style.setProperty('--primary-100', config.primaryColor + '20');
        }
    }

    getThemeConfig(): ThemeConfig {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : { ...this.defaults };
        }
        return { ...this.defaults };
    }

    saveThemeConfig(config: ThemeConfig) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
            this.applyTheme();
        }
    }

    resetToDefaults() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.applyTheme();
        }
    }

    getDefaults(): ThemeConfig {
        return { ...this.defaults };
    }
}
