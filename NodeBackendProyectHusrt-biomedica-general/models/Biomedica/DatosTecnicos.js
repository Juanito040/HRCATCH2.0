const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const DatosTecnicos = sequelize.define('DatosTecnicos', {

    vMaxOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    vMinOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    iMaxOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    iMinOperacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    wConsumida: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    frecuencia: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    presion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    velocidad: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    temperatura: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    peso: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
    capacidad: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false,
    },
}, { tableName: 'DatosTecnicos', timestamps: true });

module.exports = DatosTecnicos;