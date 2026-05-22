const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');

const SysHojaVida = sequelize.define('SysHojaVida', {
  id_syshoja_vida: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: { type: DataTypes.STRING(255), allowNull: true },
  mac: { type: DataTypes.STRING(255), allowNull: true },
  procesador: { type: DataTypes.STRING(255), allowNull: true },
  ram: { type: DataTypes.STRING(255), allowNull: true },
  disco_duro: { type: DataTypes.STRING(255), allowNull: true },
  sistema_operativo: { type: DataTypes.STRING(255), allowNull: true },
  office: { type: DataTypes.STRING(255), allowNull: true },
  tonner: { type: DataTypes.STRING(255), allowNull: true },
  nombre_usuario: { type: DataTypes.STRING(255), allowNull: true },
  vendedor: { type: DataTypes.STRING(150), allowNull: true, defaultValue: '' },
  tipo_uso: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '' },
  fecha_compra: { type: DataTypes.DATEONLY, allowNull: true },
  fecha_instalacion: { type: DataTypes.DATEONLY, allowNull: true },
  costo_compra: { type: DataTypes.STRING(255), allowNull: true },
  contrato: { type: DataTypes.STRING(255), allowNull: true },
  observaciones: { type: DataTypes.TEXT, allowNull: true },
  foto: { type: DataTypes.STRING(255), allowNull: true },
  compraddirecta: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  convenio: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  donado: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  comodato: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  fecha_inicio_soporte: { type: DataTypes.DATEONLY, allowNull: true },
  anos_soporte_fabricante: { type: DataTypes.INTEGER, allowNull: true },
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: SysEquipo, key: 'id_sysequipo' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'SysHojaVida',
  timestamps: true
});

SysHojaVida.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });
SysEquipo.hasOne(SysHojaVida, { foreignKey: 'id_sysequipo_fk', as: 'hojaVida' });

module.exports = SysHojaVida;
