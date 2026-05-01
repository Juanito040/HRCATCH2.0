import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MeterGroupModule } from 'primeng/metergroup';
import { SysmantenimientoService, SysMantenimiento, SysMantenimientoResponse } from '../../../Services/appServices/sistemasServices/sysmantenimiento/sysmantenimiento.service';
import { firstValueFrom } from 'rxjs';

type TipoMantenimiento = 'Correctivo' | 'Preventivo' | 'Predictivo' | 'Otro';
type TipoFalla =
  | 'Desgaste'
  | 'Operación Indebida'
  | 'Causa Externa'
  | 'Accesorios'
  | 'Desconocido'
  | 'Sin Falla'
  | 'Otros'
  | 'No Registra';

const TIPO_MANTENIMIENTO_LABELS: Record<number, TipoMantenimiento> = {
  1: 'Correctivo',
  2: 'Preventivo',
  3: 'Predictivo',
  4: 'Otro'
};

const TIPO_FALLA_LABELS: Record<number, TipoFalla> = {
  1: 'Desgaste', 2: 'Operación Indebida', 3: 'Causa Externa',
  4: 'Accesorios', 5: 'Desconocido', 6: 'Sin Falla', 7: 'Otros', 8: 'No Registra'
};

@Component({
  selector: 'app-sysindicadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    CardModule,
    ButtonModule,
    CalendarModule,
    ProgressSpinnerModule,
    TagModule,
    MeterGroupModule,
    SelectModule,
    InputTextModule
  ],
  templateUrl: `./sysindicadores.component.html`,
})
export class SysindicadoresComponent {

  readonly colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
  ];
  readonly bgColors = [
    'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)',
    'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(99, 102, 241, 0.7)', 'rgba(20, 184, 166, 0.7)',
    'rgba(249, 115, 22, 0.7)', 'rgba(6, 182, 212, 0.7)'
  ];
  readonly borderColors = [
    '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#4f46e5', '#0d9488', '#ea580c', '#0891b2'
  ];

  private srv = inject(SysmantenimientoService);

  loading = signal(false);

  allPreventivos = signal<SysMantenimiento[]>([]);
  allCorrectivos = signal<SysMantenimiento[]>([]);

  reportes = computed(() => [...this.allPreventivos(), ...this.allCorrectivos()]);

  fechaActual = new Date();
  anio: number = this.fechaActual.getFullYear();
  mesInicio: number = this.fechaActual.getMonth() + 1;
  mesFin: number = this.fechaActual.getMonth() + 1;

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  totalReportesLabel = computed(() => `Total: ${this.reportes().length}`);

  constructor() { this.refrescar(); }

  async refrescar() {
    if (!this.anio || !this.mesInicio || !this.mesFin) return;

    this.loading.set(true);
    try {
      const fechaInicioStr = `${this.anio}-${String(this.mesInicio).padStart(2, '0')}-01`;
      const fechaFinDate = new Date(this.anio, this.mesFin, 0); // Ultimo dia del mes
      const fechaFinStr = `${this.anio}-${String(this.mesFin).padStart(2, '0')}-${String(fechaFinDate.getDate()).padStart(2, '0')}`;

      const res: any = await firstValueFrom(this.srv.getAll({ fecha_inicio: fechaInicioStr, fecha_fin: fechaFinStr }));
      
      const allData: SysMantenimiento[] = Array.isArray(res.data) ? res.data : [];

      this.allPreventivos.set(allData.filter((r: SysMantenimiento) => r.tipo_mantenimiento === 2));
      this.allCorrectivos.set(allData.filter((r: SysMantenimiento) => r.tipo_mantenimiento === 1));
      
      // Tambien incluimos Predictivo(3) y Otro(4) como parte de preventivos o solos? 
      // Para mantener estructura, solo mapeamos los estrictos o guardamos todos en el computed
    } catch (e) {
      console.error(e);
      this.allPreventivos.set([]);
      this.allCorrectivos.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Helpers
  private isRealizado(r: SysMantenimiento): boolean {
    return !!r.entega || !!r.hora_terminacion;
  }

  private getTipoMantenimientoLabel(val?: number): string {
    if (!val) return 'Otro';
    return TIPO_MANTENIMIENTO_LABELS[val] || 'Otro';
  }

  private getTipoFallaLabel(val?: number): string {
    if (!val) return 'No Registra';
    return TIPO_FALLA_LABELS[val] || 'No Registra';
  }

  private groupCount<K extends string | number>(arr: SysMantenimiento[], key: (r: SysMantenimiento) => K | null | undefined) {
    const m = new Map<K, number>();
    for (const r of arr) {
      const k = key(r);
      if (k == null) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }
  
  private groupAvg<K extends string | number>(arr: SysMantenimiento[], key: (r: SysMantenimiento) => K | null | undefined, val: (r: SysMantenimiento) => number | null) {
    const sum = new Map<K, number>(), cnt = new Map<K, number>(), avg = new Map<K, number>();
    for (const r of arr) {
      const k = key(r); const v = val(r);
      if (k == null || v == null) continue;
      sum.set(k, (sum.get(k) ?? 0) + v);
      cnt.set(k, (cnt.get(k) ?? 0) + 1);
    }
    for (const [k, s] of sum.entries()) avg.set(k, s / (cnt.get(k) ?? 1));
    return avg;
  }

  chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 14 } } },
      tooltip: { mode: 'index', intersect: false }
    }
  }) as any);

  barOptions(title?: string) {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 14, family: "'Inter', sans-serif" }, usePointStyle: true, pointStyle: 'circle' } },
        title: title ? { display: true, text: title, font: { size: 18, weight: 'bold', family: "'Inter', sans-serif" }, padding: { bottom: 20 } } : undefined,
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4
        }
      },
      scales: {
        x: {
          ticks: { autoSkip: true, font: { size: 12, family: "'Inter', sans-serif" }, color: '#6b7280' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, font: { size: 12, family: "'Inter', sans-serif" }, color: '#6b7280' },
          grid: { color: '#f3f4f6', borderDash: [5, 5] }
        }
      },
      layout: { padding: { top: 10, bottom: 10 } }
    } as any;
  }

  getResponsableOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 14, family: "'Inter', sans-serif" }, usePointStyle: true } },
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', titleColor: '#1f2937', bodyColor: '#4b5563', borderColor: '#e5e7eb', borderWidth: 1,
          callbacks: {
            footer: (tooltipItems: any) => {
              let realized = 0;
              let notRealized = 0;
              tooltipItems.forEach((item: any) => {
                if (item.dataset.label === 'Prev. Realizado') realized = item.raw;
                if (item.dataset.label === 'Prev. No Realizado') notRealized = item.raw;
              });
              const total = realized + notRealized;
              if (total > 0) {
                const percentage = (realized / total) * 100;
                return `Cumplimiento Prev: ${percentage.toFixed(2)}%`;
              }
              return '';
            }
          },
          footerColor: '#1f2937',
          footerFont: { weight: 'bold', size: 13, family: "'Inter', sans-serif" }
        }
      },
      scales: {
        x: { ticks: { autoSkip: true, font: { size: 12 } }, grid: { display: false } },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 5, precision: 0, font: { size: 12 }, color: '#6b7280' },
          grid: { color: '#f3f4f6' }
        }
      }
    } as any;
  }

  lineOptions(title?: string) {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 14, family: "'Inter', sans-serif" }, usePointStyle: true } },
        title: title ? { display: true, text: title, font: { size: 18, weight: 'bold' }, padding: { bottom: 20 } } : undefined,
        tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(255, 255, 255, 0.9)', titleColor: '#1f2937', bodyColor: '#4b5563', borderColor: '#e5e7eb', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { autoSkip: true, font: { size: 12 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0, font: { size: 12 } }, grid: { color: '#f3f4f6', borderDash: [5, 5] } }
      },
      elements: {
        line: { tension: 0.4, borderWidth: 3 },
        point: { radius: 4, hoverRadius: 6, backgroundColor: '#ffffff', borderWidth: 2 }
      }
    } as any;
  }

  preventivoMeterData = computed(() => {
    const total = this.allPreventivos().length;
    if (total === 0) return [];
    const realizados = this.allPreventivos().filter(r => this.isRealizado(r)).length;
    const c = (realizados / total) * 100;
    return [
      { label: 'Realizados', value: c, color: '#34d399', icon: 'pi pi-check-circle' },
      { label: 'Pendientes', value: 100 - c, color: '#fbbf24', icon: 'pi pi-exclamation-circle' }
    ];
  });

  correctivoMeterData = computed(() => {
    const total = this.allCorrectivos().length;
    if (total === 0) return [];
    const realizados = this.allCorrectivos().filter(r => this.isRealizado(r)).length;
    const c = (realizados / total) * 100;
    return [
      { label: 'Atendidos', value: c, color: '#60a5fa', icon: 'pi pi-check-circle' },
      { label: 'Pendientes', value: 100 - c, color: '#f87171', icon: 'pi pi-exclamation-circle' }
    ];
  });

  duracionStats = computed(() => {
    const calcAvg = (reps: SysMantenimiento[]) => {
      const realizados = reps.filter(r => this.isRealizado(r) && r.hora_inicio && r.hora_terminacion);
      if (realizados.length === 0) return '00:00:00';
      
      const totalMinutes = realizados.reduce((acc, r) => {
        const start = this.hhmmssToMinutes(r.hora_inicio);
        const end = this.hhmmssToMinutes(r.hora_terminacion);
        if (start != null && end != null && end >= start) {
           return acc + (end - start);
        }
        return acc;
      }, 0);
      return this.formatearDuracion(totalMinutes / realizados.length);
    };

    return {
      preventivo: calcAvg(this.allPreventivos()),
      correctivo: calcAvg(this.allCorrectivos())
    };
  });

  preventivoInfo = computed(() => {
    const total = this.allPreventivos().length;
    const realizados = this.allPreventivos().filter(r => this.isRealizado(r)).length;
    return {
      programados: total,
      realizados: realizados,
      cumplimiento: total > 0 ? parseFloat(((realizados / total) * 100).toFixed(2)) : 0
    };
  });

  correctivoInfo = computed(() => {
    const total = this.allCorrectivos().length;
    const realizados = this.allCorrectivos().filter(r => this.isRealizado(r)).length;
    return {
      reportados: total,
      realizados: realizados,
      cumplimiento: total > 0 ? parseFloat(((realizados / total) * 100).toFixed(2)) : 0
    };
  });

  private formatearDuracion(minutosTotales: number): string {
    if (!minutosTotales) return "00:00:00";
    const horas = Math.floor(minutosTotales / 60);
    const minutos = Math.floor(minutosTotales % 60);
    const segundos = Math.floor((minutosTotales * 60) % 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  realizadosChartData = computed(() => {
    const rs = this.reportes();
    const hechos = rs.filter(r => this.isRealizado(r)).length;
    const no = rs.length - hechos;
    return {
      labels: ['Realizados', 'No realizados'],
      datasets: [{
        data: [hechos, no],
        backgroundColor: ['#10b981', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#dc2626'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2
      }]
    };
  });

  porTipoChartData = computed(() => {
    const rs = this.reportes();
    const mapa = new Map<string, number>();

    rs.forEach(r => {
      let tipo = this.getTipoMantenimientoLabel(r.tipo_mantenimiento);
      if (tipo === 'Preventivo') {
        tipo = this.isRealizado(r) ? 'Prev. Realizado' : 'Prev. No Realizado';
      }
      mapa.set(tipo, (mapa.get(tipo) ?? 0) + 1);
    });

    const orden = ['Prev. Realizado', 'Prev. No Realizado', 'Correctivo', 'Predictivo', 'Otro'];
    const labels = orden.filter(k => mapa.has(k) || k === 'Correctivo' || k === 'Prev. Realizado' || k === 'Prev. No Realizado');

    const colorMap: Record<string, string> = {
      'Prev. Realizado': '#10b981', 
      'Prev. No Realizado': '#fbbf24', 
      'Correctivo': '#3b82f6', 
      'Predictivo': '#8b5cf6', 
      'Otro': '#94a3b8' 
    };

    return {
      labels,
      datasets: [{
        data: labels.map(k => mapa.get(k) ?? 0),
        backgroundColor: labels.map(k => colorMap[k] || '#cbd5e1'),
        hoverOffset: 4,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  });

  porUsuarioChartData = computed(() => {
    const rs = this.reportes();
    const stats = new Map<string, { prevRealizado: number, prevNoRealizado: number, correctivo: number }>();

    rs.forEach(r => {
      const u = r.usuario;
      const nom = (u?.nombres || '').trim();
      const ap = (u?.apellidos || '').trim();
      const email = (u?.email || '').trim();
      const name = (nom || ap) ? `${nom} ${ap}`.trim() : (email || 'Sin usuario');

      const current = stats.get(name) || { prevRealizado: 0, prevNoRealizado: 0, correctivo: 0 };
      const tipo = this.getTipoMantenimientoLabel(r.tipo_mantenimiento);
      
      if (tipo === 'Preventivo') {
        if (this.isRealizado(r)) {
          current.prevRealizado++;
        } else {
          current.prevNoRealizado++;
        }
      } else if (tipo === 'Correctivo') {
        current.correctivo++;
      }
      stats.set(name, current);
    });

    const labels = Array.from(stats.keys());
    const dataPrevR = labels.map(l => stats.get(l)?.prevRealizado ?? 0);
    const dataPrevN = labels.map(l => stats.get(l)?.prevNoRealizado ?? 0);
    const dataCorr = labels.map(l => stats.get(l)?.correctivo ?? 0);

    return {
      labels,
      datasets: [
        {
          label: 'Prev. Realizado',
          data: dataPrevR,
          backgroundColor: '#34d399',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Prev. No Realizado',
          data: dataPrevN,
          backgroundColor: '#fbbf24',
          borderColor: '#f59e0b',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Correctivo',
          data: dataCorr,
          backgroundColor: '#f97316',
          borderColor: '#ea580c',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        }
      ]
    };
  });

  porServicioChartData = computed(() => {
    const rs = this.reportes();
    const stats = new Map<string, { preventivo: number, correctivo: number }>();

    rs.forEach(r => {
      const sName = r.equipo?.servicio?.nombres || 'Sin servicio';
      const current = stats.get(sName) || { preventivo: 0, correctivo: 0 };
      const tipo = this.getTipoMantenimientoLabel(r.tipo_mantenimiento);
      
      if (tipo === 'Preventivo') {
        current.preventivo++;
      } else if (tipo === 'Correctivo') {
        current.correctivo++;
      }
      stats.set(sName, current);
    });

    const sortedLabels = Array.from(stats.keys())
      .sort((a, b) => {
        const totalA = (stats.get(a)?.preventivo ?? 0) + (stats.get(a)?.correctivo ?? 0);
        const totalB = (stats.get(b)?.preventivo ?? 0) + (stats.get(b)?.correctivo ?? 0);
        return totalB - totalA;
      })
      .slice(0, 5);

    return {
      labels: sortedLabels,
      datasets: [
        {
          label: 'Preventivo',
          data: sortedLabels.map(l => stats.get(l)?.preventivo ?? 0),
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Correctivo',
          data: sortedLabels.map(l => stats.get(l)?.correctivo ?? 0),
          backgroundColor: '#f97316',
          borderColor: '#ea580c',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        }
      ]
    };
  });

  porFallaChartData = computed(() => {
    const rs = this.reportes();
    const orden: TipoFalla[] = [
      'Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios',
      'Desconocido', 'Sin Falla', 'Otros', 'No Registra'
    ];
    const mapa = this.groupCount(rs, r => this.getTipoFallaLabel(r.tipo_falla) as TipoFalla);
    return {
      labels: orden,
      datasets: [{
        label: 'Reportes por Falla',
        data: orden.map(k => mapa.get(k) ?? 0),
        backgroundColor: this.bgColors,
        borderColor: this.borderColors,
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.6
      }]
    };
  });

  porMesChartData = computed(() => {
    const rs = this.reportes();
    const m = new Map<string, number>(); 
    for (const r of rs) {
      if (!r.fecha) continue;
      const ym = r.fecha.slice(0, 7);
      m.set(ym, (m.get(ym) ?? 0) + 1);
    }
    const labels = Array.from(m.keys()).sort();
    const data = labels.map(l => m.get(l) ?? 0);
    return {
      labels,
      datasets: [{
        label: 'Tendencia Mensual',
        data,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        tension: 0.4
      }]
    };
  });

  topEquiposChartData = computed(() => {
    const rs = this.reportes();
    const mapa = this.groupCount(rs, r => r.equipo?.nombres || r.equipo?.nombre || r.equipo?.codigo || `Equipo ${r.id_sysequipo_fk}`);
    const pares = Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = pares.map(p => p[0] as string);
    const data = pares.map(p => p[1]);
    return {
      labels,
      datasets: [{
        label: 'Reportes',
        data,
        backgroundColor: this.bgColors,
        borderColor: this.borderColors,
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.6
      }]
    };
  });

  duracionPromedioPorTipoChartData = computed(() => {
    const rs = this.reportes();
    const avg = this.groupAvg(
      rs,
      r => this.getTipoMantenimientoLabel(r.tipo_mantenimiento),
      r => {
        if (!r.hora_inicio || !r.hora_terminacion) return null;
        const start = this.hhmmssToMinutes(r.hora_inicio);
        const end = this.hhmmssToMinutes(r.hora_terminacion);
        if (start != null && end != null && end >= start) return end - start;
        return null;
      }
    );
    const orden: TipoMantenimiento[] = ['Preventivo', 'Correctivo', 'Predictivo', 'Otro'];
    const labels = orden;
    const data = orden.map(k => Math.round((avg.get(k) ?? 0) * 10) / 10);
    return {
      labels,
      datasets: [{
        label: 'Minutos (prom.)',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.6
      }]
    };
  });

  private hhmmssToMinutes(v?: string | null): number | null {
    if (!v) return null;
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(v);
    if (!m) return null;
    const h = +m[1], min = +m[2], s = +(m[3] ?? 0);
    return h * 60 + min + s / 60;
  }

  preventivoPorTipoEquipoChartData = computed(() => {
    const reps = this.allPreventivos();
    const counts: Record<string, number> = {};

    reps.forEach(r => {
      const tipoName = r.equipo?.tipoEquipo?.nombres || 'Sin Clasificar';
      counts[tipoName] = (counts[tipoName] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: 'Preventivos por Tipo',
          data,
          backgroundColor: '#3b82f6', 
          borderColor: '#2563eb', 
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.6
        }
      ]
    };
  });

  correctivoPorTipoEquipoChartData = computed(() => {
    const reps = this.allCorrectivos();
    const counts: Record<string, number> = {};

    reps.forEach(r => {
      const tipoName = r.equipo?.tipoEquipo?.nombres || 'Sin Clasificar';
      counts[tipoName] = (counts[tipoName] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: 'Correctivos por Tipo',
          data,
          backgroundColor: '#ef4444', 
          borderColor: '#dc2626', 
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.6
        }
      ]
    };
  });

  pendientesPorResponsableChartData = computed(() => {
    const reps = this.allPreventivos().filter(r => !this.isRealizado(r));
    const counts: Record<string, number> = {};

    reps.forEach(r => {
      const nombreUsuario = r.usuario
        ? (r.usuario.nombres || r.usuario.email || 'Sin Asignar')
        : 'Sin Asignar';
      counts[nombreUsuario] = (counts[nombreUsuario] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: 'Pendientes por Responsable',
          data,
          backgroundColor: '#f59e0b', 
          borderColor: '#d97706', 
          borderWidth: 1
        }
      ]
    };
  });
}
