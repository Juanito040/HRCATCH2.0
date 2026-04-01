import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SysHojaVidaService, SysHojaVida } from '../../../Services/appServices/sistemasServices/syshojavida/syshojavida.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sys-hoja-vida',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hoja-vida.component.html',
  styleUrl: './hoja-vida.component.css'
})
export class SysHojaVidaComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private svc      = inject(SysHojaVidaService);
  private equipoSvc = inject(SysequiposService);

  equipoId!: number;
  hojaVida: SysHojaVida | null = null;
  equipo: any = null;

  isLoading     = true;
  isSaving      = false;
  isEditing     = false;
  isDownloading = false;
  error: string | null = null;
  isNew = false;

  formData: SysHojaVida = this.emptyForm();

  ngOnInit() {
    this.equipoId = Number(this.route.snapshot.paramMap.get('equipoId'));
    this.load();
  }

  private emptyForm(): SysHojaVida {
    return {
      ip: '', mac: '', procesador: '', ram: '', disco_duro: '',
      sistema_operativo: '', office: '', tonner: '', nombre_usuario: '',
      vendedor: '', tipo_uso: '', fecha_compra: '', fecha_instalacion: '',
      costo_compra: '', contrato: '', observaciones: '',
      compraddirecta: false, convenio: false, donado: false, comodato: false
    };
  }

  load() {
    this.isLoading = true;
    this.error = null;

    // Carga el equipo y la hoja de vida en paralelo
    forkJoin({
      equipo: this.equipoSvc.getEquipoById(this.equipoId).pipe(catchError(() => of(null))),
      hoja:   this.svc.getByEquipo(this.equipoId).pipe(catchError(err => of({ _err: err.status })))
    }).subscribe(({ equipo, hoja }) => {

      // Equipo
      if (equipo?.data) {
        this.equipo = Array.isArray(equipo.data) ? equipo.data[0] : equipo.data;
      }

      // Hoja de vida
      const err = (hoja as any)?._err;
      if (err) {
        if (err === 404) {
          this.isNew     = true;
          this.isEditing = true;
          this.formData  = this.emptyForm();
        } else {
          this.error = 'Error al cargar la hoja de vida. Verifica que el servidor esté activo.';
        }
      } else {
        this.hojaVida = (hoja as any).data;
        this.formData = { ...(hoja as any).data };
        this.isNew    = false;
      }

      this.isLoading = false;
    });
  }

  startEditing() {
    this.formData  = { ...this.hojaVida };
    this.isEditing = true;
  }

  cancelEditing() {
    if (this.isNew) {
      this.router.navigate(['/adminsistemas/equipos']);
    } else {
      this.formData  = { ...this.hojaVida };
      this.isEditing = false;
    }
  }

  save() {
    this.isSaving = true;
    this.svc.upsertByEquipo(this.equipoId, this.formData).subscribe({
      next: (res) => {
        this.hojaVida  = res.data;
        this.equipo    = res.data?.equipo ?? this.equipo;
        this.formData  = { ...res.data };
        this.isEditing = false;
        this.isNew     = false;
        this.isSaving  = false;
        Swal.fire({ icon: 'success', title: 'Guardado', text: 'Hoja de vida guardada exitosamente', timer: 1800, showConfirmButton: false });
      },
      error: () => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la hoja de vida' });
      }
    });
  }

  goBack() {
    this.router.navigate(['/adminsistemas/equipos']);
  }

  async descargarPdf() {
    this.isDownloading = true;
    try {
      const blob = await this.svc.descargarPdf(this.equipoId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `HojaVida_${this.equipo?.placa_inventario ?? this.equipoId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF' });
    } finally {
      this.isDownloading = false;
    }
  }
}
