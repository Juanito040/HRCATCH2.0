import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-semaforizacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semaforizacion.component.html',
  styleUrl: './semaforizacion.component.css'
})
export class SemaforizacionComponent {
  router = inject(Router);

  showViewSemaforizacionGarantias() {
    this.router.navigate(['/biomedica/semaforizacion-garantias']);
  }
}
