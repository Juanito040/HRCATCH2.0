const sequelize = require('../config/configDb');

async function migrate() {
  try {
    console.log('--- Iniciando migración V3: Agregando la columna "nombre_item" a "SysAuditoriaRepuesto" ---');

    await sequelize.query(`
      ALTER TABLE SysAuditoriaRepuesto 
      ADD COLUMN nombre_item VARCHAR(255) NULL;
    `);

    console.log('--- Migración V3 completada exitosamente ---');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('--- La columna "nombre_item" ya existe en la tabla SysAuditoriaRepuesto ---');
    } else {
      console.error('--- Error durante la migración V3 ---');
      console.error(error);
    }
  } finally {
    process.exit();
  }
}

migrate();
