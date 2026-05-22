/**
 * Seed completo: base + módulo Sistemas
 * Crea: Roles, Cargos, Sedes, Servicios, TipoEquipo, Fabricantes, Proveedores,
 *       Responsables, Usuarios, Equipos Biomédicos, y 53 Equipos de Sistemas
 *       con HojaVida y mantenimientos.
 *
 * node scripts/seed_all.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/configDb');

const Rol            = require('../models/generales/Rol');
const Cargo          = require('../models/generales/Cargo');
const Sede           = require('../models/generales/Sede');
const Servicio       = require('../models/generales/Servicio');
const TipoEquipo     = require('../models/generales/TipoEquipo');
const Usuario        = require('../models/generales/Usuario');
const MesaServicioRol = require('../models/MesaServicios/MesaServicioRol');
const Fabricante     = require('../models/Biomedica/Fabricante');
const Proveedor      = require('../models/Biomedica/Proveedor');
const Responsable    = require('../models/Biomedica/Responsable');
const DatosTecnicos  = require('../models/Biomedica/DatosTecnicos');
const Equipo         = require('../models/Biomedica/Equipo');
const HojaVida       = require('../models/Biomedica/HojaVida');
const SysEquipo      = require('../models/Sistemas/SysEquipo');
const SysHojaVida    = require('../models/Sistemas/SysHojaVida');
const SysReporte     = require('../models/Sistemas/SysReporte');

async function findOrCreate(Model, where, defaults = {}) {
  const [record] = await Model.findOrCreate({ where, defaults: { ...where, ...defaults } });
  return record;
}

// ── HELPERS SISTEMAS ──────────────────────────────────────────────────────────

const USUARIOS_EQUIPO = [
  'Dr. Carlos Vargas', 'Enf. Lucía Martínez', 'Tec. Pedro Gómez',
  'Adm. Sandra Ruiz',  'Dra. Ana Torres',      'Ing. Luis Reyes',
  'Aux. María López',  'Dr. Jorge Herrera',    'Coord. Diana Castro',
  'Adm. Fabio Niño',
];
const VENDEDORES = ['Compumax S.A.S', 'Danaranjo Ltda.', 'PC Factory Colombia', 'Syscom Colombia', 'Grupo TI S.A.S'];
const TIPO_USO   = ['Producción', 'Administrativo', 'Crítico', 'Consulta', 'Almacenamiento'];

function buildHV(equipoId, i, tipoNombre) {
  const SO_MAP = {
    'Computador de Escritorio': 'Windows 10 Pro 22H2',
    'Portátil / Laptop':        'Windows 11 Pro 23H2',
    'Servidor':                 'Windows Server 2022 Datacenter',
    'Impresora':                'No aplica',
    'Switch de Red':            'Cisco IOS 16.12',
    'Access Point':             'FortiOS 7.4',
    'Tablet':                   'Android 14 / iPadOS 17',
  };
  const CPU_MAP = {
    'Computador de Escritorio': 'Intel Core i5-10400 6C/12T 2.9GHz',
    'Portátil / Laptop':        'Intel Core i7-1165G7 4C/8T 2.8GHz',
    'Servidor':                 'Intel Xeon Silver 4210R 10C 2.4GHz x2',
    'Tablet':                   'Snapdragon 8 Gen 1 / Apple A14',
  };
  const RAM_MAP = {
    'Computador de Escritorio': '8 GB DDR4 2666 MHz',
    'Portátil / Laptop':        '16 GB DDR4 3200 MHz',
    'Servidor':                 '64 GB DDR4 ECC 2933 MHz',
    'Impresora':                '256 MB',
    'Switch de Red':            'No aplica',
    'Access Point':             '2 GB DDR3',
    'Tablet':                   '8 GB LPDDR5',
  };
  const DISCO_MAP = {
    'Computador de Escritorio': 'SSD 256 GB SATA III',
    'Portátil / Laptop':        'SSD 512 GB NVMe PCIe 4.0',
    'Servidor':                 'HDD SAS 2 TB 10K x4 RAID 5',
    'Impresora':                'No aplica',
    'Switch de Red':            'Flash 2 GB',
    'Access Point':             'Flash 4 GB',
    'Tablet':                   '128 GB UFS 3.1',
  };
  const isSwitch = tipoNombre === 'Switch de Red' || tipoNombre === 'Access Point';
  const isPeripheral = tipoNombre === 'Impresora';
  return {
    ip:                `${isSwitch ? '10.0' : '192.168'}.${Math.floor(i / 50) + 1}.${(i % 200) + 10}`,
    mac:               isPeripheral
                         ? 'No aplica'
                         : `A4:C3:${i.toString(16).padStart(2, '0').toUpperCase()}:${((i + 10) % 256).toString(16).padStart(2, '0').toUpperCase()}:${((i + 20) % 256).toString(16).padStart(2, '0').toUpperCase()}:FF`,
    procesador:        CPU_MAP[tipoNombre]  || 'No aplica',
    ram:               RAM_MAP[tipoNombre]  || 'No aplica',
    disco_duro:        DISCO_MAP[tipoNombre] || 'No aplica',
    sistema_operativo: SO_MAP[tipoNombre]   || 'No aplica',
    office:            (tipoNombre === 'Computador de Escritorio' || tipoNombre === 'Portátil / Laptop') ? 'Microsoft 365 E3' : 'No aplica',
    tonner:            tipoNombre === 'Impresora' ? `Tóner ${['HP 58A', 'Brother TN-890', 'Lexmark 62D4H00', 'Canon C-EXV55'][i % 4]}` : 'No aplica',
    nombre_usuario:    USUARIOS_EQUIPO[i % USUARIOS_EQUIPO.length],
    vendedor:          VENDEDORES[i % VENDEDORES.length],
    tipo_uso:          TIPO_USO[i % TIPO_USO.length],
    fecha_compra:      ['2020-01-15', '2021-06-10', '2022-03-20', '2023-09-05', '2024-01-12'][i % 5],
    fecha_instalacion: ['2020-02-01', '2021-06-15', '2022-03-25', '2023-09-10', '2024-01-15'][i % 5],
    costo_compra:      ['2500000', '3800000', '5200000', '1900000', '7500000', '12000000'][i % 6],
    contrato:          `CONT-2024-${String(i + 1).padStart(3, '0')}`,
    observaciones:     'Equipo registrado en inventario de sistemas. Sin novedades al momento de instalación.',
    compraddirecta:    i % 3 === 0,
    convenio:          i % 3 === 1,
    donado:            false,
    comodato:          i % 10 === 0,
    fecha_inicio_soporte:    ['2020-02-01', '2021-06-15', '2022-03-25', '2023-09-10', '2024-01-15'][i % 5],
    anos_soporte_fabricante: [3, 4, 5][i % 3],
    id_sysequipo_fk:   equipoId,
  };
}

function buildPreventivo(equipoId, servicioId, usuarioId, fecha, idx) {
  const TRABAJOS = [
    'Limpieza interna, pasta térmica renovada, drivers actualizados, temperatura verificada. Equipo operativo.',
    'Sopleteado de polvo, revisión fuente de poder, actualización antivirus y parches Windows. OK.',
    'Limpieza profunda, pasta térmica renovada, MemTest86 sin errores, desfragmentación realizada.',
  ];
  return {
    añoProgramado:     parseInt(fecha.split('-')[0]),
    mesProgramado:     parseInt(fecha.split('-')[1]),
    fechaRealizado:    fecha,
    fechaFin:          fecha,
    horaInicio:        '08:00:00',
    horaTerminacion:   idx % 2 === 0 ? '09:30:00' : '10:00:00',
    horaTotal:         idx % 2 === 0 ? '01:30:00' : '02:00:00',
    tipoMantenimiento: 'Preventivo',
    tipoFalla:         'Sin Falla',
    estadoOperativo:   'Operativo sin restricciones',
    motivo:            'Mantenimiento preventivo semestral del área de Tecnología e Informática.',
    trabajoRealizado:  TRABAJOS[idx % TRABAJOS.length],
    calificacion:      5,
    nombreRecibio:     ['Jefe Enfermería', 'Aux. Administrativo', 'Coordinador Servicio', 'Médico Residente'][idx % 4],
    cedulaRecibio:     `1023${String(idx * 7 + 100).padStart(5, '0')}`,
    observaciones:     'Equipo en buen estado. Protocolo completado. Próximo mantenimiento en 6 meses.',
    mantenimientoPropio: true,
    realizado:         true,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

function buildCorrectivo(equipoId, servicioId, usuarioId, fecha, idx) {
  const FALLAS = [
    { falla: 'Desgaste',           trabajo: 'Ventilador con rodamiento desgastado. Reemplazo y aplicación de pasta térmica. Temp. carga: 52°C estable.' },
    { falla: 'Causa Externa',      trabajo: 'Pico de tensión dañó la fuente. Reemplazo fuente HP 300W original. Prueba funcional OK.' },
    { falla: 'Accesorios',         trabajo: 'Teclado con líquido derramado. Limpieza isopropílico 70%. Reemplazo 3 teclas dañadas. Operativo.' },
    { falla: 'Otros',              trabajo: 'Puerto RJ45 dañado. Sustitución tarjeta de red. IP estática configurada. Ping al HIS OK.' },
    { falla: 'Operación Indebida', trabajo: 'HDD con 47 sectores defectuosos. CHKDSK /R ejecutado. Rendimiento mejoró 60%. Reemplazo sugerido.' },
    { falla: 'Desconocido',        trabajo: 'Cable DisplayPort suelto. Conector asegurado y probado cable de repuesto. Imagen estable.' },
  ];
  const f = FALLAS[idx % FALLAS.length];
  return {
    añoProgramado:     parseInt(fecha.split('-')[0]),
    mesProgramado:     parseInt(fecha.split('-')[1]),
    fechaRealizado:    fecha,
    fechaFin:          fecha,
    horaInicio:        '10:00:00',
    horaTerminacion:   '12:30:00',
    horaTotal:         '02:30:00',
    tipoMantenimiento: 'Correctivo',
    tipoFalla:         f.falla,
    estadoOperativo:   'Operativo sin restricciones',
    motivo:            'Equipo reportado con falla funcional por el usuario del servicio a través de mesa de servicios.',
    trabajoRealizado:  f.trabajo,
    calificacion:      4,
    nombreRecibio:     ['Auxiliar Enfermería', 'Aux. Administrativo', 'Técnico de Servicio'][idx % 3],
    cedulaRecibio:     `7654${String(idx * 3 + 200).padStart(5, '0')}`,
    observaciones:     'Falla corregida satisfactoriamente. Equipo entregado en pleno funcionamiento al usuario del servicio.',
    mantenimientoPropio: true,
    realizado:         true,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida.\n');

    // ── 1. Roles ──────────────────────────────────────────────────────────────
    console.log('Creando roles...');
    const roles = {};
    for (const nombre of [
      'SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO',
      'ADMINISTRADOR', 'AG', 'ADM', 'MESAADMIN', 'MESAUSER', 'SOL', 'OBS', 'INVITADO',
    ]) {
      roles[nombre] = await findOrCreate(Rol, { nombre });
    }
    console.log(`  ${Object.keys(roles).length} roles OK`);

    // ── 2. Mesa de servicios roles ────────────────────────────────────────────
    console.log('Creando roles mesa de servicios...');
    const mesaRolNone = await findOrCreate(MesaServicioRol, { codigo: 'NONE' }, { nombre: 'Sin rol' });
    await findOrCreate(MesaServicioRol, { codigo: 'ADMIN' }, { nombre: 'Administrador Mesa' });
    await findOrCreate(MesaServicioRol, { codigo: 'AGENT' }, { nombre: 'Agente' });
    await findOrCreate(MesaServicioRol, { codigo: 'USER'  }, { nombre: 'Usuario' });
    console.log('  Mesa roles OK');

    // ── 3. Cargos ─────────────────────────────────────────────────────────────
    console.log('Creando cargos...');
    const cargoAdmin   = await findOrCreate(Cargo, { nombre: 'Administrador' });
    const cargoBiomed  = await findOrCreate(Cargo, { nombre: 'Ingeniero Biomédico' });
    const cargoTec     = await findOrCreate(Cargo, { nombre: 'Técnico Biomédico' });
    const cargoEnf     = await findOrCreate(Cargo, { nombre: 'Enfermero/a' });
    const cargoMedico  = await findOrCreate(Cargo, { nombre: 'Médico' });
    const cargoSistemas = await findOrCreate(Cargo, { nombre: 'Técnico de Sistemas' });
    console.log('  Cargos OK');

    // ── 4. Sedes ──────────────────────────────────────────────────────────────
    console.log('Creando sedes...');
    const sedePrincipal = await findOrCreate(Sede, { nombres: 'Sede Principal HUSRT' }, {
      direccion:   'Carrera 11 # 69-80',
      nit:         '891800394-4',
      ciudad:      'Tunja',
      departamento:'Boyacá',
      estado:      true,
      nivel:       3,
    });
    const sedeNorte = await findOrCreate(Sede, { nombres: 'Sede Norte' }, {
      direccion:   'Av. Norte # 12-45',
      nit:         '891800394-4',
      ciudad:      'Tunja',
      departamento:'Boyacá',
      estado:      true,
      nivel:       2,
    });
    await findOrCreate(Sede, { nombres: 'Sede Sur' }, {
      direccion:   'Calle 10 # 23-56',
      nit:         '891800394-4',
      ciudad:      'Tunja',
      departamento:'Boyacá',
      estado:      true,
      nivel:       1,
    });
    console.log('  3 sedes OK');

    // ── 5. Servicios ──────────────────────────────────────────────────────────
    console.log('Creando servicios...');
    const servicios = {};
    const serviciosDef = [
      { nombres: 'Urgencias',              ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'UCI',                    ubicacion: 'Piso 3',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'UCI Adulto',             ubicacion: 'Piso 3',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'UCI Neonatal',           ubicacion: 'Piso 3',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Cirugía',                ubicacion: 'Piso 2',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Quirúrgicos',            ubicacion: 'Piso 2',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Laboratorio Clínico',    ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Radiología e Imágenes',  ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Consulta Externa',       ubicacion: 'Piso 4',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Neonatología',           ubicacion: 'Piso 3',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
      { nombres: 'Farmacia',               ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Facturación',            ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Talento Humano',         ubicacion: 'Piso 4',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Gerencia',               ubicacion: 'Piso 5',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Sistemas TI',            ubicacion: 'Piso 1',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Calidad',                ubicacion: 'Piso 4',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Aseguramiento',          ubicacion: 'Piso 4',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Financiera',             ubicacion: 'Piso 5',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'Epidemiología',          ubicacion: 'Piso 4',     sedeIdFk: sedePrincipal.id, requiereMesaServicios: false },
      { nombres: 'General',                ubicacion: 'Principal',  sedeIdFk: sedePrincipal.id, requiereMesaServicios: true  },
    ];
    for (const s of serviciosDef) {
      servicios[s.nombres] = await findOrCreate(Servicio, { nombres: s.nombres }, {
        ubicacion: s.ubicacion, sedeIdFk: s.sedeIdFk, requiereMesaServicios: s.requiereMesaServicios,
      });
    }
    console.log(`  ${Object.keys(servicios).length} servicios OK`);

    // ── 6. Tipos de equipo ────────────────────────────────────────────────────
    console.log('Creando tipos de equipo...');
    const tiposEquipo = {};

    const tiposBio = [
      { nombres: 'Monitor de Signos Vitales', materialConsumible: 'Sensores, electrodos',             herramienta: 'Destornilladores, multímetro',           tiempoMinutos: '90',  repuestosMinimos: 'Batería, sensores SpO2',                tipoR: 1, actividad: 'Mantenimiento preventivo semestral',    activo: true, requiereMetrologia: true  },
      { nombres: 'Ventilador Mecánico',        materialConsumible: 'Filtros, circuitos de paciente',   herramienta: 'Medidor de flujo, destornilladores',     tiempoMinutos: '120', repuestosMinimos: 'Válvulas, filtros HEPA',                tipoR: 1, actividad: 'Mantenimiento preventivo trimestral',   activo: true, requiereMetrologia: true  },
      { nombres: 'Desfibrilador',              materialConsumible: 'Electrodos, gel conductor',        herramienta: 'Analizador de desfibriladores',          tiempoMinutos: '60',  repuestosMinimos: 'Batería, paletas',                      tipoR: 1, actividad: 'Mantenimiento preventivo semestral',    activo: true, requiereMetrologia: true  },
      { nombres: 'Bomba de Infusión',          materialConsumible: 'Equipos de infusión',              herramienta: 'Analizador de bombas, multímetro',       tiempoMinutos: '60',  repuestosMinimos: 'Batería',                               tipoR: 1, actividad: 'Mantenimiento preventivo anual',        activo: true, requiereMetrologia: true  },
      { nombres: 'Equipo de Rayos X',          materialConsumible: 'Placas, revelador',                herramienta: 'Dosímetro, multímetro',                  tiempoMinutos: '180', repuestosMinimos: 'Fusibles, colimador',                   tipoR: 1, actividad: 'Mantenimiento preventivo semestral',    activo: true, requiereMetrologia: true  },
      { nombres: 'Autoclave',                  materialConsumible: 'Agua destilada, indicadores',      herramienta: 'Termómetro, manómetro',                  tiempoMinutos: '90',  repuestosMinimos: 'Juntas, válvulas de seguridad',         tipoR: 1, actividad: 'Mantenimiento preventivo trimestral',   activo: true, requiereMetrologia: false },
      { nombres: 'Electrocardiógrafo',         materialConsumible: 'Papel térmico, electrodos',        herramienta: 'Simulador ECG',                          tiempoMinutos: '60',  repuestosMinimos: 'Cable de paciente, electrodos',         tipoR: 1, actividad: 'Mantenimiento preventivo anual',        activo: true, requiereMetrologia: false },
      { nombres: 'Incubadora Neonatal',        materialConsumible: 'Filtros, agua destilada',          herramienta: 'Termómetro calibrado, higrómetro',       tiempoMinutos: '120', repuestosMinimos: 'Resistencia calefactora, sondas temp.', tipoR: 1, actividad: 'Mantenimiento preventivo trimestral',   activo: true, requiereMetrologia: true  },
      { nombres: 'Centrífuga',                 materialConsumible: 'Tubos, adaptadores',               herramienta: 'Tacómetro, balanza',                     tiempoMinutos: '60',  repuestosMinimos: 'Brushes, rotor',                        tipoR: 1, actividad: 'Mantenimiento preventivo semestral',    activo: true, requiereMetrologia: false },
      { nombres: 'Equipo de Ultrasonido',      materialConsumible: 'Gel conductor',                    herramienta: 'Fantoma de prueba',                      tiempoMinutos: '90',  repuestosMinimos: 'Transductores',                         tipoR: 1, actividad: 'Mantenimiento preventivo anual',        activo: true, requiereMetrologia: false },
    ];
    const tiposSis = [
      { nombres: 'Computador de Escritorio',   materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores, soplador de aire',    tiempoMinutos: '60', repuestosMinimos: 'Memoria RAM, disco duro',         tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Portátil / Laptop',          materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores de precisión',         tiempoMinutos: '60', repuestosMinimos: 'Batería, cargador',               tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Impresora',                  materialConsumible: 'Tóner, papel',                          herramienta: 'Destornilladores, pinzas',              tiempoMinutos: '45', repuestosMinimos: 'Tóner, drum',                     tipoR: 2, actividad: 'Mantenimiento preventivo semestral',  activo: true, requiereMetrologia: false },
      { nombres: 'Servidor',                   materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores, multímetro',          tiempoMinutos: '90', repuestosMinimos: 'RAM, disco duro, fuente de poder', tipoR: 2, actividad: 'Mantenimiento preventivo semestral',  activo: true, requiereMetrologia: false },
      { nombres: 'UPS / Regulador',            materialConsumible: 'N/A',                                   herramienta: 'Multímetro',                            tiempoMinutos: '30', repuestosMinimos: 'Batería interna',                 tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Tablet',                     materialConsumible: 'N/A',                                   herramienta: 'Destornilladores de precisión',         tiempoMinutos: '30', repuestosMinimos: 'Batería, cargador',               tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Switch de Red',              materialConsumible: 'Alcohol isopropílico',                  herramienta: 'Soplador de aire',                      tiempoMinutos: '20', repuestosMinimos: 'Cables de red',                   tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Access Point',               materialConsumible: 'Alcohol isopropílico',                  herramienta: 'Soplador de aire',                      tiempoMinutos: '20', repuestosMinimos: 'N/A',                             tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Escáner',                    materialConsumible: 'Rodillos de limpieza, paño',            herramienta: 'Destornilladores, pinzas',              tiempoMinutos: '30', repuestosMinimos: 'Rodillos, pad de separación',     tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
      { nombres: 'Monitor',                    materialConsumible: 'Paño microfibra, alcohol isopropílico', herramienta: 'Destornilladores',                      tiempoMinutos: '15', repuestosMinimos: 'Cable de video',                  tipoR: 2, actividad: 'Mantenimiento preventivo anual',      activo: true, requiereMetrologia: false },
    ];

    for (const t of [...tiposBio, ...tiposSis]) {
      tiposEquipo[t.nombres] = await findOrCreate(TipoEquipo, { nombres: t.nombres }, t);
    }
    console.log(`  ${Object.keys(tiposEquipo).length} tipos de equipo OK`);

    // ── 7. Fabricantes ────────────────────────────────────────────────────────
    console.log('Creando fabricantes...');
    const fabricantes = {};
    for (const f of [
      { nombres: 'Philips Healthcare',    pais: 'Países Bajos',  estado: true },
      { nombres: 'GE Healthcare',         pais: 'Estados Unidos', estado: true },
      { nombres: 'Siemens Healthineers',  pais: 'Alemania',       estado: true },
      { nombres: 'Mindray',               pais: 'China',          estado: true },
      { nombres: 'Drager',                pais: 'Alemania',       estado: true },
      { nombres: 'Medtronic',             pais: 'Irlanda',        estado: true },
      { nombres: 'Biomedical Systems',    pais: 'Colombia',       estado: true },
    ]) {
      fabricantes[f.nombres] = await findOrCreate(Fabricante, { nombres: f.nombres }, f);
    }
    console.log('  Fabricantes OK');

    // ── 8. Proveedores ────────────────────────────────────────────────────────
    console.log('Creando proveedores...');
    const proveedores = {};
    for (const p of [
      { nombres: 'Medisalud SAS',                     telefono: '6014567890', correo: 'contacto@medisalud.com.co',  ciudad: 'Bogotá',       representante: 'Carlos Pérez',   telRepresentante: '3001234567', estado: true },
      { nombres: 'Equipos Hospitalarios del Norte',   telefono: '6087654321', correo: 'ventas@ehno.com.co',         ciudad: 'Bucaramanga',  representante: 'María Torres',   telRepresentante: '3109876543', estado: true },
      { nombres: 'Tecno Médica Ltda',                 telefono: '6044445555', correo: 'info@tecnomedica.com.co',    ciudad: 'Medellín',     representante: 'Andrés Gómez',   telRepresentante: '3151122334', estado: true },
      { nombres: 'Compumax S.A.S',                    telefono: '6015551234', correo: 'ventas@compumax.com.co',     ciudad: 'Bogotá',       representante: 'Ricardo Salinas', telRepresentante: '3001112233', estado: true },
      { nombres: 'Syscom Colombia',                   telefono: '6017778888', correo: 'info@syscom.com.co',         ciudad: 'Bogotá',       representante: 'Natalia Rincón', telRepresentante: '3174445566', estado: true },
      { nombres: 'PC Factory Colombia',               telefono: '6019998877', correo: 'soporte@pcfactory.com.co',  ciudad: 'Bogotá',       representante: 'Esteban Mora',   telRepresentante: '3123334455', estado: true },
    ]) {
      proveedores[p.nombres] = await findOrCreate(Proveedor, { nombres: p.nombres }, p);
    }
    console.log(`  ${Object.keys(proveedores).length} proveedores OK`);

    // ── 9. Responsables ───────────────────────────────────────────────────────
    console.log('Creando responsables...');
    const responsables = {};
    for (const r of [
      { nombres: 'Ingeniería Biomédica HUSRT', garantia: false, externo: false, calificacion: 5, comodato: false, estado: true },
      { nombres: 'Garantía Philips',           garantia: true,  externo: true,  calificacion: 5, comodato: false, estado: true },
      { nombres: 'Garantía GE Healthcare',     garantia: true,  externo: true,  calificacion: 5, comodato: false, estado: true },
      { nombres: 'Contrato Medisalud SAS',     garantia: false, externo: true,  calificacion: 4, comodato: false, estado: true },
      { nombres: 'Comodato Drager',            garantia: false, externo: true,  calificacion: 4, comodato: true,  estado: true },
    ]) {
      responsables[r.nombres] = await findOrCreate(Responsable, { nombres: r.nombres }, r);
    }
    console.log('  Responsables OK');

    // ── 10. Usuarios ──────────────────────────────────────────────────────────
    console.log('Creando usuarios...');
    const pass      = await bcrypt.hash('Husrt2025*', 10);
    const passAdmin = await bcrypt.hash('Admin2025*', 10);
    const passSuper = await bcrypt.hash('Super123*',  10);

    const usuariosDef = [
      { nombres: 'Super',          apellidos: 'Admin',               nombreUsuario: 'superadmin',  tipoId: 'CC', numeroId: '0000000001', telefono: '3000000001', email: 'superadmin@husrt.local',   contraseña: passSuper, estado: true, rolId: roles['SUPERADMIN'].id,       cargoId: cargoAdmin.id,    servicioId: servicios['General'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Juan Carlos',    apellidos: 'Rodríguez Mora',      nombreUsuario: 'jrodriguez',  tipoId: 'CC', numeroId: '7001234567', telefono: '3101234567', email: 'jrodriguez@husrt.gov.co',  contraseña: passAdmin, estado: true, rolId: roles['BIOMEDICAADMIN'].id,   cargoId: cargoBiomed.id,   servicioId: servicios['General'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Laura Patricia', apellidos: 'Gómez Suárez',        nombreUsuario: 'lgomez',      tipoId: 'CC', numeroId: '4009876543', telefono: '3209876543', email: 'lgomez@husrt.gov.co',      contraseña: pass,      estado: true, rolId: roles['BIOMEDICATECNICO'].id, cargoId: cargoTec.id,      servicioId: servicios['General'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Felipe Andrés',  apellidos: 'Castro Niño',         nombreUsuario: 'fcastro',     tipoId: 'CC', numeroId: '1001112222', telefono: '3111112222', email: 'fcastro@husrt.gov.co',     contraseña: pass,      estado: true, rolId: roles['BIOMEDICAUSER'].id,    cargoId: cargoBiomed.id,   servicioId: servicios['Urgencias'].id,   mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Sandra Milena',  apellidos: 'Vargas López',        nombreUsuario: 'svargas',     tipoId: 'CC', numeroId: '3003334444', telefono: '3173334444', email: 'svargas@husrt.gov.co',     contraseña: pass,      estado: true, rolId: roles['ADMINISTRADOR'].id,    cargoId: cargoAdmin.id,    servicioId: servicios['General'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Miguel Ángel',   apellidos: 'Torres Rincón',       nombreUsuario: 'mtorres',     tipoId: 'CC', numeroId: '5005556666', telefono: '3145556666', email: 'mtorres@husrt.gov.co',     contraseña: pass,      estado: true, rolId: roles['MESAADMIN'].id,        cargoId: cargoAdmin.id,    servicioId: servicios['General'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Claudia Helena', apellidos: 'Rojas Pineda',        nombreUsuario: 'crojas',      tipoId: 'CC', numeroId: '6006667777', telefono: '3006667777', email: 'crojas@husrt.gov.co',      contraseña: pass,      estado: true, rolId: roles['MESAUSER'].id,         cargoId: cargoEnf.id,      servicioId: servicios['UCI'].id,         mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Alejandro',      apellidos: 'Mora Bermúdez',       nombreUsuario: 'amora',       tipoId: 'CC', numeroId: '7007778888', telefono: '3007778888', email: 'amora@husrt.gov.co',       contraseña: pass,      estado: true, rolId: roles['SOL'].id,              cargoId: cargoMedico.id,   servicioId: servicios['Cirugía'].id,     mesaServicioRolId: mesaRolNone.id },
      { nombres: 'David Ernesto',  apellidos: 'Guerrero Castro',     nombreUsuario: 'deguerreroc', tipoId: 'CC', numeroId: '8008889999', telefono: '3118889999', email: 'deguerreroc@husrt.gov.co', contraseña: passAdmin, estado: true, rolId: roles['ADMINISTRADOR'].id,    cargoId: cargoSistemas.id, servicioId: servicios['Sistemas TI'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Ana María',      apellidos: 'Pedraza Suárez',      nombreUsuario: 'apedraza',    tipoId: 'CC', numeroId: '9009990000', telefono: '3009990000', email: 'apedraza@husrt.gov.co',    contraseña: pass,      estado: true, rolId: roles['ADM'].id,              cargoId: cargoSistemas.id, servicioId: servicios['Sistemas TI'].id, mesaServicioRolId: mesaRolNone.id },
    ];

    const usuariosCreados = {};
    for (const u of usuariosDef) {
      const existing = await Usuario.findOne({ where: { nombreUsuario: u.nombreUsuario } });
      if (!existing) {
        usuariosCreados[u.nombreUsuario] = await Usuario.create(u);
        console.log(`  [CREADO] ${u.nombreUsuario}`);
      } else {
        usuariosCreados[u.nombreUsuario] = existing;
        console.log(`  [EXISTE] ${u.nombreUsuario}`);
      }
    }

    // ID del técnico de sistemas para los mantenimientos
    const sistemasTecnicoId = usuariosCreados['deguerreroc']?.id || usuariosCreados['superadmin']?.id;

    // ── 11. Equipos Biomédicos ────────────────────────────────────────────────
    console.log('\nCreando equipos biomédicos...');

    const bioEquipos = [
      {
        equipo: { nombres: 'Monitor Multiparámetro UCI-01', marca: 'Philips', modelo: 'IntelliVue MX450', serie: 'PHI-MX450-2021-001', placa: 'HUS-MON-001', registroInvima: '2021M-000001', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 1', activo: true, periodicidadM: 6, periodicidadC: 12, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Monitor de Signos Vitales'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '2A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '18-25°C', peso: '6.5 kg', capacidad: 'N/A' },
        hojaVida: { codigoInternacional: 'MSV-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-03-15'), fechaInstalacion: new Date('2021-04-01'), fechaIncorporacion: new Date('2021-04-05'), fechaVencimientoGarantia: new Date('2023-04-01'), costoCompra: 45000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Monitor con módulos de SpO2, NIBP, ECG, temperatura y CO2.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Monitor Multiparámetro UCI-02', marca: 'Philips', modelo: 'IntelliVue MX450', serie: 'PHI-MX450-2021-002', placa: 'HUS-MON-002', registroInvima: '2021M-000001', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 2', activo: true, periodicidadM: 6, periodicidadC: 12, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Monitor de Signos Vitales'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '2A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '18-25°C', peso: '6.5 kg', capacidad: 'N/A' },
        hojaVida: { codigoInternacional: 'MSV-002', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-03-15'), fechaInstalacion: new Date('2021-04-01'), fechaIncorporacion: new Date('2021-04-05'), fechaVencimientoGarantia: new Date('2023-04-01'), costoCompra: 45000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Monitor con módulos de SpO2, NIBP, ECG, temperatura.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Ventilador Mecánico UCI-01', marca: 'Drager', modelo: 'Evita Infinity V500', serie: 'DRG-V500-2020-001', placa: 'HUS-VENT-001', registroInvima: '2020M-000055', riesgo: 'III', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 3', activo: true, periodicidadM: 3, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Ventilador Mecánico'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Comodato Drager'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '4A', iMinOperacion: '1A', wConsumida: '350W', frecuencia: '60Hz', presion: '2.7-6 bar', velocidad: 'N/A', temperatura: '15-40°C', peso: '33 kg', capacidad: 'FiO2 21-100%' },
        hojaVida: { codigoInternacional: 'VENT-001', contrato: 'CON-2020-DRG-001', tipoAdquisicion: 'Comodato', fechaCompra: null, fechaInstalacion: new Date('2020-08-10'), fechaIncorporacion: new Date('2020-08-15'), fechaVencimientoGarantia: new Date('2022-08-10'), costoCompra: null, fuente: 'Electricidad', tipoUso: 'Soporte Vital', clase: 'Electromecanico', mantenimiento: 'Comodato', propiedad: 'Proveedor', equipoPortatil: false, observaciones: 'Ventilador de alta gama. Incluye módulo de monitoreo gráfico.', fabricanteIdFk: fabricantes['Drager'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Desfibrilador Urgencias-01', marca: 'Philips', modelo: 'HeartStart XL+', serie: 'PHI-XL-2022-001', placa: 'HUS-DES-001', registroInvima: '2022M-000088', riesgo: 'III', ubicacion: 'Urgencias', ubicacionEspecifica: 'Sala de Reanimación', activo: true, periodicidadM: 6, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Desfibrilador'].id, servicioIdFk: servicios['Urgencias'].id, responsableIdFk: responsables['Garantía Philips'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '3A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '0-45°C', peso: '7.4 kg', capacidad: 'Hasta 360J' },
        hojaVida: { codigoInternacional: 'DES-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2022-01-20'), fechaInstalacion: new Date('2022-02-05'), fechaIncorporacion: new Date('2022-02-10'), fechaVencimientoGarantia: new Date('2024-02-05'), costoCompra: 35000000, fuente: 'Electricidad', tipoUso: 'Terapéutico', clase: 'Electronico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'Incluye paletas externas e internas. Con función de marcapaso.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Bomba de Infusión UCI-01', marca: 'Mindray', modelo: 'SK-600II', serie: 'MIN-SK600-2021-001', placa: 'HUS-BOM-001', registroInvima: '2021M-000112', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 1', activo: true, periodicidadM: 12, periodicidadC: 12, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Bomba de Infusión'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '1A', iMinOperacion: '0.3A', wConsumida: '30W', frecuencia: '60Hz', presion: 'N/A', velocidad: '0.1-1200 ml/h', temperatura: '10-40°C', peso: '1.8 kg', capacidad: 'Flujo 0.1-1200 ml/h' },
        hojaVida: { codigoInternacional: 'BOMINF-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-06-10'), fechaInstalacion: new Date('2021-07-01'), fechaIncorporacion: new Date('2021-07-05'), fechaVencimientoGarantia: new Date('2023-07-01'), costoCompra: 5500000, fuente: 'Electricidad', tipoUso: 'Terapéutico', clase: 'Electromecanico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'Bomba de jeringa. Batería interna con autonomía de 8 horas.', fabricanteIdFk: fabricantes['Mindray'].id, proveedorIdFk: proveedores['Equipos Hospitalarios del Norte'].id },
      },
      {
        equipo: { nombres: 'Electrocardiógrafo Consulta-01', marca: 'GE Healthcare', modelo: 'MAC 800', serie: 'GEH-MAC800-2020-001', placa: 'HUS-ECG-001', registroInvima: '2020M-000200', riesgo: 'IIA', ubicacion: 'Consulta Externa', ubicacionEspecifica: 'Consultorio 5', activo: true, periodicidadM: 12, periodicidadC: 0, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Electrocardiógrafo'].id, servicioIdFk: servicios['Consulta Externa'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '1A', iMinOperacion: '0.2A', wConsumida: '50W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '15-40°C', peso: '2.5 kg', capacidad: '12 derivaciones' },
        hojaVida: { codigoInternacional: 'ECG-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2020-05-20'), fechaInstalacion: new Date('2020-06-01'), fechaIncorporacion: new Date('2020-06-03'), fechaVencimientoGarantia: new Date('2022-06-01'), costoCompra: 18000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'ECG de 12 derivaciones con impresión automática.', fabricanteIdFk: fabricantes['GE Healthcare'].id, proveedorIdFk: proveedores['Tecno Médica Ltda'].id },
      },
      {
        equipo: { nombres: 'Incubadora Neonatal NEO-01', marca: 'Drager', modelo: 'Isolette C2000', serie: 'DRG-ISO-2022-001', placa: 'HUS-INC-001', registroInvima: '2022M-000300', riesgo: 'IIB', ubicacion: 'Neonatología', ubicacionEspecifica: 'Sala Neonatal', activo: true, periodicidadM: 3, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Incubadora Neonatal'].id, servicioIdFk: servicios['Neonatología'].id, responsableIdFk: responsables['Garantía Philips'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '6A', iMinOperacion: '1A', wConsumida: '600W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '20-39°C', peso: '60 kg', capacidad: 'Temp. hasta 39°C, HR hasta 95%' },
        hojaVida: { codigoInternacional: 'INC-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2022-09-01'), fechaInstalacion: new Date('2022-09-20'), fechaIncorporacion: new Date('2022-09-25'), fechaVencimientoGarantia: new Date('2024-09-20'), costoCompra: 55000000, fuente: 'Electricidad', tipoUso: 'Soporte Vital', clase: 'Electromecanico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Incubadora de doble pared con control de temperatura y humedad.', fabricanteIdFk: fabricantes['Drager'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Autoclave Esterilización-01', marca: 'Biomedical Systems', modelo: 'STURDY-SA-232', serie: 'BMS-SA232-2019-001', placa: 'HUS-AUT-001', registroInvima: '2019M-000410', riesgo: 'IIA', ubicacion: 'Esterilización', ubicacionEspecifica: 'Sala Autoclave', activo: true, periodicidadM: 3, periodicidadC: 0, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Autoclave'].id, servicioIdFk: servicios['Cirugía'].id, responsableIdFk: responsables['Contrato Medisalud SAS'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '220V', iMaxOperacion: '20A', iMinOperacion: '15A', wConsumida: '4000W', frecuencia: '60Hz', presion: '2.1 kg/cm²', velocidad: 'N/A', temperatura: '121-134°C', peso: '95 kg', capacidad: '23 litros' },
        hojaVida: { codigoInternacional: 'AUT-001', contrato: 'CON-2023-MED-002', tipoAdquisicion: 'Compra', fechaCompra: new Date('2019-11-10'), fechaInstalacion: new Date('2019-12-01'), fechaIncorporacion: new Date('2019-12-05'), fechaVencimientoGarantia: new Date('2021-12-01'), costoCompra: 28000000, fuente: 'Electricidad', tipoUso: 'Gestión y Soporte Hospitalario', clase: 'Electromecanico', mantenimiento: 'Contratado', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Autoclave de vapor saturado con ciclos pre-vacío y gravitacional.', fabricanteIdFk: fabricantes['Biomedical Systems'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Equipo de Ultrasonido RAD-01', marca: 'GE Healthcare', modelo: 'LOGIQ E10', serie: 'GEH-LE10-2023-001', placa: 'HUS-ECO-001', registroInvima: '2023M-000500', riesgo: 'IIA', ubicacion: 'Radiología e Imágenes', ubicacionEspecifica: 'Sala Ecografía', activo: true, periodicidadM: 12, periodicidadC: 0, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Equipo de Ultrasonido'].id, servicioIdFk: servicios['Radiología e Imágenes'].id, responsableIdFk: responsables['Garantía GE Healthcare'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '4A', iMinOperacion: '1A', wConsumida: '350W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '15-35°C', peso: '70 kg', capacidad: 'Frecuencias 1-22 MHz' },
        hojaVida: { codigoInternacional: 'USG-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2023-01-15'), fechaInstalacion: new Date('2023-02-10'), fechaIncorporacion: new Date('2023-02-15'), fechaVencimientoGarantia: new Date('2025-02-10'), costoCompra: 280000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Ecógrafo de alta gama con doppler color. Incluye 3 transductores.', fabricanteIdFk: fabricantes['GE Healthcare'].id, proveedorIdFk: proveedores['Tecno Médica Ltda'].id },
      },
    ];

    const tipoUsoMap = {
      'Diagnóstico': 'Diagnóstico', 'Terapéutico': 'Terapéutico', 'Soporte Vital': 'Soporte Vital',
      'Quirúrgico': 'Quirúrgico', 'Equipo de laboratorio': 'Equipo de laboratorio',
      'Rehabilitación': 'Rehabilitación', 'Gestión y Soporte Hospitalario': 'Gestión y Soporte Hospitalario',
    };

    let bioCreados = 0;
    for (const def of bioEquipos) {
      const existente = await Equipo.findOne({ where: { serie: def.equipo.serie } });
      if (existente) { console.log(`  [EXISTE] ${def.equipo.nombres}`); continue; }
      const datosTec = await DatosTecnicos.create(def.tecnico);
      const equipo   = await Equipo.create(def.equipo);
      await HojaVida.create({ ...def.hojaVida, tipoUso: tipoUsoMap[def.hojaVida.tipoUso] || def.hojaVida.tipoUso, equipoIdFk: equipo.id, datosTecnicosIdFk: datosTec.id });
      console.log(`  [CREADO] ${equipo.nombres}`);
      bioCreados++;
    }

    // ── 12. Equipos de Sistemas (53) con HojaVida y Mantenimientos ────────────
    console.log('\nCreando equipos de sistemas...');

    const T = tiposEquipo;
    const SV = servicios;

    const EQUIPOS_SIS = [
      // ── COMPUTADORES DE ESCRITORIO ──────────────────────────────────────────
      { nombre_equipo: 'PC Triage Urgencias 1',        marca: 'HP',       modelo: 'EliteDesk 800 G5 SFF',         serie: 'HPS24-001',  placa_inventario: 'SIS-001', codigo: 'TI-001', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Puesto Triage 1',            ano_ingreso: '2022-03-15', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'PC Triage Urgencias 2',        marca: 'HP',       modelo: 'EliteDesk 800 G5 SFF',         serie: 'HPS24-002',  placa_inventario: 'SIS-002', codigo: 'TI-002', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Puesto Triage 2',            ano_ingreso: '2022-03-15', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'PC Enfermería Urgencias',      marca: 'Lenovo',   modelo: 'ThinkCentre M720 Tower',       serie: 'LNV23-001',  placa_inventario: 'SIS-003', codigo: 'TI-003', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Puesto central Enfermería',  ano_ingreso: '2021-06-20', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'PC UCI Adulto Est. 1',         marca: 'Dell',     modelo: 'OptiPlex 7080 MT',             serie: 'DEL23-001',  placa_inventario: 'SIS-004', codigo: 'TI-004', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Estación Médico 1',          ano_ingreso: '2023-01-10', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'PC UCI Adulto Est. 2',         marca: 'Dell',     modelo: 'OptiPlex 7080 MT',             serie: 'DEL23-002',  placa_inventario: 'SIS-005', codigo: 'TI-005', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Estación Médico 2',          ano_ingreso: '2023-01-10', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'PC Enfermería UCI',            marca: 'HP',       modelo: 'ProDesk 400 G7 MT',            serie: 'HPS22-010',  placa_inventario: 'SIS-006', codigo: 'TI-006', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Puesto Enfermería Central',  ano_ingreso: '2022-08-05', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'PC UCI Neonatal',              marca: 'Lenovo',   modelo: 'ThinkCentre M920 Tower',       serie: 'LNV22-005',  placa_inventario: 'SIS-007', codigo: 'TI-007', ubicacion: 'UCI NEONATAL',      ubicacion_especifica: 'Puesto principal',           ano_ingreso: '2022-05-18', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['UCI Neonatal'].id      },
      { nombre_equipo: 'PC Consulta Externa 1',        marca: 'Dell',     modelo: 'OptiPlex 3080 MT',             serie: 'DEL20-001',  placa_inventario: 'SIS-008', codigo: 'TI-008', ubicacion: 'CONSULTA EXTERNA',  ubicacion_especifica: 'Consultorio 1',              ano_ingreso: '2020-11-12', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Consulta Externa'].id  },
      { nombre_equipo: 'PC Consulta Externa 2',        marca: 'Dell',     modelo: 'OptiPlex 3080 MT',             serie: 'DEL20-002',  placa_inventario: 'SIS-009', codigo: 'TI-009', ubicacion: 'CONSULTA EXTERNA',  ubicacion_especifica: 'Consultorio 2',              ano_ingreso: '2020-11-12', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Consulta Externa'].id  },
      { nombre_equipo: 'PC Consulta Externa 3',        marca: 'Lenovo',   modelo: 'ThinkCentre M720 Tower',       serie: 'LNV21-010',  placa_inventario: 'SIS-010', codigo: 'TI-010', ubicacion: 'CONSULTA EXTERNA',  ubicacion_especifica: 'Consultorio 3',              ano_ingreso: '2021-02-20', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Consulta Externa'].id  },
      { nombre_equipo: 'PC Laboratorio Clínico 1',     marca: 'Dell',     modelo: 'OptiPlex 5080 MT',             serie: 'DEL22-010',  placa_inventario: 'SIS-011', codigo: 'TI-011', ubicacion: 'LABORATORIO',       ubicacion_especifica: 'Mesa Analítica 1',           ano_ingreso: '2022-07-15', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Laboratorio Clínico'].id },
      { nombre_equipo: 'PC Laboratorio Clínico 2',     marca: 'HP',       modelo: 'ProDesk 600 G6 MT',            serie: 'HPS22-020',  placa_inventario: 'SIS-012', codigo: 'TI-012', ubicacion: 'LABORATORIO',       ubicacion_especifica: 'Mesa Analítica 2',           ano_ingreso: '2022-07-15', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Laboratorio Clínico'].id },
      { nombre_equipo: 'PC Farmacia Dispensación',     marca: 'HP',       modelo: 'ProDesk 600 G5 MT',            serie: 'HPS21-030',  placa_inventario: 'SIS-013', codigo: 'TI-013', ubicacion: 'FARMACIA',          ubicacion_especifica: 'Mostrador dispensación',    ano_ingreso: '2021-10-08', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Farmacia'].id          },
      { nombre_equipo: 'PC Facturación 1',             marca: 'Lenovo',   modelo: 'ThinkCentre M920t',            serie: 'LNV23-020',  placa_inventario: 'SIS-014', codigo: 'TI-014', ubicacion: 'FACTURACIÓN',       ubicacion_especifica: 'Ventanilla 1',               ano_ingreso: '2023-02-14', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Facturación'].id       },
      { nombre_equipo: 'PC Facturación 2',             marca: 'Lenovo',   modelo: 'ThinkCentre M920t',            serie: 'LNV23-021',  placa_inventario: 'SIS-015', codigo: 'TI-015', ubicacion: 'FACTURACIÓN',       ubicacion_especifica: 'Ventanilla 2',               ano_ingreso: '2023-02-14', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Facturación'].id       },
      { nombre_equipo: 'PC Talento Humano',            marca: 'HP',       modelo: 'EliteDesk 705 G5 MT',          serie: 'HPS21-015',  placa_inventario: 'SIS-016', codigo: 'TI-016', ubicacion: 'TALENTO HUMANO',    ubicacion_especifica: 'Oficina Principal',          ano_ingreso: '2021-09-01', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Talento Humano'].id    },
      { nombre_equipo: 'PC Gerencia',                  marca: 'HP',       modelo: 'EliteDesk 800 G8 SFF',         serie: 'HPS24-050',  placa_inventario: 'SIS-017', codigo: 'TI-017', ubicacion: 'GERENCIA',          ubicacion_especifica: 'Oficina Gerente',            ano_ingreso: '2024-01-05', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Gerencia'].id          },
      { nombre_equipo: 'PC Sistemas TI 1',             marca: 'HP',       modelo: 'EliteDesk 800 G8 SFF',         serie: 'HPS24-051',  placa_inventario: 'SIS-018', codigo: 'TI-018', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Área TI',                    ano_ingreso: '2024-01-05', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'PC Sistemas TI 2',             marca: 'Dell',     modelo: 'OptiPlex 7090 MT',             serie: 'DEL24-001',  placa_inventario: 'SIS-019', codigo: 'TI-019', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Área TI',                    ano_ingreso: '2024-03-10', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'PC Imágenes Diagnósticas',     marca: 'HP',       modelo: 'Z2 Tower G5',                  serie: 'HPS23-020',  placa_inventario: 'SIS-020', codigo: 'TI-020', ubicacion: 'IMÁGENES',          ubicacion_especifica: 'Sala de Lectura',            ano_ingreso: '2023-04-03', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Computador de Escritorio'].id, id_servicio_fk: SV['Radiología e Imágenes'].id },

      // ── PORTÁTILES ──────────────────────────────────────────────────────────
      { nombre_equipo: 'Portátil Médico Urgencias',    marca: 'HP',       modelo: 'EliteBook 840 G8',             serie: 'LHPS-001',   placa_inventario: 'SIS-021', codigo: 'TI-021', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Sala Médica',                ano_ingreso: '2023-06-10', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Portátil / Laptop'].id,        id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'Portátil Dirección Médica',    marca: 'Dell',     modelo: 'Latitude 5420',                serie: 'LDEL-001',   placa_inventario: 'SIS-022', codigo: 'TI-022', ubicacion: 'GERENCIA',          ubicacion_especifica: 'Dirección Médica',           ano_ingreso: '2022-10-20', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Portátil / Laptop'].id,        id_servicio_fk: SV['Gerencia'].id          },
      { nombre_equipo: 'Portátil Coordinador TI',      marca: 'Lenovo',   modelo: 'ThinkPad X1 Carbon G9',        serie: 'LLNV-001',   placa_inventario: 'SIS-023', codigo: 'TI-023', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Oficina TI',                 ano_ingreso: '2024-02-01', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Portátil / Laptop'].id,        id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Portátil Calidad',             marca: 'HP',       modelo: 'ProBook 450 G9',               serie: 'LHPS-002',   placa_inventario: 'SIS-024', codigo: 'TI-024', ubicacion: 'CALIDAD',           ubicacion_especifica: 'Oficina Calidad',            ano_ingreso: '2022-07-08', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Portátil / Laptop'].id,        id_servicio_fk: SV['Calidad'].id           },
      { nombre_equipo: 'Portátil Quirúrgicos',         marca: 'Dell',     modelo: 'Latitude 3420',                serie: 'LDEL-002',   placa_inventario: 'SIS-025', codigo: 'TI-025', ubicacion: 'QUIRÚRGICOS',       ubicacion_especifica: 'Sala Pre-Quirúrgica',        ano_ingreso: '2021-05-15', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Portátil / Laptop'].id,        id_servicio_fk: SV['Quirúrgicos'].id       },

      // ── SERVIDORES ──────────────────────────────────────────────────────────
      { nombre_equipo: 'Servidor Principal HIS',       marca: 'Dell',     modelo: 'PowerEdge R740',               serie: 'SRDEL-001',  placa_inventario: 'SIS-026', codigo: 'TI-026', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 1',         ano_ingreso: '2021-01-15', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 4, id_tipo_equipo_fk: T['Servidor'].id,                 id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Servidor Respaldo',            marca: 'HP',       modelo: 'ProLiant DL380 Gen10',         serie: 'SRHPS-001',  placa_inventario: 'SIS-027', codigo: 'TI-027', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 1',         ano_ingreso: '2021-01-15', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 4, id_tipo_equipo_fk: T['Servidor'].id,                 id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Servidor PACS Imágenes',       marca: 'Dell',     modelo: 'PowerEdge R640',               serie: 'SRDEL-002',  placa_inventario: 'SIS-028', codigo: 'TI-028', ubicacion: 'IMÁGENES',          ubicacion_especifica: 'Sala Servidores Rx',         ano_ingreso: '2022-09-20', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 2, id_tipo_equipo_fk: T['Servidor'].id,                 id_servicio_fk: SV['Radiología e Imágenes'].id },
      { nombre_equipo: 'Servidor de Archivos',         marca: 'Lenovo',   modelo: 'ThinkSystem SR650',            serie: 'SRLNV-001',  placa_inventario: 'SIS-029', codigo: 'TI-029', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 2',         ano_ingreso: '2023-05-10', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 4, id_tipo_equipo_fk: T['Servidor'].id,                 id_servicio_fk: SV['Sistemas TI'].id       },

      // ── IMPRESORAS ──────────────────────────────────────────────────────────
      { nombre_equipo: 'Impresora Urgencias',          marca: 'HP',       modelo: 'LaserJet M404dn',              serie: 'IMHPS-001',  placa_inventario: 'SIS-030', codigo: 'TI-030', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Puesto Central',             ano_ingreso: '2022-04-10', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'Impresora Farmacia',           marca: 'HP',       modelo: 'LaserJet M404dn',              serie: 'IMHPS-002',  placa_inventario: 'SIS-031', codigo: 'TI-031', ubicacion: 'FARMACIA',          ubicacion_especifica: 'Área Dispensación',          ano_ingreso: '2022-04-10', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Farmacia'].id          },
      { nombre_equipo: 'Impresora Laboratorio',        marca: 'Brother',  modelo: 'HL-L6400DW',                   serie: 'IMBRO-001',  placa_inventario: 'SIS-032', codigo: 'TI-032', ubicacion: 'LABORATORIO',       ubicacion_especifica: 'Recepción',                  ano_ingreso: '2021-11-05', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Laboratorio Clínico'].id },
      { nombre_equipo: 'Impresora Facturación',        marca: 'Lexmark',  modelo: 'MS622de',                      serie: 'IMLEX-001',  placa_inventario: 'SIS-033', codigo: 'TI-033', ubicacion: 'FACTURACIÓN',       ubicacion_especifica: 'Ventanilla Principal',       ano_ingreso: '2020-08-15', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Facturación'].id       },
      { nombre_equipo: 'Impresora Multifunc. Consult.', marca: 'HP',      modelo: 'LaserJet MFP M428fdw',         serie: 'IMHPS-003',  placa_inventario: 'SIS-034', codigo: 'TI-034', ubicacion: 'CONSULTA EXTERNA',  ubicacion_especifica: 'Pasillo Central',            ano_ingreso: '2023-01-20', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Consulta Externa'].id  },
      { nombre_equipo: 'Impresora Gerencia',           marca: 'Canon',    modelo: 'imageRUNNER 2630i',            serie: 'IMCAN-001',  placa_inventario: 'SIS-035', codigo: 'TI-035', ubicacion: 'GERENCIA',          ubicacion_especifica: 'Secretaría General',         ano_ingreso: '2022-06-30', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Gerencia'].id          },
      { nombre_equipo: 'Impresora Sistemas TI',        marca: 'Kyocera',  modelo: 'ECOSYS M3655idn',              serie: 'IMKYO-001',  placa_inventario: 'SIS-036', codigo: 'TI-036', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Área TI',                    ano_ingreso: '2023-09-05', periodicidad: 180, activo: true, administrable: false, id_tipo_equipo_fk: T['Impresora'].id,                id_servicio_fk: SV['Sistemas TI'].id       },

      // ── SWITCHES ────────────────────────────────────────────────────────────
      { nombre_equipo: 'Switch Core Principal',        marca: 'Cisco',    modelo: 'Catalyst 9300-48P',            serie: 'SWCSC-001',  placa_inventario: 'SIS-037', codigo: 'TI-037', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 1',         ano_ingreso: '2021-03-01', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 48, direccionamiento_Vlan: 'VLAN 10,20,30,100', id_tipo_equipo_fk: T['Switch de Red'].id, id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Switch Distribución Piso 1',   marca: 'Cisco',    modelo: 'Catalyst 9200-24T',            serie: 'SWCSC-002',  placa_inventario: 'SIS-038', codigo: 'TI-038', ubicacion: 'URGENCIAS',         ubicacion_especifica: 'Cuarto Telecom. P1',         ano_ingreso: '2021-03-01', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 24, direccionamiento_Vlan: 'VLAN 10,20',        id_tipo_equipo_fk: T['Switch de Red'].id, id_servicio_fk: SV['Urgencias'].id         },
      { nombre_equipo: 'Switch Distribución Piso 2',   marca: 'HP',       modelo: 'Aruba 2930F-24G',              serie: 'SWHPS-001',  placa_inventario: 'SIS-039', codigo: 'TI-039', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Cuarto Telecom. P2',         ano_ingreso: '2022-02-10', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 24, direccionamiento_Vlan: 'VLAN 10,30',        id_tipo_equipo_fk: T['Switch de Red'].id, id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'Switch Distribución Piso 3',   marca: 'HP',       modelo: 'Aruba 2930F-24G',              serie: 'SWHPS-002',  placa_inventario: 'SIS-040', codigo: 'TI-040', ubicacion: 'QUIRÚRGICOS',       ubicacion_especifica: 'Cuarto Telecom. P3',         ano_ingreso: '2022-02-10', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 24, direccionamiento_Vlan: 'VLAN 10,40',        id_tipo_equipo_fk: T['Switch de Red'].id, id_servicio_fk: SV['Quirúrgicos'].id       },
      { nombre_equipo: 'Switch Administración',        marca: 'Cisco',    modelo: 'Catalyst 9200-48T',            serie: 'SWCSC-003',  placa_inventario: 'SIS-041', codigo: 'TI-041', ubicacion: 'GERENCIA',          ubicacion_especifica: 'Cuarto Telecom. P4',         ano_ingreso: '2022-05-20', periodicidad: 90,  activo: true, administrable: true,  numero_puertos: 48, direccionamiento_Vlan: 'VLAN 10,50',        id_tipo_equipo_fk: T['Switch de Red'].id, id_servicio_fk: SV['Gerencia'].id          },

      // ── ROUTERS / FIREWALL ──────────────────────────────────────────────────
      { nombre_equipo: 'Firewall Principal',           marca: 'Fortinet', modelo: 'FortiGate 100F',               serie: 'RTFTN-001',  placa_inventario: 'SIS-042', codigo: 'TI-042', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 1',         ano_ingreso: '2021-01-15', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Access Point'].id,             id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Router WAN Principal',         marca: 'Cisco',    modelo: 'ISR 4331',                     serie: 'RTCSC-001',  placa_inventario: 'SIS-043', codigo: 'TI-043', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 1',         ano_ingreso: '2021-01-15', periodicidad: 90,  activo: true, administrable: true,  id_tipo_equipo_fk: T['Access Point'].id,             id_servicio_fk: SV['Sistemas TI'].id       },
      { nombre_equipo: 'Router Enlace UMI',            marca: 'Mikrotik', modelo: 'RB4011iGS+',                   serie: 'RTMKT-001',  placa_inventario: 'SIS-044', codigo: 'TI-044', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Data Center Rack 2',         ano_ingreso: '2022-08-10', periodicidad: 180, activo: true, administrable: true,  id_tipo_equipo_fk: T['Access Point'].id,             id_servicio_fk: SV['Sistemas TI'].id       },

      // ── MONITORES ───────────────────────────────────────────────────────────
      { nombre_equipo: 'Monitor Imágenes Dx 1',        marca: 'LG',       modelo: '27UN850-W 4K',                 serie: 'MONLG-001',  placa_inventario: 'SIS-045', codigo: 'TI-045', ubicacion: 'IMÁGENES',          ubicacion_especifica: 'Sala Lectura Mon. 1',        ano_ingreso: '2023-04-03', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Monitor'].id,                  id_servicio_fk: SV['Radiología e Imágenes'].id },
      { nombre_equipo: 'Monitor Imágenes Dx 2',        marca: 'LG',       modelo: '27UN850-W 4K',                 serie: 'MONLG-002',  placa_inventario: 'SIS-046', codigo: 'TI-046', ubicacion: 'IMÁGENES',          ubicacion_especifica: 'Sala Lectura Mon. 2',        ano_ingreso: '2023-04-03', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Monitor'].id,                  id_servicio_fk: SV['Radiología e Imágenes'].id },
      { nombre_equipo: 'Monitor UCI Adulto 1',         marca: 'Samsung',  modelo: 'S27A600UUN 27"',               serie: 'MONSAM-001', placa_inventario: 'SIS-047', codigo: 'TI-047', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Estación Médico 1',          ano_ingreso: '2022-08-05', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Monitor'].id,                  id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'Monitor UCI Adulto 2',         marca: 'Samsung',  modelo: 'S27A600UUN 27"',               serie: 'MONSAM-002', placa_inventario: 'SIS-048', codigo: 'TI-048', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Estación Médico 2',          ano_ingreso: '2022-08-05', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Monitor'].id,                  id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'Monitor Sistemas TI',          marca: 'Dell',     modelo: 'P2422H 24"',                   serie: 'MONDEL-001', placa_inventario: 'SIS-049', codigo: 'TI-049', ubicacion: 'SISTEMAS',          ubicacion_especifica: 'Área TI Puesto 1',           ano_ingreso: '2023-09-05', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Monitor'].id,                  id_servicio_fk: SV['Sistemas TI'].id       },

      // ── TABLETS ─────────────────────────────────────────────────────────────
      { nombre_equipo: 'Tableta Enfermería UCI',       marca: 'Samsung',  modelo: 'Galaxy Tab S8 11"',            serie: 'TBLSAM-001', placa_inventario: 'SIS-050', codigo: 'TI-050', ubicacion: 'UCI ADULTO',        ubicacion_especifica: 'Ronda de Enfermería',        ano_ingreso: '2023-07-20', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Tablet'].id,                   id_servicio_fk: SV['UCI Adulto'].id        },
      { nombre_equipo: 'Tableta Visita Médica',        marca: 'Apple',    modelo: 'iPad 10ª Gen 10.9"',           serie: 'TBLAPL-001', placa_inventario: 'SIS-051', codigo: 'TI-051', ubicacion: 'QUIRÚRGICOS',       ubicacion_especifica: 'Sala Juntas Médicas',        ano_ingreso: '2024-01-15', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Tablet'].id,                   id_servicio_fk: SV['Quirúrgicos'].id       },

      // ── ESCÁNERES ────────────────────────────────────────────────────────────
      { nombre_equipo: 'Escáner Gestión Documental',   marca: 'Fujitsu',  modelo: 'fi-7160',                      serie: 'ESCFUJ-001', placa_inventario: 'SIS-052', codigo: 'TI-052', ubicacion: 'GERENCIA',          ubicacion_especifica: 'Gestión Documental',         ano_ingreso: '2022-03-10', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Escáner'].id,                  id_servicio_fk: SV['Gerencia'].id          },
      { nombre_equipo: 'Escáner Archivo HC',           marca: 'Canon',    modelo: 'DR-C230',                      serie: 'ESCCAN-001', placa_inventario: 'SIS-053', codigo: 'TI-053', ubicacion: 'CONSULTA EXTERNA',  ubicacion_especifica: 'Archivo H.C.',               ano_ingreso: '2021-08-25', periodicidad: 365, activo: true, administrable: false, id_tipo_equipo_fk: T['Escáner'].id,                  id_servicio_fk: SV['Consulta Externa'].id  },
    ];

    let sisCreados = 0, sisOmitidos = 0;

    for (let i = 0; i < EQUIPOS_SIS.length; i++) {
      const eq = EQUIPOS_SIS[i];
      const tipoNombre = Object.keys(T).find(k => T[k].id === eq.id_tipo_equipo_fk) || 'Computador de Escritorio';

      const existe = await SysEquipo.findOne({ where: { placa_inventario: eq.placa_inventario } });
      if (existe) {
        const countMtto = await SysReporte.count({ where: { id_sysequipo_fk: existe.id_sysequipo } });
        if (countMtto === 0) {
          await SysReporte.create(buildPreventivo(existe.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2024-05-08', i));
          await SysReporte.create(buildPreventivo(existe.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2024-11-12', i + 10));
          if (i % 5 !== 0) await SysReporte.create(buildCorrectivo(existe.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2025-02-18', i));
          console.log(`  [MTTO AÑADIDO] ${existe.nombre_equipo}`);
        } else {
          console.log(`  [EXISTE]        ${eq.nombre_equipo}`);
        }
        sisOmitidos++;
        continue;
      }

      const equipo = await SysEquipo.create(eq);
      await SysHojaVida.create(buildHV(equipo.id_sysequipo, i, tipoNombre));
      await SysReporte.create(buildPreventivo(equipo.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2024-05-08', i));
      await SysReporte.create(buildPreventivo(equipo.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2024-11-12', i + 10));
      if (i % 5 !== 0) await SysReporte.create(buildCorrectivo(equipo.id_sysequipo, eq.id_servicio_fk, sistemasTecnicoId, '2025-02-18', i));

      console.log(`  [CREADO] ${equipo.nombre_equipo} — ID ${equipo.id_sysequipo}`);
      sisCreados++;
    }

    // ── Resumen ───────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  SEED COMPLETO — RESUMEN');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  Roles:                    ${Object.keys(roles).length}`);
    console.log(`  Cargos:                   6`);
    console.log(`  Sedes:                    3`);
    console.log(`  Servicios:                ${Object.keys(servicios).length}`);
    console.log(`  Tipos de equipo:          ${Object.keys(tiposEquipo).length} (10 biomédicos + 10 sistemas)`);
    console.log(`  Fabricantes:              7`);
    console.log(`  Proveedores:              ${Object.keys(proveedores).length}`);
    console.log(`  Responsables:             5`);
    console.log(`  Usuarios:                 ${usuariosDef.length}`);
    console.log(`  Equipos biomédicos nuevos: ${bioCreados}`);
    console.log(`  Equipos sistemas creados:  ${sisCreados}`);
    console.log(`  Equipos sistemas omitidos: ${sisOmitidos}`);
    console.log('══════════════════════════════════════════════════════════════');
    console.log('\nCredenciales de acceso:');
    console.log('  superadmin    / Super123*    (SUPERADMIN)');
    console.log('  jrodriguez    / Admin2025*   (BIOMEDICAADMIN)');
    console.log('  lgomez        / Husrt2025*   (BIOMEDICATECNICO)');
    console.log('  fcastro       / Husrt2025*   (BIOMEDICAUSER)');
    console.log('  svargas       / Husrt2025*   (ADMINISTRADOR)');
    console.log('  mtorres       / Husrt2025*   (MESAADMIN)');
    console.log('  crojas        / Husrt2025*   (MESAUSER)');
    console.log('  amora         / Husrt2025*   (SOL)');
    console.log('  deguerreroc   / Admin2025*   (ADMINISTRADOR — Sistemas TI)');
    console.log('  apedraza      / Husrt2025*   (ADM — Sistemas TI)');
    console.log('══════════════════════════════════════════════════════════════\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error en seed:', err.message);
    if (err.errors) err.errors.forEach(e => console.error('  -', e.message));
    if (err.original) console.error('  DB:', err.original.message);
    await sequelize.close();
    process.exit(1);
  }
})();
