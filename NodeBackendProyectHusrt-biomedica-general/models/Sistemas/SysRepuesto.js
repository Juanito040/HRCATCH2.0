const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysTipoRepuesto = require('./SysTipoRepuesto');

const SysRepuesto = sequelize.define('SysRepuesto', {
  id_sysrepuesto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion_tecnica: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  numero_parte: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  numero_serie: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  id_sys_tipo_repuesto_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'SysTipoRepuesto', key: 'id_sys_tipo_repuesto' }
  },
  modelo_asociado: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  proveedor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cantidad_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ubicacion_fisica: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  garantia_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  garantia_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('Nuevo', 'Usado', 'Reacondicionado', 'Defectuoso'),
    allowNull: false,
    defaultValue: 'Nuevo'
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  costo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
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
  tableName: 'SysRepuesto',
  timestamps: true
});

SysRepuesto.belongsTo(SysTipoRepuesto, {
  foreignKey: 'id_sys_tipo_repuesto_fk',
  as: 'tipoRepuesto'
});

SysTipoRepuesto.hasMany(SysRepuesto, {
  foreignKey: 'id_sys_tipo_repuesto_fk',
  as: 'repuestos'
});

module.exports = SysRepuesto;
