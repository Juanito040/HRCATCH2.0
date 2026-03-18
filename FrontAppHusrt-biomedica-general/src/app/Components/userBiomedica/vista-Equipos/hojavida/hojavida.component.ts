import { Component, OnInit, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BiomedicausernavbarComponent } from '../../../navbars/biomedicausernavbar/biomedicausernavbar.component';
import { HojavidaService } from './../../../../Services/appServices/biomedicaServices/hojavida/hojavida.service';
import { ImagenesService } from './../../../../Services/appServices/general/imagenes/imagenes.service'
import { MantenimientosService } from './../../../../Services/appServices/biomedicaServices/mantenimientos/mantenimientos.service';
import { MetrologiaService } from './../../../../Services/appServices/biomedicaServices/metrologia/metrologia.service'
import { obtenerNombreMes, getDecodedAccessToken } from '../../../../utilidades';
import { CrearHojavidaComponent } from '../crear-hojavida/crear-hojavida.component';
import { DocumentosService } from './../../../../Services/appServices/general/documentos/documentos.service';
import { TipoDocumentoService } from './../../../../Services/appServices/general/tipoDocumento/tipo-documento.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { API_URL } from '../../../../constantes';
import Swal from 'sweetalert2';
import { PdfGeneratorService } from '../../../../Services/appServices/biomedicaServices/pdf-generator/pdf-generator.service';
import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
  selector: 'app-hojavida',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AccordionModule,
    PanelModule,
    DividerModule,
    ButtonModule,
    ImageModule,
    CrearHojavidaComponent,
    TableModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    TooltipModule,
    UppercaseDirective
  ],
  providers: [ConfirmationService],
  templateUrl: './hojavida.component.html',
  styleUrl: './hojavida.component.css'
})
export class HojavidaComponent implements OnInit {

  id: string | null = null;
  imagenUrl: SafeUrl | null = null;
  hojaVida: any;
  planMantenimiento: any[] = [];
  planMetrologia: any[] = [];
  dataToEdit: any = null;
  isGuestUser: boolean = true;

  private pdfGeneratorService = inject(PdfGeneratorService);
  showCreate: boolean = false; // State to toggle create form

  generatePdf() {
    if (this.hojaVida) {
      this.pdfGeneratorService.generateHojaVida(this.hojaVida, this.documentos, this.planMantenimiento, this.planMetrologia);
    }
  }

  hojavidaService = inject(HojavidaService);
  imagenesServices = inject(ImagenesService);
  mantenimientosService = inject(MantenimientosService);
  metrologiaServices = inject(MetrologiaService);
  documentosService = inject(DocumentosService);
  tipoDocumentoService = inject(TipoDocumentoService);
  confirmationService = inject(ConfirmationService);


  // Documentos properties
  documentos: any[] = [];
  tiposDocumento: any[] = [];
  modalAddDocumento: boolean = false;
  nuevoDocumento: any = {
    nombres: '',
    tipoDocumntoIdFk: '',
    archivo: null
  };
  loadingDocumentos: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer, private location: Location) { }

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isGuestUser = this.calculateIsGuest();
    await this.cargarHojaVida();
    await this.cargarTiposDocumento();
    await this.cargarDocumentos();
  }

  private calculateIsGuest(): boolean {
    if (typeof sessionStorage === 'undefined') return true;
    const token = sessionStorage.getItem('utoken');
    if (!token) return true;
    const decoded = getDecodedAccessToken();
    return decoded?.rol === 'INVITADO' || decoded?.rol === 'BIOMEDICATECNICO';
  }

  async cargarHojaVida() {
    if (!this.id || isNaN(Number(this.id))) {
      console.error('ID de equipo no válido:', this.id);
      this.showCreate = false;
      Swal.fire({
        icon: 'error',
        title: 'Error de navegación',
        text: 'El ID del equipo no es válido.',
        confirmButtonText: 'Volver'
      }).then(() => {
        this.location.back();
      });
      return;
    }

    try {
      this.showCreate = false;
      this.hojaVida = await this.hojavidaService.getHojaVidaByIdEquipo(this.id);

      this.planMantenimiento = await this.mantenimientosService.getPlanMantenimientoEquipo(this.id);
      this.planMetrologia = await this.metrologiaServices.getPlanMetrologiaEquipo(this.id);

      if (this.hojaVida?.foto) {
        const blob = await this.imagenesServices.getImagen(this.hojaVida.foto);
        const objectUrl = URL.createObjectURL(blob);
        this.imagenUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      } else {
        console.warn('No hay imagen en hoja de vida');
      }

    } catch (error: any) {
      console.error('Error cargando hoja de vida o imagen:', error);

      // Check Specifically for 404 - Not Found
      const isNotFound = error?.status === 404 ||
        (error?.error?.error && (
          error.error.error.includes('Hoja de vida no encontrada') ||
          error.error.error.includes('no encontrada')
        ));

      if (isNotFound) {
        if (this.isGuestUser) {
          this.showCreate = false;
          Swal.fire({
            icon: 'warning',
            title: 'Hoja de Vida no disponible',
            text: 'Este equipo no tiene una hoja de vida registrada.',
            confirmButtonText: 'Volver'
          }).then(() => {
            this.location.back();
          });
        } else {
          // Confirm with the user if they want to create it
          Swal.fire({
            title: 'Hoja de Vida no encontrada',
            text: '¿Desea crear la hoja de vida para este equipo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'No, volver'
          }).then((result) => {
            if (result.isConfirmed) {
              this.showCreate = true;
            } else {
              this.location.back();
            }
          });
        }
      } else {
        // Handle other errors (500, etc.)
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'Hubo un problema al cargar los datos de la hoja de vida.',
          confirmButtonText: 'Cerrar'
        });
      }
    }
  }

  async cargarTiposDocumento() {
    try {
      this.tiposDocumento = await this.tipoDocumentoService.getAllTiposDocumento();
    } catch (error) {
      console.error('Error cargando tipos de documento', error);
    }
  }

  async cargarDocumentos() {
    if (!this.id) return;
    try {
      this.loadingDocumentos = true;
      this.documentos = await this.documentosService.getDocumentosByEquipo(this.id);
      this.loadingDocumentos = false;
    } catch (error) {
      this.loadingDocumentos = false;
      console.error('Error cargando documentos', error);
    }
  }

  onHojaVidaCreated() {
    // Reload data when created

    this.cargarHojaVida();
    this.showCreate = false; // Hide form
    this.dataToEdit = null; // Reset edit data
  }

  onEdit() {
    this.dataToEdit = this.hojaVida;
    this.showCreate = true;
  }

  onCancelCreate() {
    if (this.hojaVida) {
      this.showCreate = false;
      this.dataToEdit = null;
    } else {
      this.location.back();
    }
  }

  datosTecnicosKeys(): string[] {
    return this.hojaVida?.datosTecnicos
      ? Object.keys(this.hojaVida.datosTecnicos).filter(k => !['id', 'createdAt', 'updatedAt'].includes(k))
      : [];
  }


  async cargarImagen() {
    try {
      const blob = await this.imagenesServices.getImagen('D:/imagenes/foto1.jpg');
      const objectUrl = URL.createObjectURL(blob);
      this.imagenUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
    }
  }

  getNombreMes(numeroMes: number): string {
    return obtenerNombreMes(numeroMes);
  }

  // Métodos para gestión de documentos

  openModalAddDocumento() {
    this.nuevoDocumento = {
      nombres: '',
      tipoDocumntoIdFk: '',
      archivo: null
    };
    this.modalAddDocumento = true;
  }

  onFileSelectedDocumento(event: any) {
    if (event.target.files.length > 0) {
      this.nuevoDocumento.archivo = event.target.files[0];
    }
  }

  async guardarDocumento() {
    if (!this.nuevoDocumento.nombres || !this.nuevoDocumento.tipoDocumntoIdFk || !this.nuevoDocumento.archivo) {
      Swal.fire('Error', 'Por favor complete todos los campos y seleccione un archivo.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nombres', this.nuevoDocumento.nombres);
    formData.append('ruta', this.nuevoDocumento.archivo);
    formData.append('activo', 'true');
    formData.append('equipoIdFk', this.id!);
    formData.append('tipoDocumntoIdFk', this.nuevoDocumento.tipoDocumntoIdFk);

    try {
      await this.documentosService.addDocumento(formData);
      Swal.fire('Éxito', 'Documento agregado correctamente.', 'success');
      this.modalAddDocumento = false;
      this.cargarDocumentos();
    } catch (error) {
      console.error('Error al guardar documento:', error);
      Swal.fire('Error', 'No se pudo guardar el documento.', 'error');
    }
  }

  descargarDocumento(doc: any) {
    if (typeof sessionStorage === 'undefined') return;
    const token = sessionStorage.getItem('utoken');
    if (!token) return;
    const url = `${API_URL}/downloadDocumento/${doc.id}?token=${token}`;
    window.open(url, '_blank');
  }

  eliminarDocumento(doc: any) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este documento?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.documentosService.deleteDocumento(doc.id);
          this.cargarDocumentos();
          Swal.fire('Eliminado', 'El documento ha sido eliminado.', 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el documento.', 'error');
        }
      }
    });
  }

  isGuest(): boolean {
    return this.isGuestUser;
  }
}



