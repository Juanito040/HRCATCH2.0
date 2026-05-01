import { LoginComponent } from '../../login/login.component';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DatePicker } from 'primeng/datepicker'
import { IconFieldModule } from 'primeng/iconfield';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

import { SysmantenimientoService } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { SysplanmantenimientoService } from '../../../Services/appServices/sistemasServices/sysplanmantenimiento/sysplanmantenimiento.service';
import { ServicioService } from '../../../Services/appServices/general/servicio/servicio.service';
import { TipoEquipoService } from '../../../Services/appServices/general/tipoEquipo/tipo-equipo.service';

import { obtenerNombreMes, getDecodedAccessToken } from '../../../utilidades';

@Component({
  selector: 'app-programar-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule,
    DatePicker, Select, TableModule, IconFieldModule, InputIconModule, InputTextModule, DialogModule],
  templateUrl: './programar-mantenimiento.component.html',
  styleUrl: './programar-mantenimiento.component.css'
})

export class ProgramarMantenimientoComponent implements OnInit {

  // ... (existing properties)

  get canProgram(): boolean {
    const token = getDecodedAccessToken();
    return token?.rol !== 'BIOMEDICATECNICO';
  }

  // ... (rest of the class)

  fechaPlan = new Date();
  mesPlan = this.fechaPlan.getMonth() + 1;
  anioPlan = this.fechaPlan.getFullYear();

  loading: boolean = false;
  @ViewChild('dt2') dt2!: Table;

  tiposEquipo: any[] = [];
  selectedTipoEquipo: any;
  servicios: any[] = [];
  selectedServicio: any;

  equiposPlanPreventivoMes: any[] = [];
  equiposPlanMantenimientoServicio: any[] = [];
  equiposPlanMantenimientoTipoEquipo: any[] = [];



  viewPlanTipoEquipo: boolean = false;

  viewPlanTipoEquipoMantenimiento: boolean = true;


  viewPlanServicio: boolean = false;

  viewPlanServicioMantenimiento: boolean = true;


  viewPlanMes: boolean = true;

  viewPlanMesMantenimiento: boolean = true;

  date: Date | undefined;
  panelActivo: 'seguimiento' | 'mantenimientos' | 'mensuales' = 'seguimiento';

  sysMantenimientoServices = inject(SysmantenimientoService);
  sysPlanMantenimientoServices = inject(SysplanmantenimientoService);
  serviciosServices = inject(ServicioService);
  tiposEquipoServices = inject(TipoEquipoService);

  // Scheduled Months Variables
  scheduledPreventiveMonths: any[] = [];
  showScheduledPreventiveModal: boolean = false;

  async viewScheduledPreventiveMonths() {
    try {
      const data = await this.sysPlanMantenimientoServices.getScheduledMonths();
      this.scheduledPreventiveMonths = data;
      this.showScheduledPreventiveModal = true;
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los meses programados de preventivos', 'error');
    }
  }


  async ngOnInit() {
    this.equiposPlanPreventivoMes = await this.sysPlanMantenimientoServices.getByMes(this.mesPlan, this.anioPlan);

    this.tiposEquipo = await this.tiposEquipoServices.getTiposEquiposSistemas();
    this.servicios = await this.serviciosServices.getAllServicios();

  }

  setPanel(panel: 'seguimiento' | 'mantenimientos' | 'mensuales') {
    this.panelActivo = panel;
  }

  async setDate() {
    if (this.date) {
      this.mesPlan = this.date.getMonth() + 1;
      this.anioPlan = this.date.getFullYear();

      this.equiposPlanPreventivoMes = await this.sysPlanMantenimientoServices.getByMes(this.mesPlan, this.anioPlan);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un mes para continuar',
        text: 'Datos no encontrados.'
      })
    }
  }

  async setTipoEquipo() {
    if (this.selectedTipoEquipo) {
      const mantenimientoData = await this.sysPlanMantenimientoServices.getPlanMantenimientoTipoEquipo(this.selectedTipoEquipo.id);
      this.equiposPlanMantenimientoTipoEquipo = this.agruparPorEquipo(mantenimientoData);

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un tipo de equipo para continuar',
        text: 'Datos no encontrados.'
      })
      return;
    }
  }

  async setServicio() {
    if (this.selectedServicio) {
      const mantenimientoData = await this.sysPlanMantenimientoServices.getPlanMantenimientoServicio(this.selectedServicio.id);
      this.equiposPlanMantenimientoServicio = this.agruparPorEquipo(mantenimientoData);

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Debe seleccionar un servicio para continuar',
        text: 'Datos no encontrados.'
      })
      return;
    }
  }

  agruparPorEquipo(data: any[]): any[] {
    const grupos = new Map<number, any>();

    data.forEach(item => {
      const id = item.equipo?.id ?? item.equipo?.id_sysequipo;
      // For Metrologia, check if tipoActividad is unique per equipment or if we should group by id AND activity?
      // User request: "agrupar cada equipo... y en la columna de mes poner los meses...".
      // Assuming same activity type for metrology or just listing months.
      // If metrology has different activities for same equipment in different months, we might want to group by (id + activity).
      // However, usually "Mantenimiento Preventivo" is consistent. "Metrologia" might vary?
      // Let's assume grouping by equipment ID is what is requested for now.
      // But wait, keying by ID only might merge different activities.
      // If one entry is "Calibración" in Jan, and "Cualificación" in Feb for same equipment.
      // Merging them would hide the activity distinction if we just pick the first one.
      // Let's check the HTML for metrology table. It displays `registro.tipoActividad`.
      // If we merge, we show one activity.
      // I'll group by Equipment ID AND Activity Type for Metrology?
      // The user specially mentioned "agrupar cada equipo".
      // Let's stick to Equipment ID. If multiple activities exist, maybe just list them or assume they are usually the same.
      // To be safe for Metrology, maybe group by ID + TipoActividad if present.
      // But for Maintenance is just ID.

      if (id === undefined || id === null) return;
      let key: any = id;
      if (item.tipoActividad) {
        key = `${id}-${item.tipoActividad}`;
      }

      if (!grupos.has(key)) {
        grupos.set(key, { ...item, meses: [item.mes] });
      } else {
        const existente = grupos.get(key);
        if (!existente.meses.includes(item.mes)) {
          existente.meses.push(item.mes);
        }
      }
    });

    const resultado = Array.from(grupos.values());
    resultado.forEach(item => {
      item.meses.sort((a: number, b: number) => a - b);
      item.mesesStr = item.meses.map((m: number) => this.getNombreMes(m)).join(', ');
    });

    return resultado
  }

  fechaSeleccionada() {
    return { mes: this.mesPlan, anio: this.anioPlan };
  }

  async programarMantenimiento() {
    Swal.fire({
      title: "Programar mantenimientos preventivos?",
      text: "¿Desea programar los mantenimientos preventivos planeados para el mes de " + this.getNombreMes(this.mesPlan) + " del año " + this.anioPlan + "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Programar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const programados = await this.sysPlanMantenimientoServices.programacionMantenimiento(this.fechaSeleccionada());
          Swal.fire({
            title: "¡Mantenimientos programados!",
            text: "Mantenimientos del mes de " + this.getNombreMes(this.mesPlan) + " del año " + this.anioPlan + " Programados",
            icon: "success"
          });

        } catch (error: any) {
          const errorMessage = error?.error?.error || " los mantenimientos del mes de " + this.getNombreMes(this.mesPlan) + " del año " + this.anioPlan + " se programaron anteriormente.";
          Swal.fire({
            title: "¡No se programaron los mantenimientos!",
            text: errorMessage,
            icon: "warning"
          });
        }
      }
    });
  }




  viewPanelTipoEquipo() {
    this.viewPlanTipoEquipo = true;
    this.viewPlanServicio = false;
    this.viewPlanMes = false;
  }
  viewPanelServicio() {
    this.viewPlanTipoEquipo = false;
    this.viewPlanServicio = true;
    this.viewPlanMes = false;
  }
  viewPanelMes() {
    this.viewPlanTipoEquipo = false;
    this.viewPlanServicio = false;
    this.viewPlanMes = true;
  }

  viewPanelTipoEquipoMantenimiento() {
    this.viewPlanTipoEquipoMantenimiento = true;
  }

  viewPanelServicioMantenimiento() {
    this.viewPlanServicioMantenimiento = true;
  }

  viewPanelMesMantenimiento() {
    this.viewPlanMesMantenimiento = true;
  }

  viewPanelMesMetrologia() {
    this.viewPlanMesMantenimiento = false;
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.dt2.filterGlobal(target.value, 'contains');
    }
  }

  nombreMes() {
    if (this.mesPlan && this.anioPlan) {
      return obtenerNombreMes(this.mesPlan) + ' ' + this.anioPlan;
    } else {
      return '';
    }
  }

  getNombreMes(mes: number) {
    return obtenerNombreMes(mes);
  }
}
