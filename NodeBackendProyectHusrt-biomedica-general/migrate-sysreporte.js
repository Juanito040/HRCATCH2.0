require('dotenv').config();
const sequelize = require('./config/configDb');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a MariaDB');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS `SysReporteMantenimiento`');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tabla SysReporteMantenimiento eliminada. Reinicia el backend para que Sequelize la recree.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

fix();
