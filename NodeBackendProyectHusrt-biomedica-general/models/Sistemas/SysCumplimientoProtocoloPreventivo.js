const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysProtocoloPreventivo = require('./SysProtocoloPreventivo');

const SysCumplimientoProtocoloPreventivo = sequelize.define('SysCumplimientoProtocoloPreventivo', {
    cumple: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sysProtocoloPreventivoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SysProtocoloPreventivo,
            key: 'id'
        },
    },
    sysReporteIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SysReporte',
            key: 'id'
        },
    }
}, { tableName: 'SysCumplimientoProtocoloPreventivo', timestamps: true });

// Solo belongsTo aqui — el hasMany esta declarado en SysProtocoloPreventivo.js
SysCumplimientoProtocoloPreventivo.belongsTo(SysProtocoloPreventivo, { foreignKey: 'sysProtocoloPreventivoIdFk', as: 'protocolo' });

module.exports = SysCumplimientoProtocoloPreventivo;