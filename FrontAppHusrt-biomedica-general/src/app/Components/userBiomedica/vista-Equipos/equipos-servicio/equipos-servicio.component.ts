import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MetrologiaService } from '../../../../Services/appServices/biomedicaServices/metrologia/metrologia.service';

import { ButtonModule } from 'primeng/button';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { ServicioService } from '../../../../Services/appServices/general/servicio/servicio.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem, MessageService } from 'primeng/api';
import { getDecodedAccessToken, obtenerNombreMes } from '../../../../utilidades';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HistorialEquiposComponent } from '../historial-equipos/historial-equipos.component';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TrasladosService } from '../../../../Services/appServices/biomedicaServices/traslados/traslados.service';
import Swal from 'sweetalert2';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-equipos-servicio',
  standalone: true,
  imports: [TableModule, CommonModule, IconFieldModule,
    InputIconModule, InputTextModule, SplitButtonModule, DialogModule, MultiSelectModule, SelectModule, InputNumberModule, FormsModule, ButtonModule, TagModule, DatePickerModule],
  providers: [DialogService],
  templateUrl: './equipos-servicio.component.html',
  styleUrl: './equipos-servicio.component.css'
})
export class EquiposServicioComponent implements OnInit {

  @ViewChild('dt2') dt2!: Table;
  equipos!: any[];
  servicio!: any;
  equipoServices = inject(EquiposService);
  servicioServices = inject(ServicioService);
  trasladosService = inject(TrasladosService);

  loading: boolean = false;
  items: MenuItem[] | undefined;
  ref: DynamicDialogRef | undefined;

  // Variables para el modal de edición de plan
  displayPlanDialog: boolean = false;
  currentEquipo: any = null;
  selectedMonths: any[] = [];
  selectedPlans: any[] = []; // Array of objects { mes, ano }
  periodicidad: number = 0; // Legacy field
  intervencionesAnuales: number = 1;
  mesInicio: number = 1;
  anioInicio: number = new Date().getFullYear();
  calculatedMonthsText: string = '';

  intervencionOptions = [
    { name: '1 vez al año (Anual)', value: 1 },
    { name: '2 veces al año (Semestral)', value: 2 },
    { name: '3 veces al año (Cuatrimestral)', value: 3 },
    { name: '4 veces al año (Trimestral)', value: 4 }
  ];

  anioOptions = Array.from({ length: 11 }, (_, i) => ({ name: (new Date().getFullYear() + i).toString(), value: new Date().getFullYear() + i }));

  // Variables para Traslados
  displayTrasladoDialog: boolean = false;
  displayHistorialTrasladosDialog: boolean = false;
  historialUnificado: any[] = [];

  // Formulario Traslado
  selectedEquipoTraslado: any = null;
  servicioDestinoId: number | null = null;
  nombreReceptor: string = '';
  cargoReceptor: string = '';
  observacionesTransferencia: string = '';
  serviciosList: any[] = []; // Para llenar el dropdown

  monthOptions: any[] = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
  ];

  constructor(
    private messageService: MessageService,
    private router: Router,
    public dialogService: DialogService
  ) {

  }

  async ngOnInit() {
    if (typeof sessionStorage === 'undefined') return;

    const equiposdatos = await this.equipoServices.getAllEquiposServicio(sessionStorage.getItem("idServicio"));
    this.servicio = await this.servicioServices.getServicio(sessionStorage.getItem("idServicio"));

    if (['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN'].includes(getDecodedAccessToken().rol)) {
      this.serviciosList = await this.servicioServices.getAllServicios();
    }

    this.equipos = this.mapEquipos(equiposdatos);
  }

  mapEquipos(datos: any[]): any[] {
    return datos.map((equipo: any) => ({
      ...equipo,
      opcionesHV: [
        {
          label: 'Editar',
          icon: 'pi pi-pencil',
          command: () => this.editarEquipo(equipo.id),
          visible: ['BIOMEDICAADMIN', 'SUPERADMIN', 'BIOMEDICAUSER'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Editar Plan Mantenimiento',
          icon: 'pi pi-calendar',
          command: () => this.openPlanDialog(equipo),
          visible: ['BIOMEDICAADMIN', 'SUPERADMIN'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Editar Plan Metrología',
          icon: 'pi pi-cog',
          command: () => this.openPlanMetrologiaDialog(equipo),
          visible: ['BIOMEDICAADMIN', 'SUPERADMIN'].includes(getDecodedAccessToken().rol) && equipo.tipoEquipos?.requiereMetrologia
        },
        {
          label: 'Registrar Actividad Metrológica',
          icon: 'pi pi-file-excel',
          command: () => this.viewModalMetrologia(equipo),
          visible: ['BIOMEDICAADMIN', 'SUPERADMIN', 'BIOMEDICAUSER'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Registrar Traslado',
          icon: 'pi pi-send',
          command: () => this.abrirModalTraslado(equipo),
          visible: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'BIOMEDICATECNICO'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Historial Movimientos',
          icon: 'pi pi-history',
          command: () => this.verHistorialTraslados(equipo),
          visible: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Ver Hoja de Vida',
          icon: 'pi pi-eye',
          command: () => this.verHojaVida(equipo.id)
        },
        {
          label: 'Reportes',
          icon: 'pi pi-external-link',
          command: () => this.verReportes(equipo.id)
        },
        {
          label: 'Nuevo reporte',
          icon: 'pi pi-upload',
          command: () => this.nuevoReporte(equipo.id),
          visible: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'BIOMEDICATECNICO'].includes(getDecodedAccessToken().rol)
        },
        {
          label: 'Dar de Baja',
          icon: 'pi pi-trash',
          command: () => this.darDeBaja(equipo.id),
          visible: ['BIOMEDICAADMIN', 'SUPERADMIN'].includes(getDecodedAccessToken().rol)
        }
      ]
    }));
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  verHojaVida(id: number) {
    this.router.navigate(['biomedica/hojavidaequipo', id]);
  }

  editarEquipo(id: number) {
    this.router.navigate(['biomedica/adminequipos/edit/', id]);
  }

  nuevoReporte(id: number) {
    sessionStorage.setItem('TipoMantenimiento', 'C');
    this.router.navigate(['biomedica/nuevoreporte/', id]);
  }

  verReportes(id: number) {
    this.router.navigate(['biomedica/reportesequipo/', id]);
  }

  verHistorial(id: number) {
    this.ref = this.dialogService.open(HistorialEquiposComponent, {
      header: 'Historial de Mantenimientos',
      width: '70%',
      contentStyle: { "max-height": "500px", "overflow": "auto" },
      baseZIndex: 10000,
      data: { id: id }
    });
  }

  darDeBaja(id: number) {
    // Implementación pendiente o existente
  }

  openPlanDialog(equipo: any) {
    this.currentEquipo = equipo;
    this.displayPlanDialog = true;

    if (equipo.planesMantenimiento && equipo.planesMantenimiento.length > 0) {
      const firstPlan = equipo.planesMantenimiento[0];
      this.mesInicio = firstPlan.mes || 1;
      this.anioInicio = firstPlan.ano || new Date().getFullYear();
      this.intervencionesAnuales = equipo.periodicidadM || 1;
      this.selectedPlans = equipo.planesMantenimiento;
    } else {
      this.mesInicio = new Date().getMonth() + 1;
      this.anioInicio = new Date().getFullYear();
      this.intervencionesAnuales = 1;
      this.selectedPlans = [];
    }

    this.calcularFechas();
  }

  calcularFechas() {
    if (!this.intervencionesAnuales || this.intervencionesAnuales <= 0) {
      this.calculatedMonthsText = 'Intervenciones no válidas';
      return;
    }

    const interval = 12 / this.intervencionesAnuales;
    const nuevosPlanes = [];
    let m = this.mesInicio;
    let y = this.anioInicio;

    for (let i = 0; i < this.intervencionesAnuales; i++) {
      let calcMonth = m + (i * interval);
      let calcYear = y + Math.floor((calcMonth - 1) / 12);
      calcMonth = ((calcMonth - 1) % 12) + 1;
      nuevosPlanes.push({ mes: Math.floor(calcMonth), ano: calcYear });
    }

    this.selectedPlans = nuevosPlanes;
    this.updateCalculatedText();
  }

  updateCalculatedText() {
    if (!this.selectedPlans || this.selectedPlans.length === 0) {
      this.calculatedMonthsText = 'Sin fechas seleccionadas';
      return;
    }

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const textPlanes = this.selectedPlans.map(p => `${meses[p.mes - 1]} ${p.ano}`).join(', ');
    this.calculatedMonthsText = `Ciclo calculado: ${textPlanes}`;
  }

  async savePlan() {
    if (!this.currentEquipo) return;

    try {
      const equipoUpdate = {
        ...this.currentEquipo,
        periodicidadM: this.intervencionesAnuales,
        planesMantenimiento: this.selectedPlans
      };

      await this.equipoServices.updateEquipo(this.currentEquipo.id, equipoUpdate);
      Swal.fire('Actualizado!', 'El plan de mantenimiento ha sido actualizado.', 'success');
      this.displayPlanDialog = false;
      this.ngOnInit();
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Hubo un problema al actualizar el plan.', 'error');
    }
  }

  // Métodos restaurados para compatibilidad con HTML

  obtenerMesesConCumplimiento(equipo: any): any[] {
    const planes = equipo.planesMantenimiento || [];
    const reportes = equipo.reporte || [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    return planes.map((p: any) => {
      const m = typeof p === 'object' ? p.mes : p;
      const y = typeof p === 'object' ? p.ano : currentYear;

      const reporte = reportes.find((r: any) => r.mesProgramado === m && (r.añoProgramado === y || !r.añoProgramado));
      let color = '';

      if (reporte) {
        if (reporte.realizado) {
          color = '#2ecc71'; // Verde (Realizado)
        } else {
          if (currentYear > y || (currentYear === y && currentMonth > m)) {
            color = '#e74c3c'; // Rojo (Vencido)
          } else {
            color = '#f1c40f'; // Amarillo (Pendiente)
          }
        }
      } else {
        if (currentYear > y || (currentYear === y && currentMonth > m)) {
          color = '#e74c3c'; // Rojo (Vencido)
        } else if (currentYear === y && currentMonth === m) {
          color = '#f1c40f'; // Amarillo (Este mes)
        } else {
          color = '#3498db'; // Azul (Futuro)
        }
      }

      const mesNombre = meses[m - 1];
      const mostrarAnio = y !== currentYear;

      return {
        mes: mostrarAnio ? `${mesNombre} ${y}` : mesNombre,
        color: color
      };
    });
  }

  obtenerColorRiesgo(riesgo: string): string {
    switch (riesgo) {
      case 'I': return '#4caf50'; // Verde
      case 'IIA': return '#90EE90'; // Verde claro
      case 'IIB': return '#ffff00'; // Amarillo
      case 'III': return '#ffcc80'; // Naranja claro
      default: return 'transparent';
    }
  }

  // --- MÉTODOS PARA TRASLADOS ---

  abrirModalTraslado(equipo: any) {
    this.selectedEquipoTraslado = equipo;
    this.displayTrasladoDialog = true;
    // Resetear formulario
    this.servicioDestinoId = null;
    this.nombreReceptor = '';
    this.cargoReceptor = '';
    this.observacionesTransferencia = '';
  }

  async verHistorialTraslados(equipo: any) {
    this.selectedEquipoTraslado = equipo;
    this.loading = true;
    try {
      this.historialUnificado = await this.trasladosService.getHistorialCompleto(equipo.id);
      this.displayHistorialTrasladosDialog = true;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial.' });
    } finally {
      this.loading = false;
    }
  }



  async confirmarTraslado() {
    if (!this.selectedEquipoTraslado || !this.servicioDestinoId || !this.nombreReceptor || !this.cargoReceptor) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos requeridos.' });
      return;
    }

    try {
      const data = {
        equipoId: this.selectedEquipoTraslado.id,
        servicioDestinoId: this.servicioDestinoId!,
        nombreReceptor: this.nombreReceptor,
        cargoReceptor: this.cargoReceptor,
        observaciones: this.observacionesTransferencia,
        usuarioId: getDecodedAccessToken().id
      };

      await this.trasladosService.registrarTraslado(data);

      this.displayTrasladoDialog = false;
      this.ngOnInit(); // Recargar

      Swal.fire(
        '¡Traslado Exitoso!',
        'El equipo ha sido trasladado correctamente.',
        'success'
      );

    } catch (error) {
      Swal.fire(
        'Error',
        'No se pudo registrar el traslado.',
        'error'
      );
    }
  }

  // --- VARIABLES PARA METROLOGIA ---
  displayPlanMetrologiaDialog: boolean = false;
  fechasCalibracion: any[] = [];
  mesInicioMetrologia: number = 1;
  selectedMonthsMetrologia: number[] = [];
  calculatedMonthsMetrologiaText: string = '';
  selectedTipoActividad: string = 'Calibración'; // Default

  tipoActividadOptions: any[] = [
    { label: 'Calibración', value: 'Calibración' },
    { label: 'Calificación', value: 'Calificación' },
    { label: 'Mantenimiento Correctivo', value: 'Mantenimiento Correctivo' },
    { label: 'Inspección', value: 'Inspección' }
  ];

  openPlanMetrologiaDialog(equipo: any) {
    this.currentEquipo = equipo;
    this.displayPlanMetrologiaDialog = true;
    this.fechasCalibracion = []; // Reset

    // Check existing plans
    if (equipo.planesActividadMetrologica && equipo.planesActividadMetrologica.length > 0) {
      // Map existing plans to editable format
      const currentYear = new Date().getFullYear();
      this.fechasCalibracion = equipo.planesActividadMetrologica.map((p: any) => ({
        fecha: new Date(currentYear, p.mes - 1, 1),
        tipoActividad: p.tipoActividad || 'Calibración'
      }));

      this.selectedMonthsMetrologia = equipo.planesActividadMetrologica.map((p: any) => p.mes);
    } else {
      // Initialize based on frequency if available
      this.mesInicioMetrologia = 1;
      this.selectedMonthsMetrologia = [];
      // Calculate initial Suggestions
      this.calcularFechasMetrologia(true); // Auto-calc new
    }
  }

  calcularFechasMetrologia(forceNew: boolean = false) {
    if (!this.currentEquipo) return;

    const period = this.currentEquipo.periodicidadAM || this.currentEquipo.periodicidadC || 0;

    if (!period || period <= 0) {
      if (forceNew) this.fechasCalibracion = [];
      return;
    }

    // Only overwrite if forcing new or empty
    if (forceNew || this.fechasCalibracion.length === 0) {
      const interval = Math.floor(12 / period);
      const nuevosMeses = [];
      this.fechasCalibracion = [];

      let mesActual = this.mesInicioMetrologia;
      const currentYear = new Date().getFullYear();

      while (mesActual <= 12) {
        nuevosMeses.push(mesActual);
        const fechaCalculada = new Date(currentYear, mesActual - 1, 1);
        this.fechasCalibracion.push({
          fecha: fechaCalculada,
          tipoActividad: 'Calibración'
        });
        mesActual += interval;
      }
      this.selectedMonthsMetrologia = nuevosMeses;
    }
  }

  async savePlanMetrologia() {
    if (!this.currentEquipo) return;

    try {
      const planesActividadMetrologica = this.fechasCalibracion
        .map(item => {
          let mes = 0;
          if (item.fecha) {
            mes = item.fecha.getMonth() + 1;
          }
          return {
            mes: mes,
            tipoActividad: item.tipoActividad
          };
        })
        .filter(p => p.mes > 0);

      const equipoUpdate = {
        ...this.currentEquipo,
        planesActividadMetrologica: planesActividadMetrologica
      };

      await this.equipoServices.updateEquipo(this.currentEquipo.id, equipoUpdate);

      Swal.fire(
        'Actualizado!',
        'El plan metrológico ha sido actualizado.',
        'success'
      );

      this.displayPlanMetrologiaDialog = false;
      this.ngOnInit(); // Reload
    } catch (error) {
      console.error(error);
      Swal.fire(
        'Error!',
        'Hubo un problema al actualizar el plan metrológico.',
        'error'
      );
    }
  }


  metrologiaService = inject(MetrologiaService);
  modalAddActividadMetrologica: boolean = false;

  // Form Properties
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

  viewModalMetrologia(equipo: any) {
    this.currentEquipo = equipo;
    this.modalAddActividadMetrologica = true;

    // Reset Form
    this.tipoActividad = '';
    this.empresa = '';
    this.fechaRealizadoActividad = undefined;
    this.resultado = '';
    this.errorMaximoIdentificado = null;
    this.observaciones = '';
    this.observaciones = '';
    this.selectedFile = null;
    this.selectedFileConfirmacion = null;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onFileSelectedConfirmacion(event: any) {
    this.selectedFileConfirmacion = event.target.files[0];
  }

  async registrarMetrologia() {
    if (!this.currentEquipo) return;

    if (!this.tipoActividad || !this.empresa || !this.fechaRealizadoActividad || !this.resultado || this.errorMaximoIdentificado === null || !this.selectedFile) {
      Swal.fire('Error', 'Todos los campos son obligatorios, incluyendo el archivo.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('equipoIdFk', this.currentEquipo.id.toString());
    formData.append('tipoActividad', this.tipoActividad);
    formData.append('empresa', this.empresa);
    formData.append('fechaRealizado', this.fechaRealizadoActividad.toISOString());
    formData.append('mesProgramado', (this.fechaRealizadoActividad.getMonth() + 1).toString());
    formData.append('añoProgramado', this.fechaRealizadoActividad.getFullYear().toString());
    formData.append('resultado', this.resultado);
    formData.append('errorMaximoIdentificado', this.errorMaximoIdentificado.toString());
    formData.append('observaciones', this.observaciones);
    formData.append('usuarioIdFk', getDecodedAccessToken().id);
    formData.append('rutaReporte', this.selectedFile);

    if (this.selectedFileConfirmacion) {
      formData.append('confirmacionMetrologica', this.selectedFileConfirmacion);
    }

    try {
      await this.metrologiaService.registrarActividadConArchivo(formData);
      Swal.fire('Éxito', 'Actividad metrológica registrada correctamente.', 'success');
      this.modalAddActividadMetrologica = false;
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', 'No se pudo registrar la actividad.', 'error');
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
