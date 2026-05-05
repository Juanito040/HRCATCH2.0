const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');


const Rol = sequelize.define('Rol', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Rol'
});

module.exports = Rol;