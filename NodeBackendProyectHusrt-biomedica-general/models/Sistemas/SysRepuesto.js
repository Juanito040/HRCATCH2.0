const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');

const SysRepuesto = sequelize.define('SysRepuesto', {
  id_sysrepuesto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_equipo: { type: DataTypes.STRING(255), allowNull: true },
  marca: { type: DataTypes.STRING(255), allowNull: true },
  modelo: { type: DataTypes.STRING(255), allowNull: true },
  serie: { type: DataTypes.STRING(255), allowNull: true },
  ubicacion: { type: DataTypes.STRING(255), allowNull: true },
  observaciones: { type: DataTypes.STRING(255), allowNull: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
  id_sys_equipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'SysEquipo', key: 'id_sysequipo' }
  }
}, {
  tableName: 'SysRepuesto',
  timestamps: true
});

SysRepuesto.belongsTo(SysEquipo, { foreignKey: 'id_sys_equipo_fk', as: 'equipo' });
SysEquipo.hasMany(SysRepuesto, { foreignKey: 'id_sys_equipo_fk', as: 'repuestos' });

module.exports = SysRepuesto;
