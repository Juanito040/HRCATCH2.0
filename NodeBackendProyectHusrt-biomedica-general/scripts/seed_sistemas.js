/**
 * Seed módulo Sistemas — usa TipoEquipo y Servicios EXISTENTES.
 * Crea 53 SysEquipo con SysHojaVida completa y 2-3 mantenimientos cada uno.
 * node scripts/seed_sistemas.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../config/configDb');
const SysEquipo   = require('../models/Sistemas/SysEquipo');
const SysHojaVida = require('../models/Sistemas/SysHojaVida');
const SysReporte  = require('../models/Sistemas/SysReporte'); // tabla que lee el frontend

// ── IDs EXISTENTES EN DB ────────────────────────────────────────────────────
// TipoEquipo (tipoR=2)
const T = {
  COMPUTADOR:  123,
  PORTATIL:    122,
  SERVIDOR:    134,
  IMPRESORA:   121,
  SWITCH:      130,
  ROUTER:      1340,
  MONITOR:     1241,
  TABLETA:     127,
  ESCANER:     124,
  TELEFONO:    1347,
  TORRE:       128,
};

// Servicios
const S = {
  SISTEMAS:     45,
  URGENCIAS:    34,
  UCI_ADULTO:   29,
  UCI_NEONATAL: 30,
  CONS_EXT:     7,
  IMAGENES:     19,
  LABORATORIO:  20,
  FARMACIA:     10,
  FACTURACION:  44,
  TALENTO:      61,
  GERENCIA:     60,
  QUIRURGICO:   28,
  CALIDAD:      42,
  ASEGURAMIENTO:38,
  FINANCIERA:   57,
  EPIDEMIOLOGIA:56,
};

const USUARIO_ID = 1; // deguerreroc

// ── EQUIPOS ─────────────────────────────────────────────────────────────────
const EQUIPOS = [
  // ── COMPUTADORES DE ESCRITORIO (T.COMPUTADOR = 123) ─────────────────────
  { nombre_equipo:'PC Triage Urgencias 1',       marca:'HP',      modelo:'EliteDesk 800 G5 SFF',   serie:'HPS24-001', placa_inventario:'SIS-001', codigo:'TI-001', ubicacion:'URGENCIAS',        ubicacion_especifica:'Puesto Triage 1',           ano_ingreso:'2022-03-15', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.URGENCIAS   },
  { nombre_equipo:'PC Triage Urgencias 2',       marca:'HP',      modelo:'EliteDesk 800 G5 SFF',   serie:'HPS24-002', placa_inventario:'SIS-002', codigo:'TI-002', ubicacion:'URGENCIAS',        ubicacion_especifica:'Puesto Triage 2',           ano_ingreso:'2022-03-15', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.URGENCIAS   },
  { nombre_equipo:'PC Enfermería Urgencias',     marca:'Lenovo',  modelo:'ThinkCentre M720 Tower',  serie:'LNV23-001', placa_inventario:'SIS-003', codigo:'TI-003', ubicacion:'URGENCIAS',        ubicacion_especifica:'Puesto central Enfermería', ano_ingreso:'2021-06-20', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.URGENCIAS   },
  { nombre_equipo:'PC UCI Adulto Est. 1',        marca:'Dell',    modelo:'OptiPlex 7080 MT',        serie:'DEL23-001', placa_inventario:'SIS-004', codigo:'TI-004', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Estación Médico 1',         ano_ingreso:'2023-01-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'PC UCI Adulto Est. 2',        marca:'Dell',    modelo:'OptiPlex 7080 MT',        serie:'DEL23-002', placa_inventario:'SIS-005', codigo:'TI-005', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Estación Médico 2',         ano_ingreso:'2023-01-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'PC Enfermería UCI',           marca:'HP',      modelo:'ProDesk 400 G7 MT',       serie:'HPS22-010', placa_inventario:'SIS-006', codigo:'TI-006', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Puesto Enfermería Central', ano_ingreso:'2022-08-05', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'PC UCI Neonatal',             marca:'Lenovo',  modelo:'ThinkCentre M920 Tower',  serie:'LNV22-005', placa_inventario:'SIS-007', codigo:'TI-007', ubicacion:'UCI NEONATAL',     ubicacion_especifica:'Puesto principal',          ano_ingreso:'2022-05-18', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.UCI_NEONATAL},
  { nombre_equipo:'PC Consulta Externa 1',       marca:'Dell',    modelo:'OptiPlex 3080 MT',        serie:'DEL20-001', placa_inventario:'SIS-008', codigo:'TI-008', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Consultorio 1',             ano_ingreso:'2020-11-12', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.CONS_EXT    },
  { nombre_equipo:'PC Consulta Externa 2',       marca:'Dell',    modelo:'OptiPlex 3080 MT',        serie:'DEL20-002', placa_inventario:'SIS-009', codigo:'TI-009', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Consultorio 2',             ano_ingreso:'2020-11-12', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.CONS_EXT    },
  { nombre_equipo:'PC Consulta Externa 3',       marca:'Lenovo',  modelo:'ThinkCentre M720 Tower',  serie:'LNV21-010', placa_inventario:'SIS-010', codigo:'TI-010', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Consultorio 3',             ano_ingreso:'2021-02-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.CONS_EXT    },
  { nombre_equipo:'PC Laboratorio Clínico 1',    marca:'Dell',    modelo:'OptiPlex 5080 MT',        serie:'DEL22-010', placa_inventario:'SIS-011', codigo:'TI-011', ubicacion:'LABORATORIO',      ubicacion_especifica:'Mesa Analítica 1',          ano_ingreso:'2022-07-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.LABORATORIO },
  { nombre_equipo:'PC Laboratorio Clínico 2',    marca:'HP',      modelo:'ProDesk 600 G6 MT',       serie:'HPS22-020', placa_inventario:'SIS-012', codigo:'TI-012', ubicacion:'LABORATORIO',      ubicacion_especifica:'Mesa Analítica 2',          ano_ingreso:'2022-07-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.LABORATORIO },
  { nombre_equipo:'PC Farmacia Dispensación',    marca:'HP',      modelo:'ProDesk 600 G5 MT',       serie:'HPS21-030', placa_inventario:'SIS-013', codigo:'TI-013', ubicacion:'FARMACIA',         ubicacion_especifica:'Mostrador dispensación',    ano_ingreso:'2021-10-08', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.FARMACIA    },
  { nombre_equipo:'PC Facturación 1',            marca:'Lenovo',  modelo:'ThinkCentre M920t',       serie:'LNV23-020', placa_inventario:'SIS-014', codigo:'TI-014', ubicacion:'FACTURACIÓN',      ubicacion_especifica:'Ventanilla 1',              ano_ingreso:'2023-02-14', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.FACTURACION },
  { nombre_equipo:'PC Facturación 2',            marca:'Lenovo',  modelo:'ThinkCentre M920t',       serie:'LNV23-021', placa_inventario:'SIS-015', codigo:'TI-015', ubicacion:'FACTURACIÓN',      ubicacion_especifica:'Ventanilla 2',              ano_ingreso:'2023-02-14', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.FACTURACION },
  { nombre_equipo:'PC Talento Humano',           marca:'HP',      modelo:'EliteDesk 705 G5 MT',     serie:'HPS21-015', placa_inventario:'SIS-016', codigo:'TI-016', ubicacion:'TALENTO HUMANO',   ubicacion_especifica:'Oficina Principal',         ano_ingreso:'2021-09-01', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.TALENTO     },
  { nombre_equipo:'PC Gerencia',                 marca:'HP',      modelo:'EliteDesk 800 G8 SFF',    serie:'HPS24-050', placa_inventario:'SIS-017', codigo:'TI-017', ubicacion:'GERENCIA',         ubicacion_especifica:'Oficina Gerente',           ano_ingreso:'2024-01-05', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.GERENCIA    },
  { nombre_equipo:'PC Sistemas TI 1',            marca:'HP',      modelo:'EliteDesk 800 G8 SFF',    serie:'HPS24-051', placa_inventario:'SIS-018', codigo:'TI-018', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI',                  ano_ingreso:'2024-01-05', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.SISTEMAS    },
  { nombre_equipo:'PC Sistemas TI 2',            marca:'Dell',    modelo:'OptiPlex 7090 MT',        serie:'DEL24-001', placa_inventario:'SIS-019', codigo:'TI-019', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI',                  ano_ingreso:'2024-03-10', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.SISTEMAS    },
  { nombre_equipo:'PC Imágenes Diagnósticas',    marca:'HP',      modelo:'Z2 Tower G5',             serie:'HPS23-020', placa_inventario:'SIS-020', codigo:'TI-020', ubicacion:'IMÁGENES',         ubicacion_especifica:'Sala de Lectura',           ano_ingreso:'2023-04-03', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.COMPUTADOR, id_servicio_fk:S.IMAGENES    },

  // ── COMPUTADORES PORTÁTILES (T.PORTATIL = 122) ───────────────────────────
  { nombre_equipo:'Portátil Médico Urgencias',   marca:'HP',      modelo:'EliteBook 840 G8',        serie:'LHPS-001',  placa_inventario:'SIS-021', codigo:'TI-021', ubicacion:'URGENCIAS',        ubicacion_especifica:'Sala Médica',              ano_ingreso:'2023-06-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.PORTATIL,   id_servicio_fk:S.URGENCIAS   },
  { nombre_equipo:'Portátil Dirección Médica',   marca:'Dell',    modelo:'Latitude 5420',           serie:'LDEL-001',  placa_inventario:'SIS-022', codigo:'TI-022', ubicacion:'GERENCIA',         ubicacion_especifica:'Dirección Médica',         ano_ingreso:'2022-10-20', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.PORTATIL,   id_servicio_fk:S.GERENCIA    },
  { nombre_equipo:'Portátil Coordinador TI',     marca:'Lenovo',  modelo:'ThinkPad X1 Carbon G9',   serie:'LLNV-001',  placa_inventario:'SIS-023', codigo:'TI-023', ubicacion:'SISTEMAS',         ubicacion_especifica:'Oficina TI',               ano_ingreso:'2024-02-01', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.PORTATIL,   id_servicio_fk:S.SISTEMAS    },
  { nombre_equipo:'Portátil Calidad',            marca:'HP',      modelo:'ProBook 450 G9',          serie:'LHPS-002',  placa_inventario:'SIS-024', codigo:'TI-024', ubicacion:'CALIDAD',          ubicacion_especifica:'Oficina Calidad',          ano_ingreso:'2022-07-08', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.PORTATIL,   id_servicio_fk:S.CALIDAD     },
  { nombre_equipo:'Portátil Quirúrgicos',        marca:'Dell',    modelo:'Latitude 3420',           serie:'LDEL-002',  placa_inventario:'SIS-025', codigo:'TI-025', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Sala Pre-Quirúrgica',      ano_ingreso:'2021-05-15', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.PORTATIL,   id_servicio_fk:S.QUIRURGICO  },

  // ── SERVIDORES (T.SERVIDOR = 134) ────────────────────────────────────────
  { nombre_equipo:'Servidor Principal HIS',      marca:'Dell',    modelo:'PowerEdge R740',          serie:'SRDEL-001', placa_inventario:'SIS-026', codigo:'TI-026', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',       ano_ingreso:'2021-01-15', periodicidad:90,  activo:true, administrable:true,  numero_puertos:4, id_tipo_equipo_fk:T.SERVIDOR,   id_servicio_fk:S.SISTEMAS    },
  { nombre_equipo:'Servidor Respaldo',           marca:'HP',      modelo:'ProLiant DL380 Gen10',    serie:'SRHPS-001', placa_inventario:'SIS-027', codigo:'TI-027', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',       ano_ingreso:'2021-01-15', periodicidad:90,  activo:true, administrable:true,  numero_puertos:4, id_tipo_equipo_fk:T.SERVIDOR,   id_servicio_fk:S.SISTEMAS    },
  { nombre_equipo:'Servidor PACS Imágenes',      marca:'Dell',    modelo:'PowerEdge R640',          serie:'SRDEL-002', placa_inventario:'SIS-028', codigo:'TI-028', ubicacion:'IMÁGENES',         ubicacion_especifica:'Sala Servidores Rx',       ano_ingreso:'2022-09-20', periodicidad:90,  activo:true, administrable:true,  numero_puertos:2, id_tipo_equipo_fk:T.SERVIDOR,   id_servicio_fk:S.IMAGENES    },
  { nombre_equipo:'Servidor de Archivos',        marca:'Lenovo',  modelo:'ThinkSystem SR650',       serie:'SRLNV-001', placa_inventario:'SIS-029', codigo:'TI-029', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 2',       ano_ingreso:'2023-05-10', periodicidad:90,  activo:true, administrable:true,  numero_puertos:4, id_tipo_equipo_fk:T.SERVIDOR,   id_servicio_fk:S.SISTEMAS    },

  // ── IMPRESORAS (T.IMPRESORA = 121) ───────────────────────────────────────
  { nombre_equipo:'Impresora Urgencias',         marca:'HP',      modelo:'LaserJet M404dn',         serie:'IMHPS-001', placa_inventario:'SIS-030', codigo:'TI-030', ubicacion:'URGENCIAS',        ubicacion_especifica:'Puesto Central',           ano_ingreso:'2022-04-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.URGENCIAS   },
  { nombre_equipo:'Impresora Farmacia',          marca:'HP',      modelo:'LaserJet M404dn',         serie:'IMHPS-002', placa_inventario:'SIS-031', codigo:'TI-031', ubicacion:'FARMACIA',         ubicacion_especifica:'Área Dispensación',        ano_ingreso:'2022-04-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.FARMACIA    },
  { nombre_equipo:'Impresora Laboratorio',       marca:'Brother', modelo:'HL-L6400DW',              serie:'IMBRO-001', placa_inventario:'SIS-032', codigo:'TI-032', ubicacion:'LABORATORIO',      ubicacion_especifica:'Recepción',                ano_ingreso:'2021-11-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.LABORATORIO },
  { nombre_equipo:'Impresora Facturación',       marca:'Lexmark', modelo:'MS622de',                 serie:'IMLEX-001', placa_inventario:'SIS-033', codigo:'TI-033', ubicacion:'FACTURACIÓN',      ubicacion_especifica:'Ventanilla Principal',     ano_ingreso:'2020-08-15', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.FACTURACION },
  { nombre_equipo:'Impresora Multifunc. Consult.', marca:'HP',    modelo:'LaserJet MFP M428fdw',    serie:'IMHPS-003', placa_inventario:'SIS-034', codigo:'TI-034', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Pasillo Central',          ano_ingreso:'2023-01-20', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.CONS_EXT    },
  { nombre_equipo:'Impresora Gerencia',          marca:'Canon',   modelo:'imageRUNNER 2630i',       serie:'IMCAN-001', placa_inventario:'SIS-035', codigo:'TI-035', ubicacion:'GERENCIA',         ubicacion_especifica:'Secretaría General',       ano_ingreso:'2022-06-30', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.GERENCIA    },
  { nombre_equipo:'Impresora Sistemas TI',       marca:'Kyocera', modelo:'ECOSYS M3655idn',         serie:'IMKYO-001', placa_inventario:'SIS-036', codigo:'TI-036', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI',                  ano_ingreso:'2023-09-05', periodicidad:180, activo:true, administrable:false, id_tipo_equipo_fk:T.IMPRESORA,  id_servicio_fk:S.SISTEMAS    },

  // ── SWITCHES (T.SWITCH = 130) ────────────────────────────────────────────
  { nombre_equipo:'Switch Core Principal',       marca:'Cisco',   modelo:'Catalyst 9300-48P',       serie:'SWCSC-001', placa_inventario:'SIS-037', codigo:'TI-037', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',       ano_ingreso:'2021-03-01', periodicidad:90,  activo:true, administrable:true,  numero_puertos:48, direccionamiento_Vlan:'VLAN 10,20,30,100', id_tipo_equipo_fk:T.SWITCH, id_servicio_fk:S.SISTEMAS },
  { nombre_equipo:'Switch Distribución Piso 1',  marca:'Cisco',   modelo:'Catalyst 9200-24T',       serie:'SWCSC-002', placa_inventario:'SIS-038', codigo:'TI-038', ubicacion:'URGENCIAS',        ubicacion_especifica:'Cuarto Telecom. P1',       ano_ingreso:'2021-03-01', periodicidad:90,  activo:true, administrable:true,  numero_puertos:24, direccionamiento_Vlan:'VLAN 10,20',        id_tipo_equipo_fk:T.SWITCH, id_servicio_fk:S.URGENCIAS },
  { nombre_equipo:'Switch Distribución Piso 2',  marca:'HP',      modelo:'Aruba 2930F-24G',         serie:'SWHPS-001', placa_inventario:'SIS-039', codigo:'TI-039', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Cuarto Telecom. P2',       ano_ingreso:'2022-02-10', periodicidad:90,  activo:true, administrable:true,  numero_puertos:24, direccionamiento_Vlan:'VLAN 10,30',        id_tipo_equipo_fk:T.SWITCH, id_servicio_fk:S.UCI_ADULTO },
  { nombre_equipo:'Switch Distribución Piso 3',  marca:'HP',      modelo:'Aruba 2930F-24G',         serie:'SWHPS-002', placa_inventario:'SIS-040', codigo:'TI-040', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Cuarto Telecom. P3',       ano_ingreso:'2022-02-10', periodicidad:90,  activo:true, administrable:true,  numero_puertos:24, direccionamiento_Vlan:'VLAN 10,40',        id_tipo_equipo_fk:T.SWITCH, id_servicio_fk:S.QUIRURGICO },
  { nombre_equipo:'Switch Administración',       marca:'Cisco',   modelo:'Catalyst 9200-48T',       serie:'SWCSC-003', placa_inventario:'SIS-041', codigo:'TI-041', ubicacion:'GERENCIA',         ubicacion_especifica:'Cuarto Telecom. P4',       ano_ingreso:'2022-05-20', periodicidad:90,  activo:true, administrable:true,  numero_puertos:48, direccionamiento_Vlan:'VLAN 10,50',        id_tipo_equipo_fk:T.SWITCH, id_servicio_fk:S.GERENCIA },

  // ── ROUTERS / FIREWALL (T.ROUTER = 1340) ────────────────────────────────
  { nombre_equipo:'Firewall Principal',          marca:'Fortinet', modelo:'FortiGate 100F',         serie:'RTFTN-001', placa_inventario:'SIS-042', codigo:'TI-042', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',       ano_ingreso:'2021-01-15', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.ROUTER, id_servicio_fk:S.SISTEMAS },
  { nombre_equipo:'Router WAN Principal',        marca:'Cisco',    modelo:'ISR 4331',               serie:'RTCSC-001', placa_inventario:'SIS-043', codigo:'TI-043', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 1',       ano_ingreso:'2021-01-15', periodicidad:90,  activo:true, administrable:true,  id_tipo_equipo_fk:T.ROUTER, id_servicio_fk:S.SISTEMAS },
  { nombre_equipo:'Router Enlace UMI',           marca:'Mikrotik', modelo:'RB4011iGS+',            serie:'RTMKT-001', placa_inventario:'SIS-044', codigo:'TI-044', ubicacion:'SISTEMAS',         ubicacion_especifica:'Data Center Rack 2',       ano_ingreso:'2022-08-10', periodicidad:180, activo:true, administrable:true,  id_tipo_equipo_fk:T.ROUTER, id_servicio_fk:S.SISTEMAS },

  // ── MONITORES (T.MONITOR = 1241) ─────────────────────────────────────────
  { nombre_equipo:'Monitor Imágenes Dx 1',       marca:'LG',      modelo:'27UN850-W 4K',           serie:'MONLG-001', placa_inventario:'SIS-045', codigo:'TI-045', ubicacion:'IMÁGENES',         ubicacion_especifica:'Sala Lectura Mon. 1',      ano_ingreso:'2023-04-03', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.MONITOR, id_servicio_fk:S.IMAGENES    },
  { nombre_equipo:'Monitor Imágenes Dx 2',       marca:'LG',      modelo:'27UN850-W 4K',           serie:'MONLG-002', placa_inventario:'SIS-046', codigo:'TI-046', ubicacion:'IMÁGENES',         ubicacion_especifica:'Sala Lectura Mon. 2',      ano_ingreso:'2023-04-03', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.MONITOR, id_servicio_fk:S.IMAGENES    },
  { nombre_equipo:'Monitor UCI Adulto 1',        marca:'Samsung', modelo:'S27A600UUN 27"',          serie:'MONSAM-001',placa_inventario:'SIS-047', codigo:'TI-047', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Estación Médico 1',        ano_ingreso:'2022-08-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.MONITOR, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'Monitor UCI Adulto 2',        marca:'Samsung', modelo:'S27A600UUN 27"',          serie:'MONSAM-002',placa_inventario:'SIS-048', codigo:'TI-048', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Estación Médico 2',        ano_ingreso:'2022-08-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.MONITOR, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'Monitor Sistemas TI',         marca:'Dell',    modelo:'P2422H 24"',              serie:'MONDEL-001',placa_inventario:'SIS-049', codigo:'TI-049', ubicacion:'SISTEMAS',         ubicacion_especifica:'Área TI Puesto 1',        ano_ingreso:'2023-09-05', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.MONITOR, id_servicio_fk:S.SISTEMAS    },

  // ── TABLETAS (T.TABLETA = 127) ───────────────────────────────────────────
  { nombre_equipo:'Tableta Enfermería UCI',      marca:'Samsung', modelo:'Galaxy Tab S8 11"',       serie:'TBLSAM-001',placa_inventario:'SIS-050', codigo:'TI-050', ubicacion:'UCI ADULTO',       ubicacion_especifica:'Ronda de Enfermería',      ano_ingreso:'2023-07-20', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.TABLETA, id_servicio_fk:S.UCI_ADULTO  },
  { nombre_equipo:'Tableta Visita Médica',       marca:'Apple',   modelo:'iPad 10ª Gen 10.9"',      serie:'TBLAPL-001',placa_inventario:'SIS-051', codigo:'TI-051', ubicacion:'QUIRÚRGICOS',      ubicacion_especifica:'Sala Juntas Médicas',      ano_ingreso:'2024-01-15', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.TABLETA, id_servicio_fk:S.QUIRURGICO  },

  // ── ESCÁNERES (T.ESCANER = 124) ──────────────────────────────────────────
  { nombre_equipo:'Escáner Gestión Documental',  marca:'Fujitsu', modelo:'fi-7160',                 serie:'ESCFUJ-001',placa_inventario:'SIS-052', codigo:'TI-052', ubicacion:'GERENCIA',         ubicacion_especifica:'Gestión Documental',       ano_ingreso:'2022-03-10', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.ESCANER, id_servicio_fk:S.GERENCIA    },
  { nombre_equipo:'Escáner Archivo HC',          marca:'Canon',   modelo:'DR-C230',                 serie:'ESCCAN-001',placa_inventario:'SIS-053', codigo:'TI-053', ubicacion:'CONSULTA EXTERNA', ubicacion_especifica:'Archivo H.C.',             ano_ingreso:'2021-08-25', periodicidad:365, activo:true, administrable:false, id_tipo_equipo_fk:T.ESCANER, id_servicio_fk:S.CONS_EXT    },
];

// ── HOJA DE VIDA POR TIPO ────────────────────────────────────────────────────
const SO_MAP = {
  [T.COMPUTADOR]: 'Windows 10 Pro 22H2',
  [T.PORTATIL]:   'Windows 11 Pro 23H2',
  [T.SERVIDOR]:   'Windows Server 2022 Datacenter',
  [T.IMPRESORA]:  'No aplica',
  [T.SWITCH]:     'Cisco IOS 16.12',
  [T.ROUTER]:     'FortiOS 7.4',
  [T.MONITOR]:    'No aplica',
  [T.TABLETA]:    'Android 14 / iPadOS 17',
  [T.ESCANER]:    'No aplica',
};
const CPU_MAP = {
  [T.COMPUTADOR]: 'Intel Core i5-10400 6C/12T 2.9GHz',
  [T.PORTATIL]:   'Intel Core i7-1165G7 4C/8T 2.8GHz',
  [T.SERVIDOR]:   'Intel Xeon Silver 4210R 10C 2.4GHz x2',
  [T.IMPRESORA]:  'No aplica',
  [T.SWITCH]:     'No aplica',
  [T.ROUTER]:     'No aplica',
  [T.MONITOR]:    'No aplica',
  [T.TABLETA]:    'Snapdragon 8 Gen 1 / Apple A14',
  [T.ESCANER]:    'No aplica',
};
const RAM_MAP = {
  [T.COMPUTADOR]: '8 GB DDR4 2666 MHz',
  [T.PORTATIL]:   '16 GB DDR4 3200 MHz',
  [T.SERVIDOR]:   '64 GB DDR4 ECC 2933 MHz',
  [T.IMPRESORA]:  '256 MB',
  [T.SWITCH]:     'No aplica',
  [T.ROUTER]:     '2 GB DDR3',
  [T.MONITOR]:    'No aplica',
  [T.TABLETA]:    '8 GB LPDDR5',
  [T.ESCANER]:    'No aplica',
};
const DISCO_MAP = {
  [T.COMPUTADOR]: 'SSD 256 GB SATA III',
  [T.PORTATIL]:   'SSD 512 GB NVMe PCIe 4.0',
  [T.SERVIDOR]:   'HDD SAS 2 TB 10K x4 RAID 5',
  [T.IMPRESORA]:  'No aplica',
  [T.SWITCH]:     'Flash 2 GB',
  [T.ROUTER]:     'Flash 4 GB',
  [T.MONITOR]:    'No aplica',
  [T.TABLETA]:    '128 GB UFS 3.1',
  [T.ESCANER]:    'No aplica',
};
const OFFICE_MAP = {
  [T.COMPUTADOR]: 'Microsoft 365 E3',
  [T.PORTATIL]:   'Microsoft 365 E3',
  [T.SERVIDOR]:   'No aplica',
  default:        'No aplica',
};

const USUARIOS_EQUIPO = [
  'Dr. Carlos Vargas','Enf. Lucía Martínez','Tec. Pedro Gómez',
  'Adm. Sandra Ruiz','Dra. Ana Torres','Ing. Luis Reyes',
  'Aux. María López','Dr. Jorge Herrera','Coord. Diana Castro',
  'Adm. Fabio Niño',
];
const VENDEDORES = ['Compumax S.A.S','Danaranjo Ltda.','PC Factory Colombia','Syscom Colombia','Grupo TI S.A.S'];
const TIPO_USO   = ['Producción','Administrativo','Crítico','Consulta','Almacenamiento'];

function buildHV(equipoId, i, tipoId) {
  return {
    ip:               tipoId === T.SWITCH || tipoId === T.ROUTER
                        ? `10.0.${Math.floor(i/10)+1}.${i+1}`
                        : `192.168.${Math.floor(i/50)+1}.${(i % 200)+10}`,
    mac:              tipoId === T.MONITOR || tipoId === T.IMPRESORA || tipoId === T.ESCANER
                        ? 'No aplica'
                        : `A4:C3:${i.toString(16).padStart(2,'0').toUpperCase()}:${((i+10)%256).toString(16).padStart(2,'0').toUpperCase()}:${((i+20)%256).toString(16).padStart(2,'0').toUpperCase()}:FF`,
    procesador:       CPU_MAP[tipoId]  || 'No aplica',
    ram:              RAM_MAP[tipoId]  || 'No aplica',
    disco_duro:       DISCO_MAP[tipoId]|| 'No aplica',
    sistema_operativo:SO_MAP[tipoId]  || 'No aplica',
    office:           OFFICE_MAP[tipoId] || OFFICE_MAP.default || 'No aplica',
    tonner:           tipoId === T.IMPRESORA ? `Tóner ${['HP 58A','Brother TN-890','Lexmark 62D4H00','Canon C-EXV55'][i%4]}` : 'No aplica',
    nombre_usuario:   USUARIOS_EQUIPO[i % USUARIOS_EQUIPO.length],
    vendedor:         VENDEDORES[i % VENDEDORES.length],
    tipo_uso:         TIPO_USO[i % TIPO_USO.length],
    fecha_compra:     ['2020-01-15','2021-06-10','2022-03-20','2023-09-05','2024-01-12'][i%5],
    fecha_instalacion:['2020-02-01','2021-06-15','2022-03-25','2023-09-10','2024-01-15'][i%5],
    costo_compra:     ['2500000','3800000','5200000','1900000','7500000','12000000'][i%6],
    contrato:         `CONT-2024-${String(i+1).padStart(3,'0')}`,
    observaciones:    'Equipo registrado en inventario de sistemas. Sin novedades al momento de instalación.',
    compraddirecta:   i % 3 === 0,
    convenio:         i % 3 === 1,
    donado:           false,
    comodato:         i % 10 === 0,
    fecha_inicio_soporte:       ['2020-02-01','2021-06-15','2022-03-25','2023-09-10','2024-01-15'][i%5],
    anos_soporte_fabricante:    [3, 4, 5][i % 3],
    id_sysequipo_fk:  equipoId,
  };
}

// ── PLANTILLAS DE MANTENIMIENTO ─────────────────────────────────────────────

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
    nombreRecibio:     ['Jefe Enfermería','Aux. Administrativo','Coordinador Servicio','Médico Residente'][idx % 4],
    cedulaRecibio:     `1023${String(idx * 7 + 100).padStart(5,'0')}`,
    observaciones:     'Equipo en buen estado. Protocolo completado. Próximo mantenimiento en 6 meses.',
    mantenimientoPropio: true,
    realizado:         true,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

function buildCorrectivo(equipoId, servicioId, usuarioId, fecha, idx) {
  const FALLAS_MAP = [
    { falla:'Desgaste',           trabajo:'Ventilador con rodamiento desgastado. Reemplazo y aplicación de pasta térmica. Temp. carga: 52°C estable.' },
    { falla:'Causa Externa',      trabajo:'Pico de tensión dañó la fuente. Reemplazo fuente HP 300W original. Prueba funcional OK.' },
    { falla:'Accesorios',         trabajo:'Teclado con líquido derramado. Limpieza isopropílico 70%. Reemplazo 3 teclas dañadas. Operativo.' },
    { falla:'Otros',              trabajo:'Puerto RJ45 dañado. Sustitución tarjeta de red. IP estática configurada. Ping al HIS OK.' },
    { falla:'Operación Indebida', trabajo:'HDD con 47 sectores defectuosos. CHKDSK /R ejecutado. Rendimiento mejoró 60%. Reemplazo sugerido.' },
    { falla:'Desconocido',        trabajo:'Cable DisplayPort suelto. Conector asegurado y probado cable de repuesto. Imagen estable.' },
  ];
  const f = FALLAS_MAP[idx % FALLAS_MAP.length];
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
    nombreRecibio:     ['Auxiliar Enfermería','Aux. Administrativo','Técnico de Servicio'][idx % 3],
    cedulaRecibio:     `7654${String(idx * 3 + 200).padStart(5,'0')}`,
    observaciones:     'Falla corregida satisfactoriamente. Equipo entregado en pleno funcionamiento al usuario del servicio.',
    mantenimientoPropio: true,
    realizado:         true,
    id_sysequipo_fk:   equipoId,
    servicioIdFk:      servicioId,
    usuarioIdFk:       usuarioId,
  };
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida.\n');

    // Borrar mantenimientos incorrectos (SysReporteMantenimiento) de los equipos actuales
    await sequelize.query('DELETE FROM SysReporteMantenimiento WHERE id_sysequipo_fk BETWEEN 87 AND 200', { type: 'RAW' });
    console.log('✓ Registros previos en SysReporteMantenimiento eliminados.\n');

    let creados = 0, omitidos = 0;

    for (let i = 0; i < EQUIPOS.length; i++) {
      const eq = EQUIPOS[i];

      const existe = await SysEquipo.findOne({ where: { placa_inventario: eq.placa_inventario } });
      if (existe) {
        // Equipo ya existe: solo insertar mantenimientos si no tiene
        const countMtto = await SysReporte.count({ where: { id_sysequipo_fk: existe.id_sysequipo } });
        if (countMtto === 0) {
          await SysReporte.create(buildPreventivo(existe.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2024-05-08', i));
          await SysReporte.create(buildPreventivo(existe.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2024-11-12', i + 10));
          if (i % 5 !== 0) await SysReporte.create(buildCorrectivo(existe.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2025-02-18', i));
          console.log(`  [MTTO AÑADIDO] ${existe.nombre_equipo}`);
        } else {
          console.log(`  [OMITIDO] ${eq.nombre_equipo} (ya tiene mantenimientos)`);
        }
        omitidos++;
        continue;
      }

      const equipo = await SysEquipo.create(eq);
      console.log(`  [CREADO] ${equipo.nombre_equipo} — ID ${equipo.id_sysequipo}`);
      creados++;

      // Hoja de Vida completa
      await SysHojaVida.create(buildHV(equipo.id_sysequipo, i, eq.id_tipo_equipo_fk));

      // 2 preventivos + 1 correctivo (en SysReporte — tabla que lee el frontend)
      await SysReporte.create(buildPreventivo(equipo.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2024-05-08', i));
      await SysReporte.create(buildPreventivo(equipo.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2024-11-12', i + 10));
      if (i % 5 !== 0) {
        await SysReporte.create(buildCorrectivo(equipo.id_sysequipo, eq.id_servicio_fk, USUARIO_ID, '2025-02-18', i));
      }
    }

    console.log('\n══════════════════════════════════════════════');
    console.log(`  Equipos creados  : ${creados}`);
    console.log(`  Equipos omitidos : ${omitidos}`);
    console.log(`  Total procesados : ${EQUIPOS.length}`);
    console.log('══════════════════════════════════════════════');
    console.log('✓ Seed completado.');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    if (err.original) console.error('  DB:', err.original.message);
    await sequelize.close();
    process.exit(1);
  }
})();
