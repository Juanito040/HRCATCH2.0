const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const SysProgramacionPreventivoMes = sequelize.define('SysProgramacionPreventivoMes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Mes programado (1-12)'
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Año programado'
  }
}, {
  tableName: 'SysProgramacionPreventivoMes',
  timestamps: true
});

module.exports = SysProgramacionPreventivoMes;