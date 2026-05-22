const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario = require('../generales/Usuario');

const SysBodega = sequelize.define('SysBodega', {
  id_sysbodega: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_ingreso: { type: DataTypes.DATEONLY, allowNull: true },
  tipo_bodega: { type: DataTypes.STRING(255), allowNull: true },
  motivo: { type: DataTypes.TEXT, allowNull: true },
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: SysEquipo, key: 'id_sysequipo' }
  },
  id_sysusuario_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Usuario, key: 'id' }
  },
  ubicacion_origen: { type: DataTypes.STRING(255), allowNull: true },
  ubicacion_esp_origen: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'SysBodega',
  timestamps: true
});

SysBodega.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo', constraints: false });
SysEquipo.hasOne(SysBodega, { foreignKey: 'id_sysequipo_fk', as: 'bodega', constraints: false });
SysBodega.belongsTo(Usuario, { foreignKey: 'id_sysusuario_fk', as: 'usuarioBodega', constraints: false });

module.exports = SysBodega;
