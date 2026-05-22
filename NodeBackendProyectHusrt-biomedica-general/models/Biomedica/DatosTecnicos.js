const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const DatosTecnicos = sequelize.define('DatosTecnicos', {

    vMaxOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    vMinOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    iMaxOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    iMinOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    wConsumida: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    frecuencia: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    presion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    velocidad: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    temperatura: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    peso: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    capacidad: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
}, { tableName: 'DatosTecnicos', timestamps: true });

module.exports = DatosTecnicos;
