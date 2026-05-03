/**
 * Migración: agrega columna sysReporteIdFk a SysMovimientosStockRepuestos
 * La tabla fue creada sin esta columna; el modelo Sequelize sí la define.
 *
 * Ejecutar una sola vez:
 *   node src/manual_migration_add_reporte_fk_movimientos.js
 */

const sequelize = require('../config/configDb');
const { QueryTypes } = require('sequelize');

async function run() {
  try {
    console.log('🔄 Verificando columna sysReporteIdFk en SysMovimientosStockRepuestos...');

    const cols = await sequelize.query(
      `SHOW COLUMNS FROM SysMovimientosStockRepuestos LIKE 'sysReporteIdFk'`,
      { type: QueryTypes.SELECT }
    );

    if (cols.length === 0) {
      await sequelize.query(`
        ALTER TABLE SysMovimientosStockRepuestos
        ADD COLUMN sysReporteIdFk INT NULL DEFAULT NULL
          AFTER referencia,
        ADD CONSTRAINT fk_movstock_reporte
          FOREIGN KEY (sysReporteIdFk) REFERENCES SysReporte(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Columna sysReporteIdFk agregada correctamente.');
    } else {
      console.log('ℹ️  La columna ya existe, no se requiere cambio.');
    }

    console.log('🎉 Migración completada.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  }
}

run();
