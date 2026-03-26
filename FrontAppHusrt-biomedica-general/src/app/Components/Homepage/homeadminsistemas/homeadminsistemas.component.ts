import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homeadminsistemas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homeadminsistemas.component.html',
  styleUrl: './homeadminsistemas.component.css'
})
export class HomeadminsistemasComponent {

  private router = inject(Router);

  irACalendarioBackups(): void {
    this.router.navigate(['/admin/sistemasinformacion/backups']);
  }
}
