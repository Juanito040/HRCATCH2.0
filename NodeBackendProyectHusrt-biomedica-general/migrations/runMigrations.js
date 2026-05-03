const { QueryTypes } = require('sequelize');
const sequelize = require('../config/configDb');

/**
 * Corrige la FK de SysMovimientosStockRepuestos que en algunos entornos
 * quedó apuntando a la tabla vieja `sysrepuesto_legacy` en vez de `SysRepuesto`.
 * Se ejecuta de forma idempotente: si la FK ya está bien, no hace nada.
 */
async function fixMovimientosStockFK() {
  const rows = await sequelize.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'sysmovimientosstockrepuestos'
      AND REFERENCED_TABLE_NAME = 'sysrepuesto_legacy'
    LIMIT 1;
  `, { type: QueryTypes.SELECT });

  if (!rows || rows.length === 0) {
    console.log('[Migration] FK sysmovimientosstock → SysRepuesto: ya correcta, sin cambios.');
    return;
  }

  const constraintName = rows[0].CONSTRAINT_NAME;
  console.log(`[Migration] Corrigiendo FK "${constraintName}" (apuntaba a sysrepuesto_legacy)...`);

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { type: QueryTypes.RAW });
  await sequelize.query(
    `ALTER TABLE \`sysmovimientosstockrepuestos\` DROP FOREIGN KEY \`${constraintName}\`;`,
    { type: QueryTypes.RAW }
  );
  await sequelize.query(`
    ALTER TABLE \`sysmovimientosstockrepuestos\`
      ADD CONSTRAINT \`${constraintName}\`
      FOREIGN KEY (\`id_repuesto_fk\`)
      REFERENCES \`SysRepuesto\` (\`id_sysrepuesto\`)
      ON DELETE NO ACTION
      ON UPDATE CASCADE;
  `, { type: QueryTypes.RAW });
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { type: QueryTypes.RAW });

  console.log('[Migration] FK corregida: sysmovimientosstockrepuestos → SysRepuesto ✓');
}

module.exports = { fixMovimientosStockFK };
