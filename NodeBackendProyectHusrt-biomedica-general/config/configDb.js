const { Sequelize } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize('dbnewapphusrt', 'root', 'NuevaPass123', {
  host: 'localhost',
  dialect: 'mariadb',
});

module.exports = sequelize;