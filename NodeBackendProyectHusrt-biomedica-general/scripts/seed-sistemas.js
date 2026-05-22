/**
 * seed-sistemas.js
 * Limpia todos los datos del módulo Sistemas e inserta 40 equipos de prueba realistas.
 * Uso: node scripts/seed-sistemas.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize  = require('../config/configDb');
const TipoEquipo = require('../models/generales/TipoEquipo');
const Servicio   = require('../models/generales/Servicio');
const Sede       = require('../models/generales/Sede');
const Usuario    = require('../models/generales/Usuario');
const SysEquipo  = require('../models/Sistemas/SysEquipo');
const SysHojaVida= require('../models/Sistemas/SysHojaVida');
const SysBodega  = require('../models/Sistemas/SysBodega');
const SysBaja    = require('../models/Sistemas/SysBaja');
const SysTrazabilidad = require('../models/Sistemas/SysTrazabilidad');

// Cargar el resto de modelos para evitar errores de asociaciones no definidas
require('../models/Sistemas/SysReporte');
require('../models/Sistemas/SysReporteEntrega');
require('../models/Sistemas/SysReporteMantenimiento');
require('../models/Sistemas/SysPlanMantenimiento');
require('../models/Sistemas/SysProtocoloPreventivo');
require('../models/Sistemas/SysCumplimientoProtocoloPreventivo');
require('../models/Sistemas/SysTrazabilidad');
require('../models/Sistemas/SysTipoRepuesto');
require('../models/Sistemas/SysRepuesto');
require('../models/Sistemas/SysAuditoriaRepuesto');
require('../models/Sistemas/SysMovimientosStockRepuestos');
require('../models/Sistemas/Sysprogramacionpreventivomes');

// ─── Helpers ────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (from, to) => {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return new Date(f + Math.random() * (t - f)).toISOString().split('T')[0];
};

const pad = (n, len = 4) => String(n).padStart(len, '0');

// ─── Datos base realistas ────────────────────────────────────────────────────

const MARCAS_PC = ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer'];
const MARCAS_LAPTOP = ['HP', 'Dell', 'Lenovo', 'Asus', 'MacBook'];
const MARCAS_IMPRESORA = ['HP', 'Epson', 'Brother', 'Samsung', 'Canon'];
const MARCAS_SERVIDOR = ['HP', 'Dell', 'IBM', 'Lenovo'];
const MARCAS_SWITCH = ['Cisco', 'TP-Link', 'Huawei', 'Ubiquiti'];
const MARCAS_UPS = ['APC', 'Eaton', 'CyberPower', 'Powerware'];

const PROCESADORES = [
  'Intel Core i3-10100', 'Intel Core i5-10400', 'Intel Core i7-10700',
  'Intel Core i5-12400', 'Intel Core i7-12700', 'AMD Ryzen 5 5600G', 'AMD Ryzen 7 5700G'
];
const RAMS = ['4 GB DDR4', '8 GB DDR4', '16 GB DDR4', '32 GB DDR4'];
const DISCOS = ['240 GB SSD', '480 GB SSD', '1 TB HDD', '500 GB HDD', '256 GB NVMe'];
const SOS = ['Windows 10 Pro', 'Windows 11 Pro', 'Ubuntu 22.04 LTS'];
const OFFICES = ['Microsoft Office 2019', 'Microsoft Office 2021', 'LibreOffice 7', 'Sin Office'];
const TONNERS = ['HP 85A', 'HP 80A', 'Brother TN-2360', 'Epson T544', 'N/A'];

const MODELOS_PC = ['EliteDesk 800 G5', 'OptiPlex 7090', 'ThinkCentre M720', 'Veriton M4680G', 'PN52'];
const MODELOS_LAPTOP = ['EliteBook 840 G8', 'Latitude 5520', 'ThinkPad E15', 'VivoBook 15', 'MacBook Air M1'];
const MODELOS_IMPRESORA = ['LaserJet Pro M404n', 'EcoTank L3250', 'HL-L2350DW', 'Xpress M2020', 'PIXMA G3160'];
const MODELOS_SERVIDOR = ['ProLiant DL360 Gen10', 'PowerEdge R640', 'System x3650 M5', 'ThinkSystem SR530'];
const MODELOS_SWITCH = ['Catalyst 2960-X', 'TL-SG1024', 'S5735-L24T4X', 'UniFi 24-Port'];
const MODELOS_UPS = ['Smart-UPS 1500', 'Ellipse ECO 1600', 'CP1500EPFCLCD', 'EX 1000 RT'];

const IPS_BASE = [
  '192.168.1.', '192.168.2.', '10.10.0.', '172.16.1.'
];

const generarIP = (idx) => `${pick(IPS_BASE)}${10 + idx}`;
const generarMAC = () =>
  [...Array(6)].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase();
const generarSerie = (prefijo) =>
  `${prefijo}${Math.floor(10000 + Math.random() * 90000)}`;

// ─── Definición de los 40 equipos ───────────────────────────────────────────

/**
 * Genera la lista de 40 equipos usando los tipos/servicios/usuarios reales de la BD.
 * tiposMap: { 'PC'→id, 'Laptop'→id, 'Impresora'→id, 'Servidor'→id, 'Switch'→id, 'UPS'→id }
 * servicios: array de {id, nombres}
 * usuarios:  array de {id}
 */
function buildEquipos(tiposMap, servicios, usuarios) {
  const tipoKeys = Object.keys(tiposMap);
  if (tipoKeys.length === 0) throw new Error('No hay tipos de equipo de Sistemas en la BD. Créalos primero.');
  if (servicios.length === 0) throw new Error('No hay servicios activos en la BD.');

  const userId = usuarios.length > 0 ? usuarios[0].id : null;

  // Helper para elegir tipo: si el nombre clave no existe, usa el primero disponible
  const tipo = (nombre) => tiposMap[nombre] ?? tiposMap[tipoKeys[0]];

  const equipos = [
    // ──────── ACTIVOS (30) ────────
    // 15 Computadores de escritorio
    { nombre_equipo: 'Computador Admisiones 01', marca: 'HP',    modelo: 'EliteDesk 800 G5',   serie: generarSerie('HP'), placa: 'SIS-0001', cod: 'COM-001', svc: servicios[0 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Escritorio recepción', activo: true },
    { nombre_equipo: 'Computador Admisiones 02', marca: 'HP',    modelo: 'EliteDesk 800 G5',   serie: generarSerie('HP'), placa: 'SIS-0002', cod: 'COM-002', svc: servicios[0 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Escritorio auxiliar', activo: true },
    { nombre_equipo: 'Computador Urgencias 01',  marca: 'Dell',  modelo: 'OptiPlex 7090',       serie: generarSerie('DL'), placa: 'SIS-0003', cod: 'COM-003', svc: servicios[1 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Triage',             activo: true },
    { nombre_equipo: 'Computador Urgencias 02',  marca: 'Dell',  modelo: 'OptiPlex 7090',       serie: generarSerie('DL'), placa: 'SIS-0004', cod: 'COM-004', svc: servicios[1 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Enfermería',        activo: true },
    { nombre_equipo: 'Computador Consulta 01',   marca: 'Lenovo',modelo: 'ThinkCentre M720',    serie: generarSerie('LN'), placa: 'SIS-0005', cod: 'COM-005', svc: servicios[2 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Consultorio 1',     activo: true },
    { nombre_equipo: 'Computador Consulta 02',   marca: 'Lenovo',modelo: 'ThinkCentre M720',    serie: generarSerie('LN'), placa: 'SIS-0006', cod: 'COM-006', svc: servicios[2 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Consultorio 2',     activo: true },
    { nombre_equipo: 'Computador Farmacia 01',   marca: 'Asus',  modelo: 'PN52',                serie: generarSerie('AS'), placa: 'SIS-0007', cod: 'COM-007', svc: servicios[3 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[3 % servicios.length].ubicacion, ubi_esp: 'Mostrador',         activo: true },
    { nombre_equipo: 'Computador Laboratorio 01',marca: 'HP',    modelo: 'EliteDesk 800 G5',   serie: generarSerie('HP'), placa: 'SIS-0008', cod: 'COM-008', svc: servicios[4 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[4 % servicios.length].ubicacion, ubi_esp: 'Área toma muestras',activo: true },
    { nombre_equipo: 'Computador Laboratorio 02',marca: 'HP',    modelo: 'EliteDesk 800 G5',   serie: generarSerie('HP'), placa: 'SIS-0009', cod: 'COM-009', svc: servicios[4 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[4 % servicios.length].ubicacion, ubi_esp: 'Área análisis',     activo: true },
    { nombre_equipo: 'Computador Imagenología 01',marca:'Dell',  modelo: 'OptiPlex 5090',       serie: generarSerie('DL'), placa: 'SIS-0010', cod: 'COM-010', svc: servicios[5 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[5 % servicios.length].ubicacion, ubi_esp: 'Recepción',         activo: true },
    { nombre_equipo: 'Computador Contabilidad 01',marca:'HP',    modelo: 'ProDesk 600 G5',      serie: generarSerie('HP'), placa: 'SIS-0011', cod: 'COM-011', svc: servicios[0 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Oficina 201',       activo: true },
    { nombre_equipo: 'Computador RRHH 01',       marca: 'HP',    modelo: 'ProDesk 600 G5',      serie: generarSerie('HP'), placa: 'SIS-0012', cod: 'COM-012', svc: servicios[1 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Gerencia',          activo: true },
    { nombre_equipo: 'Computador Sistemas 01',   marca: 'Lenovo',modelo: 'ThinkCentre M90s',    serie: generarSerie('LN'), placa: 'SIS-0013', cod: 'COM-013', svc: servicios[2 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Datacenter',        activo: true },
    { nombre_equipo: 'Computador Sistemas 02',   marca: 'Lenovo',modelo: 'ThinkCentre M90s',    serie: generarSerie('LN'), placa: 'SIS-0014', cod: 'COM-014', svc: servicios[2 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Oficina técnica',   activo: true },
    { nombre_equipo: 'Computador UCI 01',        marca: 'Dell',  modelo: 'OptiPlex 3080',       serie: generarSerie('DL'), placa: 'SIS-0015', cod: 'COM-015', svc: servicios[3 % servicios.length].id, tipo: tipo('PC'),     ubicacion: servicios[3 % servicios.length].ubicacion, ubi_esp: 'Cuarto UCI',        activo: true },

    // 7 Portátiles
    { nombre_equipo: 'Portátil Gerencia',        marca: 'HP',    modelo: 'EliteBook 840 G8',    serie: generarSerie('HP'), placa: 'SIS-0016', cod: 'LAP-001', svc: servicios[0 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Gerencia General',  activo: true },
    { nombre_equipo: 'Portátil Sistemas 01',     marca: 'Dell',  modelo: 'Latitude 5520',       serie: generarSerie('DL'), placa: 'SIS-0017', cod: 'LAP-002', svc: servicios[1 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Área técnica',      activo: true },
    { nombre_equipo: 'Portátil Sistemas 02',     marca: 'Lenovo',modelo: 'ThinkPad E15',        serie: generarSerie('LN'), placa: 'SIS-0018', cod: 'LAP-003', svc: servicios[2 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Sala reuniones',    activo: true },
    { nombre_equipo: 'Portátil Capacitación 01', marca: 'Asus',  modelo: 'VivoBook 15',         serie: generarSerie('AS'), placa: 'SIS-0019', cod: 'LAP-004', svc: servicios[3 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[3 % servicios.length].ubicacion, ubi_esp: 'Aula capacitación', activo: true },
    { nombre_equipo: 'Portátil Capacitación 02', marca: 'Asus',  modelo: 'VivoBook 15',         serie: generarSerie('AS'), placa: 'SIS-0020', cod: 'LAP-005', svc: servicios[4 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[4 % servicios.length].ubicacion, ubi_esp: 'Aula capacitación', activo: true },
    { nombre_equipo: 'Portátil Auditoría',       marca: 'HP',    modelo: 'ProBook 445 G8',      serie: generarSerie('HP'), placa: 'SIS-0021', cod: 'LAP-006', svc: servicios[0 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Auditoría',         activo: true },
    { nombre_equipo: 'Portátil Estadística',     marca: 'Lenovo',modelo: 'IdeaPad 5',           serie: generarSerie('LN'), placa: 'SIS-0022', cod: 'LAP-007', svc: servicios[1 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Estadística',       activo: true },

    // 4 Impresoras
    { nombre_equipo: 'Impresora Admisiones',     marca: 'HP',    modelo: 'LaserJet Pro M404n',  serie: generarSerie('HP'), placa: 'SIS-0023', cod: 'IMP-001', svc: servicios[0 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: servicios[0 % servicios.length].ubicacion, ubi_esp: 'Recepción',         activo: true },
    { nombre_equipo: 'Impresora Urgencias',      marca: 'Brother',modelo:'HL-L2350DW',          serie: generarSerie('BR'), placa: 'SIS-0024', cod: 'IMP-002', svc: servicios[1 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: servicios[1 % servicios.length].ubicacion, ubi_esp: 'Enfermería',        activo: true },
    { nombre_equipo: 'Impresora Laboratorio',    marca: 'Epson', modelo: 'EcoTank L3250',       serie: generarSerie('EP'), placa: 'SIS-0025', cod: 'IMP-003', svc: servicios[2 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Área impresión',    activo: true },
    { nombre_equipo: 'Impresora Farmacia',       marca: 'HP',    modelo: 'LaserJet M203dw',     serie: generarSerie('HP'), placa: 'SIS-0026', cod: 'IMP-004', svc: servicios[3 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: servicios[3 % servicios.length].ubicacion, ubi_esp: 'Mostrador',         activo: true },

    // 2 Servidores
    { nombre_equipo: 'Servidor Principal',       marca: 'HP',    modelo: 'ProLiant DL360 Gen10',serie: generarSerie('SV'), placa: 'SIS-0027', cod: 'SRV-001', svc: servicios[2 % servicios.length].id, tipo: tipo('Servidor'), ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Datacenter Rack 1',  activo: true },
    { nombre_equipo: 'Servidor Backup',          marca: 'Dell',  modelo: 'PowerEdge R640',      serie: generarSerie('SV'), placa: 'SIS-0028', cod: 'SRV-002', svc: servicios[2 % servicios.length].id, tipo: tipo('Servidor'), ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Datacenter Rack 2',  activo: true },

    // 2 Switches
    { nombre_equipo: 'Switch Core Piso 1',       marca: 'Cisco', modelo: 'Catalyst 2960-X',     serie: generarSerie('CS'), placa: 'SIS-0029', cod: 'SWT-001', svc: servicios[2 % servicios.length].id, tipo: tipo('Switch'),   ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Cuarto de red P1', activo: true },
    { nombre_equipo: 'Switch Core Piso 2',       marca: 'Cisco', modelo: 'Catalyst 2960-X',     serie: generarSerie('CS'), placa: 'SIS-0030', cod: 'SWT-002', svc: servicios[2 % servicios.length].id, tipo: tipo('Switch'),   ubicacion: servicios[2 % servicios.length].ubicacion, ubi_esp: 'Cuarto de red P2', activo: true },

    // ──────── EN BODEGA (5) ────────
    { nombre_equipo: 'Computador Antiguo 01',    marca: 'HP',    modelo: 'Compaq Pro 6300',     serie: generarSerie('HP'), placa: 'SIS-0031', cod: 'COM-031', svc: servicios[0 % servicios.length].id, tipo: tipo('PC'),     ubicacion: 'Bodega', ubi_esp: null, activo: false, bodega: true, tipo_bodega: 'Bodega Sistemas', motivo_bodega: 'Equipo fuera de garantía, pendiente evaluación técnica' },
    { nombre_equipo: 'Computador Antiguo 02',    marca: 'Dell',  modelo: 'OptiPlex 390',        serie: generarSerie('DL'), placa: 'SIS-0032', cod: 'COM-032', svc: servicios[1 % servicios.length].id, tipo: tipo('PC'),     ubicacion: 'Bodega', ubi_esp: null, activo: false, bodega: true, tipo_bodega: 'Bodega Sistemas', motivo_bodega: 'Falla en disco duro, requiere reemplazo' },
    { nombre_equipo: 'Portátil Dañado',          marca: 'HP',    modelo: 'ProBook 4540s',       serie: generarSerie('HP'), placa: 'SIS-0033', cod: 'LAP-033', svc: servicios[2 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: 'Bodega', ubi_esp: null, activo: false, bodega: true, tipo_bodega: 'Bodega Almacén',  motivo_bodega: 'Pantalla rota, en espera de repuesto' },
    { nombre_equipo: 'Impresora Averiada',       marca: 'HP',    modelo: 'LaserJet P1102',      serie: generarSerie('HP'), placa: 'SIS-0034', cod: 'IMP-034', svc: servicios[3 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: 'Bodega', ubi_esp: null, activo: false, bodega: true, tipo_bodega: 'Bodega Almacén',  motivo_bodega: 'Falla en fuente de poder, costo de reparación elevado' },
    { nombre_equipo: 'UPS Descargado',           marca: 'APC',   modelo: 'Back-UPS 500',        serie: generarSerie('UP'), placa: 'SIS-0035', cod: 'UPS-035', svc: servicios[4 % servicios.length].id, tipo: tipo('UPS'),      ubicacion: 'Bodega', ubi_esp: null, activo: false, bodega: true, tipo_bodega: 'Bodega Sistemas', motivo_bodega: 'Baterías agotadas, reemplazo en proceso' },

    // ──────── DADOS DE BAJA (5) ────────
    { nombre_equipo: 'PC Obsoleto Enfermería',   marca: 'HP',    modelo: 'Vectra VL',           serie: generarSerie('HP'), placa: 'SIS-0036', cod: 'COM-036', svc: servicios[0 % servicios.length].id, tipo: tipo('PC'),     ubicacion: 'Bodega', ubi_esp: null, activo: false, baja: true, justificacion: 'Equipo obsoleto, 15 años de uso. Sin soporte de fabricante. No compatible con software institucional.' },
    { nombre_equipo: 'Monitor Quemado',          marca: 'Samsung',modelo:'SyncMaster 743N',     serie: generarSerie('SM'), placa: 'SIS-0037', cod: 'MON-037', svc: servicios[1 % servicios.length].id, tipo: tipo('Monitor') ?? tipo('PC'), ubicacion: 'Bodega', ubi_esp: null, activo: false, baja: true, justificacion: 'Falla en la placa de control. Costo de reparación supera el valor del equipo.' },
    { nombre_equipo: 'Laptop Obsoleta RRHH',     marca: 'Acer',  modelo: 'Aspire 4730',         serie: generarSerie('AC'), placa: 'SIS-0038', cod: 'LAP-038', svc: servicios[2 % servicios.length].id, tipo: tipo('Laptop'),  ubicacion: 'Bodega', ubi_esp: null, activo: false, baja: true, justificacion: 'Equipo de 2009, sin soporte Windows 10. Procesador incompatible con aplicaciones actuales.' },
    { nombre_equipo: 'Impresora Fuera de Uso',   marca: 'Lexmark',modelo:'E360dn',              serie: generarSerie('LX'), placa: 'SIS-0039', cod: 'IMP-039', svc: servicios[3 % servicios.length].id, tipo: tipo('Impresora'),ubicacion: 'Bodega', ubi_esp: null, activo: false, baja: true, justificacion: 'Sin disponibilidad de tóner ni repuestos en el mercado nacional.' },
    { nombre_equipo: 'Switch Obsoleto Red',      marca: 'D-Link', modelo:'DES-1016D',           serie: generarSerie('DL'), placa: 'SIS-0040', cod: 'SWT-040', svc: servicios[4 % servicios.length].id, tipo: tipo('Switch'),   ubicacion: 'Bodega', ubi_esp: null, activo: false, baja: true, justificacion: 'Switch no administrable, 100Mbps. Reemplazado por equipo Cisco Gigabit. Obsolescencia tecnológica total.' },
  ];

  return equipos;
}

// ─── Hoja de vida por tipo ────────────────────────────────────────────────────

function buildHojaVida(equipoData, equipoId, idx) {
  const nombre = equipoData.nombre_equipo.toLowerCase();
  const esLaptop    = nombre.includes('portátil') || nombre.includes('laptop');
  const esImpresora = nombre.includes('impresora');
  const esServidor  = nombre.includes('servidor');
  const esSwitch    = nombre.includes('switch');
  const esUps       = nombre.includes('ups') || nombre.includes('descargado');
  const esMonitor   = nombre.includes('monitor');

  const fechaCompra = randomDate('2016-01-01', '2023-12-31');
  const fechaInst   = fechaCompra; // misma fecha aproximada

  if (esImpresora || esSwitch || esUps || esMonitor) {
    return {
      id_sysequipo_fk: equipoId,
      ip: null, mac: null, procesador: null, ram: null, disco_duro: null,
      sistema_operativo: null, office: null,
      tonner: esImpresora ? pick(TONNERS.filter(t => t !== 'N/A')) : null,
      nombre_usuario: null,
      tipo_uso: 'Institucional',
      fecha_compra: fechaCompra,
      fecha_instalacion: fechaInst,
      fecha_inicio_soporte: fechaCompra,
      anos_soporte_fabricante: pick([3, 5]),
      costo_compra: `${(Math.floor(Math.random() * 8) + 3) * 100000}`,
      compraddirecta: true,
      vendedor: pick(['Tecnocom', 'Proinco', 'SYS Distribuciones', 'NetSol']),
      observaciones: null
    };
  }

  if (esServidor) {
    return {
      id_sysequipo_fk: equipoId,
      ip: generarIP(idx),
      mac: generarMAC(),
      procesador: 'Intel Xeon Silver 4210R 10 núcleos',
      ram: '64 GB ECC DDR4',
      disco_duro: '2 TB SSD RAID 1',
      sistema_operativo: 'Windows Server 2019',
      office: null,
      tonner: null,
      nombre_usuario: 'Administrador',
      tipo_uso: 'Servidor',
      fecha_compra: fechaCompra,
      fecha_instalacion: fechaInst,
      fecha_inicio_soporte: fechaCompra,
      anos_soporte_fabricante: 5,
      costo_compra: `${(Math.floor(Math.random() * 40) + 60) * 100000}`,
      compraddirecta: true,
      vendedor: pick(['Tecnocom', 'NetSol', 'ServiSystems']),
      observaciones: 'Servidor crítico — no apagar sin autorización de jefe de sistemas'
    };
  }

  return {
    id_sysequipo_fk: equipoId,
    ip: generarIP(idx),
    mac: generarMAC(),
    procesador: pick(PROCESADORES),
    ram: pick(RAMS),
    disco_duro: pick(DISCOS),
    sistema_operativo: pick(SOS),
    office: pick(OFFICES),
    tonner: 'N/A',
    nombre_usuario: `usuario${pad(idx, 3)}`,
    tipo_uso: esLaptop ? pick(['Portátil', 'Mixto']) : 'Fijo',
    fecha_compra: fechaCompra,
    fecha_instalacion: fechaInst,
    fecha_inicio_soporte: fechaCompra,
    anos_soporte_fabricante: pick([3, 5]),
    costo_compra: `${(Math.floor(Math.random() * 20) + 18) * 100000}`,
    compraddirecta: Math.random() > 0.3,
    convenio: Math.random() < 0.2,
    vendedor: pick(['Tecnocom', 'Proinco', 'SYS Distribuciones', 'iSistemas']),
    observaciones: null
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔌 Conectando a la base de datos...');
  await sequelize.authenticate();
  console.log('✅ Conexión exitosa.\n');

  // ── 1. Leer datos existentes ──
  const tiposDB = await TipoEquipo.findAll({ where: { activo: true } });
  const serviciosDB = await Servicio.findAll({
    where: { activo: true },
    include: [{ model: Sede, as: 'sede' }]
  });
  const usuariosDB = await Usuario.findAll({ limit: 10 });

  if (tiposDB.length === 0) {
    console.error('❌ No hay tipos de equipo activos. Crea al menos un TipoEquipo primero.');
    process.exit(1);
  }
  if (serviciosDB.length === 0) {
    console.error('❌ No hay servicios activos. Crea al menos un Servicio primero.');
    process.exit(1);
  }

  console.log(`📋 TipoEquipo encontrados (${tiposDB.length}):`);
  tiposDB.forEach(t => console.log(`   [${t.id}] ${t.nombres}`));

  console.log(`\n🏥 Servicios activos (${serviciosDB.length}):`);
  serviciosDB.forEach(s => console.log(`   [${s.id}] ${s.nombres} — ${s.ubicacion}`));

  // Construir mapa tipo nombre→id (flexible: compara en minúsculas)
  const tiposMap = {};
  for (const t of tiposDB) {
    const nom = t.nombres.toLowerCase();
    // Claves comunes
    if (nom.includes('computador') || nom.includes('pc') || nom.includes('desktop') || nom.includes('escritorio')) tiposMap['PC'] = t.id;
    if (nom.includes('portátil') || nom.includes('laptop') || nom.includes('notebook')) tiposMap['Laptop'] = t.id;
    if (nom.includes('impresora') || nom.includes('printer')) tiposMap['Impresora'] = t.id;
    if (nom.includes('servidor') || nom.includes('server')) tiposMap['Servidor'] = t.id;
    if (nom.includes('switch') || nom.includes('router') || nom.includes('red')) tiposMap['Switch'] = t.id;
    if (nom.includes('ups') || nom.includes('regulador') || nom.includes('no break')) tiposMap['UPS'] = t.id;
    if (nom.includes('monitor') || nom.includes('pantalla')) tiposMap['Monitor'] = t.id;
    // Fallback: guardar también por nombre exacto
    tiposMap[t.nombres] = t.id;
  }

  // Fallback: si ningún nombre clave coincide, usar el primer tipo disponible para todo
  const fallbackTipoId = tiposDB[0].id;
  ['PC','Laptop','Impresora','Servidor','Switch','UPS','Monitor'].forEach(k => {
    if (!tiposMap[k]) tiposMap[k] = fallbackTipoId;
  });

  console.log('\n🗺️  Mapa de tipos usado:');
  Object.entries(tiposMap).forEach(([k, v]) => {
    const t = tiposDB.find(x => x.id === v);
    if (t) console.log(`   ${k} → [${v}] ${t.nombres}`);
  });

  const userId = usuariosDB.length > 0 ? usuariosDB[0].id : null;

  // ── 2. Limpiar tablas Sistemas ──
  console.log('\n🧹 Limpiando datos existentes del módulo Sistemas...');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

  const tablasSistemas = [
    'SysCumplimientoProtocoloPreventivo',
    'Sysprogramacionpreventivomes',
    'SysReporteMantenimiento',
    'SysReporteEntrega',
    'SysReporte',
    'SysProtocoloPreventivo',
    'SysPlanMantenimiento',
    'SysAuditoriaRepuesto',
    'SysMovimientosStockRepuestos',
    'SysTrazabilidad',
    'SysHojaVida',
    'SysBodega',
    'SysBaja',
    'SysEquipo',
  ];

  for (const tabla of tablasSistemas) {
    try {
      await sequelize.query(`DELETE FROM \`${tabla}\``);
      await sequelize.query(`ALTER TABLE \`${tabla}\` AUTO_INCREMENT = 1`);
      console.log(`   ✓ ${tabla}`);
    } catch (e) {
      console.warn(`   ⚠ ${tabla}: ${e.message}`);
    }
  }

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Tablas limpias.\n');

  // ── 3. Crear equipos ──
  console.log('🔨 Creando 40 equipos de prueba...\n');

  const equiposDef = buildEquipos(tiposMap, serviciosDB, usuariosDB);

  let creados = 0;
  const bodegaEquipos = [];
  const bajaEquipos   = [];

  for (let i = 0; i < equiposDef.length; i++) {
    const def = equiposDef[i];
    try {
      const equipo = await SysEquipo.create({
        nombre_equipo:       def.nombre_equipo,
        marca:               def.marca,
        modelo:              def.modelo,
        serie:               def.serie,
        placa_inventario:    def.placa,
        codigo:              def.cod,
        ubicacion:           def.ubicacion,
        ubicacion_especifica:def.ubi_esp || null,
        ubicacion_anterior:  null,
        activo:              def.activo ? 1 : 0,
        estado_baja:         def.baja ? 1 : 0,
        id_servicio_fk:      def.svc,
        id_tipo_equipo_fk:   def.tipo,
        id_usuario_fk:       userId,
        administrable:       def.nombre_equipo.toLowerCase().includes('servidor') || def.nombre_equipo.toLowerCase().includes('switch') ? 1 : 0,
        preventivo_s:        1,
        ano_ingreso:         randomDate('2016-01-01', '2023-12-31'),
      });

      // Hoja de vida (solo para activos y bodega)
      if (!def.baja) {
        const hv = buildHojaVida(def, equipo.id_sysequipo, i + 1);
        await SysHojaVida.create(hv);
      }

      // Bodega
      if (def.bodega) {
        const ubOrig = serviciosDB.find(s => s.id === def.svc)?.ubicacion || 'Servicio';
        await SysBodega.create({
          tipo_bodega:      def.tipo_bodega,
          motivo:           def.motivo_bodega,
          fecha_ingreso:    randomDate('2024-01-01', '2025-12-31'),
          id_sysequipo_fk:  equipo.id_sysequipo,
          id_sysusuario_fk: userId,
          ubicacion_origen: ubOrig,
          ubicacion_esp_origen: null
        });
        bodegaEquipos.push(def.nombre_equipo);
      }

      // Baja
      if (def.baja) {
        await SysBaja.create({
          fecha_baja:             randomDate('2023-06-01', '2025-03-31'),
          justificacion_baja:     def.justificacion,
          accesorios_reutilizables: 'Cables de poder, teclado y mouse (si aplica)',
          id_sysequipo_fk:        equipo.id_sysequipo,
          id_sysusuario_fk:       userId
        });
        bajaEquipos.push(def.nombre_equipo);
      }

      const estado = def.baja ? '🔴 BAJA' : def.bodega ? '🟡 BODEGA' : '🟢 ACTIVO';
      console.log(`   ${estado} [${String(i + 1).padStart(2, '0')}] ${def.nombre_equipo}`);
      creados++;
    } catch (e) {
      console.error(`   ❌ Error en "${def.nombre_equipo}": ${e.message}`);
    }
  }

  // ── 4. Resumen ──
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`✅ Seed completado: ${creados} / ${equiposDef.length} equipos creados`);
  console.log(`   🟢 Activos  : ${creados - bodegaEquipos.length - bajaEquipos.length}`);
  console.log(`   🟡 En bodega: ${bodegaEquipos.length}`);
  console.log(`   🔴 Baja     : ${bajaEquipos.length}`);
  console.log(`${'─'.repeat(55)}\n`);

  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message || err);
  process.exit(1);
});
