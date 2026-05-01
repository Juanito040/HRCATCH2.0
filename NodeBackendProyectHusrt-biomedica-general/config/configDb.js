const { Sequelize } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize('dbnewapphusrt', 'root', 'Millos310114$', {
  host: '127.0.0.1',
  dialect: 'mariadb',
  port: 3307,
});

module.exports = sequelize;