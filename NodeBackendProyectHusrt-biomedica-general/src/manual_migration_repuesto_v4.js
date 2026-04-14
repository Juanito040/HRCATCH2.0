const sequelize = require('../config/configDb');

async function migrateDropTiposDates() {
  try {
    console.log('--- Iniciando migración V4: Eliminando "fecha_ingreso" y "fecha_garantia" de "SysTipoRepuesto" ---');

    await sequelize.query(`
      ALTER TABLE SysTipoRepuesto 
      DROP COLUMN IF EXISTS fecha_ingreso,
      DROP COLUMN IF EXISTS fecha_garantia;
    `);

    console.log('--- Migración V4 completada exitosamente ---');
  } catch (error) {
    console.error('--- Error durante la migración V4 ---');
    console.error(error);
  } finally {
    process.exit();
  }
}

migrateDropTiposDates();
