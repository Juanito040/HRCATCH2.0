const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');

const PlanMantenimiento = sequelize.define('PlanMantenimiento', {
    equipoIdFk: {
        type: DataTypes.INTEGER,
        references: { model: Equipo, key: 'id' },
        allowNull: false,
    },
    mes: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ano: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rangoInicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rangoFin: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, { tableName: 'PlanMantenimiento', timestamps: true });

Equipo.hasMany(PlanMantenimiento, { foreignKey: 'equipoIdFk', as: 'planesMantenimiento' });
PlanMantenimiento.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });

module.exports = PlanMantenimiento;
