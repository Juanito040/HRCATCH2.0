const { Sequelize } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize('dbnewapphusrt', 'root', 'Millos310114$', {
  host: 'localhost',
  dialect: 'mariadb',
});

module.exports = sequelize;