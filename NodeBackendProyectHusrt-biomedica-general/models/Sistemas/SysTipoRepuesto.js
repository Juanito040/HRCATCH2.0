const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const SysTipoRepuesto = sequelize.define('SysTipoRepuesto', {
  id_sys_tipo_repuesto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  fecha_inactivacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usuario_inactivacion: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'SysTipoRepuesto',
  timestamps: true
});

module.exports = SysTipoRepuesto;
