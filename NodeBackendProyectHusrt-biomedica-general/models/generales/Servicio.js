const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Servicio = sequelize.define('Servicio', {
  nombres: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  requiereMesaServicios: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  sedeIdFk: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sede',
      key: 'id'
    }
  }
}, {
  tableName: 'Servicio',
  timestamps: true,
});

const Sede = require('./Sede');
Servicio.belongsTo(Sede, { foreignKey: 'sedeIdFk', as: 'sede' });
Sede.hasMany(Servicio, { foreignKey: 'sedeIdFk', as: 'servicios' });

module.exports = Servicio;