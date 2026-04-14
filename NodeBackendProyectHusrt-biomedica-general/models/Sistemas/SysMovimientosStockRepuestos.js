const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysRepuesto = require('./SysRepuesto');

const SysMovimientosStockRepuestos = sequelize.define('SysMovimientosStockRepuestos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_repuesto_fk: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'SysRepuesto', key: 'id_sysrepuesto' }
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'egreso'),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_antes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_despues: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  referencia: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  usuario: {
    type: DataTypes.STRING(150),
    allowNull: false,
    defaultValue: 'desconocido'
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SysMovimientosStockRepuestos',
  timestamps: false
});

SysMovimientosStockRepuestos.belongsTo(SysRepuesto, {
  foreignKey: 'id_repuesto_fk',
  as: 'repuesto'
});

SysRepuesto.hasMany(SysMovimientosStockRepuestos, {
  foreignKey: 'id_repuesto_fk',
  as: 'movimientosStock'
});

module.exports = SysMovimientosStockRepuestos;
