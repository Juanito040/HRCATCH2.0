require('dotenv').config();
const sequelize = require('../config/configDb');
const SysEquipo = require('../models/Sistemas/SysEquipo');

const equipos = [
  {
    nombre_equipo: 'PC Administración 01',
    marca: 'HP',
    modelo: 'ProDesk 400 G7',
    serie: 'SN-HP-001-2022',
    placa_inventario: 'INV-SYS-001',
    codigo: 'PC-ADM-001',
    ubicacion: 'Oficina Administrativa',
    ubicacion_especifica: 'Piso 1 - Cubículo 1',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-03-15',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-01-10'
  },
  {
    nombre_equipo: 'PC Urgencias 01',
    marca: 'Dell',
    modelo: 'OptiPlex 7090',
    serie: 'SN-DL-002-2021',
    placa_inventario: 'INV-SYS-002',
    codigo: 'PC-URG-001',
    ubicacion: 'Urgencias',
    ubicacion_especifica: 'Estación de Enfermería',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-07-20',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-02-05'
  },
  {
    nombre_equipo: 'PC Consulta Externa 01',
    marca: 'Lenovo',
    modelo: 'ThinkCentre M70q',
    serie: 'SN-LN-003-2023',
    placa_inventario: 'INV-SYS-003',
    codigo: 'PC-CE-001',
    ubicacion: 'Consulta Externa',
    ubicacion_especifica: 'Consultorio 3',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-01-10',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-03-01'
  },
  {
    nombre_equipo: 'PC Laboratorio Clínico',
    marca: 'HP',
    modelo: 'EliteDesk 800 G6',
    serie: 'SN-HP-004-2022',
    placa_inventario: 'INV-SYS-004',
    codigo: 'PC-LAB-001',
    ubicacion: 'Laboratorio Clínico',
    ubicacion_especifica: 'Mesa Principal',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-09-05',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-01-20'
  },
  {
    nombre_equipo: 'PC Rayos X',
    marca: 'Dell',
    modelo: 'Precision 3660',
    serie: 'SN-DL-005-2023',
    placa_inventario: 'INV-SYS-005',
    codigo: 'PC-RX-001',
    ubicacion: 'Imagenología',
    ubicacion_especifica: 'Sala de Rayos X',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-04-18',
    periodicidad: 12,
    administrable: false,
    fecha_modificacion: '2024-04-10'
  },
  {
    nombre_equipo: 'PC Facturación 01',
    marca: 'Lenovo',
    modelo: 'IdeaCentre 3',
    serie: 'SN-LN-006-2021',
    placa_inventario: 'INV-SYS-006',
    codigo: 'PC-FAC-001',
    ubicacion: 'Caja y Facturación',
    ubicacion_especifica: 'Ventanilla 1',
    activo: false,
    estado_baja: false,
    ano_ingreso: '2021-02-28',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2023-12-15'
  },
  {
    nombre_equipo: 'PC Facturación 02',
    marca: 'HP',
    modelo: 'ProDesk 400 G7',
    serie: 'SN-HP-007-2021',
    placa_inventario: 'INV-SYS-007',
    codigo: 'PC-FAC-002',
    ubicacion: 'Caja y Facturación',
    ubicacion_especifica: 'Ventanilla 2',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2021-02-28',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-02-20'
  },
  {
    nombre_equipo: 'PC Gerencia',
    marca: 'Apple',
    modelo: 'Mac Mini M2',
    serie: 'SN-AP-008-2023',
    placa_inventario: 'INV-SYS-008',
    codigo: 'PC-GER-001',
    ubicacion: 'Gerencia',
    ubicacion_especifica: 'Oficina Gerente General',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2023-08-01',
    periodicidad: 12,
    administrable: true,
    fecha_modificacion: '2024-03-22'
  },
  {
    nombre_equipo: 'PC UCI 01',
    marca: 'Dell',
    modelo: 'OptiPlex 5090',
    serie: 'SN-DL-009-2022',
    placa_inventario: 'INV-SYS-009',
    codigo: 'PC-UCI-001',
    ubicacion: 'UCI',
    ubicacion_especifica: 'Estación Central',
    activo: true,
    estado_baja: false,
    ano_ingreso: '2022-11-14',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2024-01-30'
  },
  {
    nombre_equipo: 'PC Archivo Clínico',
    marca: 'Lenovo',
    modelo: 'ThinkCentre Neo 50s',
    serie: 'SN-LN-010-2020',
    placa_inventario: 'INV-SYS-010',
    codigo: 'PC-ARC-001',
    ubicacion: 'Archivo Clínico',
    ubicacion_especifica: 'Sala de Archivo',
    activo: false,
    estado_baja: false,
    ano_ingreso: '2020-06-10',
    periodicidad: 6,
    administrable: false,
    fecha_modificacion: '2023-11-05'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');

    const result = await SysEquipo.bulkCreate(equipos, { validate: true });
    console.log(`✅ Se insertaron ${result.length} equipos correctamente.`);
    result.forEach(eq => {
      console.log(`  [${eq.id_sysequipo}] ${eq.nombre_equipo} - ${eq.ubicacion}`);
    });
  } catch (error) {
    console.error('❌ Error al insertar equipos:', error.message);
  } finally {
    await sequelize.close();
  }
}

seed();
