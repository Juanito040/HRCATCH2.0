import { MetrologiaService } from './../../../Services/appServices/biomedicaServices/metrologia/metrologia.service';
import { ArchivosService } from './../../../Services/appServices/general/archivos/archivos.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DatePicker } from 'primeng/datepicker'
import { Location } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Console } from 'console';
import { getDecodedAccessToken } from '../../../utilidades';

import { API_URL } from '../../../constantes';

@Component({
  selector: 'app-actividades-metrologicas',
  standalone: true,
  imports: [CommonModule, TabsModule, DatePicker, FormsModule,
    TableModule, IconFieldModule, InputIconModule, InputTextModule, CalendarModule, Dialog, ButtonModule],
  templateUrl: './actividades-metrologicas.component.html',
  styleUrl: './actividades-metrologicas.component.css'
})
export class ActividadesMetrologicasComponent implements OnInit {

  @ViewChild('dt2') dt2!: Table;
  date: Date | undefined;
  metrologiaServices = inject(MetrologiaService);
  archivosServices = inject(ArchivosService);
  loading: boolean = false;
  fechaActual = new Date();
  mes = this.fechaActual.getMonth() + 1;
  anio = this.fechaActual.getFullYear();


  actividadMetrologicaSelected: any;

  modalAddActividadMetrologica: boolean = false;
  modalViewActividadMetrologica: boolean = false;

  actividadesMetrologicas: any[] = [];



  panelActividadesMetrologicas: boolean = true;
  panelMetas: boolean = false;

  panelRealizados: boolean = true;
  panelPendientes: boolean = false;

  constructor(private location: Location) { }

  async ngOnInit() {
    this.date = new Date();
    try {
      this.actividadesMetrologicas = await this.metrologiaServices.getReportesActividadesMesAño({ mes: this.mes, anio: this.anio });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No es posible cargar la informacion de los reportes de actividades metrológicas',
        text: 'Error al cargar los reportes de actividades metrológicas, intente más tarde.'
      })
    }
  }


  async setDate() {
    if (this.date) {
      this.mes = this.date.getMonth() + 1;
      this.anio = this.date.getFullYear();
      try {
        this.actividadesMetrologicas = await this.metrologiaServices.getReportesActividadesMesAño({ mes: this.mes, anio: this.anio })

      } catch (error) {

        Swal.fire({
          icon: 'error',
          title: 'No es posible cargar la informacion de los reportes de actividades metrológicas',
          text: 'Error al cargar los reportes de actividades metrológicas, intente más tarde.'
        })
      }

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un mes para continuar',
        text: 'Datos no encontrados.'
      })
    }
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  viewActividadesMetrologicas() {
    this.panelActividadesMetrologicas = true;
    this.panelMetas = false;
  }

  viewMetas() {
    this.panelActividadesMetrologicas = false;
    this.panelMetas = true;
  }

  panelRealizadosView() {
    this.panelRealizados = true;
    this.panelPendientes = false;
  }

  panelPendientesView() {
    this.panelRealizados = false;
    this.panelPendientes = true;
  }

  obtenerNombreMes(numeroMes: number): string {
    const meses: string[] = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    if (numeroMes < 1 || numeroMes > 12) {
      throw new Error("El número debe estar entre 1 y 12.");
    }
    return meses[numeroMes - 1];
  }

  goBack(): void {
    this.location.back();
  }

  // Propiedades para el formulario
  tipoActividad: string = '';
  empresa: string = '';
  fechaRealizadoActividad: Date | undefined;
  resultado: string = '';
  errorMaximoIdentificado: number | null = null;
  observaciones: string = '';
  selectedFile: File | null = null;
  selectedFileConfirmacion: File | null = null;

  opcionesResultado: any[] = [
    { label: 'Cumple', value: 'Cumple' },
    { label: 'No Cumple', value: 'No Cumple' },
    { label: 'No Aplica', value: 'No Aplica' }
  ];

  opcionesTipoActividad: any[] = [
    { label: 'Calibración', value: 'Calibración' },
    { label: 'Calificación', value: 'Calificación' },
    { label: 'Validación', value: 'Validación' },
    { label: 'Confirmación Metrológica', value: 'Confirmación Metrológica' }
  ];

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onFileSelectedConfirmacion(event: any) {
    this.selectedFileConfirmacion = event.target.files[0];
  }

  async registrarActividad() {
    if (!this.actividadMetrologicaSelected) return;

    if (!this.tipoActividad || !this.empresa || !this.fechaRealizadoActividad || !this.resultado || this.errorMaximoIdentificado === null) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('tipoActividad', this.tipoActividad);
    formData.append('empresa', this.empresa);
    formData.append('fechaRealizado', this.fechaRealizadoActividad.toISOString()); // O formato adecuado
    formData.append('resultado', this.resultado);
    formData.append('errorMaximoIdentificado', this.errorMaximoIdentificado.toString());
    formData.append('observaciones', this.observaciones);
    formData.append('usuarioIdFk', getDecodedAccessToken().id); // Asignar quien registró/aprobó

    if (this.selectedFile) {
      formData.append('rutaReporte', this.selectedFile);
    }

    if (this.selectedFileConfirmacion) {
      formData.append('confirmacionMetrologica', this.selectedFileConfirmacion);
    }

    try {
      await this.metrologiaServices.updateActividadMetrologica(this.actividadMetrologicaSelected.id, formData);
      Swal.fire('Éxito', 'Actividad metrológica registrada correctamente.', 'success');
      this.modalAddActividadMetrologica = false;
      this.setDate(); // Recargar datos
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || 'Error desconocido';
      const errorStatus = error.status ? `Status: ${error.status}` : '';
      Swal.fire('Error', `No se pudo registrar la actividad. ${errorMessage} ${errorStatus}`, 'error');
    }
  }

  viewmodalAddActividadMetrologica(actividad: any) {
    this.modalAddActividadMetrologica = true;
    this.actividadMetrologicaSelected = actividad;
    // Reset form
    this.tipoActividad = actividad.tipoActividad;
    this.empresa = '';
    this.fechaRealizadoActividad = undefined;
    this.resultado = '';
    this.errorMaximoIdentificado = null;
    this.observaciones = '';
    this.selectedFile = null;
    this.selectedFileConfirmacion = null;

  }

  viewActividadMetrologica(actividad: any) {
    this.modalViewActividadMetrologica = true;
    this.actividadMetrologicaSelected = actividad;

  }

  verCertificado() {
    if (this.actividadMetrologicaSelected && this.actividadMetrologicaSelected.rutaReporte) {
      const token = sessionStorage.getItem('utoken');
      const url = `${API_URL}/downloadReporte/${this.actividadMetrologicaSelected.id}?token=${token}`;
      window.open(url, '_blank');
    } else {
      Swal.fire('Info', 'Este registro no tiene un certificado cargado.', 'info');
    }
  }

  async verConfirmacion() {
    if (this.actividadMetrologicaSelected && this.actividadMetrologicaSelected.confirmacionMetrologica) {
      try {
        const blob = await this.archivosServices.getArchivo(this.actividadMetrologicaSelected.confirmacionMetrologica);
        if (blob.type === 'application/pdf') {
          const objectUrl = URL.createObjectURL(blob);
          window.open(objectUrl, '_blank');
        } else {
          console.error('El archivo recibido no es un PDF');
          Swal.fire('Error', 'El archivo no es un PDF válido.', 'error');
        }
      } catch (error) {
        console.error('Error al obtener la confirmación:', error);
        Swal.fire('Error', 'No se pudo abrir el archivo de confirmación.', 'error');
      }
    } else {
      Swal.fire('Info', 'Este registro no tiene una confirmación metrológica cargada.', 'info');
    }
  }
}
