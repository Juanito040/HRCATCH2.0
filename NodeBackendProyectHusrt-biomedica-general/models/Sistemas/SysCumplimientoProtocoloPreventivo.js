const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const ProtocoloPreventivo = require('../Biomedica/ProtocoloPreventivo');

const SysCumplimientoProtocoloPreventivo = sequelize.define('SysCumpliminetoProtocoloPreventivo', {
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
    mantenimientoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'SysMantenimiento',
            key: 'id_sysmtto'
        },
    }
}, { tableName: 'SysCumpliminetoProtocoloPreventivo', timestamps: true });

SysCumplimientoProtocoloPreventivo.belongsTo(ProtocoloPreventivo, { foreignKey: 'protocoloPreventivoIdFk', as: 'protocolo' });
ProtocoloPreventivo.hasMany(SysCumplimientoProtocoloPreventivo, { foreignKey: 'protocoloPreventivoIdFk', as: 'SyscumplimientoProtocolo' });


module.exports = SysCumplimientoProtocoloPreventivo;
