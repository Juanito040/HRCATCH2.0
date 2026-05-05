import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-homeadminmantenimiento',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './homeadminmantenimiento.component.html',
  styleUrl: './homeadminmantenimiento.component.css'
})
export class HomeadminmantenimientoComponent {

}
