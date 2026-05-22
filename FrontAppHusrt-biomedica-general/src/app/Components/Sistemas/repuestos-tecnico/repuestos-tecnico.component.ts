import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SysRepuestosService } from '../../../Services/appServices/sistemasServices/sysrepuestos/sysrepuestos.service';

@Component({
  selector: 'app-repuestos-tecnico',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './repuestos-tecnico.component.html',
  styleUrl: './repuestos-tecnico.component.css'
})
export class SisRepuestosTecnicoComponent implements OnInit {
  repuestosUsados: any[] = [];
  loading: boolean = true;
  private sysRepuestosService = inject(SysRepuestosService);

  constructor() {}

  ngOnInit(): void {
    this.cargarRepuestosUsados();
  }

  cargarRepuestosUsados() {
    this.loading = true;
    this.sysRepuestosService.getUsadosPorTecnico().subscribe({
      next: (res) => {
        if (res.success) {
          this.repuestosUsados = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando repuestos usados', err);
        this.loading = false;
      }
    });
  }
}
