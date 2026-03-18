import { ResponsableService } from './../../../../Services/appServices/biomedicaServices/responsable/responsable.service';
import { CommonModule, Location } from '@angular/common'; // Added Location
import { Component, inject, model, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router';
import { TipoEquipoService } from '../../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';
import { ServicioService } from '../../../../Services/appServices/general/servicio/servicio.service';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';
import Swal from 'sweetalert2';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from 'primeng/datepicker';
// Removed unused services

import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-crear-equipo',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, FormsModule, DatePickerModule, ReactiveFormsModule, MultiSelectModule, SelectModule, InputNumberModule, UppercaseDirective],
  templateUrl: './crear-equipo.component.html',
  styleUrl: './crear-equipo.component.css'
})
export class CrearEquipoComponent implements OnInit {

  tiposequipo: any[] | undefined;
  servicios: any[] | undefined;
  responsables: any[] | undefined;

  // Removed proveedores and fabricantes arrays
  fechasMantenimiento: (Date | null)[] = [null, null, null];

  modalAddFechasMantenimiento: boolean = false;
  modalAddFechasCalibracion: boolean = false;
  fechasCalibracion: { fecha: Date | null, tipoActividad: string | null }[] = [];

  // Variables para el modal de plan de mantenimiento (Tipo 'EquiposTipo')
  mesInicio: number = 1;
  anioInicio: number = new Date().getFullYear();
  selectedPlans: any[] = [];
  calculatedMonthsText: string = '';

  anioOptions = Array.from({ length: 11 }, (_, i) => ({ name: (new Date().getFullYear() + i).toString(), value: new Date().getFullYear() + i }));

  intervencionOptions = [
    { name: '1 vez al año (Anual)', value: 1 },
    { name: '2 veces al año (Semestral)', value: 2 },
    { name: '3 veces al año (Cuatrimestral)', value: 3 },
    { name: '4 veces al año (Trimestral)', value: 4 }
  ];

  // Variables para el modal de plan de metrologia
  mesInicioMetrologia: number = 1;
  selectedMonthsMetrologia: any[] = [];
  calculatedMonthsMetrologiaText: string = '';
  selectedTipoActividad: string = 'Calibración';

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

  tipoActividadOptions = [
    { label: 'Calibración', value: 'Calibración' },
    { label: 'Calificación', value: 'Calificación' },
    { label: 'Mantenimiento Correctivo', value: 'Mantenimiento Correctivo' },
    { label: 'Inspección', value: 'Inspección' }
  ];


  equipo: any;
  showMetrologyFrequency: boolean = false;

  tipoEquipoServices = inject(TipoEquipoService);
  serviciosServices = inject(ServicioService);
  responsablesServices = inject(ResponsableService);

  estandarServices = inject(EquiposService); // Alias for EquiposService to match usage if needed, but existing is equipoServices
  equipoServices = inject(EquiposService);
  // Removed injected services

  equipoForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private location: Location // Injected Location
  ) {

    this.equipoForm = this.formBuilder.group({
      nombres: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      serie: ['', Validators.required],
      placa: ['', Validators.required],
      registroInvima: [''],
      riesgo: ['NA'],
      ubicacion: ['', Validators.required],
      ubicacionEspecifica: ['', Validators.required],
      activo: [true],
      periodicidadM: [0, Validators.required],
      periodicidadAM: [0, Validators.required],
      estadoBaja: [false],
      // actividadMetrologica removed as per requirement
      tipoEquipoIdFk: [null, Validators.required],
      servicioIdFk: [null, Validators.required],

      responsableIdFk: [null, Validators.required]
      // Removed proveedorIdFk and fabricanteIdFk
    });

    this.equipoForm.get('tipoEquipoIdFk')?.valueChanges.subscribe(val => {
      this.checkMetrologyRequirement(val);
    });
  }

  async ngOnInit() {
    // Load data independently to prevent one failure from blocking others
    try {
      await Promise.all([
        this.tipoEquipoServices.getAllTiposEquipos().then(data => this.tiposequipo = data).catch(err => console.error('Error cargando TiposEquipo:', err)),
        this.serviciosServices.getAllServicios().then(data => {
          this.servicios = data.map(s => ({
            ...s,
            displayName: `${s.nombres} - ${s.sede?.nombres || ''}`
          }));
        }).catch(err => console.error('Error cargando Servicios:', err)),
        this.responsablesServices.getAllResponsables().then(data => this.responsables = data).catch(err => console.error('Error cargando Responsables:', err))
        // Removed loading of Proveedores and Fabricantes
      ]);

      this.checkEditMode();
    } catch (error) {
      console.error('Error general en ngOnInit:', error);
    }
  }

  async checkEditMode() {
    this.activatedRoute.params.subscribe(async params => {
      const id = params['id'];
      if (id) {
        try {
          this.equipo = await this.equipoServices.getEquipoById(id);
          this.equipoForm.patchValue({
            nombres: this.equipo.nombres,
            marca: this.equipo.marca,
            modelo: this.equipo.modelo,
            serie: this.equipo.serie,
            placa: this.equipo.placa,
            registroInvima: this.equipo.registroInvima,
            riesgo: this.equipo.riesgo,
            ubicacion: this.equipo.ubicacion,
            ubicacionEspecifica: this.equipo.ubicacionEspecifica,
            activo: this.equipo.activo,
            periodicidadM: this.equipo.periodicidadM,
            periodicidadAM: this.equipo.periodicidadC, // Note: backend might use periodicidadC for AM
            estadoBaja: this.equipo.estadoBaja,
            tipoEquipoIdFk: this.equipo.tipoEquipoIdFk,
            servicioIdFk: this.equipo.servicioIdFk,

            responsableIdFk: this.equipo.responsableIdFk
            // Removed patchValue for proveedorIdFk and fabricanteIdFk
          });

          this.checkMetrologyRequirement(this.equipo.tipoEquipoIdFk);
        } catch (error) {
          console.error("Error loading equipment for edit", error);
        }
      }
    });
  }

  async guardar() {
    if (this.equipoForm.valid) {
      this.equipo = {
        nombres: this.equipoForm.get('nombres')?.value,
        marca: this.equipoForm.get('marca')?.value,
        modelo: this.equipoForm.get('modelo')?.value,
        serie: this.equipoForm.get('serie')?.value,
        placa: this.equipoForm.get('placa')?.value,
        registroInvima: this.equipoForm.get('registroInvima')?.value,
        riesgo: this.equipoForm.get('riesgo')?.value,
        ubicacion: this.equipoForm.get('ubicacion')?.value,
        ubicacionEspecifica: this.equipoForm.get('ubicacionEspecifica')?.value,
        activo: this.equipoForm.get('activo')?.value,
        periodicidadM: this.equipoForm.get('periodicidadM')?.value,
        periodicidadC: this.equipoForm.get('periodicidadAM')?.value,
        estadoBaja: this.equipoForm.get('estadoBaja')?.value,
        calibracion: false,
        calificacion: false,
        validacion: false,
        tipoEquipoIdFk: this.equipoForm.get('tipoEquipoIdFk')?.value,
        servicioIdFk: this.equipoForm.get('servicioIdFk')?.value,

        responsableIdFk: this.equipoForm.get('responsableIdFk')?.value,
        // Removed provider/fabricante form values
        id: this.equipo ? this.equipo.id : null
      }
      if (this.equipo.id) {
        await this.equipoServices.updateEquipo(this.equipo.id, this.equipo);
        Swal.fire({
          title: "Equipo Actualizado",
          icon: "success",
          draggable: true,
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        try {
          const createdEquipo = await this.equipoServices.addEquipo(this.equipo);
          this.equipo = createdEquipo;
          this.iniciarFechasMantenimiento();
          Swal.fire({
            title: "Equipo Creado",
            icon: "success",
            draggable: true,
            showConfirmButton: false,
            timer: 1500
          });
        } catch (error: any) {
          if (error.status === 409) {
            Swal.fire({
              title: "Conflicto",
              text: error.error?.detalle || "Ocurrió un conflicto al crear el equipo. Es posible que algunos datos internos ya existan.",
              icon: "warning"
            });
            return;
          }
          console.error(error);
          Swal.fire({
            title: "Error",
            text: "No se pudo crear el equipo",
            icon: "error"
          });
          return;
        }
        // Remove navigation here, wait for plan modals
        // this.router.navigate(['/biomedica/lista-equipos']); 
        // The initiateFechasMantenimiento handles the flow.
        return;
      }
      this.cancelar();
      // this.router.navigate(['/biomedica/lista-equipos']);


    } else {

      Swal.fire({
        title: "Campos vacios",
        text: "Debe diligenciar Todos los Campos",
        icon: "warning"
      });
      // Marca todos los campos como tocados para mostrar los mensajes de error
      this.equipoForm.markAllAsTouched();
    }
  }

  cancelar() {
    this.location.back();
  }

  viewModalFechasMantenimiento() {
    this.modalAddFechasMantenimiento = true;
  }

  iniciarFechasMantenimiento() {
    this.anioInicio = new Date().getFullYear();
    this.mesInicio = new Date().getMonth() + 1;
    this.calcularFechas();
    this.viewModalFechasMantenimiento();
  }

  calcularFechas() {
    const interventions = this.equipoForm.get('periodicidadM')?.value;

    if (!interventions || interventions <= 0) {
      this.calculatedMonthsText = 'Intervenciones no válidas';
      this.selectedPlans = [];
      return;
    }

    const interval = 12 / interventions;
    const nuevosPlanes = [];
    let m = this.mesInicio;
    let y = this.anioInicio;

    for (let i = 0; i < interventions; i++) {
      // Calculate month and year with rollover
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

    const textPlanes = this.selectedPlans.map(p => {
      return `${meses[p.mes - 1]} ${p.ano}`;
    }).join(', ');

    this.calculatedMonthsText = `Ciclo calculado: ${textPlanes}`;
  }

  validarFechasMantenimiento() {
    this.modalAddFechasMantenimiento = false;

    // Chain to Metrology Modal
    if (this.showMetrologyFrequency && this.equipo.periodicidadC > 0) {
      this.iniciarFechasCalibracion();
    } else {
      this.finalizarGuardado();
    }
  }

  iniciarFechasCalibracion() {
    const period = this.equipoForm.get('periodicidadAM')?.value;
    if (period && period > 0) {
      this.mesInicioMetrologia = 1;
      this.selectedTipoActividad = 'Calibración';
      this.calcularFechasMetrologia();
      this.modalAddFechasCalibracion = true;
    } else {
      // If 0, skip or show empty? Assuming skip if 0 based on logic, but let's allow open like maintenance
      this.mesInicioMetrologia = 1;
      this.selectedMonthsMetrologia = [];
      this.updateCalculatedMetrologiaText();
      this.modalAddFechasCalibracion = true;
    }
  }

  calcularFechasMetrologia() {
    const period = this.equipoForm.get('periodicidadAM')?.value;
    if (!period || period <= 0) {
      this.calculatedMonthsMetrologiaText = 'Periodicidad no válida';
      this.selectedMonthsMetrologia = [];
      this.fechasCalibracion = [];
      return;
    }

    const interval = Math.floor(12 / period);
    const nuevosMeses = [];
    this.fechasCalibracion = []; // Reset editable fields

    let mesActual = this.mesInicioMetrologia;
    const currentYear = new Date().getFullYear();

    while (mesActual <= 12) {
      nuevosMeses.push(mesActual);
      // Create pre-filled object for the editable form
      // Note: Month in Date constructor is 0-indexed (Jan=0), so mesActual-1
      const fechaCalculada = new Date(currentYear, mesActual - 1, 1);

      this.fechasCalibracion.push({
        fecha: fechaCalculada,
        tipoActividad: 'Calibración'
      });

      mesActual += interval;
    }
    this.selectedMonthsMetrologia = nuevosMeses;
    // We don't necessarily update 'calculatedMonthsMetrologiaText' for display in the new loop modal, 
    // but keeping it doesn't hurt if we want to debug.
    this.updateCalculatedMetrologiaText();
  }

  updateCalculatedMetrologiaText() {
    if (!this.selectedMonthsMetrologia || this.selectedMonthsMetrologia.length === 0) {
      this.calculatedMonthsMetrologiaText = 'Sin fechas seleccionadas';
      return;
    }
    const textMeses = this.selectedMonthsMetrologia.sort((a, b) => a - b).map(m => {
      const op = this.monthOptions.find(o => o.value === m);
      return op ? op.name : m;
    }).join(', ');
    this.calculatedMonthsMetrologiaText = `Fechas programadas: ${textMeses}`;
  }

  validarFechasCalibracion() {
    this.modalAddFechasCalibracion = false;
    this.finalizarGuardado();
  }

  async finalizarGuardado() {
    // Construct payload
    const planesMantenimiento = this.selectedPlans;

    // For Metrology, we now use the editable 'fechasCalibracion' array
    // We need to convert the Date object back to a Month number (1-12) for the backend 'mes' field
    const planesActividadMetrologica = this.fechasCalibracion
      .map(item => {
        let mes = 0;
        if (item.fecha) {
          mes = item.fecha.getMonth() + 1; // getMonth() is 0-11
        }
        return {
          mes: mes,
          tipoActividad: item.tipoActividad
        };
      })
      .filter(p => p.mes > 0); // Filter out any invalid dates

    const finalPayload = {
      ...this.equipo,
      planesMantenimiento: planesMantenimiento.length > 0 ? planesMantenimiento : undefined,
      planesActividadMetrologica: planesActividadMetrologica.length > 0 ? planesActividadMetrologica : undefined
    };

    if (finalPayload.planesMantenimiento || finalPayload.planesActividadMetrologica) {
      try {
        await this.equipoServices.updateEquipo(this.equipo.id, finalPayload);
        Swal.fire({
          title: "Equipo Creado Exitosamente",
          text: "Se han guardado el Equipo y sus Planes de Mantenimiento y Metrología.",
          icon: "success",
          showConfirmButton: true
        }).then(() => {
          // Redirect to Hoja de Vida
          if (this.equipo.id) {
            this.router.navigate(['/biomedica/hojavidaequipo', this.equipo.id]);
          } else {
            this.cancelar();
          }
        });
      } catch (e) {
        console.error(e);
        Swal.fire({
          title: "Error al guardar planes",
          text: "El equipo se creó pero hubo un error guardando los planes.",
          icon: "error"
        });
        this.cancelar();
      }
    } else {
      // If no plans were needed, still redirect to HV? or just back?
      // Usually if successful creation, go to HV.
      if (this.equipo.id) {
        this.router.navigate(['/biomedica/hojavidaequipo', this.equipo.id]);
      } else {
        this.cancelar();
      }
    }
  }


  checkMetrologyRequirement(tipoId: any) {
    if (!this.tiposequipo) return;
    // tipoId might be string or number
    const type = this.tiposequipo.find(t => t.id == tipoId);
    if (type && type.requiereMetrologia) {
      this.showMetrologyFrequency = true;
      this.equipoForm.get('periodicidadAM')?.setValidators([Validators.required]);
    } else {
      this.showMetrologyFrequency = false;
      this.equipoForm.get('periodicidadAM')?.clearValidators();
      this.equipoForm.get('periodicidadAM')?.setValue(0);
    }
    this.equipoForm.get('periodicidadAM')?.updateValueAndValidity();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
