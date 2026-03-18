require('dotenv').config();
const sequelize = require('../config/configDb');
const SysEquipo = require('../models/Sistemas/SysEquipo');
const SysHojaVida = require('../models/Sistemas/SysHojaVida');

// IDs de tipos de equipo (tipoR=2 Sistemas) según imagen
// 121=IMPRESORA, 122=COMPUTADOR PORTATIL, 123=COMPUTADOR, 124=ESCANER
// 125=LECTOR CODIGO BARRAS, 126=ROBOTRIMEGE, 127=TABLETA, 128=TORRE
// 129=VIDEO BEAM, 130=SWITCH, 134=SERVIDORES
// 1241=MONITOR, 1255=MONITOR PC, 1339=BIOMETRICOS, 1340=ROUTER
// 1347=TELEFONO, 1376=COMPUTADORES

const equipos = [
  // ── COMPUTADOR (tipo 123) ── 10 unidades ──────────────────────────────────
  {
    nombre_equipo: 'PC Urgencias 02',
    marca: 'Dell',
    modelo: 'OptiPlex 7090',
    serie: 'SN-DL-U02-2022',
    placa_inventario: 'INV-SYS-011',
    codigo: 'PC-URG-002',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Estación de Enfermería 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-05-10',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC UCI 02',
    marca: 'HP',
    modelo: 'ProDesk 600 G6',
    serie: 'SN-HP-U02-2022',
    placa_inventario: 'INV-SYS-012',
    codigo: 'PC-UCI-002',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Puesto Médico Central',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-08-15',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Farmacia 01',
    marca: 'Lenovo',
    modelo: 'ThinkCentre M80s',
    serie: 'SN-LN-F01-2023',
    placa_inventario: 'INV-SYS-013',
    codigo: 'PC-FAR-001',
    ubicacion: 'Farmacia',
    ubicacion_especifica: 'Mostrador Principal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-02-20',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Recursos Humanos',
    marca: 'HP',
    modelo: 'ProDesk 400 G7',
    serie: 'SN-HP-RH-2021',
    placa_inventario: 'INV-SYS-014',
    codigo: 'PC-RH-001',
    ubicacion: 'Recursos Humanos',
    ubicacion_especifica: 'Oficina RRHH',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-09-01',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Contabilidad 01',
    marca: 'Dell',
    modelo: 'OptiPlex 5090',
    serie: 'SN-DL-CO1-2022',
    placa_inventario: 'INV-SYS-015',
    codigo: 'PC-CON-001',
    ubicacion: 'Contabilidad',
    ubicacion_especifica: 'Puesto 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-01-15',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Hospitalización 01',
    marca: 'HP',
    modelo: 'EliteDesk 800 G8',
    serie: 'SN-HP-H01-2023',
    placa_inventario: 'INV-SYS-016',
    codigo: 'PC-HOS-001',
    ubicacion: 'Hospitalización',
    ubicacion_especifica: 'Enfermería Piso 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-03-10',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Pediatría 01',
    marca: 'Lenovo',
    modelo: 'ThinkCentre Neo 50q',
    serie: 'SN-LN-P01-2022',
    placa_inventario: 'INV-SYS-017',
    codigo: 'PC-PED-001',
    ubicacion: 'Pediatría',
    ubicacion_especifica: 'Consultorio Pediatría 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-06-05',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Ginecología 01',
    marca: 'Dell',
    modelo: 'OptiPlex 3090',
    serie: 'SN-DL-G01-2021',
    placa_inventario: 'INV-SYS-018',
    codigo: 'PC-GIN-001',
    ubicacion: 'Ginecología',
    ubicacion_especifica: 'Consultorio Ginecología',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-11-20',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Cirugía 01',
    marca: 'HP',
    modelo: 'ProDesk 600 G6',
    serie: 'SN-HP-CI1-2022',
    placa_inventario: 'INV-SYS-019',
    codigo: 'PC-CIR-001',
    ubicacion: 'Cirugía',
    ubicacion_especifica: 'Pre-quirófano',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-04-18',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 123
  },
  {
    nombre_equipo: 'PC Sistemas 01',
    marca: 'Dell',
    modelo: 'OptiPlex 7090',
    serie: 'SN-DL-SIS-2023',
    placa_inventario: 'INV-SYS-020',
    codigo: 'PC-SIS-001',
    ubicacion: 'Sistemas',
    ubicacion_especifica: 'Oficina Sistemas',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-01-20',
    periodicidad: 6,
    administrable: true,
    id_tipo_equipo_fk: 123
  },

  // ── COMPUTADOR PORTATIL (tipo 122) ── 6 unidades ─────────────────────────
  {
    nombre_equipo: 'Laptop Gerencia 01',
    marca: 'Dell',
    modelo: 'Latitude 5520',
    serie: 'SN-DL-LG1-2023',
    placa_inventario: 'INV-SYS-021',
    codigo: 'LAP-GER-001',
    ubicacion: 'Gerencia',
    ubicacion_especifica: 'Oficina Gerente General',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-05-10',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 122
  },
  {
    nombre_equipo: 'Laptop Administración 01',
    marca: 'HP',
    modelo: 'EliteBook 840 G8',
    serie: 'SN-HP-LA1-2022',
    placa_inventario: 'INV-SYS-022',
    codigo: 'LAP-ADM-001',
    ubicacion: 'Administración',
    ubicacion_especifica: 'Coordinación Administrativa',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-10-05',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 122
  },
  {
    nombre_equipo: 'Laptop Sistemas',
    marca: 'Lenovo',
    modelo: 'ThinkPad T14 Gen 2',
    serie: 'SN-LN-LS1-2023',
    placa_inventario: 'INV-SYS-023',
    codigo: 'LAP-SIS-001',
    ubicacion: 'Sistemas',
    ubicacion_especifica: 'Oficina Sistemas',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-02-15',
    periodicidad: 12,
    administrable: true,
    id_tipo_equipo_fk: 122
  },
  {
    nombre_equipo: 'Laptop Consulta Externa 02',
    marca: 'HP',
    modelo: 'ProBook 450 G8',
    serie: 'SN-HP-CE2-2022',
    placa_inventario: 'INV-SYS-024',
    codigo: 'LAP-CE-002',
    ubicacion: 'Consulta Externa',
    ubicacion_especifica: 'Sala de Espera',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-07-20',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 122
  },
  {
    nombre_equipo: 'Laptop UCI Coordinadora',
    marca: 'Dell',
    modelo: 'Latitude 7420',
    serie: 'SN-DL-LU1-2023',
    placa_inventario: 'INV-SYS-025',
    codigo: 'LAP-UCI-001',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Coordinación UCI',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-04-01',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 122
  },
  {
    nombre_equipo: 'Laptop Capacitación',
    marca: 'Lenovo',
    modelo: 'IdeaPad 3 15ITL6',
    serie: 'SN-LN-LC1-2021',
    placa_inventario: 'INV-SYS-026',
    codigo: 'LAP-CAP-001',
    ubicacion: 'Sala de Capacitación',
    ubicacion_especifica: 'Mesa del Instructor',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-08-10',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 122
  },

  // ── IMPRESORA (tipo 121) ── 6 unidades ───────────────────────────────────
  {
    nombre_equipo: 'Impresora Administración',
    marca: 'HP',
    modelo: 'LaserJet Pro M404dn',
    serie: 'SN-HP-IA1-2022',
    placa_inventario: 'INV-SYS-027',
    codigo: 'IMP-ADM-001',
    ubicacion: 'Administración',
    ubicacion_especifica: 'Área Común Piso 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-02-28',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 121
  },
  {
    nombre_equipo: 'Impresora Urgencias',
    marca: 'Epson',
    modelo: 'EcoTank L3150',
    serie: 'SN-EP-IU1-2021',
    placa_inventario: 'INV-SYS-028',
    codigo: 'IMP-URG-001',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Mostrador Urgencias',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-06-15',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 121
  },
  {
    nombre_equipo: 'Impresora Facturación',
    marca: 'HP',
    modelo: 'LaserJet Enterprise M507dn',
    serie: 'SN-HP-IF1-2022',
    placa_inventario: 'INV-SYS-029',
    codigo: 'IMP-FAC-001',
    ubicacion: 'Caja y Facturación',
    ubicacion_especifica: 'Área Facturación',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-03-10',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 121
  },
  {
    nombre_equipo: 'Impresora Farmacia',
    marca: 'Brother',
    modelo: 'HL-L2350DW',
    serie: 'SN-BR-IF1-2020',
    placa_inventario: 'INV-SYS-030',
    codigo: 'IMP-FAR-001',
    ubicacion: 'Farmacia',
    ubicacion_especifica: 'Despacho Farmacia',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2020-11-05',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 121
  },
  {
    nombre_equipo: 'Impresora Laboratorio',
    marca: 'HP',
    modelo: 'LaserJet Pro M428fdw',
    serie: 'SN-HP-IL1-2023',
    placa_inventario: 'INV-SYS-031',
    codigo: 'IMP-LAB-001',
    ubicacion: 'Laboratorio Clínico',
    ubicacion_especifica: 'Área de Resultados',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-01-25',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 121
  },
  {
    nombre_equipo: 'Impresora Gerencia',
    marca: 'Canon',
    modelo: 'PIXMA G5010',
    serie: 'SN-CA-IG1-2022',
    placa_inventario: 'INV-SYS-032',
    codigo: 'IMP-GER-001',
    ubicacion: 'Gerencia',
    ubicacion_especifica: 'Secretaría Gerencia',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-09-12',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 121
  },

  // ── MONITOR PC (tipo 1255) ── 5 unidades ──────────────────────────────────
  {
    nombre_equipo: 'Monitor Administración 01',
    marca: 'Dell',
    modelo: 'U2421E 24"',
    serie: 'SN-DL-MA1-2022',
    placa_inventario: 'INV-SYS-033',
    codigo: 'MON-ADM-001',
    ubicacion: 'Administración',
    ubicacion_especifica: 'Cubículo 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-03-20',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1255
  },
  {
    nombre_equipo: 'Monitor UCI 01',
    marca: 'HP',
    modelo: 'E24 G4 23.8"',
    serie: 'SN-HP-MU1-2022',
    placa_inventario: 'INV-SYS-034',
    codigo: 'MON-UCI-001',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Estación Central',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-08-20',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1255
  },
  {
    nombre_equipo: 'Monitor Urgencias 01',
    marca: 'LG',
    modelo: '24MK430H 24"',
    serie: 'SN-LG-MUG1-2021',
    placa_inventario: 'INV-SYS-035',
    codigo: 'MON-URG-001',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Estación de Enfermería 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-07-25',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1255
  },
  {
    nombre_equipo: 'Monitor Laboratorio Clínico',
    marca: 'Samsung',
    modelo: 'C24F396FH 24"',
    serie: 'SN-SA-ML1-2022',
    placa_inventario: 'INV-SYS-036',
    codigo: 'MON-LAB-001',
    ubicacion: 'Laboratorio Clínico',
    ubicacion_especifica: 'Puesto Analista',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-09-08',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1255
  },
  {
    nombre_equipo: 'Monitor Sistemas',
    marca: 'Dell',
    modelo: 'S2721DS 27"',
    serie: 'SN-DL-MS1-2023',
    placa_inventario: 'INV-SYS-037',
    codigo: 'MON-SIS-001',
    ubicacion: 'Sistemas',
    ubicacion_especifica: 'Oficina Sistemas',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-01-22',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1255
  },

  // ── SWITCH (tipo 130) ── 3 unidades ──────────────────────────────────────
  {
    nombre_equipo: 'Switch Core Piso 1',
    marca: 'Cisco',
    modelo: 'Catalyst 2960-X 24-Port',
    serie: 'SN-CI-SC1-2020',
    placa_inventario: 'INV-SYS-038',
    codigo: 'SWT-CORE-001',
    ubicacion: 'Cuarto de Telecomunicaciones',
    ubicacion_especifica: 'Rack Principal Piso 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2020-03-15',
    periodicidad: 12,
    administrable: true,
    numero_puertos: 24,
    id_tipo_equipo_fk: 130
  },
  {
    nombre_equipo: 'Switch Distribución Piso 2',
    marca: 'TP-Link',
    modelo: 'TL-SG1024 24-Port',
    serie: 'SN-TP-SP2-2021',
    placa_inventario: 'INV-SYS-039',
    codigo: 'SWT-P2-001',
    ubicacion: 'Cuarto de Telecomunicaciones',
    ubicacion_especifica: 'Rack Distribución Piso 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-04-20',
    periodicidad: 12,
    administrable: true,
    numero_puertos: 24,
    id_tipo_equipo_fk: 130
  },
  {
    nombre_equipo: 'Switch Urgencias',
    marca: 'Cisco',
    modelo: 'SG350-28 28-Port',
    serie: 'SN-CI-SU1-2022',
    placa_inventario: 'INV-SYS-040',
    codigo: 'SWT-URG-001',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Rack Local Urgencias',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-02-10',
    periodicidad: 12,
    administrable: true,
    numero_puertos: 28,
    id_tipo_equipo_fk: 130
  },

  // ── ROUTER (tipo 1340) ── 2 unidades ─────────────────────────────────────
  {
    nombre_equipo: 'Router Principal',
    marca: 'Cisco',
    modelo: 'ISR 4321',
    serie: 'SN-CI-RP1-2019',
    placa_inventario: 'INV-SYS-041',
    codigo: 'RTR-MAIN-001',
    ubicacion: 'Cuarto de Telecomunicaciones',
    ubicacion_especifica: 'Rack Principal - Slot 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2019-08-05',
    periodicidad: 12,
    administrable: true,
    id_tipo_equipo_fk: 1340
  },
  {
    nombre_equipo: 'Router Backup',
    marca: 'MikroTik',
    modelo: 'RB750Gr3',
    serie: 'SN-MK-RB1-2021',
    placa_inventario: 'INV-SYS-042',
    codigo: 'RTR-BCK-001',
    ubicacion: 'Cuarto de Telecomunicaciones',
    ubicacion_especifica: 'Rack Principal - Slot 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-01-18',
    periodicidad: 12,
    administrable: true,
    id_tipo_equipo_fk: 1340
  },

  // ── BIOMETRICOS (tipo 1339) ── 3 unidades ─────────────────────────────────
  {
    nombre_equipo: 'Lector Biométrico Entrada Principal',
    marca: 'ZKTeco',
    modelo: 'F18',
    serie: 'SN-ZK-BE1-2022',
    placa_inventario: 'INV-SYS-043',
    codigo: 'BIO-ENT-001',
    ubicacion: 'Entrada Principal',
    ubicacion_especifica: 'Portería Principal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-05-05',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1339
  },
  {
    nombre_equipo: 'Lector Biométrico Administración',
    marca: 'ZKTeco',
    modelo: 'SF300',
    serie: 'SN-ZK-BA1-2022',
    placa_inventario: 'INV-SYS-044',
    codigo: 'BIO-ADM-001',
    ubicacion: 'Administración',
    ubicacion_especifica: 'Puerta Acceso Administración',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-05-06',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1339
  },
  {
    nombre_equipo: 'Lector Biométrico UCI',
    marca: 'Hikvision',
    modelo: 'DS-K1T8003',
    serie: 'SN-HK-BU1-2023',
    placa_inventario: 'INV-SYS-045',
    codigo: 'BIO-UCI-001',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Puerta Acceso UCI',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-03-15',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 1339
  },

  // ── TABLETA (tipo 127) ── 3 unidades ──────────────────────────────────────
  {
    nombre_equipo: 'Tableta UCI Médicos',
    marca: 'Samsung',
    modelo: 'Galaxy Tab S7 FE',
    serie: 'SN-SA-TU1-2022',
    placa_inventario: 'INV-SYS-046',
    codigo: 'TAB-UCI-001',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Estación de Médicos',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-11-10',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 127
  },
  {
    nombre_equipo: 'Tableta Visita Domiciliaria',
    marca: 'Apple',
    modelo: 'iPad Air 5ta Gen',
    serie: 'SN-AP-TV1-2023',
    placa_inventario: 'INV-SYS-047',
    codigo: 'TAB-VD-001',
    ubicacion: 'Consulta Externa',
    ubicacion_especifica: 'Coordinación Extramural',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-04-20',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 127
  },
  {
    nombre_equipo: 'Tableta Consulta Externa',
    marca: 'Lenovo',
    modelo: 'Tab P11 Pro Gen 2',
    serie: 'SN-LN-TC1-2022',
    placa_inventario: 'INV-SYS-048',
    codigo: 'TAB-CE-001',
    ubicacion: 'Consulta Externa',
    ubicacion_especifica: 'Recepción Consulta Externa',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-09-30',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 127
  },

  // ── VIDEO BEAM (tipo 129) ── 2 unidades ──────────────────────────────────
  {
    nombre_equipo: 'Video Beam Sala Capacitación',
    marca: 'Epson',
    modelo: 'PowerLite 980W',
    serie: 'SN-EP-VC1-2021',
    placa_inventario: 'INV-SYS-049',
    codigo: 'VB-CAP-001',
    ubicacion: 'Sala de Capacitación',
    ubicacion_especifica: 'Techo Sala Principal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-05-10',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 129
  },
  {
    nombre_equipo: 'Video Beam Sala de Juntas',
    marca: 'BenQ',
    modelo: 'MW550',
    serie: 'SN-BQ-VJ1-2022',
    placa_inventario: 'INV-SYS-050',
    codigo: 'VB-JUN-001',
    ubicacion: 'Sala de Juntas',
    ubicacion_especifica: 'Pared Frontal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-07-18',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 129
  },

  // ── ESCANER (tipo 124) ── 3 unidades ──────────────────────────────────────
  {
    nombre_equipo: 'Escáner Archivo Clínico',
    marca: 'Epson',
    modelo: 'DS-870',
    serie: 'SN-EP-EA1-2022',
    placa_inventario: 'INV-SYS-051',
    codigo: 'ESC-ARC-001',
    ubicacion: 'Archivo Clínico',
    ubicacion_especifica: 'Puesto Digitalización',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-04-05',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 124
  },
  {
    nombre_equipo: 'Escáner Administración',
    marca: 'HP',
    modelo: 'ScanJet Pro 3600 f1',
    serie: 'SN-HP-EA1-2021',
    placa_inventario: 'INV-SYS-052',
    codigo: 'ESC-ADM-001',
    ubicacion: 'Administración',
    ubicacion_especifica: 'Área Común Piso 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-03-20',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 124
  },
  {
    nombre_equipo: 'Escáner Facturación',
    marca: 'Fujitsu',
    modelo: 'fi-7160',
    serie: 'SN-FJ-EF1-2023',
    placa_inventario: 'INV-SYS-053',
    codigo: 'ESC-FAC-001',
    ubicacion: 'Caja y Facturación',
    ubicacion_especifica: 'Ventanilla Radicación',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-02-28',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 124
  },

  // ── LECTOR CODIGO BARRAS (tipo 125) ── 2 unidades ─────────────────────────
  {
    nombre_equipo: 'Lector Código Barras Farmacia',
    marca: 'Honeywell',
    modelo: 'Voyager 1200g',
    serie: 'SN-HW-LF1-2022',
    placa_inventario: 'INV-SYS-054',
    codigo: 'LCB-FAR-001',
    ubicacion: 'Farmacia',
    ubicacion_especifica: 'Mostrador Dispensación',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-01-10',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 125
  },
  {
    nombre_equipo: 'Lector Código Barras Almacén',
    marca: 'Symbol',
    modelo: 'LS2208',
    serie: 'SN-SY-LA1-2020',
    placa_inventario: 'INV-SYS-055',
    codigo: 'LCB-ALM-001',
    ubicacion: 'Almacén',
    ubicacion_especifica: 'Mesa de Recepción Almacén',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2020-09-14',
    periodicidad: 12,
    administrable: false,
    id_tipo_equipo_fk: 125
  },

  // ── TORRE (tipo 128) ── 2 unidades ────────────────────────────────────────
  {
    nombre_equipo: 'Torre Servidor Backup',
    marca: 'HP',
    modelo: 'Tower 580 G8',
    serie: 'SN-HP-TB1-2022',
    placa_inventario: 'INV-SYS-056',
    codigo: 'TOR-BCK-001',
    ubicacion: 'Cuarto de Servidores',
    ubicacion_especifica: 'Rack Secundario',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-06-01',
    periodicidad: 6,
    administrable: true,
    id_tipo_equipo_fk: 128
  },
  {
    nombre_equipo: 'Torre Workstation Imagenología',
    marca: 'Dell',
    modelo: 'Precision Tower 3650',
    serie: 'SN-DL-TI1-2023',
    placa_inventario: 'INV-SYS-057',
    codigo: 'TOR-IMG-001',
    ubicacion: 'Imagenología',
    ubicacion_especifica: 'Sala de Lectura Radiológica',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-01-08',
    periodicidad: 6,
    administrable: false,
    id_tipo_equipo_fk: 128
  },

  // ── SERVIDORES (tipo 134) ── 1 unidad ─────────────────────────────────────
  {
    nombre_equipo: 'Servidor Principal HIS',
    marca: 'Dell',
    modelo: 'PowerEdge R740',
    serie: 'SN-DL-SPR-2020',
    placa_inventario: 'INV-SYS-058',
    codigo: 'SRV-HIS-001',
    ubicacion: 'Cuarto de Servidores',
    ubicacion_especifica: 'Rack Principal - U1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2020-01-20',
    periodicidad: 6,
    administrable: true,
    id_tipo_equipo_fk: 134
  },

  // ── TELEFONO (tipo 1347) ── 2 unidades ────────────────────────────────────
  {
    nombre_equipo: 'Teléfono IP Recepción',
    marca: 'Cisco',
    modelo: 'IP Phone 7945G',
    serie: 'SN-CI-TR1-2021',
    placa_inventario: 'INV-SYS-059',
    codigo: 'TEL-REC-001',
    ubicacion: 'Recepción',
    ubicacion_especifica: 'Mostrador Recepción Principal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-02-10',
    periodicidad: 12,
    administrable: true,
    id_tipo_equipo_fk: 1347
  },
  {
    nombre_equipo: 'Teléfono IP Urgencias',
    marca: 'Polycom',
    modelo: 'VVX 410',
    serie: 'SN-PL-TU1-2021',
    placa_inventario: 'INV-SYS-060',
    codigo: 'TEL-URG-001',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Estación de Médicos Urgencias',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-02-10',
    periodicidad: 12,
    administrable: true,
    id_tipo_equipo_fk: 1347
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Datos de hoja de vida – se asocian por posición con el equipo creado
// ─────────────────────────────────────────────────────────────────────────────
const hojaVidaData = [
  // PC Urgencias 02 (idx 0)
  { ip: '192.168.2.51', mac: 'B8:27:EB:11:11:11', procesador: 'Intel Core i7-10700', ram: '16 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'urgencias.enf2', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Asistencial', fecha_compra: '2022-05-05', fecha_instalacion: '2022-05-10', costo_compra: '4500000', contrato: 'CONT-2022-012', observaciones: 'Estación 2 de enfermería urgencias. Mantenimiento preventivo al día.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC UCI 02 (idx 1)
  { ip: '192.168.2.101', mac: 'C4:34:6B:22:22:22', procesador: 'Intel Core i7-10700', ram: '16 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'uci.medico1', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial', fecha_compra: '2022-08-10', fecha_instalacion: '2022-08-15', costo_compra: '4800000', contrato: 'CONT-2022-030', observaciones: 'Equipo puesto médico central UCI. Crítico para atención.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Farmacia 01 (idx 2)
  { ip: '192.168.6.10', mac: 'DC:A6:32:33:33:33', procesador: 'Intel Core i5-10400', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'farmacia.regente', vendedor: 'Lenovo Colombia', tipo_uso: 'Administrativo', fecha_compra: '2023-02-15', fecha_instalacion: '2023-02-20', costo_compra: '2900000', contrato: 'CONT-2023-006', observaciones: 'Equipo principal farmacia. Software dispensación instalado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Recursos Humanos (idx 3)
  { ip: '192.168.1.80', mac: 'E4:5F:01:44:44:44', procesador: 'Intel Core i5-10500', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'rrhh.coordinador', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2021-08-25', fecha_instalacion: '2021-09-01', costo_compra: '3100000', contrato: 'CONT-2021-022', observaciones: 'Equipo coordinación RRHH. En buen estado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Contabilidad 01 (idx 4)
  { ip: '192.168.1.90', mac: 'F4:CE:36:55:55:55', procesador: 'Intel Core i5-10500T', ram: '8 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'contabilidad.asist1', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-01-10', fecha_instalacion: '2022-01-15', costo_compra: '3300000', contrato: 'CONT-2022-003', observaciones: 'Equipo contabilidad. Software contable licenciado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Hospitalización 01 (idx 5)
  { ip: '192.168.7.20', mac: '00:14:22:66:66:66', procesador: 'Intel Core i7-10700', ram: '16 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 11 Pro', office: 'Microsoft 365', nombre_usuario: 'hospitalizacion.enf1', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial', fecha_compra: '2023-03-05', fecha_instalacion: '2023-03-10', costo_compra: '4600000', contrato: 'CONT-2023-009', observaciones: 'Estación enfermería hospitalización piso 2. Actualizado a Windows 11.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Pediatría 01 (idx 6)
  { ip: '192.168.8.10', mac: '3C:06:30:77:77:77', procesador: 'Intel Core i5-11400T', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'pediatria.dr1', vendedor: 'Lenovo Colombia', tipo_uso: 'Asistencial', fecha_compra: '2022-06-01', fecha_instalacion: '2022-06-05', costo_compra: '2700000', contrato: 'CONT-2022-018', observaciones: 'Consultorio pediatría 1. En buen estado operativo.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Ginecología 01 (idx 7)
  { ip: '192.168.9.10', mac: '5C:BA:EF:88:88:88', procesador: 'Intel Core i5-10500', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'ginecologia.dr1', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Asistencial', fecha_compra: '2021-11-15', fecha_instalacion: '2021-11-20', costo_compra: '3000000', contrato: 'CONT-2021-040', observaciones: 'Consultorio ginecología. Mantenimiento preventivo pendiente.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Cirugía 01 (idx 8)
  { ip: '192.168.10.5', mac: '70:F3:95:99:99:99', procesador: 'Intel Core i7-10700', ram: '16 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'cirugia.instrumentador', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial', fecha_compra: '2022-04-12', fecha_instalacion: '2022-04-18', costo_compra: '4700000', contrato: 'CONT-2022-015', observaciones: 'Equipo pre-quirófano cirugía. Software quirúrgico instalado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // PC Sistemas 01 (idx 9)
  { ip: '192.168.1.10', mac: 'A4:C3:F0:AA:AA:AA', procesador: 'Intel Core i7-10700', ram: '32 GB DDR4', disco_duro: '1 TB SSD NVMe', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'sistemas.admin', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo', fecha_compra: '2023-01-15', fecha_instalacion: '2023-01-20', costo_compra: '5500000', contrato: 'CONT-2023-002', observaciones: 'Equipo administrador de sistemas. Herramientas de gestión de red instaladas.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop Gerencia 01 (idx 10)
  { ip: '192.168.1.6', mac: 'B8:27:EB:BB:BB:BB', procesador: 'Intel Core i7-1165G7', ram: '16 GB DDR4', disco_duro: '512 GB SSD NVMe', sistema_operativo: 'Windows 11 Pro', office: 'Microsoft 365', nombre_usuario: 'gerencia.general', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Gerencial', fecha_compra: '2023-05-05', fecha_instalacion: '2023-05-10', costo_compra: '6800000', contrato: 'CONT-2023-015', observaciones: 'Laptop del gerente general. Garantía vigente.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop Administración 01 (idx 11)
  { ip: '192.168.1.55', mac: 'DC:A6:32:CC:CC:CC', procesador: 'Intel Core i5-1135G7', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'coordinacion.adm', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2022-09-30', fecha_instalacion: '2022-10-05', costo_compra: '4200000', contrato: 'CONT-2022-032', observaciones: 'Laptop coordinación administrativa. En buen estado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop Sistemas (idx 12)
  { ip: '192.168.1.11', mac: 'E4:5F:01:DD:DD:DD', procesador: 'AMD Ryzen 5 Pro 5650U', ram: '16 GB DDR4', disco_duro: '512 GB SSD NVMe', sistema_operativo: 'Windows 11 Pro', office: 'Microsoft 365', nombre_usuario: 'sistemas.tecnico1', vendedor: 'Lenovo Colombia', tipo_uso: 'Administrativo', fecha_compra: '2023-02-10', fecha_instalacion: '2023-02-15', costo_compra: '5200000', contrato: 'CONT-2023-005', observaciones: 'Laptop técnico de sistemas. Software de administración y monitoreo instalado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop Consulta Externa 02 (idx 13)
  { ip: '192.168.3.25', mac: 'F4:CE:36:EE:EE:EE', procesador: 'Intel Core i5-1135G7', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro', office: 'Microsoft 365', nombre_usuario: 'consulta.triaje', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial', fecha_compra: '2022-07-15', fecha_instalacion: '2022-07-20', costo_compra: '3800000', contrato: 'CONT-2022-025', observaciones: 'Laptop triaje consulta externa. Sistema de gestión de turnos.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop UCI Coordinadora (idx 14)
  { ip: '192.168.2.102', mac: '00:14:22:FF:FF:FF', procesador: 'Intel Core i7-1165G7', ram: '16 GB DDR4', disco_duro: '512 GB SSD', sistema_operativo: 'Windows 11 Pro', office: 'Microsoft 365', nombre_usuario: 'uci.coordinadora', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Asistencial', fecha_compra: '2023-03-26', fecha_instalacion: '2023-04-01', costo_compra: '5900000', contrato: 'CONT-2023-011', observaciones: 'Laptop coordinadora UCI. Software clínico instalado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Laptop Capacitación (idx 15)
  { ip: '192.168.11.5', mac: '3C:06:30:A1:A1:A1', procesador: 'Intel Core i3-1115G4', ram: '8 GB DDR4', disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Home', office: 'Microsoft 365', nombre_usuario: 'capacitacion.instructor', vendedor: 'Lenovo Colombia', tipo_uso: 'Administrativo', fecha_compra: '2021-08-05', fecha_instalacion: '2021-08-10', costo_compra: '2500000', contrato: 'CONT-2021-025', observaciones: 'Laptop para instructores en sala de capacitación.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Administración (idx 16)
  { ip: '192.168.1.120', mac: 'A4:C3:F0:B2:B2:B2', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'CF258A HP 58A Negro', nombre_usuario: null, vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2022-02-20', fecha_instalacion: '2022-02-28', costo_compra: '1200000', contrato: 'CONT-2022-007', observaciones: 'Impresora área común piso 1. Tóner actualizado en marzo 2025.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Urgencias (idx 17)
  { ip: '192.168.2.120', mac: 'B8:27:EB:C3:C3:C3', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'Tinta EcoTank 664 Negro/Color', nombre_usuario: null, vendedor: 'Epson Colombia', tipo_uso: 'Asistencial', fecha_compra: '2021-06-10', fecha_instalacion: '2021-06-15', costo_compra: '450000', contrato: 'CONT-2021-018', observaciones: 'Impresora urgencias. Imprime tickets de triaje y órdenes.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Facturación (idx 18)
  { ip: '192.168.1.121', mac: 'DC:A6:32:D4:D4:D4', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'CF289A HP 89A Negro', nombre_usuario: null, vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2022-03-05', fecha_instalacion: '2022-03-10', costo_compra: '2100000', contrato: 'CONT-2022-009', observaciones: 'Impresora facturación. Alto volumen de impresión diario.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Farmacia (idx 19)
  { ip: '192.168.6.120', mac: 'E4:5F:01:E5:E5:E5', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'TN-2380 Brother Negro', nombre_usuario: null, vendedor: 'Brother Colombia', tipo_uso: 'Administrativo', fecha_compra: '2020-10-30', fecha_instalacion: '2020-11-05', costo_compra: '380000', contrato: 'CONT-2020-015', observaciones: 'Impresora farmacia. Imprime etiquetas medicamentos.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Laboratorio (idx 20)
  { ip: '192.168.4.120', mac: 'F4:CE:36:F6:F6:F6', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'CF259A HP 59A Negro', nombre_usuario: null, vendedor: 'HP Colombia S.A.S', tipo_uso: 'Laboratorio', fecha_compra: '2023-01-20', fecha_instalacion: '2023-01-25', costo_compra: '1800000', contrato: 'CONT-2023-004', observaciones: 'Impresora resultados laboratorio clínico.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Impresora Gerencia (idx 21)
  { ip: '192.168.1.122', mac: '00:14:22:07:07:07', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, tonner: 'Tinta Canon GI-10 Negro/Color', nombre_usuario: null, vendedor: 'Canon Colombia', tipo_uso: 'Gerencial', fecha_compra: '2022-09-08', fecha_instalacion: '2022-09-12', costo_compra: '650000', contrato: 'CONT-2022-031', observaciones: 'Impresora secretaría gerencia. Impresión color para informes.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Monitor Administración 01 (idx 22)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'admin.contabilidad2', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-03-15', fecha_instalacion: '2022-03-20', costo_compra: '850000', contrato: 'CONT-2022-008', observaciones: 'Monitor 24" IPS administración. Excelente calidad de imagen.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Monitor UCI 01 (idx 23)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'uci.central', vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial', fecha_compra: '2022-08-12', fecha_instalacion: '2022-08-20', costo_compra: '720000', contrato: 'CONT-2022-030', observaciones: 'Monitor estación central UCI. Pantalla antirreflejo para ambiente hospitalario.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Monitor Urgencias 01 (idx 24)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'urgencias.enf1', vendedor: 'LG Electronics Colombia', tipo_uso: 'Asistencial', fecha_compra: '2021-07-20', fecha_instalacion: '2021-07-25', costo_compra: '580000', contrato: 'CONT-2021-020', observaciones: 'Monitor urgencias. Estado operativo normal.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Monitor Laboratorio Clínico (idx 25)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'lab.analista', vendedor: 'Samsung Colombia', tipo_uso: 'Laboratorio', fecha_compra: '2022-09-03', fecha_instalacion: '2022-09-08', costo_compra: '620000', contrato: 'CONT-2022-029', observaciones: 'Monitor laboratorio clínico. Calibrado para visualización de resultados.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Monitor Sistemas (idx 26)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'sistemas.admin', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo', fecha_compra: '2023-01-18', fecha_instalacion: '2023-01-22', costo_compra: '980000', contrato: 'CONT-2023-002', observaciones: 'Monitor 27" QHD sistemas. Doble pantalla con PC Sistemas 01.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Switch Core Piso 1 (idx 27)
  { ip: '192.168.1.253', mac: '00:1E:13:08:08:08', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'Cisco IOS 15.2', office: null, nombre_usuario: null, vendedor: 'Cisco Colombia', tipo_uso: 'Administrativo', fecha_compra: '2020-03-10', fecha_instalacion: '2020-03-15', costo_compra: '8500000', contrato: 'CONT-2020-003', observaciones: 'Switch core principal. VLAN configuradas. Firmware actualizado en 2024.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Switch Distribución Piso 2 (idx 28)
  { ip: '192.168.1.252', mac: '14:91:82:09:09:09', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'TP-Link TL-SG1024', office: null, nombre_usuario: null, vendedor: 'TP-Link Colombia', tipo_uso: 'Administrativo', fecha_compra: '2021-04-15', fecha_instalacion: '2021-04-20', costo_compra: '650000', contrato: 'CONT-2021-010', observaciones: 'Switch distribución piso 2. No administrable. En buen estado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Switch Urgencias (idx 29)
  { ip: '192.168.2.253', mac: '00:1E:13:0A:0A:0A', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'Cisco IOS 15.2', office: null, nombre_usuario: null, vendedor: 'Cisco Colombia', tipo_uso: 'Asistencial', fecha_compra: '2022-02-05', fecha_instalacion: '2022-02-10', costo_compra: '3200000', contrato: 'CONT-2022-005', observaciones: 'Switch local urgencias. PoE para teléfonos IP y cámaras.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Router Principal (idx 30)
  { ip: '10.0.0.1', mac: '00:1A:2B:0B:0B:0B', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'Cisco IOS XE 16.9', office: null, nombre_usuario: null, vendedor: 'Cisco Colombia', tipo_uso: 'Administrativo', fecha_compra: '2019-07-30', fecha_instalacion: '2019-08-05', costo_compra: '12000000', contrato: 'CONT-2019-001', observaciones: 'Router principal enlace WAN. Soporte contratado con Cisco. Renovar en 2026.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Router Backup (idx 31)
  { ip: '10.0.0.2', mac: 'E4:8D:8C:0C:0C:0C', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'RouterOS v7', office: null, nombre_usuario: null, vendedor: 'MikroTik Colombia', tipo_uso: 'Administrativo', fecha_compra: '2021-01-12', fecha_instalacion: '2021-01-18', costo_compra: '850000', contrato: 'CONT-2021-002', observaciones: 'Router backup balanceo de carga. Activo en modo failover.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Lector Biométrico Entrada Principal (idx 32)
  { ip: '192.168.12.10', mac: '00:17:61:0D:0D:0D', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'ZKTeco Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-05-01', fecha_instalacion: '2022-05-05', costo_compra: '780000', contrato: 'CONT-2022-014', observaciones: 'Control acceso entrada principal. Huella + tarjeta. 1200 usuarios registrados.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Lector Biométrico Administración (idx 33)
  { ip: '192.168.12.11', mac: '00:17:61:0E:0E:0E', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'ZKTeco Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-05-01', fecha_instalacion: '2022-05-06', costo_compra: '650000', contrato: 'CONT-2022-014', observaciones: 'Control acceso área administrativa. Solo huella digital.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Lector Biométrico UCI (idx 34)
  { ip: '192.168.12.12', mac: '4C:ED:FB:0F:0F:0F', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'Hikvision Colombia', tipo_uso: 'Asistencial', fecha_compra: '2023-03-10', fecha_instalacion: '2023-03-15', costo_compra: '920000', contrato: 'CONT-2023-008', observaciones: 'Control acceso UCI. Tarjeta RFID + PIN. Restringido al personal autorizado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Tableta UCI Médicos (idx 35)
  { ip: '192.168.2.200', mac: 'A0:AF:BD:10:10:10', procesador: 'Qualcomm Snapdragon 778G', ram: '6 GB', disco_duro: '128 GB', sistema_operativo: 'Android 13', office: null, nombre_usuario: 'uci.medicos', vendedor: 'Samsung Colombia', tipo_uso: 'Asistencial', fecha_compra: '2022-11-05', fecha_instalacion: '2022-11-10', costo_compra: '1800000', contrato: 'CONT-2022-038', observaciones: 'Tableta médicos UCI. App HIS instalada. Funda antimicrobiana.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Tableta Visita Domiciliaria (idx 36)
  { ip: null, mac: null, procesador: 'Apple M1', ram: '8 GB', disco_duro: '64 GB', sistema_operativo: 'iPadOS 16', office: null, nombre_usuario: 'extramural.equipo', vendedor: 'Apple Colombia', tipo_uso: 'Asistencial', fecha_compra: '2023-04-15', fecha_instalacion: '2023-04-20', costo_compra: '3200000', contrato: 'CONT-2023-013', observaciones: 'Tableta visitas domiciliarias. Chip celular activo. SIM Claro datos.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Tableta Consulta Externa (idx 37)
  { ip: '192.168.3.200', mac: 'B0:FA:EB:12:12:12', procesador: 'Qualcomm Snapdragon 870', ram: '8 GB', disco_duro: '256 GB', sistema_operativo: 'Android 12', office: null, nombre_usuario: 'consulta.recepcion', vendedor: 'Lenovo Colombia', tipo_uso: 'Asistencial', fecha_compra: '2022-09-25', fecha_instalacion: '2022-09-30', costo_compra: '1600000', contrato: 'CONT-2022-033', observaciones: 'Tableta recepción consulta externa. Gestión de turnos y citas.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Video Beam Sala Capacitación (idx 38)
  { ip: '192.168.11.100', mac: '00:80:92:13:13:13', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'Epson Colombia', tipo_uso: 'Administrativo', fecha_compra: '2021-05-05', fecha_instalacion: '2021-05-10', costo_compra: '2800000', contrato: 'CONT-2021-014', observaciones: 'Video beam sala capacitación. Instalado en techo. 3000 lúmenes. Lámpara a 1200 hrs de uso.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Video Beam Sala de Juntas (idx 39)
  { ip: '192.168.1.130', mac: 'AC:22:0B:14:14:14', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'BenQ Colombia', tipo_uso: 'Gerencial', fecha_compra: '2022-07-12', fecha_instalacion: '2022-07-18', costo_compra: '1800000', contrato: 'CONT-2022-024', observaciones: 'Video beam sala de juntas. 3600 lúmenes. HDMI y VGA. Pantalla motorizada.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Escáner Archivo Clínico (idx 40)
  { ip: '192.168.1.140', mac: '00:26:B9:15:15:15', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'archivo.digitalizador', vendedor: 'Epson Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-04-01', fecha_instalacion: '2022-04-05', costo_compra: '2200000', contrato: 'CONT-2022-011', observaciones: 'Escáner dúplex archivo clínico. 80 ppm. Digitalización historias clínicas.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Escáner Administración (idx 41)
  { ip: '192.168.1.141', mac: 'A4:C3:F0:16:16:16', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: null, vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2021-03-15', fecha_instalacion: '2021-03-20', costo_compra: '950000', contrato: 'CONT-2021-008', observaciones: 'Escáner plano administración. Documentos A4 y A3.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Escáner Facturación (idx 42)
  { ip: '192.168.1.142', mac: 'B8:27:EB:17:17:17', procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'facturacion.rad', vendedor: 'Fujitsu Colombia', tipo_uso: 'Administrativo', fecha_compra: '2023-02-22', fecha_instalacion: '2023-02-28', costo_compra: '4800000', contrato: 'CONT-2023-007', observaciones: 'Escáner alto rendimiento facturación. Radicación documentos PQRS.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Lector Código Barras Farmacia (idx 43)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'farmacia.regente', vendedor: 'Honeywell Colombia', tipo_uso: 'Administrativo', fecha_compra: '2022-01-05', fecha_instalacion: '2022-01-10', costo_compra: '180000', contrato: 'CONT-2022-002', observaciones: 'Lector 1D/2D farmacia. Lectura códigos medicamentos. USB HID.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Lector Código Barras Almacén (idx 44)
  { ip: null, mac: null, procesador: null, ram: null, disco_duro: null, sistema_operativo: null, office: null, nombre_usuario: 'almacen.aux', vendedor: 'Symbol/Zebra Colombia', tipo_uso: 'Administrativo', fecha_compra: '2020-09-10', fecha_instalacion: '2020-09-14', costo_compra: '120000', contrato: 'CONT-2020-012', observaciones: 'Lector 1D almacén. Control inventario suministros. USB. Antiguo pero funcional.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Torre Servidor Backup (idx 45)
  { ip: '192.168.1.20', mac: '00:1A:4B:19:19:19', procesador: 'Intel Xeon E-2334', ram: '32 GB DDR4 ECC', disco_duro: '4 TB HDD RAID 1', sistema_operativo: 'Windows Server 2019', office: null, nombre_usuario: null, vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo', fecha_compra: '2022-05-25', fecha_instalacion: '2022-06-01', costo_compra: '9500000', contrato: 'CONT-2022-016', observaciones: 'Servidor torre backup NAS/Veeam. Respaldo nocturno automático. RAID 1 operativo.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Torre Workstation Imagenología (idx 46)
  { ip: '192.168.5.15', mac: '14:18:77:1A:1A:1A', procesador: 'Intel Xeon W-1270', ram: '64 GB DDR4 ECC', disco_duro: '2 TB NVMe + 4 TB HDD', sistema_operativo: 'Windows 10 Pro for Workstations', office: 'Microsoft 365', nombre_usuario: 'imagenologia.radiologo', vendedor: 'Dell Technologies Colombia', tipo_uso: 'Diagnóstico por imagen', fecha_compra: '2023-01-03', fecha_instalacion: '2023-01-08', costo_compra: '14000000', contrato: 'CONT-2023-001', observaciones: 'Workstation lectura radiológica. GPU NVIDIA Quadro RTX 4000. DICOM instalado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Servidor Principal HIS (idx 47)
  { ip: '192.168.1.2', mac: '00:0E:1E:1B:1B:1B', procesador: 'Intel Xeon Gold 6226R (x2)', ram: '128 GB DDR4 ECC RDIMM', disco_duro: '4 x 1.8 TB SAS RAID 5', sistema_operativo: 'Windows Server 2022', office: null, nombre_usuario: null, vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo', fecha_compra: '2020-01-10', fecha_instalacion: '2020-01-20', costo_compra: '65000000', contrato: 'CONT-2020-001', observaciones: 'Servidor principal HIS hospitalario. iDRAC activo. UPS dedicado. Soporte 24/7 Dell.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Teléfono IP Recepción (idx 48)
  { ip: '192.168.13.10', mac: '00:18:73:1C:1C:1C', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'SIP 12.5.1', office: null, nombre_usuario: 'recepcion.principal', vendedor: 'Cisco Colombia', tipo_uso: 'Administrativo', fecha_compra: '2021-02-05', fecha_instalacion: '2021-02-10', costo_compra: '480000', contrato: 'CONT-2021-004', observaciones: 'Teléfono IP recepción principal. Ext. 100. Directorio 200 contactos configurado.', compraddirecta: true, convenio: false, donado: false, comodato: false },
  // Teléfono IP Urgencias (idx 49)
  { ip: '192.168.13.20', mac: '64:16:7F:1D:1D:1D', procesador: null, ram: null, disco_duro: null, sistema_operativo: 'Polycom OS 5.9', office: null, nombre_usuario: 'urgencias.medico1', vendedor: 'Polycom Colombia', tipo_uso: 'Asistencial', fecha_compra: '2021-02-05', fecha_instalacion: '2021-02-10', costo_compra: '620000', contrato: 'CONT-2021-004', observaciones: 'Teléfono IP urgencias. Ext. 200. Llamada de emergencia programada al 123.', compraddirecta: true, convenio: false, donado: false, comodato: false }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.\n');

    // 1. Insertar 50 equipos
    console.log('📦 Insertando 50 equipos de sistemas...');
    const equiposCreados = await SysEquipo.bulkCreate(equipos, { validate: true });
    console.log(`✅ Se insertaron ${equiposCreados.length} equipos.\n`);

    equiposCreados.forEach(eq => {
      console.log(`  [ID ${eq.id_sysequipo}] ${eq.nombre_equipo} (${eq.ubicacion})`);
    });

    // 2. Construir hojas de vida con los IDs reales obtenidos
    console.log('\n📋 Creando hojas de vida...');
    const hojasConIds = hojaVidaData.map((hv, idx) => ({
      ...hv,
      id_sysequipo_fk: equiposCreados[idx].id_sysequipo
    }));

    const hojasCreadas = await SysHojaVida.bulkCreate(hojasConIds, { validate: true });
    console.log(`✅ Se crearon ${hojasCreadas.length} hojas de vida.\n`);

    hojasCreadas.forEach((hv, idx) => {
      console.log(`  [HV-${hv.id_syshoja_vida}] → Equipo ID ${hv.id_sysequipo_fk} | ${equiposCreados[idx].nombre_equipo}`);
    });

    console.log('\n🎉 Seed completado exitosamente.');
    console.log(`   Total equipos:       ${equiposCreados.length}`);
    console.log(`   Total hojas de vida: ${hojasCreadas.length}`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error(`   - ${e.path}: ${e.message}`));
    }
  } finally {
    await sequelize.close();
  }
}

seed();
