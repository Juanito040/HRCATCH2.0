const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const TipoEquipo = require('../generales/TipoEquipo');

const SysProtocoloPreventivo = sequelize.define('SysProtocoloPreventivo', {
  id_sysprotocolo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paso: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  id_tipo_equipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'SysProtocoloPreventivo',
  timestamps: true
});

SysProtocoloPreventivo.belongsTo(TipoEquipo, { foreignKey: 'id_tipo_equipo_fk', as: 'tipoEquipo', constraints: false });
TipoEquipo.hasMany(SysProtocoloPreventivo, { foreignKey: 'id_tipo_equipo_fk', as: 'sysProtocolos', constraints: false });

module.exports = SysProtocoloPreventivo;
