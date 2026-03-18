const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Reporte = require('../../models/Biomedica/Reporte');
const MedicionPreventivo = require('./MedicionPreventivo');

const ValorMedicionPreventivo = sequelize.define('ValorMedicionPreventivo', {
    valor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unidadRegistrada: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    conforme: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    medicionIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MedicionPreventivo,
            key: 'id'
        },
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
    tableName: 'ValorMedicionPreventivo',
    timestamps: true,
});

ValorMedicionPreventivo.belongsTo(MedicionPreventivo, { foreignKey: 'medicionIdFk', as: 'medicion' });
ValorMedicionPreventivo.belongsTo(Reporte, { foreignKey: 'reporteIdFk', as: 'reporte' });

Reporte.hasMany(ValorMedicionPreventivo, { foreignKey: 'reporteIdFk', as: 'valoresMediciones' });
MedicionPreventivo.hasMany(ValorMedicionPreventivo, { foreignKey: 'medicionIdFk', as: 'valores' });

module.exports = ValorMedicionPreventivo;
