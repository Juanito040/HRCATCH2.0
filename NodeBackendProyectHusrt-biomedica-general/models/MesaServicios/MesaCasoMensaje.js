const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCaso = require('./MesaCaso');
const Usuario = require('../generales/Usuario');

const MesaCasoMensaje = sequelize.define('MesaCasoMensaje', {
    mensaje: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('NORMAL', 'CIERRE', 'SISTEMA'),
        defaultValue: 'NORMAL'
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
    usuarioId: { // Remitente (puede ser null si es SISTEMA auto)
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Usuario, key: 'id' }
    }
}, {
    tableName: 'MesaCasoMensaje',
    timestamps: true
});

module.exports = MesaCasoMensaje;
