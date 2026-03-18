const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const CondicionInicial = require('./CondicionInicial');

const CumplimientoCondicionInicial = sequelize.define('CumplimientoCondicionInicial', {
    cumple: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    observacion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    condicionInicialIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CondicionInicial,
            key: 'id'
        },
    },
    reporteIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Reporte',
            key: 'id'
        },
    }
}, { tableName: 'CumplimientoCondicionInicial', timestamps: true });

CumplimientoCondicionInicial.belongsTo(CondicionInicial, { foreignKey: 'condicionInicialIdFk', as: 'condicionInicial' });
CondicionInicial.hasMany(CumplimientoCondicionInicial, { foreignKey: 'condicionInicialIdFk', as: 'cumplimientos' });

// We also need to define relation to Reporte here or in Reporte.js, usually in both for safety but here should be enough if imported correctly.
// Ideally usage in Reporte include will require Reporte.hasMany...
// I will update Reporte.js next.

module.exports = CumplimientoCondicionInicial;
