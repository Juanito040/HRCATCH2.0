const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const SysAuditoriaRepuesto = sequelize.define('SysAuditoriaRepuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tabla_origen: {
    type: DataTypes.ENUM('SysRepuesto', 'SysTipoRepuesto'),
    allowNull: false
  },
  id_registro: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  nombre_item: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  rol: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  accion: {
    type: DataTypes.ENUM('creacion', 'edicion', 'activacion', 'inactivacion'),
    allowNull: false
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SysAuditoriaRepuesto',
  timestamps: false
});

module.exports = SysAuditoriaRepuesto;
