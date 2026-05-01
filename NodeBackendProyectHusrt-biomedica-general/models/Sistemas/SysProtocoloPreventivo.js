const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const TipoEquipo = require('../generales/TipoEquipo');

const SysProtocoloPreventivo = sequelize.define('SysProtocoloPreventivo', {
    paso: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    id_tipo_equipo_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoEquipo,
            key: 'id'
        },
    },
}, {
    tableName: 'SysProtocoloPreventivo',
    timestamps: true,
});

SysProtocoloPreventivo.belongsTo(TipoEquipo, { foreignKey: 'id_tipo_equipo_fk', as: 'tipoEquipos' });
TipoEquipo.hasMany(SysProtocoloPreventivo, { foreignKey: 'id_tipo_equipo_fk', as: 'sysProtocoloPreventivo' });

module.exports = SysProtocoloPreventivo;