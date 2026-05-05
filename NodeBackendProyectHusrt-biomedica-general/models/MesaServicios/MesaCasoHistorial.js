const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCaso = require('./MesaCaso');
const Usuario = require('../generales/Usuario');

const MesaCasoHistorial = sequelize.define('MesaCasoHistorial', {
    evento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valorAnterior: {
        type: DataTypes.TEXT, // Store as JSON string if complex
        allowNull: true
    },
    valorNuevo: {
        type: DataTypes.TEXT, // Store as JSON string if complex
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    casoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: MesaCaso, key: 'id' }
    },
    usuarioId: { // Ejecutor
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Usuario, key: 'id' }
    }
}, {
    tableName: 'MesaCasoHistorial',
    timestamps: true
});

module.exports = MesaCasoHistorial;
