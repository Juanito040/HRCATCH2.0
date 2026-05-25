/**
 * seed_100_equipos.js — 100 equipos Sistemas + módulo Backups
 *
 * Script autosuficiente: crea toda la base catalogo necesaria con findOrCreate,
 * luego agrega los equipos SIS-054 a SIS-100, hojas de vida, mantenimientos y
 * 10 sistemas de información con sus registros de backup.
 *
 * node scripts/seed_100_equipos.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt    = require('bcryptjs');
const sequelize = require('../config/configDb');

const Rol             = require('../models/generales/Rol');
const Cargo           = require('../models/generales/Cargo');
const Sede            = require('../models/generales/Sede');
const Servicio        = require('../models/generales/Servicio');
const TipoEquipo      = require('../models/generales/TipoEquipo');
const Usuario         = require('../models/generales/Usuario');
const MesaServicioRol = require('../models/MesaServicios/MesaServicioRol');
const SysEquipo       = require('../models/Sistemas/SysEquipo');
const SysHojaVida     = require('../models/Sistemas/SysHojaVida');
const SysReporte      = require('../models/Sistemas/SysReporte');
const SistemaInformacion = require('../models/Biomedica/SistemaInformacion');
const BackupSistema   = require('../models/Biomedica/BackupSistema');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function foc(Model, where, defaults = {}) {
  const [r] = await Model.findOrCreate({ where, defaults: { ...where, ...defaults } });
  return r;
}
function pick(arr, i) { return arr[Math.abs(i) % arr.length]; }

// ─── Maps por tipo de equipo ──────────────────────────────────────────────────

const SO_MAP = {
  'Computador de Escritorio': 'Windows 10 Pro 22H2',
  'Portátil / Laptop':        'Windows 11 Pro 23H2',
  'Servidor':                 'Windows Server 2022 Datacenter',
  'Impresora':                'No aplica',
  'Switch de Red':            'Cisco IOS 16.12 / ArubaOS-CX 10.10',
  'Access Point':             'UniFi OS 3.1 / Cisco AireOS 8.10',
  'Tablet':                   'Android 14 / iPadOS 17',
  'UPS / Regulador':          'No aplica',
  'Escáner':                  'No aplica',
  'Monitor':                  'No aplica',
};
const CPU_MAP = {
  'Computador de Escritorio': 'Intel Core i5-12400 6C/12T 2.5 GHz',
  'Portátil / Laptop':        'Intel Core i7-1255U 10C 1.7 GHz',
  'Servidor':                 'Intel Xeon Gold 6248R 24C 3.0 GHz x2',
  'Tablet':                   'Snapdragon 8 Gen 2 / Apple M1',
  'Access Point':             'Quad-core ARM Cortex-A53 1.0 GHz',
};
const RAM_MAP = {
  'Computador de Escritorio': '8 GB DDR4 3200 MHz',
  'Portátil / Laptop':        '16 GB DDR4 3200 MHz',
  'Servidor':                 '128 GB DDR4 ECC 3200 MHz',
  'Impresora':                '256 MB',
  'Access Point':             '1 GB DDR3',
  'Tablet':                   '8 GB LPDDR5',
};
const DISCO_MAP = {
  'Computador de Escritorio': 'SSD 512 GB NVMe PCIe 4.0',
  'Portátil / Laptop':        'SSD 512 GB NVMe PCIe 4.0',
  'Servidor':                 'HDD SAS 4 TB 10K x6 RAID 6',
  'Switch de Red':            'Flash 2 GB',
  'Access Point':             'Flash 128 MB',
  'Tablet':                   '128 GB UFS 3.1',
};

const VENDEDORES  = ['Compumax S.A.S','Danaranjo Ltda.','PC Factory Colombia','Syscom Colombia','Grupo TI S.A.S','APC Colombia','Ingram Micro Colombia'];
const TIPO_USO    = ['Producción','Administrativo','Crítico','Consulta','Almacenamiento'];
const USUARIOS_EQ = ['Dr. Carlos Vargas','Enf. Lucía Martínez','Tec. Pedro Gómez','Adm. Sandra Ruiz','Dra. Ana Torres','Ing. Luis Reyes','Aux. María López','Dr. Jorge Herrera','Coord. Diana Castro','Adm. Fabio Niño','Enf. Gloria Rojas','Tec. Hernán Cárdenas'];
const FECHAS_COMPRA  = ['2020-01-15','2021-06-10','2022-03-20','2023-09-05','2024-01-12','2024-06-01'];
const FECHAS_INSTALL = ['2020-02-01','2021-06-15','2022-03-25','2023-09-10','2024-01-15','2024-06-10'];
const COSTOS         = ['1800000','2500000','3800000','5200000','7500000','12000000','25000000','45000000'];

function buildHV(equipoId, i, tipo) {
  const isNetwork = tipo === 'Switch de Red' || tipo === 'Access Point';
  const isPassive = ['UPS / Regulador','Monitor','Escáner','Impresora'].includes(tipo);
  return {
    ip:                isPassive ? 'No aplica' : isNetwork ? `10.0.${Math.floor(i/100)+1}.${(i%200)+10}` : `192.168.${Math.floor(i/100)+1}.${(i%200)+10}`,
    mac:               isPassive ? 'No aplica' : `B4:A9:${i.toString(16).padStart(2,'0').toUpperCase()}:${((i+15)%256).toString(16).padStart(2,'0').toUpperCase()}:${((i+30)%256).toString(16).padStart(2,'0').toUpperCase()}:CC`,
    procesador:        CPU_MAP[tipo]  || 'No aplica',
    ram:               RAM_MAP[tipo]  || 'No aplica',
    disco_duro:        DISCO_MAP[tipo] || 'No aplica',
    sistema_operativo: SO_MAP[tipo]   || 'No aplica',
    office:            (tipo === 'Computador de Escritorio' || tipo === 'Portátil / Laptop') ? 'Microsoft 365 E3' : 'No aplica',
    tonner:            tipo === 'Impresora' ? pick(['Tóner HP 58A','Tóner Brother TN-890','Tóner Lexmark 62D4H00','Tóner Canon C-EXV55'], i) : 'No aplica',
    nombre_usuario:    tipo === 'UPS / Regulador' ? 'Área TI / Uso general' : pick(USUARIOS_EQ, i),
    vendedor:          pick(VENDEDORES, i),
    tipo_uso:          tipo === 'UPS / Regulador' ? 'Crítico' : pick(TIPO_USO, i),
    fecha_compra:      pick(FECHAS_COMPRA, i),
    fecha_instalacion: pick(FECHAS_INSTALL, i),
    costo_compra:      pick(COSTOS, i),
    contrato:          `CONT-${2020+(i%5)}-${String(i+54).padStart(3,'0')}`,
    observaciones:     'Equipo ingresado al inventario de sistemas. Inspección inicial sin novedades.',
    compraddirecta:    i % 3 === 0,
    convenio:          i % 3 === 1,
    donado:            false,
    comodato:          false,
    fecha_inicio_soporte:    pick(FECHAS_INSTALL, i),
    anos_soporte_fabricante: [3,4,5][i%3],
    id_sysequipo_fk:   equipoId,
  };
}

// ─── Builders de mantenimiento ────────────────────────────────────────────────

const TRAB_PREV = [
  'Limpieza interna, pasta térmica renovada, drivers actualizados, temperatura verificada. Equipo operativo sin novedades.',
  'Sopleteado de polvo, revisión fuente de poder, actualización antivirus y parches del SO. Sin fallas detectadas.',
  'Limpieza profunda, verificación de memoria RAM (MemTest86 sin errores), desfragmentación de disco completada. Operativo.',
  'Revisión de conexiones, limpieza de puertos, actualización de firmware. Sistema en óptimas condiciones.',
  'Mantenimiento preventivo rutinario: limpieza, revisión eléctrica, actualización de software de seguridad. OK.',
  'Verificación de batería, limpieza de filtros de ventilación, prueba de carga. Sin novedades.',
];
const FALLAS_CORR = [
  { falla: 'Desgaste',           trabajo: 'Ventilador con rodamiento desgastado. Reemplazo y aplicación de pasta térmica. Temperatura estable en 54°C bajo carga.' },
  { falla: 'Causa Externa',      trabajo: 'Pico de tensión dañó fuente de poder. Reemplazo por fuente original certificada. Prueba funcional OK.' },
  { falla: 'Accesorios',         trabajo: 'Teclado con derrame de líquido. Limpieza con isopropílico 70%. Reemplazo de 4 teclas. Operativo.' },
  { falla: 'Otros',              trabajo: 'Puerto RJ45 dañado. Sustitución de tarjeta de red. IP estática configurada. Ping al servidor HIS exitoso.' },
  { falla: 'Operación Indebida', trabajo: 'Disco con 62 sectores defectuosos. CHKDSK /R ejecutado. Rendimiento mejorado. Reemplazo programado próximo ciclo.' },
  { falla: 'Desconocido',        trabajo: 'Cable de video suelto en conector interno. Asegurado correctamente. Imagen estable a 1080p 60Hz.' },
  { falla: 'Causa Externa',      trabajo: 'Switch de alimentación quemado. Reemplazo de módulo. UPS verificada. Operativo sin restricciones.' },
  { falla: 'Desgaste',           trabajo: 'Batería interna agotada (>500 ciclos). Reemplazo por batería original. Autonomía restituida a 4h.' },
];
const NOMBRES_RECIBIO = ['Jefe de Enfermería','Aux. Administrativo','Coordinador de Servicio','Médico Residente','Auxiliar de Enfermería','Técnico de Servicio','Jefe de Área','Secretaria'];

function buildPrev(equipoId, servicioId, usuarioId, fecha, idx) {
  return {
    añoProgramado:     +fecha.split('-')[0],
    mesProgramado:     +fecha.split('-')[1],
    fechaRealizado:    fecha,
    fechaFin:          fecha,
    horaInicio:        pick(['07:30:00','08:00:00','08:30:00','09:00:00'], idx),
    horaTerminacion:   pick(['09:00:00','09:30:00','10:00:00','10:30:00'], idx+2),
    horaTotal:         pick(['01:30:00','01:30:00','02:00:00','01:30:00'], idx),
    tipoMantenimiento: 'Preventivo',
    tipoFalla:         'Sin Falla',
    estadoOperativo:   'Operativo sin restricciones',
    motivo:            'Mantenimiento preventivo semestral programado por el área de Tecnología e Informática.',
    trabajoRealizado:  pick(TRAB_PREV, idx),
    calificacion:      pick([4,5,5,5], idx),
    nombreRecibio:     pick(NOMBRES_RECIBIO, idx),
    cedulaRecibio:     `1023${String(idx*7+154).padStart(5,'0')}`,
    observaciones:     'Protocolo completado. Equipo en buen estado. Próximo mantenimiento en 6 meses.',
    mantenimientoPropio: true,
    realizado:         true,
    equipoBackup:      false,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

function buildCorr(equipoId, servicioId, usuarioId, fecha, idx) {
  const f = pick(FALLAS_CORR, idx);
  return {
    añoProgramado:     +fecha.split('-')[0],
    mesProgramado:     +fecha.split('-')[1],
    fechaRealizado:    fecha,
    fechaFin:          fecha,
    horaInicio:        '10:00:00',
    horaTerminacion:   pick(['11:30:00','12:00:00','12:30:00','13:00:00'], idx),
    horaTotal:         pick(['01:30:00','02:00:00','02:30:00','03:00:00'], idx),
    tipoMantenimiento: 'Correctivo',
    tipoFalla:         f.falla,
    estadoOperativo:   'Operativo sin restricciones',
    motivo:            'Equipo reportado con falla funcional por el usuario a través de la Mesa de Servicios.',
    trabajoRealizado:  f.trabajo,
    calificacion:      pick([3,4,4,5], idx),
    nombreRecibio:     pick(NOMBRES_RECIBIO, idx+1),
    cedulaRecibio:     `7654${String(idx*3+254).padStart(5,'0')}`,
    observaciones:     'Falla corregida satisfactoriamente. Equipo entregado en pleno funcionamiento.',
    mantenimientoPropio: true,
    realizado:         true,
    equipoBackup:      idx % 4 === 0,
    horaEntregaBackup:      idx % 4 === 0 ? '09:00:00' : null,
    horaRecoleccionBackup:  idx % 4 === 0 ? '15:30:00' : null,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida.\n');

    // ── 0. Migraciones de columnas nuevas en SysReporte ───────────────────────
    await sequelize.query(`ALTER TABLE \`SysReporte\` ADD COLUMN IF NOT EXISTS \`equipoBackup\` TINYINT(1) NOT NULL DEFAULT 0`).catch(() => {});
    await sequelize.query(`ALTER TABLE \`SysReporte\` ADD COLUMN IF NOT EXISTS \`horaEntregaBackup\` TIME NULL`).catch(() => {});
    await sequelize.query(`ALTER TABLE \`SysReporte\` ADD COLUMN IF NOT EXISTS \`horaRecoleccionBackup\` TIME NULL`).catch(() => {});
    console.log('  Columnas SysReporte verificadas.\n');

    // ── 1. Base catalog ───────────────────────────────────────────────────────
    console.log('Verificando catálogo base...');

    // Roles
    const rolSysAdmin = await foc(Rol, { nombre: 'SYSTEMADMIN' });
    const rolSysTec   = await foc(Rol, { nombre: 'SISTEMASTECNICO' });
    await foc(Rol, { nombre: 'SYSTEMUSER' });
    const rolSuper    = await foc(Rol, { nombre: 'SUPERADMIN' });
    const rolAdm      = await foc(Rol, { nombre: 'ADMINISTRADOR' });

    // Mesa roles — solo necesitamos el rol neutro para asignar a usuarios nuevos
    const mesaRolNone = await foc(MesaServicioRol, { codigo: 'NONE' }, { nombre: 'Sin rol' });

    // Cargos
    const cargoAdmin    = await foc(Cargo, { nombre: 'Administrador' });
    const cargoSistemas = await foc(Cargo, { nombre: 'Técnico de Sistemas' });

    // Sede principal
    const sedePrincipal = await foc(Sede, { nombres: 'Sede Principal HUSRT' }, {
      direccion: 'Carrera 11 # 69-80', nit: '891800394-4',
      ciudad: 'Tunja', departamento: 'Boyacá', estado: true, nivel: 3,
    });

    // Servicios
    const svcDef = [
      { nombres: 'Urgencias',             ubicacion: 'Piso 1',    requiereMesaServicios: true  },
      { nombres: 'UCI',                   ubicacion: 'Piso 3',    requiereMesaServicios: true  },
      { nombres: 'UCI Adulto',            ubicacion: 'Piso 3',    requiereMesaServicios: true  },
      { nombres: 'UCI Neonatal',          ubicacion: 'Piso 3',    requiereMesaServicios: true  },
      { nombres: 'Cirugía',               ubicacion: 'Piso 2',    requiereMesaServicios: true  },
      { nombres: 'Quirúrgicos',           ubicacion: 'Piso 2',    requiereMesaServicios: true  },
      { nombres: 'Laboratorio Clínico',   ubicacion: 'Piso 1',    requiereMesaServicios: true  },
      { nombres: 'Radiología e Imágenes', ubicacion: 'Piso 1',    requiereMesaServicios: true  },
      { nombres: 'Consulta Externa',      ubicacion: 'Piso 4',    requiereMesaServicios: true  },
      { nombres: 'Neonatología',          ubicacion: 'Piso 3',    requiereMesaServicios: true  },
      { nombres: 'Farmacia',              ubicacion: 'Piso 1',    requiereMesaServicios: false },
      { nombres: 'Facturación',           ubicacion: 'Piso 1',    requiereMesaServicios: false },
      { nombres: 'Talento Humano',        ubicacion: 'Piso 4',    requiereMesaServicios: false },
      { nombres: 'Gerencia',              ubicacion: 'Piso 5',    requiereMesaServicios: false },
      { nombres: 'Sistemas TI',           ubicacion: 'Piso 1',    requiereMesaServicios: false },
      { nombres: 'Calidad',               ubicacion: 'Piso 4',    requiereMesaServicios: false },
      { nombres: 'Aseguramiento',         ubicacion: 'Piso 4',    requiereMesaServicios: false },
      { nombres: 'Financiera',            ubicacion: 'Piso 5',    requiereMesaServicios: false },
      { nombres: 'Epidemiología',         ubicacion: 'Piso 4',    requiereMesaServicios: false },
      { nombres: 'General',               ubicacion: 'Principal', requiereMesaServicios: true  },
    ];
    const SV = {};
    for (const s of svcDef) {
      SV[s.nombres] = await foc(Servicio, { nombres: s.nombres }, { ubicacion: s.ubicacion, sedeIdFk: sedePrincipal.id, requiereMesaServicios: s.requiereMesaServicios });
    }

    // Tipos de equipo Sistemas (tipoR: 2)
    const tiposDefSis = [
      { nombres: 'Computador de Escritorio', materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores, soplador',        tiempoMinutos: '60', repuestosMinimos: 'Memoria RAM, disco duro',         tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Portátil / Laptop',        materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores de precisión',     tiempoMinutos: '60', repuestosMinimos: 'Batería, cargador',               tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Impresora',                materialConsumible: 'Tóner, papel',                          herramienta: 'Destornilladores, pinzas',           tiempoMinutos: '45', repuestosMinimos: 'Tóner, drum',                     tipoR: 2, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: false },
      { nombres: 'Servidor',                 materialConsumible: 'Pasta térmica, alcohol isopropílico',   herramienta: 'Destornilladores, multímetro',      tiempoMinutos: '90', repuestosMinimos: 'RAM, disco duro, fuente',         tipoR: 2, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: false },
      { nombres: 'UPS / Regulador',          materialConsumible: 'N/A',                                   herramienta: 'Multímetro',                        tiempoMinutos: '30', repuestosMinimos: 'Batería interna',                 tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Tablet',                   materialConsumible: 'N/A',                                   herramienta: 'Destornilladores de precisión',     tiempoMinutos: '30', repuestosMinimos: 'Batería, cargador',               tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Switch de Red',            materialConsumible: 'Alcohol isopropílico',                  herramienta: 'Soplador de aire',                  tiempoMinutos: '20', repuestosMinimos: 'Cables de red',                   tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Access Point',             materialConsumible: 'Alcohol isopropílico',                  herramienta: 'Soplador de aire',                  tiempoMinutos: '20', repuestosMinimos: 'N/A',                             tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Escáner',                  materialConsumible: 'Rodillos de limpieza, paño',            herramienta: 'Destornilladores, pinzas',           tiempoMinutos: '30', repuestosMinimos: 'Rodillos, pad separación',        tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
      { nombres: 'Monitor',                  materialConsumible: 'Paño microfibra, alcohol isopropílico', herramienta: 'Destornilladores',                  tiempoMinutos: '15', repuestosMinimos: 'Cable de video',                  tipoR: 2, actividad: 'Mantenimiento preventivo anual',     activo: true, requiereMetrologia: false },
    ];
    const T = {};
    for (const t of tiposDefSis) {
      T[t.nombres] = await foc(TipoEquipo, { nombres: t.nombres }, t);
    }
    console.log('  Catálogo base listo.\n');

    // ── 2. Usuario superadmin de respaldo (si no existe ningún admin) ─────────
    const superExistente = await Usuario.findOne({ where: { nombreUsuario: 'superadmin' } });
    let mainTecId;
    if (!superExistente) {
      console.log('Creando usuario superadmin...');
      const s = await Usuario.create({
        nombres: 'Super', apellidos: 'Admin', nombreUsuario: 'superadmin',
        tipoId: 'CC', numeroId: '0000000001', telefono: '3000000001',
        email: 'superadmin@husrt.local',
        contraseña: await bcrypt.hash('Super123*', 10),
        estado: true, rolId: rolSuper.id, cargoId: cargoAdmin.id,
        servicioId: SV['General'].id, mesaServicioRolId: mesaRolNone.id,
      });
      mainTecId = s.id;
      console.log('  superadmin creado.\n');
    } else {
      mainTecId = superExistente.id;
    }

    // ── 3. Roles y usuarios de Sistemas ──────────────────────────────────────
    console.log('Verificando usuarios de Sistemas...');
    const tecSistemas = await Usuario.findOne({ where: { nombreUsuario: 'deguerreroc' } });
    if (tecSistemas) mainTecId = tecSistemas.id;

    const passAdmin  = await bcrypt.hash('Admin2025*', 10);
    const passTec    = await bcrypt.hash('Husrt2025*', 10);

    const u1 = await Usuario.findOne({ where: { nombreUsuario: 'jgutierrez' } });
    if (!u1) {
      const nu = await Usuario.create({
        nombres: 'Julián Ernesto', apellidos: 'Gutiérrez Rocha', nombreUsuario: 'jgutierrez',
        tipoId: 'CC', numeroId: '8800001111', telefono: '3118001111',
        email: 'jgutierrez@husrt.gov.co', contraseña: passAdmin,
        estado: true, rolId: rolSysAdmin.id, cargoId: cargoAdmin.id,
        servicioId: SV['Sistemas TI'].id, mesaServicioRolId: mesaRolNone.id,
      });
      if (!tecSistemas) mainTecId = nu.id;
      console.log('  [CREADO] jgutierrez (SYSTEMADMIN)');
    } else {
      console.log('  [EXISTE] jgutierrez');
    }

    const u2 = await Usuario.findOne({ where: { nombreUsuario: 'ncastillo' } });
    if (!u2) {
      await Usuario.create({
        nombres: 'Nathalia', apellidos: 'Castillo Bernal', nombreUsuario: 'ncastillo',
        tipoId: 'CC', numeroId: '8800002222', telefono: '3118002222',
        email: 'ncastillo@husrt.gov.co', contraseña: passTec,
        estado: true, rolId: rolSysTec.id, cargoId: cargoSistemas.id,
        servicioId: SV['Sistemas TI'].id, mesaServicioRolId: mesaRolNone.id,
      });
      console.log('  [CREADO] ncastillo (SISTEMASTECNICO)');
    } else {
      console.log('  [EXISTE] ncastillo');
    }
    console.log(`  Técnico principal mantenimientos: Usuario ID ${mainTecId}\n`);

    // ── 4. Definición de los 47 equipos nuevos ────────────────────────────────
    const EQUIPOS_NUEVOS = [
      // COMPUTADORES DE ESCRITORIO (+10) SIS-054 a SIS-063
      { nombre_equipo:'PC Neonatología 1',           marca:'HP',        modelo:'EliteDesk 800 G8 SFF',      serie:'HPS24-060',  placa_inventario:'SIS-054', codigo:'TI-054', ubicacion:'NEONATOLOGÍA',     ubicacion_especifica:'Puesto principal',           ano_ingreso:'2024-02-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Neonatología'].id       },
      { nombre_equipo:'PC Neonatología 2',           marca:'Dell',      modelo:'OptiPlex 7090 MT',          serie:'DEL24-010',  placa_inventario:'SIS-055', codigo:'TI-055', ubicacion:'NEONATOLOGÍA',     ubicacion_especifica:'Puesto auxiliar',            ano_ingreso:'2024-02-10', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Neonatología'].id       },
      { nombre_equipo:'PC Aseguramiento',            marca:'Lenovo',    modelo:'ThinkCentre M80t',          serie:'LNV24-030',  placa_inventario:'SIS-056', codigo:'TI-056', ubicacion:'ASEGURAMIENTO',    ubicacion_especifica:'Oficina Aseguramiento',      ano_ingreso:'2023-08-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Aseguramiento'].id      },
      { nombre_equipo:'PC Epidemiología',            marca:'HP',        modelo:'ProDesk 405 G8 MT',         serie:'HPS23-055',  placa_inventario:'SIS-057', codigo:'TI-057', ubicacion:'EPIDEMIOLOGÍA',    ubicacion_especifica:'Área Epidemiología',         ano_ingreso:'2023-05-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Epidemiología'].id      },
      { nombre_equipo:'PC Financiera',               marca:'Dell',      modelo:'OptiPlex 3090 MT',          serie:'DEL22-055',  placa_inventario:'SIS-058', codigo:'TI-058', ubicacion:'FINANCIERA',       ubicacion_especifica:'Oficina Contabilidad',       ano_ingreso:'2022-11-08', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Financiera'].id         },
      { nombre_equipo:'PC Quirúrgicos 1',            marca:'HP',        modelo:'ProDesk 600 G6 MT',         serie:'HPS22-070',  placa_inventario:'SIS-059', codigo:'TI-059', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Sala Pre-Quirúrgica Est.1', ano_ingreso:'2022-04-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Quirúrgicos'].id        },
      { nombre_equipo:'PC Quirúrgicos 2',            marca:'Lenovo',    modelo:'ThinkCentre M720t',         serie:'LNV22-040',  placa_inventario:'SIS-060', codigo:'TI-060', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Sala Pre-Quirúrgica Est.2', ano_ingreso:'2022-04-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Quirúrgicos'].id        },
      { nombre_equipo:'PC Calidad',                  marca:'Dell',      modelo:'OptiPlex 5090 MT',          serie:'DEL23-050',  placa_inventario:'SIS-061', codigo:'TI-061', ubicacion:'CALIDAD',          ubicacion_especifica:'Oficina Calidad',            ano_ingreso:'2023-01-30', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Calidad'].id            },
      { nombre_equipo:'PC Radiología 2',             marca:'HP',        modelo:'Z2 Tower G5',               serie:'HPS23-025',  placa_inventario:'SIS-062', codigo:'TI-062', ubicacion:'IMÁGENES',         ubicacion_especifica:'Workstation Diagnóstico',   ano_ingreso:'2023-04-03', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Radiología e Imágenes'].id },
      { nombre_equipo:'PC Cirugía',                  marca:'Dell',      modelo:'OptiPlex 7080 MT',          serie:'DEL23-060',  placa_inventario:'SIS-063', codigo:'TI-063', ubicacion:'CIRUGÍA',          ubicacion_especifica:'Oficina Cirugía',            ano_ingreso:'2023-07-14', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Computador de Escritorio'].id, id_servicio_fk:SV['Cirugía'].id            },
      // PORTÁTILES (+5) SIS-064 a SIS-068
      { nombre_equipo:'Portátil Epidemiología',      marca:'HP',        modelo:'ProBook 445 G9',            serie:'LHPS-003',   placa_inventario:'SIS-064', codigo:'TI-064', ubicacion:'EPIDEMIOLOGÍA',    ubicacion_especifica:'Área Epidemiología',         ano_ingreso:'2023-05-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Portátil / Laptop'].id,         id_servicio_fk:SV['Epidemiología'].id      },
      { nombre_equipo:'Portátil Aseguramiento',      marca:'Dell',      modelo:'Latitude 5530',             serie:'LDEL-003',   placa_inventario:'SIS-065', codigo:'TI-065', ubicacion:'ASEGURAMIENTO',    ubicacion_especifica:'Oficina Aseguramiento',      ano_ingreso:'2023-08-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Portátil / Laptop'].id,         id_servicio_fk:SV['Aseguramiento'].id      },
      { nombre_equipo:'Portátil UCI Neonatal',       marca:'Lenovo',    modelo:'ThinkPad L15 Gen 3',        serie:'LLNV-002',   placa_inventario:'SIS-066', codigo:'TI-066', ubicacion:'UCI NEONATAL',     ubicacion_especifica:'Sala UCI Neonatal',          ano_ingreso:'2022-09-12', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Portátil / Laptop'].id,         id_servicio_fk:SV['UCI Neonatal'].id       },
      { nombre_equipo:'Portátil Financiera',         marca:'HP',        modelo:'EliteBook 850 G8',          serie:'LHPS-004',   placa_inventario:'SIS-067', codigo:'TI-067', ubicacion:'FINANCIERA',       ubicacion_especifica:'Gerencia Financiera',        ano_ingreso:'2022-11-08', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Portátil / Laptop'].id,         id_servicio_fk:SV['Financiera'].id         },
      { nombre_equipo:'Portátil Soporte TI 2',       marca:'Dell',      modelo:'Latitude 5540',             serie:'LDEL-004',   placa_inventario:'SIS-068', codigo:'TI-068', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI Soporte',            ano_ingreso:'2024-04-01', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T['Portátil / Laptop'].id,         id_servicio_fk:SV['Sistemas TI'].id        },
      // SERVIDORES (+3) SIS-069 a SIS-071
      { nombre_equipo:'Servidor Virtualización',     marca:'Dell',      modelo:'PowerEdge R740xd',          serie:'SRDEL-003',  placa_inventario:'SIS-069', codigo:'TI-069', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 2',         ano_ingreso:'2022-03-10', periodicidad:90,  activo:true, administrable:true,  numero_puertos:4, id_tipo_equipo_fk:T['Servidor'].id, id_servicio_fk:SV['Sistemas TI'].id },
      { nombre_equipo:'Servidor Active Directory',   marca:'HP',        modelo:'ProLiant DL360 Gen10',      serie:'SRHPS-002',  placa_inventario:'SIS-070', codigo:'TI-070', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 3',         ano_ingreso:'2022-03-10', periodicidad:90,  activo:true, administrable:true,  numero_puertos:2, id_tipo_equipo_fk:T['Servidor'].id, id_servicio_fk:SV['Sistemas TI'].id },
      { nombre_equipo:'Servidor Backup Cintas',      marca:'Lenovo',    modelo:'ThinkSystem SR630',         serie:'SRLNV-002',  placa_inventario:'SIS-071', codigo:'TI-071', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 3',         ano_ingreso:'2023-01-20', periodicidad:90,  activo:true, administrable:true,  numero_puertos:2, id_tipo_equipo_fk:T['Servidor'].id, id_servicio_fk:SV['Sistemas TI'].id },
      // IMPRESORAS (+5) SIS-072 a SIS-076
      { nombre_equipo:'Impresora Neonatología',      marca:'HP',        modelo:'LaserJet M404dn',           serie:'IMHPS-004',  placa_inventario:'SIS-072', codigo:'TI-072', ubicacion:'NEONATOLOGÍA',     ubicacion_especifica:'Puesto Enfermería',          ano_ingreso:'2022-10-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Impresora'].id, id_servicio_fk:SV['Neonatología'].id       },
      { nombre_equipo:'Impresora UCI Adulto',        marca:'Brother',   modelo:'HL-L6400DW',                serie:'IMBRO-002',  placa_inventario:'SIS-073', codigo:'TI-073', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Puesto Enfermería Central',  ano_ingreso:'2022-08-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Impresora'].id, id_servicio_fk:SV['UCI Adulto'].id         },
      { nombre_equipo:'Impresora Quirúrgicos',       marca:'Brother',   modelo:'HL-L8360CDW',               serie:'IMBRO-003',  placa_inventario:'SIS-074', codigo:'TI-074', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Sala Pre-Quirúrgica',        ano_ingreso:'2021-07-18', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Impresora'].id, id_servicio_fk:SV['Quirúrgicos'].id        },
      { nombre_equipo:'Impresora Multifunc. Calidad',marca:'HP',        modelo:'LaserJet MFP M428fdw',      serie:'IMHPS-005',  placa_inventario:'SIS-075', codigo:'TI-075', ubicacion:'CALIDAD',          ubicacion_especifica:'Oficina Calidad',            ano_ingreso:'2023-03-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Impresora'].id, id_servicio_fk:SV['Calidad'].id            },
      { nombre_equipo:'Impresora Epidemiología',     marca:'Canon',     modelo:'imageRUNNER 2630i',         serie:'IMCAN-002',  placa_inventario:'SIS-076', codigo:'TI-076', ubicacion:'EPIDEMIOLOGÍA',    ubicacion_especifica:'Área Epidemiología',         ano_ingreso:'2022-06-30', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T['Impresora'].id, id_servicio_fk:SV['Epidemiología'].id      },
      // SWITCHES (+3) SIS-077 a SIS-079
      { nombre_equipo:'Switch Distribución Piso 4',  marca:'Cisco',     modelo:'Catalyst 9200-24T',         serie:'SWCSC-004',  placa_inventario:'SIS-077', codigo:'TI-077', ubicacion:'GERENCIA',         ubicacion_especifica:'Cuarto Telecom. P4',         ano_ingreso:'2022-05-20', periodicidad:90,  activo:true, administrable:true,  numero_puertos:24, direccionamiento_Vlan:'VLAN 10,50', id_tipo_equipo_fk:T['Switch de Red'].id, id_servicio_fk:SV['Gerencia'].id         },
      { nombre_equipo:'Switch Distribución Piso 5',  marca:'HP',        modelo:'Aruba 2930F-24G',           serie:'SWHPS-003',  placa_inventario:'SIS-078', codigo:'TI-078', ubicacion:'GERENCIA',         ubicacion_especifica:'Cuarto Telecom. P5',         ano_ingreso:'2023-02-14', periodicidad:90,  activo:true, administrable:true,  numero_puertos:24, direccionamiento_Vlan:'VLAN 10,60', id_tipo_equipo_fk:T['Switch de Red'].id, id_servicio_fk:SV['Gerencia'].id         },
      { nombre_equipo:'Switch Laboratorio',          marca:'Cisco',     modelo:'SG350-28',                  serie:'SWCSC-005',  placa_inventario:'SIS-079', codigo:'TI-079', ubicacion:'LABORATORIO',      ubicacion_especifica:'Rack Laboratorio',           ano_ingreso:'2021-09-10', periodicidad:180, activo:true, administrable:true,  numero_puertos:28, direccionamiento_Vlan:'VLAN 20',    id_tipo_equipo_fk:T['Switch de Red'].id, id_servicio_fk:SV['Laboratorio Clínico'].id },
      // ACCESS POINTS (+5) SIS-080 a SIS-084
      { nombre_equipo:'AP Urgencias',                marca:'Ubiquiti',  modelo:'UniFi AP U6-Pro',           serie:'APUBI-001',  placa_inventario:'SIS-080', codigo:'TI-080', ubicacion:'URGENCIAS',        ubicacion_especifica:'Techo Sala Espera',          ano_ingreso:'2023-03-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Access Point'].id, id_servicio_fk:SV['Urgencias'].id         },
      { nombre_equipo:'AP UCI Adulto',               marca:'Ubiquiti',  modelo:'UniFi AP U6-LR',            serie:'APUBI-002',  placa_inventario:'SIS-081', codigo:'TI-081', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Techo Central UCI',          ano_ingreso:'2023-03-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Access Point'].id, id_servicio_fk:SV['UCI Adulto'].id        },
      { nombre_equipo:'AP Consulta Externa',         marca:'Cisco',     modelo:'Aironet 2802i',             serie:'APCCSC-001', placa_inventario:'SIS-082', codigo:'TI-082', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Pasillo Consultorios',       ano_ingreso:'2021-04-15', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Access Point'].id, id_servicio_fk:SV['Consulta Externa'].id  },
      { nombre_equipo:'AP Quirúrgicos',              marca:'Ubiquiti',  modelo:'UniFi AP U6-Mesh',          serie:'APUBI-003',  placa_inventario:'SIS-083', codigo:'TI-083', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Techo Sala Quirúrgica',      ano_ingreso:'2023-05-20', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Access Point'].id, id_servicio_fk:SV['Quirúrgicos'].id       },
      { nombre_equipo:'AP Laboratorio',              marca:'Ubiquiti',  modelo:'UniFi AP U6-Lite',          serie:'APUBI-004',  placa_inventario:'SIS-084', codigo:'TI-084', ubicacion:'LABORATORIO',      ubicacion_especifica:'Área Analítica',             ano_ingreso:'2022-01-20', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['Access Point'].id, id_servicio_fk:SV['Laboratorio Clínico'].id },
      // MONITORES (+5) SIS-085 a SIS-089
      { nombre_equipo:'Monitor Gerencia 1',          marca:'Dell',      modelo:'UltraSharp U2722D 27"',     serie:'MONDEL-002', placa_inventario:'SIS-085', codigo:'TI-085', ubicacion:'GERENCIA',         ubicacion_especifica:'Oficina Gerente Mon.1',      ano_ingreso:'2024-01-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Monitor'].id, id_servicio_fk:SV['Gerencia'].id         },
      { nombre_equipo:'Monitor Gerencia 2',          marca:'Dell',      modelo:'UltraSharp U2422H 24"',     serie:'MONDEL-003', placa_inventario:'SIS-086', codigo:'TI-086', ubicacion:'GERENCIA',         ubicacion_especifica:'Sala Juntas',                ano_ingreso:'2024-01-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Monitor'].id, id_servicio_fk:SV['Gerencia'].id         },
      { nombre_equipo:'Monitor Sistemas TI 2',       marca:'LG',        modelo:'34WN650-W UltraWide 34"',   serie:'MONLG-003',  placa_inventario:'SIS-087', codigo:'TI-087', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI Puesto 2',           ano_ingreso:'2023-09-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Monitor'].id, id_servicio_fk:SV['Sistemas TI'].id      },
      { nombre_equipo:'Monitor Consulta Externa 1',  marca:'Samsung',   modelo:'S24A400UJN 24"',            serie:'MONSAM-003', placa_inventario:'SIS-088', codigo:'TI-088', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Consultorio 4',              ano_ingreso:'2022-05-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Monitor'].id, id_servicio_fk:SV['Consulta Externa'].id  },
      { nombre_equipo:'Monitor Facturación',         marca:'Samsung',   modelo:'S22A334NHN 22"',            serie:'MONSAM-004', placa_inventario:'SIS-089', codigo:'TI-089', ubicacion:'FACTURACIÓN',      ubicacion_especifica:'Ventanilla 3',               ano_ingreso:'2021-12-01', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Monitor'].id, id_servicio_fk:SV['Facturación'].id      },
      // TABLETS (+3) SIS-090 a SIS-092
      { nombre_equipo:'Tableta UCI Neonatal',        marca:'Samsung',   modelo:'Galaxy Tab S8+ 12.4"',      serie:'TBLSAM-002', placa_inventario:'SIS-090', codigo:'TI-090', ubicacion:'UCI NEONATAL',     ubicacion_especifica:'Ronda de Enfermería',        ano_ingreso:'2024-01-20', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Tablet'].id, id_servicio_fk:SV['UCI Neonatal'].id       },
      { nombre_equipo:'Tableta Urgencias',           marca:'Apple',     modelo:'iPad Air 5a Gen 10.9"',     serie:'TBLAPL-002', placa_inventario:'SIS-091', codigo:'TI-091', ubicacion:'URGENCIAS',        ubicacion_especifica:'Sala de Observación',        ano_ingreso:'2023-10-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Tablet'].id, id_servicio_fk:SV['Urgencias'].id         },
      { nombre_equipo:'Tableta Visita Médica 2',     marca:'Samsung',   modelo:'Galaxy Tab A9+ 11"',        serie:'TBLSAM-003', placa_inventario:'SIS-092', codigo:'TI-092', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Ronda Médica Consultorios',  ano_ingreso:'2024-03-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Tablet'].id, id_servicio_fk:SV['Consulta Externa'].id  },
      // ESCÁNERES (+3) SIS-093 a SIS-095
      { nombre_equipo:'Escáner Laboratorio',         marca:'HP',        modelo:'ScanJet Pro 2000 s2',       serie:'ESCHPS-001', placa_inventario:'SIS-093', codigo:'TI-093', ubicacion:'LABORATORIO',      ubicacion_especifica:'Recepción Laboratorio',      ano_ingreso:'2022-07-15', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Escáner'].id, id_servicio_fk:SV['Laboratorio Clínico'].id },
      { nombre_equipo:'Escáner Facturación',         marca:'Fujitsu',   modelo:'fi-7030',                   serie:'ESCFUJ-002', placa_inventario:'SIS-094', codigo:'TI-094', ubicacion:'FACTURACIÓN',      ubicacion_especifica:'Ventanilla 1',               ano_ingreso:'2021-03-18', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Escáner'].id, id_servicio_fk:SV['Facturación'].id       },
      { nombre_equipo:'Escáner Urgencias',           marca:'Canon',     modelo:'DR-F120',                   serie:'ESCCAN-002', placa_inventario:'SIS-095', codigo:'TI-095', ubicacion:'URGENCIAS',        ubicacion_especifica:'Recepción Urgencias',        ano_ingreso:'2023-02-28', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['Escáner'].id, id_servicio_fk:SV['Urgencias'].id         },
      // UPS / REGULADORES (+5) SIS-096 a SIS-100
      { nombre_equipo:'UPS Data Center 1',           marca:'APC',       modelo:'Smart-UPS 3000VA LCD',      serie:'UPSAPC-001', placa_inventario:'SIS-096', codigo:'TI-096', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',         ano_ingreso:'2021-01-15', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['UPS / Regulador'].id, id_servicio_fk:SV['Sistemas TI'].id       },
      { nombre_equipo:'UPS Data Center 2',           marca:'APC',       modelo:'Smart-UPS 3000VA LCD',      serie:'UPSAPC-002', placa_inventario:'SIS-097', codigo:'TI-097', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 2',         ano_ingreso:'2021-01-15', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T['UPS / Regulador'].id, id_servicio_fk:SV['Sistemas TI'].id       },
      { nombre_equipo:'UPS Urgencias',               marca:'APC',       modelo:'Back-UPS Pro 1500VA',       serie:'UPSAPC-003', placa_inventario:'SIS-098', codigo:'TI-098', ubicacion:'URGENCIAS',        ubicacion_especifica:'Rack Urgencias',             ano_ingreso:'2022-06-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['UPS / Regulador'].id, id_servicio_fk:SV['Urgencias'].id         },
      { nombre_equipo:'UPS UCI Adulto',              marca:'Eaton',     modelo:'5S 1500VA',                 serie:'UPSETN-001', placa_inventario:'SIS-099', codigo:'TI-099', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Rack UCI',                   ano_ingreso:'2023-03-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['UPS / Regulador'].id, id_servicio_fk:SV['UCI Adulto'].id        },
      { nombre_equipo:'UPS UCI Neonatal',            marca:'Tripp Lite',modelo:'SMART1500LCDT',             serie:'UPSTLC-001', placa_inventario:'SIS-100', codigo:'TI-100', ubicacion:'UCI NEONATAL',     ubicacion_especifica:'Rack Neonatal',              ano_ingreso:'2023-07-12', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T['UPS / Regulador'].id, id_servicio_fk:SV['UCI Neonatal'].id      },
    ];

    // ── 5. Crear equipos ──────────────────────────────────────────────────────
    console.log(`Creando ${EQUIPOS_NUEVOS.length} equipos (SIS-054 a SIS-100)...`);

    const FECHAS_PREV = [
      ['2024-05-10','2024-11-08'],['2024-06-14','2024-12-06'],
      ['2024-03-22','2024-09-20'],['2024-07-19','2025-01-17'],
      ['2024-04-05','2024-10-04'],
    ];
    const FECHAS_CORR = ['2025-02-10','2025-02-20','2025-03-05','2025-03-18','2025-04-02','2025-04-15','2025-05-07'];

    let creados = 0, omitidos = 0;

    for (let i = 0; i < EQUIPOS_NUEVOS.length; i++) {
      const eq = EQUIPOS_NUEVOS[i];
      const existente = await SysEquipo.findOne({ where: { placa_inventario: eq.placa_inventario } });

      if (existente) {
        const countMtto = await SysReporte.count({ where: { id_sysequipo_fk: existente.id_sysequipo } });
        if (countMtto === 0 && eq.id_servicio_fk) {
          const fp = pick(FECHAS_PREV, i);
          await SysReporte.create(buildPrev(existente.id_sysequipo, eq.id_servicio_fk, mainTecId, fp[0], i));
          await SysReporte.create(buildPrev(existente.id_sysequipo, eq.id_servicio_fk, mainTecId, fp[1], i+20));
          if (i % 3 !== 0) await SysReporte.create(buildCorr(existente.id_sysequipo, eq.id_servicio_fk, mainTecId, pick(FECHAS_CORR, i), i));
          console.log(`  [MTTO AÑADIDO] ${existente.nombre_equipo}`);
        } else {
          console.log(`  [EXISTE]        ${eq.nombre_equipo}`);
        }
        omitidos++;
        continue;
      }

      const tipoNombre = Object.keys(T).find(k => T[k].id === eq.id_tipo_equipo_fk) || 'Monitor';
      const equipo = await SysEquipo.create(eq);
      await SysHojaVida.create(buildHV(equipo.id_sysequipo, i, tipoNombre));

      const fp = pick(FECHAS_PREV, i);
      await SysReporte.create(buildPrev(equipo.id_sysequipo, eq.id_servicio_fk, mainTecId, fp[0], i));
      await SysReporte.create(buildPrev(equipo.id_sysequipo, eq.id_servicio_fk, mainTecId, fp[1], i+20));
      if (i % 3 !== 0) await SysReporte.create(buildCorr(equipo.id_sysequipo, eq.id_servicio_fk, mainTecId, pick(FECHAS_CORR, i), i));

      console.log(`  [CREADO] ${equipo.nombre_equipo} — ID ${equipo.id_sysequipo}`);
      creados++;
    }
    console.log(`\n  Equipos creados: ${creados} | Omitidos: ${omitidos}\n`);

    // ── 6. Módulo Backups ─────────────────────────────────────────────────────
    console.log('Creando módulo Backups (SistemaInformacion + BackupSistema)...');

    const SISTEMAS_INFO = [
      { nombre:'HIS NEXUS — Sistema de Información Hospitalario', descripcion:'Sistema central de gestión hospitalaria: admisiones, historia clínica, facturación y estadísticas.', tipo:'ERP Hospitalario',   estado:true, version:'12.4.1',               fecha_implementacion:'2018-03-01', tecnologia:'Java / Oracle DB 19c',           url:'http://his.husrt.gov.co'          },
      { nombre:'PACS — Gestión de Imágenes Diagnósticas',         descripcion:'Almacenamiento, visualización y distribución de imágenes radiológicas (RX, TAC, RM, Ecografía).', tipo:'PACS/RIS',            estado:true, version:'6.2.0',                fecha_implementacion:'2019-07-15', tecnologia:'DCM4CHEE / PostgreSQL 14',       url:'http://pacs.husrt.gov.co'         },
      { nombre:'LIS — Laboratorio Clínico',                       descripcion:'Gestión de solicitudes, resultados y control de calidad del laboratorio clínico.', tipo:'LIS',                  estado:true, version:'4.1.3',                fecha_implementacion:'2020-02-10', tecnologia:'Node.js / MariaDB 10.6',         url:'http://lis.husrt.gov.co'          },
      { nombre:'Sistema de Facturación SIIF',                     descripcion:'Facturación electrónica DIAN y cuentas de cobro a aseguradoras y particulares.', tipo:'Facturación',          estado:true, version:'3.8.2',                fecha_implementacion:'2017-11-20', tecnologia:'PHP / MySQL 8.0',               url:'http://facturacion.husrt.gov.co'  },
      { nombre:'Portal Web Institucional HUSRT',                  descripcion:'Sitio web corporativo, citas en línea, resultados de laboratorio y comunicados a pacientes.', tipo:'Portal Web',           estado:true, version:'2.3.0',                fecha_implementacion:'2021-05-01', tecnologia:'WordPress / PHP / MySQL',       url:'http://www.husrt.gov.co'          },
      { nombre:'Correo Corporativo Exchange 2019',                descripcion:'Servidor de correo electrónico institucional con Exchange Server 2019.', tipo:'Comunicaciones',       estado:true, version:'2019 CU13',             fecha_implementacion:'2020-09-15', tecnologia:'MS Exchange 2019 / AD DS',      url:'http://mail.husrt.gov.co'         },
      { nombre:'Sistema de RRHH y Nómina',                        descripcion:'Gestión de nómina, contratación, vacaciones, capacitaciones y evaluación de desempeño.', tipo:'RRHH',                 estado:true, version:'5.1.0',                fecha_implementacion:'2019-01-08', tecnologia:'.NET / SQL Server 2019',        url:'http://rrhh.husrt.gov.co'         },
      { nombre:'Sistema de Farmacia Hospitecnia',                  descripcion:'Control de inventario de medicamentos, dispensación y control de vencimientos.', tipo:'Farmacia',             estado:true, version:'3.4.1',                fecha_implementacion:'2018-08-20', tecnologia:'Delphi / Firebird 3.0',         url:'http://farmacia.husrt.gov.co'     },
      { nombre:'Contabilidad SIIGO Empresarial',                  descripcion:'Contabilidad, activos fijos, cuentas por pagar y estados financieros.', tipo:'ERP Financiero',       estado:true, version:'8.2.0',                fecha_implementacion:'2016-04-01', tecnologia:'SIIGO / SQL Server 2017',       url:'http://contabilidad.husrt.gov.co' },
      { nombre:'Active Directory — Directorio Corporativo',       descripcion:'Directorio de usuarios, grupos, políticas de seguridad y autenticación centralizada.', tipo:'Infraestructura',      estado:true, version:'Windows Server 2022 AD DS', fecha_implementacion:'2015-06-01', tecnologia:'Windows AD DS / LDAP / Kerberos', url:'ldap://ad.husrt.gov.co'          },
    ];

    const BACKUP_REGISTROS = [
      { fecha:'2024-07-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 18 GB. Verificación de restauración: OK.'              },
      { fecha:'2024-08-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 19 GB. Sin errores en el proceso.'                     },
      { fecha:'2024-09-30', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 19.5 GB. Guardado en NAS y cinta.'                     },
      { fecha:'2024-10-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 20 GB. Almacenado en servidor de respaldo.'            },
      { fecha:'2024-11-30', tipo:'Mensual completo',   estado:'Fallido',       obs:'Error de conexión al NAS. Proceso interrumpido. Se reprogramó para el día siguiente.' },
      { fecha:'2024-12-01', tipo:'Mensual correctivo', estado:'Completado',    obs:'Backup de recuperación exitoso tras fallo previo. Tamaño: 20.1 GB.'           },
      { fecha:'2024-12-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup fin de año. Tamaño: 21 GB. Copia adicional en storage externo.'        },
      { fecha:'2025-01-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup enero. Tamaño: 21.5 GB. Verificación OK.'                              },
      { fecha:'2025-02-28', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 22 GB. NAS al 65% de capacidad.'                      },
      { fecha:'2025-03-31', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 22.5 GB. Proceso completado en 47 minutos.'           },
      { fecha:'2025-04-30', tipo:'Mensual completo',   estado:'Completado',    obs:'Backup exitoso. Tamaño: 23 GB. Sin incidentes.'                               },
      { fecha:'2025-05-31', tipo:'Mensual completo',   estado:'Pendiente',     obs:'Programado para fin de mes. Pendiente de ejecución.'                          },
    ];
    const FRECUENCIAS = ['Mensual','Semanal','Mensual','Mensual','Diario','Mensual','Mensual','Mensual','Mensual','Diario'];

    let sysCreados = 0, bkpCreados = 0;
    for (let idx = 0; idx < SISTEMAS_INFO.length; idx++) {
      const si = SISTEMAS_INFO[idx];
      let sistema = await SistemaInformacion.findOne({ where: { nombre: si.nombre } });
      if (!sistema) {
        sistema = await SistemaInformacion.create(si);
        sysCreados++;
        console.log(`  [CREADO] ${si.nombre.substring(0,55)}`);
      } else {
        console.log(`  [EXISTE] ${si.nombre.substring(0,55)}`);
      }

      const existingBkps = await BackupSistema.count({ where: { sistemaInformacionId: sistema.id } });
      if (existingBkps === 0) {
        const sel = BACKUP_REGISTROS.filter((_, j) => (j + idx) % 2 === 0).slice(0, 6);
        for (const b of sel) {
          await BackupSistema.create({
            sistemaInformacionId: sistema.id,
            fecha:            b.fecha,
            tipo:             b.tipo,
            estado:           b.estado,
            frecuencia_backup: FRECUENCIAS[idx % FRECUENCIAS.length],
            observacion:      b.obs,
          });
          bkpCreados++;
        }
        console.log(`    + ${sel.length} backups creados`);
      } else {
        console.log(`    (${existingBkps} backups ya existen)`);
      }
    }

    // ── Resumen ───────────────────────────────────────────────────────────────
    const totalEq  = await SysEquipo.count();
    const totalHV  = await SysHojaVida.count();
    const totalRep = await SysReporte.count();
    const totalSI  = await SistemaInformacion.count();
    const totalBkp = await BackupSistema.count();

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  SEED COMPLETADO — RESUMEN');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  SysEquipo total en BD:          ${totalEq}`);
    console.log(`    Equipos creados este run:     ${creados}`);
    console.log(`  SysHojaVida total en BD:        ${totalHV}`);
    console.log(`  SysReporte/Mto total en BD:     ${totalRep}`);
    console.log(`  SistemaInformacion total BD:    ${totalSI}`);
    console.log(`    Sistemas creados este run:    ${sysCreados}`);
    console.log(`  BackupSistema total en BD:      ${totalBkp}`);
    console.log(`    Backups creados este run:     ${bkpCreados}`);
    console.log('══════════════════════════════════════════════════════════════');
    console.log('\nUsuarios de Sistemas:');
    console.log('  jgutierrez  / Admin2025*   (SYSTEMADMIN)');
    console.log('  ncastillo   / Husrt2025*   (SISTEMASTECNICO)');
    console.log('══════════════════════════════════════════════════════════════\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    if (err.errors)  err.errors.forEach(e => console.error('  -', e.message));
    if (err.original) console.error('  DB:', err.original.message);
    await sequelize.close();
    process.exit(1);
  }
})();
