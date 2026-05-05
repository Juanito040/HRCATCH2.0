const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCaso = require('./MesaCaso');
const Usuario = require('../generales/Usuario');

const MesaCasoAsignado = sequelize.define('MesaCasoAsignado', {
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    fechaAsignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    casoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: MesaCaso, key: 'id' }
    },
    usuarioId: { // El Resolutor
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Usuario, key: 'id' }
    },
    asignadoPor: { // Quién hizo la asignación
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Usuario, key: 'id' }
    }
}, {
    tableName: 'MesaCasoAsignado',
    timestamps: true
});

module.exports = MesaCasoAsignado;
