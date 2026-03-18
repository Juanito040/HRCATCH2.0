import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../../Services/theme/theme.service';

@Component({
  selector: 'app-mantenimientoadminnavbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, AvatarModule, ButtonModule, TooltipModule, RouterModule],
  templateUrl: './mantenimientoadminnavbar.component.html',
  styleUrl: './mantenimientoadminnavbar.component.css'
})
export class MantenimientoadminnavbarComponent implements OnInit {

  items: MenuItem[] | undefined;
  themeService = inject(ThemeService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/adminmantenimiento'
      },
      {
        label: 'Mesa de Servicios',
        icon: 'pi pi-briefcase',
        routerLink: '/adminmesaservicios/casos'
      }
    ];
  }

  navigateToAbout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('utoken', "");
    }
    this.router.navigate(['/login'])
  }
}
