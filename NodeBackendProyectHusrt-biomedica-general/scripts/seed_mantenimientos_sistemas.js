/**
 * SEED: Mantenimientos de Sistemas — 10 Computadores
 *
 * Crea (o reutiliza) un TipoEquipo "Computador - Sistemas", busca un Servicio
 * y un Usuario existentes, genera 10 SysEquipo, sus planes 2026 y un conjunto
 * variado de SysReporte para que el módulo de mantenimientos tenga datos reales.
 *
 * Uso:
 *   node scripts/seed_mantenimientos_sistemas.js
 */

'use strict';

// ── Bootstrap de modelos (igual que index.js) ──────────────────────────────
require('../models/Sistemas/SysEquipo');
require('../models/Sistemas/SysReporte');
require('../models/Sistemas/SysPlanMantenimiento');
require('../models/Sistemas/SysTrazabilidad');

const sequelize  = require('../config/configDb');
const TipoEquipo = require('../models/generales/TipoEquipo');
const Servicio   = require('../models/generales/Servicio');
const Usuario    = require('../models/generales/Usuario');
const SysEquipo  = require('../models/Sistemas/SysEquipo');
const SysReporte = require('../models/Sistemas/SysReporte');
const SysPlanMantenimiento = require('../models/Sistemas/SysPlanMantenimiento');

// ── Datos de los 10 computadores ───────────────────────────────────────────
const COMPUTADORES = [
  { nombre: 'PC Admisiones',        marca: 'Dell',    modelo: 'OptiPlex 5080',      serie: 'DL-5080-001', placa: 'SIS-PC-001', ubicacion: 'Admisiones',       ubicacion_especifica: 'Ventanilla 1' },
  { nombre: 'PC Urgencias',         marca: 'HP',      modelo: 'EliteDesk 800 G6',   serie: 'HP-800-002',  placa: 'SIS-PC-002', ubicacion: 'Urgencias',        ubicacion_especifica: 'Puesto Triage' },
  { nombre: 'PC Laboratorio',       marca: 'Lenovo',  modelo: 'ThinkCentre M720',   serie: 'LN-M720-003', placa: 'SIS-PC-003', ubicacion: 'Laboratorio',      ubicacion_especifica: 'Análisis clínico' },
  { nombre: 'PC Radiología',        marca: 'Dell',    modelo: 'OptiPlex 7080',      serie: 'DL-7080-004', placa: 'SIS-PC-004', ubicacion: 'Radiología',       ubicacion_especifica: 'Sala 1' },
  { nombre: 'PC Facturación 1',     marca: 'HP',      modelo: 'ProDesk 400 G7',     serie: 'HP-400-005',  placa: 'SIS-PC-005', ubicacion: 'Facturación',      ubicacion_especifica: 'Módulo A' },
  { nombre: 'PC Facturación 2',     marca: 'HP',      modelo: 'ProDesk 400 G7',     serie: 'HP-400-006',  placa: 'SIS-PC-006', ubicacion: 'Facturación',      ubicacion_especifica: 'Módulo B' },
  { nombre: 'PC Consulta Externa',  marca: 'Lenovo',  modelo: 'ThinkCentre M80s',   serie: 'LN-M80S-007', placa: 'SIS-PC-007', ubicacion: 'Consulta Externa', ubicacion_especifica: 'Consultorio 3' },
  { nombre: 'PC Gerencia',          marca: 'Dell',    modelo: 'OptiPlex 5090',      serie: 'DL-5090-008', placa: 'SIS-PC-008', ubicacion: 'Gerencia',         ubicacion_especifica: 'Oficina Gerente' },
  { nombre: 'PC Enfermería UCI',    marca: 'Asus',    modelo: 'ExpertCenter D500SA', serie: 'AS-D500-009', placa: 'SIS-PC-009', ubicacion: 'UCI',              ubicacion_especifica: 'Estación enfermería' },
  { nombre: 'PC Sala de Espera',    marca: 'Lenovo',  modelo: 'IdeaCentre 3 07ADA05', serie: 'LN-IC3-010', placa: 'SIS-PC-010', ubicacion: 'Sala de Espera',   ubicacion_especifica: 'Kiosco informativo' },
];

// ── Plantillas de mantenimiento ────────────────────────────────────────────
// Mes actual y año para calcular estados
const AHORA     = new Date();
const MES_HOY   = AHORA.getMonth() + 1;  // 1-12
const ANIO_HOY  = AHORA.getFullYear();

function fmtDate(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

// Genera un conjunto variado de reportes para un equipo dado
function buildReportes(idEquipo, servicioIdFk, usuarioIdFk) {
  const reportes = [];

  // 1. Preventivo realizado y con PDF (COMPLETADO) — hace 3 meses
  {
    const m = ((MES_HOY - 4 + 12) % 12) + 1;
    const a = m > MES_HOY ? ANIO_HOY - 1 : ANIO_HOY;
    reportes.push({
      añoProgramado: a, mesProgramado: m,
      fechaRealizado: fmtDate(a, m, 15),
      horaInicio: '08:00:00', horaTerminacion: '10:30:00', horaTotal: '02:30:00',
      tipoMantenimiento: 'Preventivo',
      estadoOperativo: 'Operativo sin restricciones',
      trabajoRealizado: 'Limpieza interna, cambio pasta térmica, soplado de polvo, verificación de cables y actualización de drivers.',
      motivo: 'Mantenimiento preventivo programado semestral.',
      observaciones: 'Equipo en óptimas condiciones tras el mantenimiento.',
      calificacion: 5,
      nombreRecibio: 'Jefe de Servicio',
      cedulaRecibio: '11223344',
      mantenimientoPropio: true,
      realizado: true,
      rutaPdf: `pdf/preventivo_${idEquipo}_${a}_${m}.pdf`,
      id_sysequipo_fk: idEquipo, servicioIdFk, usuarioIdFk
    });
  }

  // 2. Correctivo realizado SIN pdf (REALIZADO) — hace 1 mes
  {
    const m = ((MES_HOY - 2 + 12) % 12) + 1;
    const a = m > MES_HOY ? ANIO_HOY - 1 : ANIO_HOY;
    reportes.push({
      añoProgramado: a, mesProgramado: m,
      fechaRealizado: fmtDate(a, m, 8),
      horaInicio: '14:00:00', horaTerminacion: '16:00:00', horaTotal: '02:00:00',
      tipoMantenimiento: 'Correctivo',
      tipoFalla: 'Desgaste',
      estadoOperativo: 'Operativo sin restricciones',
      trabajoRealizado: 'Reemplazo de disco duro por SSD. Reinstalación del sistema operativo y aplicaciones institucionales.',
      motivo: 'Disco duro con sectores dañados, lentitud crítica del equipo.',
      observaciones: 'Se mejoró notablemente el rendimiento.',
      calificacion: 4,
      nombreRecibio: 'Auxiliar Administrativo',
      cedulaRecibio: '55667788',
      mantenimientoPropio: true,
      realizado: true,
      rutaPdf: null,
      id_sysequipo_fk: idEquipo, servicioIdFk, usuarioIdFk
    });
  }

  // 3. Preventivo programado para el mes actual (PROGRAMADO)
  reportes.push({
    añoProgramado: ANIO_HOY, mesProgramado: MES_HOY,
    fechaRealizado: null,
    tipoMantenimiento: 'Preventivo',
    motivo: 'Mantenimiento preventivo programado mensual.',
    realizado: false,
    id_sysequipo_fk: idEquipo, servicioIdFk, usuarioIdFk
  });

  // 4. Predictivo PENDIENTE (vencido — mes pasado sin realizar)
  {
    const m = ((MES_HOY - 2 + 12) % 12) + 1;
    const a = m > MES_HOY ? ANIO_HOY - 1 : ANIO_HOY;
    reportes.push({
      añoProgramado: a, mesProgramado: m,
      fechaRealizado: null,
      tipoMantenimiento: 'Predictivo',
      motivo: 'Revisión de temperatura de CPU y estado de fuente de poder.',
      observaciones: 'Pendiente por falta de disponibilidad del técnico.',
      realizado: false,
      id_sysequipo_fk: idEquipo, servicioIdFk, usuarioIdFk
    });
  }

  return reportes;
}

// ── Script principal ────────────────────────────────────────────────────────
async function main() {
  await sequelize.authenticate();
  console.log('\n✔ Conectado a la base de datos.\n');

  // 1. Buscar o crear TipoEquipo "Computador - Sistemas"
  let [tipoEquipo] = await TipoEquipo.findOrCreate({
    where: { nombres: 'Computador', tipoR: 2 },
    defaults: {
      nombres: 'Computador',
      materialConsumible: 'Pasta térmica, paño antiestático',
      herramienta: 'Destornillador, soplador',
      tiempoMinutos: '120',
      repuestosMinimos: 'Disco SSD, memoria RAM',
      tipoR: 2,
      actividad: 'Mantenimiento preventivo y correctivo de equipos de cómputo',
      activo: true,
      requiereMetrologia: false
    }
  });
  console.log(`✔ TipoEquipo: "${tipoEquipo.nombres}" (id=${tipoEquipo.id})`);

  // 2. Buscar primer Servicio activo disponible
  const servicio = await Servicio.findOne({ where: { activo: true } });
  if (!servicio) {
    console.error('✘ No hay servicios activos en la BD. Crea al menos uno primero.');
    process.exit(1);
  }
  console.log(`✔ Servicio: "${servicio.nombres}" (id=${servicio.id})`);

  // 3. Buscar primer Usuario activo
  const usuario = await Usuario.findOne();
  if (!usuario) {
    console.error('✘ No hay usuarios en la BD.');
    process.exit(1);
  }
  console.log(`✔ Usuario técnico: "${usuario.nombreUsuario || usuario.nombres}" (id=${usuario.id})`);

  // 4. Crear los 10 equipos (skip si la placa ya existe)
  console.log('\n── Creando equipos ─────────────────────────────────────────');
  const equiposCreados = [];
  for (const datos of COMPUTADORES) {
    const [equipo, created] = await SysEquipo.findOrCreate({
      where: { placa_inventario: datos.placa },
      defaults: {
        nombre_equipo:        datos.nombre,
        marca:                datos.marca,
        modelo:               datos.modelo,
        serie:                datos.serie,
        placa_inventario:     datos.placa,
        ubicacion:            datos.ubicacion,
        ubicacion_especifica: datos.ubicacion_especifica,
        activo:               true,
        estado_baja:          false,
        ano_ingreso:          '2022-01-01',
        id_tipo_equipo_fk:    tipoEquipo.id,
        id_servicio_fk:       servicio.id,
        id_usuario_fk:        usuario.id
      }
    });
    equiposCreados.push(equipo);
    console.log(`  ${created ? '✔ Creado  ' : '→ Existe  '} ${equipo.nombre_equipo} (id=${equipo.id_sysequipo})`);
  }

  // 5. Crear plan de mantenimiento 2026 (meses 1-12) para cada equipo
  console.log('\n── Creando planes de mantenimiento 2026 ────────────────────');
  for (const equipo of equiposCreados) {
    const existentes = await SysPlanMantenimiento.count({ where: { id_sysequipo_fk: equipo.id_sysequipo, ano: ANIO_HOY } });
    if (existentes > 0) {
      console.log(`  → Planes ya existen para ${equipo.nombre_equipo}`);
      continue;
    }
    const planes = [];
    for (let mes = 1; mes <= 12; mes++) {
      planes.push({ id_sysequipo_fk: equipo.id_sysequipo, mes, ano: ANIO_HOY, rango_inicio: 1, rango_fin: 28 });
    }
    await SysPlanMantenimiento.bulkCreate(planes);
    console.log(`  ✔ 12 planes creados para ${equipo.nombre_equipo}`);
  }

  // 6. Crear reportes de mantenimiento variados
  console.log('\n── Creando reportes de mantenimiento ───────────────────────');
  let totalCreados = 0;
  for (const equipo of equiposCreados) {
    const existe = await SysReporte.count({ where: { id_sysequipo_fk: equipo.id_sysequipo } });
    if (existe > 0) {
      console.log(`  → Reportes ya existen para ${equipo.nombre_equipo} (${existe} registros)`);
      continue;
    }
    const reportes = buildReportes(equipo.id_sysequipo, servicio.id, usuario.id);
    await SysReporte.bulkCreate(reportes);
    totalCreados += reportes.length;
    console.log(`  ✔ ${reportes.length} reportes creados para ${equipo.nombre_equipo}`);
  }

  console.log(`\n✅ Seed completado.`);
  console.log(`   • 10 equipos (computadores)`);
  console.log(`   • Planes 2026: 12 meses × 10 equipos`);
  console.log(`   • Reportes nuevos: ${totalCreados} (4 por equipo: COMPLETADO, REALIZADO, PROGRAMADO, PENDIENTE)\n`);

  await sequelize.close();
}

main().catch(err => {
  console.error('\n✘ Error en seed:', err.message || err);
  process.exit(1);
});
