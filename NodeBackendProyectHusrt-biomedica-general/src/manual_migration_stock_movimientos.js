/**
 * Script de migración manual para:
 * 1. Crear la tabla SysMovimientosStockRepuestos
 * 2. Agregar la columna stock_minimo a SysRepuesto (si no existe)
 *
 * Ejecutar una sola vez:
 *   node src/manual_migration_stock_movimientos.js
 */

const sequelize = require('../config/configDb');
const { QueryTypes } = require('sequelize');

async function run() {
  try {
    console.log('🔄 Iniciando migración de stock movimientos...');

    // 1. Agregar stock_minimo a SysRepuesto si no existe
    const columnsRep = await sequelize.query(
      `SHOW COLUMNS FROM SysRepuesto LIKE 'stock_minimo'`,
      { type: QueryTypes.SELECT }
    );
    if (columnsRep.length === 0) {
      await sequelize.query(
        `ALTER TABLE SysRepuesto ADD COLUMN stock_minimo INT NOT NULL DEFAULT 5 AFTER cantidad_stock`
      );
      console.log('✅ Columna stock_minimo agregada a SysRepuesto');
    } else {
      console.log('ℹ️  Columna stock_minimo ya existe en SysRepuesto, se omite');
    }

    // 2. Crear tabla SysMovimientosStockRepuestos si no existe
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`SysMovimientosStockRepuestos\` (
        \`id\`               INT          NOT NULL AUTO_INCREMENT,
        \`id_repuesto_fk\`   INT          NOT NULL,
        \`tipo\`             ENUM('ingreso','egreso') NOT NULL,
        \`cantidad\`         INT          NOT NULL,
        \`stock_antes\`      INT          NOT NULL,
        \`stock_despues\`    INT          NOT NULL,
        \`motivo\`           VARCHAR(300) NOT NULL,
        \`referencia\`       VARCHAR(200) DEFAULT NULL,
        \`usuario\`          VARCHAR(150) NOT NULL DEFAULT 'desconocido',
        \`fecha_movimiento\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_movstock_repuesto\` (\`id_repuesto_fk\`),
        KEY \`idx_movstock_fecha\`    (\`fecha_movimiento\`),
        CONSTRAINT \`fk_movstock_repuesto\`
          FOREIGN KEY (\`id_repuesto_fk\`) REFERENCES \`SysRepuesto\` (\`id_sysrepuesto\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla SysMovimientosStockRepuestos lista');

    console.log('\n🎉 Migración completada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  }
}

run();
