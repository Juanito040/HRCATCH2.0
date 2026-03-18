const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const TipoEquipo = require('../generales/TipoEquipo');

const MedicionPreventivo = sequelize.define('MedicionPreventivo', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unidad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valorEstandar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    criterioAceptacion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipoEquipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoEquipo,
            key: 'id'
        },
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'MedicionPreventivo',
    timestamps: true,
});

MedicionPreventivo.belongsTo(TipoEquipo, { foreignKey: 'tipoEquipoIdFk', as: 'tipoEquipo' });
TipoEquipo.hasMany(MedicionPreventivo, { foreignKey: 'tipoEquipoIdFk', as: 'medicionesPreventivo' });

module.exports = MedicionPreventivo;
