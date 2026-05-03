import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SysHojaVidaService, SysHojaVida } from '../../../Services/appServices/sistemasServices/syshojavida/syshojavida.service';
import { SysequiposService } from '../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { DocumentosService } from '../../../Services/appServices/general/documentos/documentos.service';
import { TipoDocumentoService } from '../../../Services/appServices/general/tipoDocumento/tipo-documento.service';
import { ImagenesService } from '../../../Services/appServices/general/imagenes/imagenes.service';
import { API_URL } from '../../../constantes';
import { getDecodedAccessToken } from '../../../utilidades';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sys-hoja-vida',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hoja-vida.component.html',
  styleUrl: './hoja-vida.component.css'
})
export class SysHojaVidaComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private sanitizer      = inject(DomSanitizer);
  private svc            = inject(SysHojaVidaService);
  private equipoSvc      = inject(SysequiposService);
  private documentosSvc  = inject(DocumentosService);
  private tipoDocSvc     = inject(TipoDocumentoService);
  private imagenesSvc    = inject(ImagenesService);

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

  // ── Tipos de uso ─────────────────────────────────────────────────────────
  tiposUso = [
    'Administrativo',
    'Asistencial',
    'Gerencial',
    'Laboratorio',
    'Diagnóstico por imagen',
    'Soporte técnico',
    'Educativo',
    'Otro'
  ];

  // ── Foto ─────────────────────────────────────────────────────────────────
  fotoUrl: SafeUrl | null = null;
  uploadingFoto           = false;

  // ── Documentos ───────────────────────────────────────────────────────────
  documentos: any[]      = [];
  tiposDocumento: any[]  = [];
  modalAddDocumento      = false;
  loadingDocumentos      = false;
  savingDocumento        = false;
  nuevoDocumento: any    = { nombres: '', tipoDocumntoIdFk: '', archivo: null };

  get isAdmin(): boolean {
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'ADMINISTRADOR' || decoded?.rol === 'SUPERADMIN' || decoded?.rol === 'SYSTEMADMIN';
  }

  async ngOnInit() {
    this.equipoId = Number(this.route.snapshot.paramMap.get('equipoId'));
    this.load();
    await Promise.all([
      this.cargarTiposDocumento(),
      this.cargarDocumentos()
    ]);
  }

  private async cargarFoto(ruta: string) {
    try {
      const blob = await this.imagenesSvc.getImagen(ruta);
      const url  = URL.createObjectURL(blob);
      this.fotoUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    } catch {
      this.fotoUrl = null;
    }
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
        if (this.hojaVida?.foto) {
          this.cargarFoto(this.hojaVida.foto);
        }
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

  // ── Foto ─────────────────────────────────────────────────────────────────
  async onFotoSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      Swal.fire({ icon: 'warning', title: 'Formato no válido', text: 'Solo se aceptan imágenes JPG, PNG o WEBP.' });
      return;
    }

    this.uploadingFoto = true;
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await this.svc.uploadFoto(this.equipoId, fd);
      this.hojaVida = res.data;
      this.formData = { ...res.data };
      await this.cargarFoto(res.data.foto);
      Swal.fire({ icon: 'success', title: 'Foto actualizada', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir la foto.' });
    } finally {
      this.uploadingFoto = false;
      // Limpia el input para permitir subir el mismo archivo de nuevo
      event.target.value = '';
    }
  }

  // ── Documentos ───────────────────────────────────────────────────────────
  async cargarTiposDocumento() {
    try {
      this.tiposDocumento = await this.tipoDocSvc.getAllTiposDocumento();
    } catch {
      console.error('Error cargando tipos de documento');
    }
  }

  async cargarDocumentos() {
    if (!this.equipoId) return;
    this.loadingDocumentos = true;
    try {
      this.documentos = await this.documentosSvc.getDocumentosByEquipo(this.equipoId);
    } catch {
      this.documentos = [];
    } finally {
      this.loadingDocumentos = false;
    }
  }

  openModalAddDocumento() {
    this.nuevoDocumento = { nombres: '', tipoDocumntoIdFk: '', archivo: null };
    this.modalAddDocumento = true;
  }

  onFileSelectedDocumento(event: any) {
    if (event.target.files.length > 0) {
      this.nuevoDocumento.archivo = event.target.files[0];
    }
  }

  async guardarDocumento() {
    if (!this.nuevoDocumento.nombres || !this.nuevoDocumento.tipoDocumntoIdFk || !this.nuevoDocumento.archivo) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Complete todos los campos antes de guardar.' });
      return;
    }
    this.savingDocumento = true;
    try {
      const fd = new FormData();
      fd.append('nombres', this.nuevoDocumento.nombres);
      fd.append('ruta', this.nuevoDocumento.archivo);
      fd.append('activo', 'true');
      fd.append('equipoIdFk', String(this.equipoId));
      fd.append('tipoDocumntoIdFk', this.nuevoDocumento.tipoDocumntoIdFk);
      await this.documentosSvc.addDocumento(fd);
      this.modalAddDocumento = false;
      await this.cargarDocumentos();
      Swal.fire({ icon: 'success', title: 'Documento agregado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el documento.' });
    } finally {
      this.savingDocumento = false;
    }
  }

  descargarDocumento(doc: any) {
    if (typeof sessionStorage === 'undefined') return;
    const token = sessionStorage.getItem('utoken');
    if (!token) return;
    window.open(`${API_URL}/downloadDocumento/${doc.id}?token=${token}`, '_blank');
  }

  async eliminarDocumento(doc: any) {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar documento?',
      text: `Se eliminará "${doc.nombres}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });
    if (!result.isConfirmed) return;
    try {
      await this.documentosSvc.deleteDocumento(doc.id);
      await this.cargarDocumentos();
      Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el documento.' });
    }
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
