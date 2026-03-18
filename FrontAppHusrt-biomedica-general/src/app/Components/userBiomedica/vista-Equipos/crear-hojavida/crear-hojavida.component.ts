import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { HojavidaService } from './../../../../Services/appServices/biomedicaServices/hojavida/hojavida.service';
import { ProveedorService } from './../../../../Services/appServices/biomedicaServices/proveedor/proveedor.service';
import { FabricanteService } from './../../../../Services/appServices/biomedicaServices/fabricante/fabricante.service';
import { DatosTecnicosService } from '../../../../Services/appServices/biomedicaServices/datosTecnicos/datos-tecnicos.service';
import { EquiposService } from '../../../../Services/appServices/biomedicaServices/equipos/equipos.service';
import Swal from 'sweetalert2';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
  selector: 'app-crear-hojavida',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CalendarModule,
    CardModule,
    ToastModule,
    TextareaModule,
    DividerModule,
    FieldsetModule,
    RouterModule,
    TabViewModule,
    PanelModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    UppercaseDirective
  ],
  providers: [MessageService],
  templateUrl: './crear-hojavida.component.html',
  styleUrl: './crear-hojavida.component.css'
})
export class CrearHojavidaComponent implements OnInit {

  @Input() equipoId: string | null = null;
  @Input() hojaVidaData: any | null = null;
  @Output() hojaVidaCreated = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  hojaVidaForm: FormGroup;
  hojaVidaService = inject(HojavidaService);
  proveedorService = inject(ProveedorService);
  fabricanteService = inject(FabricanteService);
  datosTecnicosService = inject(DatosTecnicosService);
  equipoServices = inject(EquiposService);
  messageService = inject(MessageService);

  equipo: any;
  selectedFile: File | null = null;
  accesorios: any[] = [];



  proveedores: any[] = [];
  fabricantes: any[] = [];

  // Enums for dropdowns
  tiposAdquisicion = [
    { label: 'Compra', value: 'Compra' },
    { label: 'Convenio', value: 'Convenio' },
    { label: 'Donación', value: 'Donación' },
    { label: 'Comodato', value: 'Comodato' },
    { label: 'Alquiler', value: 'Alquiler' },
    { label: 'NR', value: 'NR' }
  ];

  fuentes = [
    { label: 'Electricidad', value: 'Electricidad' },
    { label: 'Energia Solar', value: 'Energia Solar' },
    { label: 'Agua', value: 'Agua' },
    { label: 'Gas', value: 'Gas' },
    { label: 'Vapor de agua', value: 'Vapor de agua' },
    { label: 'Derivados del petroleo', value: 'Derivados del petroleo' },
    { label: 'Otra', value: 'Otra' }
  ];

  tiposUso = [
    { label: 'Diagnostico', value: 'Diagnostico' },
    { label: 'Terapéutico', value: 'Terapéutico' },
    { label: 'Soporte Vital', value: 'Soporte Vital' },
    { label: 'Quirúrgico', value: 'Quirúrgico' },
    { label: 'Equipo de laboratorio', value: 'Equipo de laboratorio' },
    { label: 'Rehabilitación', value: 'Rehabilitación' },
    { label: 'Gestión y Soporte Hospitalario', value: 'Gestión y Soporte Hospitalario' },
    { label: 'NR', value: 'NR' }
  ];

  clases = [
    { label: 'Electrico', value: 'Electrico' },
    { label: 'Electronico', value: 'Electronico' },
    { label: 'Mecanico', value: 'Mecanico' },
    { label: 'Electromecanico', value: 'Electromecanico' },
    { label: 'Hidraulico', value: 'Hidraulico' },
    { label: 'Neumatico', value: 'Neumatico' },
    { label: 'Vapor', value: 'Vapor' },
    { label: 'Solar', value: 'Solar' },
    { label: 'Otro', value: 'Otro' }
  ];

  mantenimientos = [
    { label: 'Propio', value: 'Propio' },
    { label: 'Contratado', value: 'Contratado' },
    { label: 'Comodato', value: 'Comodato' },
    { label: 'Garantia', value: 'Garantia' }
  ];

  propiedades = [
    { label: 'Hospital', value: 'Hospital' },
    { label: 'Proveedor', value: 'Proveedor' },
    { label: 'otro', value: 'otro' }
  ];

  opcionesBinarias = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  constructor(private fb: FormBuilder) {
    this.hojaVidaForm = this.fb.group({
      codigoInternacional: [''],
      contrato: [''],
      proveedorIdFk: [null],
      fabricanteIdFk: [null],
      tipoAdquisicion: [''],
      fechaCompra: [null],
      fechaInstalacion: [null],
      fechaIncorporacion: [null],
      fechaVencimientoGarantia: [null],
      costoCompra: [null],
      fuente: [''],
      tipoUso: [''],
      clase: [''],
      mantenimiento: [''],
      propiedad: [''],
      equipoPortatil: [null],
      observaciones: [''],
      // Datos Tecnicos
      vMaxOperacion: [''],
      vMinOperacion: [''],
      iMaxOperacion: [''],
      iMinOperacion: [''],
      wConsumida: [''],
      frecuencia: [''],
      presion: [''],
      velocidad: [''],
      temperatura: [''],
      peso: [''],
      capacidad: ['']
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  ngOnInit(): void {
    if (!this.equipoId && !this.hojaVidaData) {
      console.error("Equipo ID no proporcionado a CrearHojavidaComponent");
    }

    if (this.equipoId) {
      this.cargarEquipo();
    }

    this.cargarListas();

    if (this.hojaVidaData) {
      this.cargarDatosEdicion();
    }
  }

  async cargarEquipo() {
    try {
      if (this.equipoId) {
        this.equipo = await this.equipoServices.getEquipoById(this.equipoId);
      }
    } catch (error) {
      console.error("Error al cargar datos del equipo", error);
    }
  }

  async cargarListas() {
    try {
      this.proveedores = await this.proveedorService.getProveedores();
      this.fabricantes = await this.fabricanteService.getFabricantes();
    } catch (error) {
      console.error("Error cargando listas", error);
    }
  }

  cargarDatosEdicion() {
    if (this.hojaVidaData) {
      // Formatear fechas si vienen como strings ISO
      const formatDate = (dateString: string) => dateString ? new Date(dateString) : null;

      // Extract IDs for dropdowns if they come as nested objects (common in Sequelize includes)
      const proveedorId = this.hojaVidaData.proveedorIdFk || this.hojaVidaData.proveedor?.id;
      const fabricanteId = this.hojaVidaData.fabricanteIdFk || this.hojaVidaData.fabricante?.id;

      this.hojaVidaForm.patchValue({
        ...this.hojaVidaData,
        proveedorIdFk: proveedorId,
        fabricanteIdFk: fabricanteId,
        fechaCompra: formatDate(this.hojaVidaData.fechaCompra),
        fechaInstalacion: formatDate(this.hojaVidaData.fechaInstalacion),
        fechaIncorporacion: formatDate(this.hojaVidaData.fechaIncorporacion),
        fechaVencimientoGarantia: formatDate(this.hojaVidaData.fechaVencimientoGarantia),
        // Datos Tecnicos (Si existen)
        vMaxOperacion: this.hojaVidaData.datosTecnicos?.vMaxOperacion,
        vMinOperacion: this.hojaVidaData.datosTecnicos?.vMinOperacion,
        iMaxOperacion: this.hojaVidaData.datosTecnicos?.iMaxOperacion,
        iMinOperacion: this.hojaVidaData.datosTecnicos?.iMinOperacion,
        wConsumida: this.hojaVidaData.datosTecnicos?.wConsumida,
        frecuencia: this.hojaVidaData.datosTecnicos?.frecuencia,
        presion: this.hojaVidaData.datosTecnicos?.presion,
        velocidad: this.hojaVidaData.datosTecnicos?.velocidad,
        temperatura: this.hojaVidaData.datosTecnicos?.temperatura,
        peso: this.hojaVidaData.datosTecnicos?.peso,
        capacidad: this.hojaVidaData.datosTecnicos?.capacidad
      });

      if (this.hojaVidaData.accesorios) {
        this.accesorios = this.hojaVidaData.accesorios.map((acc: any) => ({
          id: acc.id,
          nombre: acc.nombre,
          cantidad: acc.cantidad || 1,
          estado: acc.estado
        }));
      }
    }
  }

  addAccesorio() {
    this.accesorios.push({ nombre: '', cantidad: 1, estado: true });
  }

  toggleAccesorioState(index: number) {
    this.accesorios[index].estado = !this.accesorios[index].estado;
  }

  async onSubmit() {
    if (this.hojaVidaForm.valid) {
      try {
        const formValue = this.hojaVidaForm.value;

        const datosTecnicosPayload = {
          vMaxOperacion: formValue.vMaxOperacion,
          vMinOperacion: formValue.vMinOperacion,
          iMaxOperacion: formValue.iMaxOperacion,
          iMinOperacion: formValue.iMinOperacion,
          wConsumida: formValue.wConsumida,
          frecuencia: formValue.frecuencia,
          presion: formValue.presion,
          velocidad: formValue.velocidad,
          temperatura: formValue.temperatura,
          peso: formValue.peso,
          capacidad: formValue.capacidad
        };

        let datosTecnicosId = this.hojaVidaData?.datosTecnicos?.id;


        if (this.hojaVidaData && datosTecnicosId) {
          // Actualizar existentes
          await this.datosTecnicosService.updateDatosTecnicos(datosTecnicosId, datosTecnicosPayload);
        } else {
          // Crear nuevos (ya sea para nueva hoja de vida o hoja existente sin datos)
          const newDatos = await this.datosTecnicosService.addDatosTecnicos(datosTecnicosPayload);
          datosTecnicosId = newDatos.id;
        }


        if (this.hojaVidaData) {
          const payload = {
            ...formValue,
            equipoIdFk: this.hojaVidaData.equipoIdFk,
            datosTecnicosIdFk: datosTecnicosId
          };

          const formData = new FormData();
          for (const key of Object.keys(payload)) {
            const value = payload[key];
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          }
          if (this.selectedFile) {
            formData.append('foto', this.selectedFile);
          }

          if (this.accesorios) {
            formData.append('accesorios', JSON.stringify(this.accesorios));
          }

          await this.hojaVidaService.updateHojaVida(this.hojaVidaData.id, formData);
          Swal.fire({
            icon: 'success',
            title: 'Hoja de Vida Actualizada',
            text: 'La hoja de vida y sus datos técnicos se han actualizado correctamente.'
          });
        } else {

          const payload = {
            ...formValue,
            equipoIdFk: this.equipoId,
            datosTecnicosIdFk: datosTecnicosId
          };

          const formData = new FormData();
          for (const key of Object.keys(payload)) {
            const value = payload[key];
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          }
          if (this.selectedFile) {
            formData.append('foto', this.selectedFile);
          }
          if (this.accesorios.length > 0) {
            formData.append('accesorios', JSON.stringify(this.accesorios));
          }

          await this.hojaVidaService.addHojaVida(formData);

          Swal.fire({
            icon: 'success',
            title: 'Hoja de Vida Creada',
            text: 'La hoja de vida y sus datos técnicos se han creado correctamente.'
          });
        }

        this.hojaVidaCreated.emit();

      } catch (error: any) {
        console.error('Error al guardar hoja de vida:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la hoja de vida. ' + (error?.error?.error || error.message)
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Inválido',
        text: 'Por favor revise los campos del formulario.'
      });
    }
  }

  cancelar() {
    this.onCancel.emit();
  }
}
