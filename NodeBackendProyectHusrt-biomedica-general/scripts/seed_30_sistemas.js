/**
 * seed_30_sistemas.js
 * Inserta 30 equipos de sistemas con hoja de vida completa.
 * Lee servicios y tipos de equipo reales de la BD.
 * Uso: node scripts/seed_30_sistemas.js
 */

require('dotenv').config();
const sequelize  = require('../config/configDb');
const Servicio   = require('../models/generales/Servicio');
const TipoEquipo = require('../models/generales/TipoEquipo');
const SysEquipo  = require('../models/Sistemas/SysEquipo');
const SysHojaVida = require('../models/Sistemas/SysHojaVida');

const pick = (arr, i) => arr[i % arr.length];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    // ── Leer catálogos reales ────────────────────────────────────────────────
    const servicios   = await Servicio.findAll({ where: { activo: true } });
    let   tiposEquipo = await TipoEquipo.findAll({ where: { activo: true, tipoR: 2 } });
    if (tiposEquipo.length === 0)
      tiposEquipo = await TipoEquipo.findAll({ where: { activo: true } });

    if (!servicios.length)   { console.error('❌ No hay servicios activos.');       process.exit(1); }
    if (!tiposEquipo.length) { console.error('❌ No hay tipos de equipo activos.');  process.exit(1); }

    console.log(`📋 ${servicios.length} servicios | ${tiposEquipo.length} tipos de equipo\n`);

    // ── Definición de los 30 equipos ─────────────────────────────────────────
    const equiposData = [
      // ── PCs de escritorio ──────────────────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'PC Escritorio HP ProDesk 400 G7',
          marca:                'HP',
          modelo:               'ProDesk 400 G7',
          serie:                'CZC1120AKL',
          placa_inventario:     'SIS-PC-201',
          codigo:               'PC-URG-001',
          ubicacion:            'Urgencias',
          ubicacion_especifica: 'Estación de enfermería central',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-03-10', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.1.10', mac: 'A4:C3:F0:10:20:01',
          procesador: 'Intel Core i5-10500', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'urgencias.enf1',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial',
          fecha_compra: '2022-02-20', fecha_instalacion: '2022-03-10',
          costo_compra: '2800000', contrato: 'CONT-2022-010',
          observaciones: 'PC estación de enfermería urgencias. En buen estado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-03-10', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Lenovo ThinkCentre M80q',
          marca:                'Lenovo',
          modelo:               'ThinkCentre M80q',
          serie:                'MP20C4B2',
          placa_inventario:     'SIS-PC-202',
          codigo:               'PC-UCI-001',
          ubicacion:            'UCI',
          ubicacion_especifica: 'Puesto médico central',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-01-15', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.2.10', mac: 'B8:27:EB:20:30:02',
          procesador: 'Intel Core i7-10700T', ram: '16 GB DDR4',
          disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'uci.medico1',
          vendedor: 'Lenovo Colombia', tipo_uso: 'Asistencial',
          fecha_compra: '2023-01-05', fecha_instalacion: '2023-01-15',
          costo_compra: '3500000', contrato: 'CONT-2023-001',
          observaciones: 'PC UCI puesto médico. Crítico para monitoreo de pacientes.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-01-15', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Dell OptiPlex 7090',
          marca:                'Dell',
          modelo:               'OptiPlex 7090',
          serie:                'DL8823KL',
          placa_inventario:     'SIS-PC-203',
          codigo:               'PC-CONSUL-001',
          ubicacion:            'Consulta Externa',
          ubicacion_especifica: 'Consultorio 1',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-07-20', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.3.10', mac: 'DC:A6:32:30:40:03',
          procesador: 'Intel Core i5-11500', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'consulta.medico1',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Asistencial',
          fecha_compra: '2022-07-01', fecha_instalacion: '2022-07-20',
          costo_compra: '3100000', contrato: 'CONT-2022-018',
          observaciones: 'PC consultorio 1. Actualizado a Windows 11.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-07-20', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio HP EliteDesk 880 G8',
          marca:                'HP',
          modelo:               'EliteDesk 880 G8',
          serie:                'CZC2211MNP',
          placa_inventario:     'SIS-PC-204',
          codigo:               'PC-HOSP-001',
          ubicacion:            'Hospitalización',
          ubicacion_especifica: 'Estación de enfermería piso 2',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-04-01', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.4.10', mac: 'E4:5F:01:40:50:04',
          procesador: 'Intel Core i5-11500', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'hosp.enf.p2',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial',
          fecha_compra: '2023-03-15', fecha_instalacion: '2023-04-01',
          costo_compra: '3200000', contrato: 'CONT-2023-008',
          observaciones: 'PC hospitalización piso 2. Reciente adquisición.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-04-01', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Lenovo IdeaCentre 5',
          marca:                'Lenovo',
          modelo:               'IdeaCentre 5 14ACN6',
          serie:                'SN-LN-FAR-001',
          placa_inventario:     'SIS-PC-205',
          codigo:               'PC-FAR-001',
          ubicacion:            'Farmacia',
          ubicacion_especifica: 'Dispensación principal',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-09-10', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.5.10', mac: 'F4:CE:36:50:60:05',
          procesador: 'Intel Core i3-10100', ram: '8 GB DDR4',
          disco_duro: '500 GB HDD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'farmacia.disp1',
          vendedor: 'Lenovo Colombia', tipo_uso: 'Administrativo',
          fecha_compra: '2022-08-25', fecha_instalacion: '2022-09-10',
          costo_compra: '2200000', contrato: 'CONT-2022-025',
          observaciones: 'PC farmacia. Sistema dispensación instalado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-09-10', anos_soporte_fabricante: 2,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Dell OptiPlex 3090',
          marca:                'Dell',
          modelo:               'OptiPlex 3090 MT',
          serie:                'DL9902XK',
          placa_inventario:     'SIS-PC-206',
          codigo:               'PC-ADM-001',
          ubicacion:            'Admisiones',
          ubicacion_especifica: 'Ventanilla 1',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-11-05', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.6.10', mac: '00:14:22:60:70:06',
          procesador: 'Intel Core i3-10105', ram: '4 GB DDR4',
          disco_duro: '500 GB HDD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft Office 2019', nombre_usuario: 'admisiones.v1',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Administrativo',
          fecha_compra: '2021-10-20', fecha_instalacion: '2021-11-05',
          costo_compra: '1900000', contrato: 'CONT-2021-030',
          observaciones: 'PC admisiones ventanilla 1. Pendiente ampliación RAM.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-11-05', anos_soporte_fabricante: 2,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio HP ProDesk 600 G6',
          marca:                'HP',
          modelo:               'ProDesk 600 G6 MT',
          serie:                'CZC0987ZZL',
          placa_inventario:     'SIS-PC-207',
          codigo:               'PC-FACT-001',
          ubicacion:            'Facturación',
          ubicacion_especifica: 'Ventanilla 1',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-05-15', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.6.20', mac: '3C:06:30:70:80:07',
          procesador: 'Intel Core i5-10500', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'factura.v1',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo',
          fecha_compra: '2022-04-30', fecha_instalacion: '2022-05-15',
          costo_compra: '2700000', contrato: 'CONT-2022-012',
          observaciones: 'PC facturación. Software hospitalario instalado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-05-15', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Lenovo ThinkCentre M70q',
          marca:                'Lenovo',
          modelo:               'ThinkCentre M70q Gen 2',
          serie:                'MP21D9K1',
          placa_inventario:     'SIS-PC-208',
          codigo:               'PC-CONT-001',
          ubicacion:            'Contabilidad',
          ubicacion_especifica: 'Oficina contadora',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-02-20', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.7.10', mac: '5C:BA:EF:80:90:08',
          procesador: 'Intel Core i5-11400T', ram: '8 GB DDR4',
          disco_duro: '512 GB SSD', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'contabilidad.jefe',
          vendedor: 'Lenovo Colombia', tipo_uso: 'Administrativo',
          fecha_compra: '2023-02-05', fecha_instalacion: '2023-02-20',
          costo_compra: '3000000', contrato: 'CONT-2023-005',
          observaciones: 'PC contabilidad. Software ERP instalado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-02-20', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio HP ProDesk 405 G8',
          marca:                'HP',
          modelo:               'ProDesk 405 G8 DM',
          serie:                'CZC3014PPQ',
          placa_inventario:     'SIS-PC-209',
          codigo:               'PC-RRHH-001',
          ubicacion:            'Recursos Humanos',
          ubicacion_especifica: 'Oficina RRHH',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-06-01', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.7.20', mac: '70:F3:95:90:A0:09',
          procesador: 'AMD Ryzen 5 PRO 5650GE', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'rrhh.aux1',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo',
          fecha_compra: '2023-05-15', fecha_instalacion: '2023-06-01',
          costo_compra: '2900000', contrato: 'CONT-2023-015',
          observaciones: 'PC RRHH. Nuevo. Garantía vigente.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-06-01', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Dell Vostro 3910',
          marca:                'Dell',
          modelo:               'Vostro 3910 MT',
          serie:                'DL7744KM',
          placa_inventario:     'SIS-PC-210',
          codigo:               'PC-CIRUG-001',
          ubicacion:            'Cirugía',
          ubicacion_especifica: 'Estación pre-quirúrgica',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-11-10', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.8.10', mac: 'A0:36:9F:A0:B0:10',
          procesador: 'Intel Core i5-12400', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'cirugia.aux1',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Asistencial',
          fecha_compra: '2022-10-25', fecha_instalacion: '2022-11-10',
          costo_compra: '2600000', contrato: 'CONT-2022-030',
          observaciones: 'PC estación pre-quirúrgica. Mantenimiento al día.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-11-10', anos_soporte_fabricante: 3,
        },
      },
      // ── Laptops ────────────────────────────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'Laptop HP ProBook 450 G9',
          marca:                'HP',
          modelo:               'ProBook 450 G9',
          serie:                'CND2340XKP',
          placa_inventario:     'SIS-LAP-101',
          codigo:               'LAP-SIS-001',
          ubicacion:            'Sistemas',
          ubicacion_especifica: 'Oficina coordinador sistemas',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-03-15', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.1.50', mac: 'B0:2A:43:B0:C0:11',
          procesador: 'Intel Core i5-1235U', ram: '16 GB DDR4',
          disco_duro: '512 GB SSD NVMe', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'sistemas.coord',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo',
          fecha_compra: '2023-03-01', fecha_instalacion: '2023-03-15',
          costo_compra: '3800000', contrato: 'CONT-2023-007',
          observaciones: 'Laptop coordinador de sistemas. Herramientas de administración instaladas.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-03-15', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Laptop Dell Latitude 5530',
          marca:                'Dell',
          modelo:               'Latitude 5530',
          serie:                'DL2023LAT5530',
          placa_inventario:     'SIS-LAP-102',
          codigo:               'LAP-GER-001',
          ubicacion:            'Gerencia',
          ubicacion_especifica: 'Oficina subgerente administrativo',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-05-10', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.1.51', mac: 'C0:3B:54:C0:D0:12',
          procesador: 'Intel Core i7-1265U', ram: '16 GB DDR5',
          disco_duro: '512 GB SSD NVMe', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'subgerente.adm',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Gerencial',
          fecha_compra: '2023-04-25', fecha_instalacion: '2023-05-10',
          costo_compra: '5200000', contrato: 'CONT-2023-012',
          observaciones: 'Laptop subgerencia administrativa. Garantía vigente hasta 2026.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-05-10', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Laptop Lenovo ThinkPad E15 Gen 4',
          marca:                'Lenovo',
          modelo:               'ThinkPad E15 Gen 4',
          serie:                'MP22F8R9',
          placa_inventario:     'SIS-LAP-103',
          codigo:               'LAP-MED-001',
          ubicacion:            'Dirección Médica',
          ubicacion_especifica: 'Oficina director médico',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-07-01', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.1.52', mac: 'D0:4C:65:D0:E0:13',
          procesador: 'Intel Core i7-1255U', ram: '16 GB DDR4',
          disco_duro: '512 GB SSD NVMe', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'director.medico',
          vendedor: 'Lenovo Colombia', tipo_uso: 'Gerencial',
          fecha_compra: '2023-06-15', fecha_instalacion: '2023-07-01',
          costo_compra: '4900000', contrato: 'CONT-2023-018',
          observaciones: 'Laptop director médico. Nuevo equipo.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-07-01', anos_soporte_fabricante: 3,
        },
      },
      // ── Impresoras ─────────────────────────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'Impresora HP LaserJet Pro M404dn',
          marca:                'HP',
          modelo:               'LaserJet Pro M404dn',
          serie:                'PHBBK04563',
          placa_inventario:     'SIS-IMP-101',
          codigo:               'IMP-URG-001',
          ubicacion:            'Urgencias',
          ubicacion_especifica: 'Estación de enfermería',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-04-20', periodicidad: 180, administrable: 0,
        },
        hv: {
          ip: '192.168.1.100', mac: 'E0:5D:76:E0:F0:14',
          tonner: 'CF259A (59A)',
          nombre_usuario: 'urgencias.imp1',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Asistencial',
          fecha_compra: '2022-04-05', fecha_instalacion: '2022-04-20',
          costo_compra: '1200000', contrato: 'CONT-2022-011',
          observaciones: 'Impresora urgencias. Tóner reemplazado en marzo 2024.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-04-20', anos_soporte_fabricante: 2,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Impresora HP LaserJet Enterprise M507dn',
          marca:                'HP',
          modelo:               'LaserJet Enterprise M507dn',
          serie:                'PHCCK11842',
          placa_inventario:     'SIS-IMP-102',
          codigo:               'IMP-ADM-001',
          ubicacion:            'Admisiones',
          ubicacion_especifica: 'Mostrador de admisiones',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-12-10', periodicidad: 180, administrable: 0,
        },
        hv: {
          ip: '192.168.6.100', mac: 'F0:6E:87:F0:00:15',
          tonner: 'CF289A (89A)',
          nombre_usuario: 'admisiones.imp1',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo',
          fecha_compra: '2021-11-25', fecha_instalacion: '2021-12-10',
          costo_compra: '2100000', contrato: 'CONT-2021-040',
          observaciones: 'Impresora admisiones. Alto volumen de impresión.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-12-10', anos_soporte_fabricante: 2,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Multifuncional Canon MAXIFY GX6010',
          marca:                'Canon',
          modelo:               'MAXIFY GX6010',
          serie:                'CA2023MX6010',
          placa_inventario:     'SIS-IMP-103',
          codigo:               'IMP-GER-001',
          ubicacion:            'Gerencia',
          ubicacion_especifica: 'Sala de juntas',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-01-20', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.1.101', mac: '00:1F:A7:00:10:16',
          tonner: 'GI-21 BK/C/M/Y',
          nombre_usuario: 'gerencia.imp1',
          vendedor: 'Canon Colombia', tipo_uso: 'Administrativo',
          fecha_compra: '2023-01-05', fecha_instalacion: '2023-01-20',
          costo_compra: '1800000', contrato: 'CONT-2023-002',
          observaciones: 'Multifuncional gerencia. Imprime, escanea y fotocopia.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-01-20', anos_soporte_fabricante: 2,
        },
      },
      // ── Red y networking ───────────────────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'Switch Cisco Catalyst 2960-X 24 puertos',
          marca:                'Cisco',
          modelo:               'WS-C2960X-24TS-L',
          serie:                'FCZ2101A2BK',
          placa_inventario:     'SIS-SW-201',
          codigo:               'SW-P1-001',
          ubicacion:            'Cuarto de Redes',
          ubicacion_especifica: 'Rack principal piso 1',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-05-10', periodicidad: 90,
          administrable: 1, direccionamiento_Vlan: '192.168.100.1', numero_puertos: 24,
        },
        hv: {
          ip: '192.168.100.1', mac: '00:1A:2B:00:20:17',
          nombre_usuario: 'sw-p1-001',
          vendedor: 'Cisco Systems Colombia', tipo_uso: 'Red',
          fecha_compra: '2021-04-20', fecha_instalacion: '2021-05-10',
          costo_compra: '6500000', contrato: 'CONT-2021-015',
          observaciones: 'Switch core piso 1. VLANs configuradas. Mantenimiento preventivo trimestral.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-05-10', anos_soporte_fabricante: 5,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Switch TP-Link TL-SG3428X 28 puertos',
          marca:                'TP-Link',
          modelo:               'TL-SG3428X',
          serie:                'TP2023SG3428X',
          placa_inventario:     'SIS-SW-202',
          codigo:               'SW-P2-001',
          ubicacion:            'Cuarto de Redes',
          ubicacion_especifica: 'Rack secundario piso 2',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-08-15', periodicidad: 90,
          administrable: 1, direccionamiento_Vlan: '192.168.100.2', numero_puertos: 28,
        },
        hv: {
          ip: '192.168.100.2', mac: '10:2B:3C:10:30:18',
          nombre_usuario: 'sw-p2-001',
          vendedor: 'TP-Link Colombia', tipo_uso: 'Red',
          fecha_compra: '2022-08-01', fecha_instalacion: '2022-08-15',
          costo_compra: '3200000', contrato: 'CONT-2022-020',
          observaciones: 'Switch distribución piso 2.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-08-15', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Access Point Ubiquiti UniFi U6 Pro',
          marca:                'Ubiquiti',
          modelo:               'U6-Pro',
          serie:                'F09FC2B5C022',
          placa_inventario:     'SIS-AP-201',
          codigo:               'AP-UCI-001',
          ubicacion:            'UCI',
          ubicacion_especifica: 'Techo central UCI',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-02-10', periodicidad: 180,
          administrable: 1, direccionamiento_Vlan: '192.168.10.51', numero_puertos: 1,
        },
        hv: {
          ip: '192.168.10.51', mac: '20:3C:4D:20:40:19',
          nombre_usuario: 'ap-uci-001',
          vendedor: 'Ubiquiti Colombia', tipo_uso: 'Red',
          fecha_compra: '2023-01-28', fecha_instalacion: '2023-02-10',
          costo_compra: '1800000', contrato: 'CONT-2023-004',
          observaciones: 'AP UCI WiFi 6. Cubre toda la sala.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-02-10', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Access Point Cisco Meraki MR46',
          marca:                'Cisco',
          modelo:               'Meraki MR46',
          serie:                'Q2KN-ABCD-1234',
          placa_inventario:     'SIS-AP-202',
          codigo:               'AP-HOSP-001',
          ubicacion:            'Hospitalización',
          ubicacion_especifica: 'Pasillo central piso 3',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-10-05', periodicidad: 180,
          administrable: 1, direccionamiento_Vlan: '192.168.10.52', numero_puertos: 1,
        },
        hv: {
          ip: '192.168.10.52', mac: '30:4D:5E:30:50:20',
          nombre_usuario: 'ap-hosp-p3',
          vendedor: 'Cisco Systems Colombia', tipo_uso: 'Red',
          fecha_compra: '2022-09-20', fecha_instalacion: '2022-10-05',
          costo_compra: '4500000', contrato: 'CONT-2022-028',
          observaciones: 'AP hospitalizacion piso 3. Gestionado desde Meraki dashboard.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-10-05', anos_soporte_fabricante: 5,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Firewall Fortinet FortiGate 100F',
          marca:                'Fortinet',
          modelo:               'FortiGate 100F',
          serie:                'FGT100F-1234567',
          placa_inventario:     'SIS-FW-001',
          codigo:               'FW-001',
          ubicacion:            'Data Center',
          ubicacion_especifica: 'Rack principal - Unidad 1',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-01-20', periodicidad: 90,
          administrable: 1, direccionamiento_Vlan: '10.0.0.1', numero_puertos: 22,
        },
        hv: {
          ip: '10.0.0.1', mac: '40:5E:6F:40:60:21',
          nombre_usuario: 'firewall-001',
          vendedor: 'Fortinet Colombia', tipo_uso: 'Red',
          fecha_compra: '2022-01-05', fecha_instalacion: '2022-01-20',
          costo_compra: '18000000', contrato: 'CONT-2022-001',
          observaciones: 'Firewall perimetral. Licencias UTM activas. Configuración administrada por sistemas.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-01-20', anos_soporte_fabricante: 5,
        },
      },
      // ── Servidores e infraestructura ───────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'Servidor HP ProLiant DL380 Gen10',
          marca:                'HP',
          modelo:               'ProLiant DL380 Gen10',
          serie:                'CZJ2230V5K',
          placa_inventario:     'SIS-SRV-201',
          codigo:               'SRV-APP-001',
          ubicacion:            'Data Center',
          ubicacion_especifica: 'Rack A - Unidad 4',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-03-01', periodicidad: 180,
          administrable: 1, direccionamiento_Vlan: '172.16.0.5', numero_puertos: 4,
        },
        hv: {
          ip: '172.16.0.5', mac: '50:6F:70:50:70:22',
          procesador: 'Intel Xeon Silver 4214R (2x)', ram: '64 GB DDR4 ECC',
          disco_duro: '4 TB RAID 5', sistema_operativo: 'Windows Server 2019',
          nombre_usuario: 'srv-app-001',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Servidor',
          fecha_compra: '2021-02-15', fecha_instalacion: '2021-03-01',
          costo_compra: '35000000', contrato: 'CONT-2021-003',
          observaciones: 'Servidor aplicaciones hospitalarias. Alta disponibilidad. Backup diario.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-03-01', anos_soporte_fabricante: 5,
        },
      },
      {
        equipo: {
          nombre_equipo:        'Servidor Dell PowerEdge R640',
          marca:                'Dell',
          modelo:               'PowerEdge R640',
          serie:                'DL2021R640',
          placa_inventario:     'SIS-SRV-202',
          codigo:               'SRV-BD-001',
          ubicacion:            'Data Center',
          ubicacion_especifica: 'Rack A - Unidad 6',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-03-01', periodicidad: 180,
          administrable: 1, direccionamiento_Vlan: '172.16.0.6', numero_puertos: 4,
        },
        hv: {
          ip: '172.16.0.6', mac: '60:70:81:60:80:23',
          procesador: 'Intel Xeon Gold 6230R (2x)', ram: '128 GB DDR4 ECC',
          disco_duro: '8 TB RAID 6', sistema_operativo: 'Windows Server 2019',
          nombre_usuario: 'srv-bd-001',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Servidor',
          fecha_compra: '2021-02-15', fecha_instalacion: '2021-03-01',
          costo_compra: '48000000', contrato: 'CONT-2021-003',
          observaciones: 'Servidor base de datos. SQL Server 2019. Respaldo diferencial cada 6h.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-03-01', anos_soporte_fabricante: 5,
        },
      },
      {
        equipo: {
          nombre_equipo:        'NAS Synology RS1221+',
          marca:                'Synology',
          modelo:               'RS1221+',
          serie:                'SY2022RS1221',
          placa_inventario:     'SIS-NAS-001',
          codigo:               'NAS-001',
          ubicacion:            'Data Center',
          ubicacion_especifica: 'Rack B - Unidad 2',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-06-15', periodicidad: 365,
          administrable: 1, direccionamiento_Vlan: '172.16.0.20', numero_puertos: 4,
        },
        hv: {
          ip: '172.16.0.20', mac: '70:81:92:70:90:24',
          procesador: 'AMD Ryzen V1500B', ram: '4 GB DDR4 ECC',
          disco_duro: '40 TB (8x5TB RAID 6)', sistema_operativo: 'DSM 7.2',
          nombre_usuario: 'nas-backup-001',
          vendedor: 'Synology Colombia', tipo_uso: 'Almacenamiento',
          fecha_compra: '2022-06-01', fecha_instalacion: '2022-06-15',
          costo_compra: '22000000', contrato: 'CONT-2022-015',
          observaciones: 'NAS backup institucional. Snapshots habilitados. Replicación diaria.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-06-15', anos_soporte_fabricante: 5,
        },
      },
      {
        equipo: {
          nombre_equipo:        'UPS APC Smart-UPS SRT 3000VA',
          marca:                'APC',
          modelo:               'SRT3000RMXLT',
          serie:                'AS2022003294',
          placa_inventario:     'SIS-UPS-201',
          codigo:               'UPS-DC-001',
          ubicacion:            'Data Center',
          ubicacion_especifica: 'Debajo rack A',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-03-05', periodicidad: 180, administrable: 0,
        },
        hv: {
          ip: '172.16.0.30', mac: '80:92:A3:80:A0:25',
          nombre_usuario: 'ups-dc-001',
          vendedor: 'APC by Schneider Electric', tipo_uso: 'Infraestructura',
          fecha_compra: '2022-02-20', fecha_instalacion: '2022-03-05',
          costo_compra: '9500000', contrato: 'CONT-2022-008',
          observaciones: 'UPS data center. Batería reemplazada en enero 2024. Autonomía 30 min.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-03-05', anos_soporte_fabricante: 3,
        },
      },
      // ── Equipos adicionales ────────────────────────────────────────────────
      {
        equipo: {
          nombre_equipo:        'Scanner Fujitsu fi-7160',
          marca:                'Fujitsu',
          modelo:               'fi-7160',
          serie:                'FJ2021FI7160',
          placa_inventario:     'SIS-SCAN-001',
          codigo:               'SCAN-ARCH-001',
          ubicacion:            'Admisiones',
          ubicacion_especifica: 'Archivo clínico',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2021-09-20', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.6.110', mac: '90:A3:B4:90:B0:26',
          nombre_usuario: 'archivo.scan1',
          vendedor: 'Fujitsu Colombia', tipo_uso: 'Administrativo',
          fecha_compra: '2021-09-05', fecha_instalacion: '2021-09-20',
          costo_compra: '4200000', contrato: 'CONT-2021-025',
          observaciones: 'Scanner archivo clínico. Alta velocidad 60 ppm. En buen estado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2021-09-20', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio HP ProDesk 600 G8',
          marca:                'HP',
          modelo:               'ProDesk 600 G8 SFF',
          serie:                'CZC3102QKL',
          placa_inventario:     'SIS-PC-211',
          codigo:               'PC-ESTER-001',
          ubicacion:            'Esterilización',
          ubicacion_especifica: 'Oficina jefe esterilización',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-08-01', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.9.10', mac: 'A0:B4:C5:A0:C0:27',
          procesador: 'Intel Core i5-11500', ram: '8 GB DDR4',
          disco_duro: '256 GB SSD', sistema_operativo: 'Windows 11 Pro',
          office: 'Microsoft 365', nombre_usuario: 'esteril.jefe',
          vendedor: 'HP Colombia S.A.S', tipo_uso: 'Administrativo',
          fecha_compra: '2023-07-15', fecha_instalacion: '2023-08-01',
          costo_compra: '3100000', contrato: 'CONT-2023-021',
          observaciones: 'PC esterilización. Nuevo.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-08-01', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Lenovo ThinkCentre M90n',
          marca:                'Lenovo',
          modelo:               'ThinkCentre M90n-1 IoT',
          serie:                'MP23G1K2',
          placa_inventario:     'SIS-PC-212',
          codigo:               'PC-LAB-201',
          ubicacion:            'Laboratorio',
          ubicacion_especifica: 'Área de análisis',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2023-05-20', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.5.20', mac: 'B0:C5:D6:B0:D0:28',
          procesador: 'Intel Core i7-10510U', ram: '16 GB DDR4',
          disco_duro: '512 GB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'lab.analis1',
          vendedor: 'Lenovo Colombia', tipo_uso: 'Laboratorio',
          fecha_compra: '2023-05-05', fecha_instalacion: '2023-05-20',
          costo_compra: '3400000', contrato: 'CONT-2023-013',
          observaciones: 'PC laboratorio. Software LIMS instalado.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2023-05-20', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'PC Escritorio Dell OptiPlex 5090',
          marca:                'Dell',
          modelo:               'OptiPlex 5090 MT',
          serie:                'DL8866RM',
          placa_inventario:     'SIS-PC-213',
          codigo:               'PC-RX-001',
          ubicacion:            'Rayos X',
          ubicacion_especifica: 'Cabina de control',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-12-01', periodicidad: 365, administrable: 0,
        },
        hv: {
          ip: '192.168.10.10', mac: 'C0:D6:E7:C0:E0:29',
          procesador: 'Intel Core i7-10700', ram: '16 GB DDR4',
          disco_duro: '1 TB SSD', sistema_operativo: 'Windows 10 Pro',
          office: 'Microsoft 365', nombre_usuario: 'radiologo.tecnico1',
          vendedor: 'Dell Technologies Colombia', tipo_uso: 'Diagnóstico',
          fecha_compra: '2022-11-15', fecha_instalacion: '2022-12-01',
          costo_compra: '4800000', contrato: 'CONT-2022-033',
          observaciones: 'PC rayos X. Software PACS instalado. Conexión al servidor de imágenes.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-12-01', anos_soporte_fabricante: 3,
        },
      },
      {
        equipo: {
          nombre_equipo:        'UPS Eaton 5PX 2200VA',
          marca:                'Eaton',
          modelo:               '5PX 2200i RT2U',
          serie:                'EA2023X2200',
          placa_inventario:     'SIS-UPS-202',
          codigo:               'UPS-RED-001',
          ubicacion:            'Cuarto de Redes',
          ubicacion_especifica: 'Debajo rack principal',
          activo: 1, estado_baja: 0,
          ano_ingreso: '2022-03-10', periodicidad: 180, administrable: 0,
        },
        hv: {
          ip: '192.168.100.10', mac: 'D0:E7:F8:D0:F0:30',
          nombre_usuario: 'ups-red-001',
          vendedor: 'Eaton Colombia', tipo_uso: 'Infraestructura',
          fecha_compra: '2022-02-25', fecha_instalacion: '2022-03-10',
          costo_compra: '5800000', contrato: 'CONT-2022-009',
          observaciones: 'UPS cuarto de redes. Protege switches y router principal.',
          compraddirecta: true, convenio: false, donado: false, comodato: false,
          fecha_inicio_soporte: '2022-03-10', anos_soporte_fabricante: 3,
        },
      },
    ];

    // ── Insertar equipos + hojas de vida ─────────────────────────────────────
    console.log(`➕ Insertando ${equiposData.length} equipos...\n`);
    let ok = 0, fail = 0;

    for (let i = 0; i < equiposData.length; i++) {
      const { equipo: eqData, hv: hvData } = equiposData[i];

      // Verificar si ya existe por placa
      const existe = await SysEquipo.findOne({ where: { placa_inventario: eqData.placa_inventario } });
      if (existe) {
        console.log(`   ⏭️  [${eqData.placa_inventario}] Ya existe, se omite.`);
        continue;
      }

      try {
        // Asignar servicio y tipo de equipo rotando entre los disponibles
        eqData.id_servicio_fk    = pick(servicios, i).id;
        eqData.id_tipo_equipo_fk = pick(tiposEquipo, i).id;

        const equipo = await SysEquipo.create(eqData);
        const hvExiste = await SysHojaVida.findOne({ where: { id_sysequipo_fk: equipo.id_sysequipo } });
        if (!hvExiste) {
          await SysHojaVida.create({ ...hvData, id_sysequipo_fk: equipo.id_sysequipo });
        }

        const tipo = tiposEquipo.find(t => t.id === eqData.id_tipo_equipo_fk)?.nombres || '?';
        const serv = servicios.find(s => s.id === eqData.id_servicio_fk)?.nombres    || '?';
        console.log(`   ✅ [ID=${equipo.id_sysequipo}] ${equipo.nombre_equipo}`);
        console.log(`        Tipo: ${tipo} | Servicio: ${serv}`);
        ok++;
      } catch (e) {
        console.error(`   ❌ Error "${eqData.nombre_equipo}": ${e.message}`);
        fail++;
      }
    }

    console.log(`\n══════════════════════════════════════════`);
    console.log(`✅ Insertados exitosamente : ${ok}`);
    if (fail > 0) console.log(`❌ Con error              : ${fail}`);
    console.log(`══════════════════════════════════════════\n`);

  } catch (err) {
    console.error('❌ Error general:', err.message);
  } finally {
    await sequelize.close();
  }
}

seed();
