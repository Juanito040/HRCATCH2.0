const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const TipoEquipo = sequelize.define('TipoEquipo', {
    nombres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    materialConsumible: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    herramienta: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tiempoMinutos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    repuestosMinimos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Biomedica, Sistemas, Mantenimiento
    tipoR: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    actividad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    requiereMetrologia: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'TipoEquipo',
    timestamps: true,
}
);

module.exports = TipoEquipo;