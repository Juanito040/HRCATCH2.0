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

  irAGestionSistemas() { this.router.navigate(['/adminsistemas']); }
}
