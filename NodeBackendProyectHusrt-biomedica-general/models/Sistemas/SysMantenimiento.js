const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario = require('../generales/Usuario');

const SysMantenimiento = sequelize.define('SysMantenimiento', {
  id_sysmtto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_reporte: { type: DataTypes.STRING(255), allowNull: true },
  añoProgramado: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mesProgramado: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  hora_llamado: { type: DataTypes.TIME, allowNull: true },
  hora_inicio: { type: DataTypes.TIME, allowNull: true },
  hora_terminacion: { type: DataTypes.TIME, allowNull: true },
  tipo_mantenimiento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '1=Correctivo, 2=Preventivo, 3=Predictivo, 4=Otro'
  },
  tipo_falla: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '1=Desgaste, 2=Operación Indebida, 3=Causa Externa, 4=Accesorios, 5=Desconocido, 6=Sin Falla, 7=Otros, 8=No Registra'
  },
  mphardware: { type: DataTypes.BOOLEAN, allowNull: true },
  mpsoftware: { type: DataTypes.BOOLEAN, allowNull: true },
  rutinah: { type: DataTypes.STRING(255), allowNull: true },
  rutinas: { type: DataTypes.STRING(255), allowNull: true },
  observacionesh: { type: DataTypes.TEXT, allowNull: true },
  observacioness: { type: DataTypes.TEXT, allowNull: true },
  autor_realizado: { type: DataTypes.STRING(255), allowNull: true },
  autor_recibido: { type: DataTypes.STRING(255), allowNull: true },
  tiempo_fuera_servicio: { type: DataTypes.INTEGER, allowNull: true },
  dano: { type: DataTypes.BOOLEAN, allowNull: true },
  entega: { type: DataTypes.BOOLEAN, allowNull: true },
  rutahardware: { type: DataTypes.TEXT, allowNull: true },
  rutasoftware: { type: DataTypes.TEXT, allowNull: true },
  rutaentrega: { type: DataTypes.TEXT, allowNull: true },
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'SysEquipo', key: 'id_sysequipo' }
  },
  id_sysusuario_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Usuario', key: 'id' }
  }
}, {
  tableName: 'SysMantenimiento',
  timestamps: true
});

SysMantenimiento.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });
SysEquipo.hasMany(SysMantenimiento, { foreignKey: 'id_sysequipo_fk', as: 'mantenimientos' });

SysMantenimiento.belongsTo(Usuario, { foreignKey: 'id_sysusuario_fk', as: 'usuario' });
Usuario.hasMany(SysMantenimiento, { foreignKey: 'id_sysusuario_fk', as: 'sysMantenimientos' });

module.exports = SysMantenimiento;
