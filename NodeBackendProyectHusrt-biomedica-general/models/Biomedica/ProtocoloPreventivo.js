const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const TipoEquipo = require('../generales/TipoEquipo');

const ProtocoloPreventivo = sequelize.define('ProtocoloPreventivo', {
    paso: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    tipoEquipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoEquipo,
            key: 'id'
        },
    },
}, {
    tableName: 'ProtocoloPreventivo',
    timestamps: true,
});

ProtocoloPreventivo.belongsTo(TipoEquipo, { foreignKey: 'tipoEquipoIdFk', as: 'tipoEquipos' });
TipoEquipo.hasMany(ProtocoloPreventivo, { foreignKey: 'tipoEquipoIdFk', as: 'protocoloPreventivo' });

module.exports = ProtocoloPreventivo;