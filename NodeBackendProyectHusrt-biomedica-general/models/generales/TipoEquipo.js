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
    },
    // Campos de Hoja de Vida configurables por tipo de equipo
    campo_ip:            { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_mac:           { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_procesador:    { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_ram:           { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_disco:         { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_tonner:        { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_so:            { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_office:        { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_nombre_usuario:{ type: DataTypes.BOOLEAN, defaultValue: true },
    campo_tipo_uso:      { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_adquisicion:   { type: DataTypes.BOOLEAN, defaultValue: true },
    campo_observaciones: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'TipoEquipo',
    timestamps: true,
}
);

module.exports = TipoEquipo;