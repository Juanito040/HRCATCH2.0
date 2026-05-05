const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario   = require('../generales/Usuario');

const SysReporteMantenimiento = sequelize.define('SysReporteMantenimiento', {
  id_sysreporte_mto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo:             { type: DataTypes.STRING(500), allowNull: true },

  // Campos principales del reporte (alineados con biomédica)
  tipo_mantenimiento: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Correctivo' },
  tipo_falla:         { type: DataTypes.STRING(100), allowNull: true },
  estado_operativo:   { type: DataTypes.STRING(100), allowNull: true, defaultValue: 'Operativo sin restricciones' },
  motivo:             { type: DataTypes.TEXT, allowNull: true },
  trabajo_realizado:  { type: DataTypes.TEXT, allowNull: false },
  calificacion:       { type: DataTypes.INTEGER, allowNull: true },
  nombre_recibio:     { type: DataTypes.STRING(255), allowNull: true },
  cedula_recibio:     { type: DataTypes.STRING(50), allowNull: true },
  observaciones:      { type: DataTypes.TEXT, allowNull: true },

  // Fechas y horas
  fecha_realizado:    { type: DataTypes.DATEONLY, allowNull: true },
  hora_inicio:        { type: DataTypes.STRING(10), allowNull: true },
  hora_terminacion:   { type: DataTypes.STRING(10), allowNull: true },
  hora_total:         { type: DataTypes.STRING(10), allowNull: true },

  // Trazabilidad
  mesa_caso_id:       { type: DataTypes.INTEGER, allowNull: true },
  id_sysequipo_fk:    { type: DataTypes.INTEGER, allowNull: false },
  id_usuario_fk:      { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'SysReporteMantenimiento',
  timestamps: true
});

SysReporteMantenimiento.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo', constraints: false });
SysEquipo.hasMany(SysReporteMantenimiento, { foreignKey: 'id_sysequipo_fk', as: 'reportesMantenimiento', constraints: false });
SysReporteMantenimiento.belongsTo(Usuario, { foreignKey: 'id_usuario_fk', as: 'usuario', constraints: false });

module.exports = SysReporteMantenimiento;
