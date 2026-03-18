const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Reporte = require('./Reporte');

const RepuestoReporte = sequelize.define('RepuestoReporte', {
    nombreInsumo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    comprobanteEgreso: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reporteIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Reporte,
            key: 'id'
        },
    }
}, {
    tableName: 'RepuestoReporte',
    timestamps: true,
});

RepuestoReporte.belongsTo(Reporte, { foreignKey: 'reporteIdFk', as: 'reporte' });
Reporte.hasMany(RepuestoReporte, { foreignKey: 'reporteIdFk', as: 'repuestos' });

module.exports = RepuestoReporte;
