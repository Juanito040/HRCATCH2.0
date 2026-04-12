const sequelize = require('./config/configDb');
const SysTipoRepuesto = require('./models/Sistemas/SysTipoRepuesto');
const SysRepuesto = require('./models/Sistemas/SysRepuesto');
const SysMovimientosStockRepuestos = require('./models/Sistemas/SysMovimientosStockRepuestos');

async function vaciarYCrear() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la BD para el sembrado de datos médicos...");

    // 1. Apagar temporalmente la restricción de llaves foráneas para poder limpiar todo limpiamente
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // 2. Vaciar las tablas relevantes (incluyendo auditorías y movimientos para tener el historial límpio)
    await sequelize.query('TRUNCATE TABLE SysMovimientosStockRepuestos;');
    await sequelize.query('TRUNCATE TABLE SysRepuesto;');
    await sequelize.query('TRUNCATE TABLE SysTipoRepuesto;');
    
    // Restaurar llaves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log("Tablas vaciadas correctamente.");

    // 3. Crear los TIPOS de Repuesto
    const tiposData = [
      { nombre: 'Sensores y Transductores', descripcion: 'Todo lo que detecta señales del paciente', is_active: true },
      { nombre: 'Cables y Conectores', descripcion: 'Extensiones físicas y cableado de equipos', is_active: true },
      { nombre: 'Baterías Médicas', descripcion: 'Fuentes de alimentación internas', is_active: true },
      { nombre: 'Partes Neumáticas y Válvulas', descripcion: 'Piezas para manejo de gases, oxígeno', is_active: true },
      { nombre: 'Circuitos y Tarjetas Electrónicas', descripcion: 'Placas madre o boards de los equipos', is_active: true }
    ];
    
    const tipos = await SysTipoRepuesto.bulkCreate(tiposData, { returning: true });
    console.log("✅ 5 Tipos creados.");

    // Mapear los IDs que se autogeneraron
    const getTipoId = (nombre) => tipos.find(t => t.nombre === nombre).id_sys_tipo_repuesto;

    // 4. Crear los REPUESTOS con stock 0
    const repuestosData = [
      {
        nombre: 'Sensor de SpO2 para adulto (Pinza reutilizable)',
        numero_parte: 'NELL-500A',
        proveedor: 'Nellcor Solutions',
        id_sys_tipo_repuesto_fk: getTipoId('Sensores y Transductores'),
        cantidad_stock: 0,
        stock_minimo: 10,
        is_active: true
      },
      {
        nombre: 'Sensor de Flujo Neonatal',
        numero_parte: 'FLOW-N22',
        proveedor: 'Dräger Medical',
        id_sys_tipo_repuesto_fk: getTipoId('Sensores y Transductores'),
        cantidad_stock: 0,
        stock_minimo: 5,
        is_active: true
      },
      {
        nombre: 'Cable de ECG de 5 derivadas',
        numero_parte: 'ECG-CAB-005',
        proveedor: 'Mindray Latam',
        ubicacion_fisica: 'Estante A, Nivel 2',
        id_sys_tipo_repuesto_fk: getTipoId('Cables y Conectores'),
        cantidad_stock: 0,
        stock_minimo: 5,
        is_active: true
      },
      {
        nombre: 'Batería de Litio para Desfibrilador',
        numero_parte: 'BATT-ZOLL-M2',
        proveedor: 'Zoll Medical Corp',
        garantia_fin: '2027-04-10',
        id_sys_tipo_repuesto_fk: getTipoId('Baterías Médicas'),
        cantidad_stock: 0,
        stock_minimo: 2,
        is_active: true
      },
      {
        nombre: 'Válvula Exhalatoria de Silicona Autoclavable',
        numero_parte: 'VAL-EXH-01',
        proveedor: 'Medtronic',
        id_sys_tipo_repuesto_fk: getTipoId('Partes Neumáticas y Válvulas'),
        cantidad_stock: 0,
        stock_minimo: 20,
        is_active: true
      }
    ];

    await SysRepuesto.bulkCreate(repuestosData);
    console.log("✅ 5 Repuestos creados (con stock igual a 0).");

    console.log("🎉 Todo ha terminado exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la base de datos:", error);
    process.exit(1);
  }
}

vaciarYCrear();
