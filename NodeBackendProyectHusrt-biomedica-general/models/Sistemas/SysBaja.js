const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario = require('../generales/Usuario');

const SysBaja = sequelize.define('SysBaja', {
  id_sysbaja: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_baja: { type: DataTypes.DATEONLY, allowNull: true },
  justificacion_baja: { type: DataTypes.TEXT, allowNull: true },
  accesorios_reutilizables: { type: DataTypes.TEXT, allowNull: true },
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: SysEquipo, key: 'id_sysequipo' }
  },
  id_sysusuario_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Usuario, key: 'id' }
  }
}, {
  tableName: 'SysBaja',
  timestamps: true
});

SysBaja.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });
SysEquipo.hasOne(SysBaja, { foreignKey: 'id_sysequipo_fk', as: 'baja' });

SysBaja.belongsTo(Usuario, { foreignKey: 'id_sysusuario_fk', as: 'usuarioBaja' });

module.exports = SysBaja;
