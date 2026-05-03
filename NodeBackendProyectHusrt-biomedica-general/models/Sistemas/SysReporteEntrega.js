const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario  = require('../generales/Usuario');

const SysReporteEntrega = sequelize.define('SysReporteEntrega', {
  id_sysreporte: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha:               { type: DataTypes.DATEONLY,      allowNull: true },
  hora_llamado:        { type: DataTypes.STRING(10),     allowNull: true },
  hora_inicio:         { type: DataTypes.STRING(10),     allowNull: true },
  hora_terminacion:    { type: DataTypes.STRING(10),     allowNull: true },
  servicio_anterior:   { type: DataTypes.STRING(255),    allowNull: true },
  ubicacion_anterior:  { type: DataTypes.STRING(255),    allowNull: true },
  servicio_nuevo:      { type: DataTypes.STRING(255),    allowNull: true },
  ubicacion_nueva:     { type: DataTypes.STRING(255),    allowNull: true },
  ubicacion_especifica:{ type: DataTypes.STRING(255),    allowNull: true },
  realizado_por:       { type: DataTypes.STRING(255),    allowNull: true },
  recibido_por:        { type: DataTypes.STRING(255),    allowNull: true },
  observaciones:       { type: DataTypes.TEXT,           allowNull: true },
  id_sysequipo_fk:     { type: DataTypes.INTEGER,        allowNull: true },
  id_sysusuario_fk:    { type: DataTypes.INTEGER,        allowNull: true }
}, {
  tableName: 'SysReporteEntrega',
  timestamps: true
});

SysReporteEntrega.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo', constraints: false });
SysEquipo.hasMany(SysReporteEntrega,   { foreignKey: 'id_sysequipo_fk', as: 'reportesEntrega', constraints: false });
SysReporteEntrega.belongsTo(Usuario,   { foreignKey: 'id_sysusuario_fk', as: 'usuario', constraints: false });

module.exports = SysReporteEntrega;
