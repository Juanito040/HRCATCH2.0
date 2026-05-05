import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { MesaService } from '../../../Services/mesa-servicios/mesa.service';

@Component({
  selector: 'app-sys-ver-reporte',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DialogModule,
    CardModule,
    TagModule
  ],
  templateUrl: './sys-ver-reporte.component.html',
  styleUrl: './sys-ver-reporte.component.css'
})
export class SysVerReporteComponent implements OnInit {

  @ViewChild('dt') dt!: Table;

  equipo: any = null;
  reportes: any[] = [];
  loading = false;
  modalVisible = false;
  reporteSeleccionado: any = null;
  equipoId!: number;

  private sysequiposService = inject(SysequiposService);
  private mesaService = inject(MesaService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    this.equipoId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    try {
      const eqRes = await this.sysequiposService.getEquipoById(this.equipoId).toPromise();
      this.equipo = Array.isArray(eqRes?.data) ? eqRes!.data[0] : eqRes?.data;

      const repRes = await this.mesaService.getSysReportesMantenimiento(this.equipoId).toPromise();
      this.reportes = repRes?.data ?? [];
    } catch {
      // carga fallida: se muestra tabla vacía
    } finally {
      this.loading = false;
    }
  }

  onGlobalFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(val, 'contains');
  }

  verDetalle(reporte: any): void {
    this.reporteSeleccionado = reporte;
    this.modalVisible = true;
  }

  estadoSeverity(estado: string): 'success' | 'warning' | 'danger' | 'secondary' {
    if (estado?.includes('sin restricciones')) return 'success';
    if (estado?.includes('con restricciones')) return 'warning';
    if (estado?.includes('Fuera')) return 'danger';
    return 'secondary';
  }

  tipoSeverity(tipo: string): 'info' | 'success' | 'secondary' {
    if (tipo === 'Correctivo') return 'info';
    if (tipo === 'Preventivo') return 'success';
    return 'secondary';
  }

  nuevoReporte(): void {
    this.router.navigate(['/adminsistemas/nuevoreporte', this.equipoId]);
  }

  volver(): void {
    this.router.navigate(['/adminsistemas/equipostipo']);
  }
}
