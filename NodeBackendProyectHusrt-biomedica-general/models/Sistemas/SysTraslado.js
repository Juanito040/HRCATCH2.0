const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Servicio = require('../generales/Servicio');
const Usuario = require('../generales/Usuario');

const SysTraslado = sequelize.define('SysTraslado', {
  id_systraslado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('BODEGA', 'REACTIVACION'),
    allowNull: false
  },
  ubicacion_origen: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ubicacion_destino: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nombre_receptor: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo_receptor: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: SysEquipo, key: 'id_sysequipo' }
  },
  id_servicio_origen_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Servicio, key: 'id' }
  },
  id_servicio_destino_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Servicio, key: 'id' }
  },
  id_sysusuario_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Usuario, key: 'id' }
  }
}, {
  tableName: 'SysTraslado',
  timestamps: true
});

SysTraslado.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo', constraints: false });
SysEquipo.hasMany(SysTraslado, { foreignKey: 'id_sysequipo_fk', as: 'traslados', constraints: false });

SysTraslado.belongsTo(Servicio, { foreignKey: 'id_servicio_origen_fk', as: 'servicioOrigen', constraints: false });
SysTraslado.belongsTo(Servicio, { foreignKey: 'id_servicio_destino_fk', as: 'servicioDestino', constraints: false });

SysTraslado.belongsTo(Usuario, { foreignKey: 'id_sysusuario_fk', as: 'usuario', constraints: false });

module.exports = SysTraslado;
