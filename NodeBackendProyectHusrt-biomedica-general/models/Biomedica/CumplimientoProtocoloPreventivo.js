const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Reporte = require('../../models/Biomedica/Reporte');
const ProtocoloPreventivo = require('./ProtocoloPreventivo');

const CumplimientoProtocoloPreventivo = sequelize.define('CumpliminetoProtocoloPreventivo', {
    cumple: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    protocoloPreventivoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ProtocoloPreventivo,
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
}, { tableName: 'CumpliminetoProtocoloPreventivo', timestamps: true });

CumplimientoProtocoloPreventivo.belongsTo(ProtocoloPreventivo, { foreignKey: 'protocoloPreventivoIdFk', as: 'protocolo' });
ProtocoloPreventivo.hasMany(CumplimientoProtocoloPreventivo, { foreignKey: 'protocoloPreventivoIdFk', as: 'cumplimientoProtocolo' });


module.exports = CumplimientoProtocoloPreventivo;
