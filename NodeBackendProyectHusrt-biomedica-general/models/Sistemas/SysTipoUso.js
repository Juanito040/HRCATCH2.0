const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const SysTipoUso = sequelize.define('SysTipoUso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sys_tipos_uso',
  timestamps: true
});

module.exports = SysTipoUso;
