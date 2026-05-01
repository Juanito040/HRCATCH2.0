const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');

const SysPlanMantenimiento = sequelize.define('SysPlanMantenimiento', {
  // Sin PK personalizada — Sequelize maneja 'id' automáticamente
  id_sysequipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SysEquipo,
      key: 'id_sysequipo'  // Corrected to match SysEquipo's actual PK
    }
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rango_inicio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rango_fin: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'SysPlanMantenimiento',
  timestamps: true
});

SysEquipo.hasMany(SysPlanMantenimiento, { foreignKey: 'id_sysequipo_fk', as: 'planesMantenimiento' });
SysPlanMantenimiento.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });

module.exports = SysPlanMantenimiento;