const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCasoMensaje = require('./MesaCasoMensaje');

const MesaCasoAdjunto = sequelize.define('MesaCasoAdjunto', {
    nombreOriginal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rutaAlmacenamiento: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipoMime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tamano: {
        type: DataTypes.INTEGER, // Bytes
        allowNull: true
    },
    mensajeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: MesaCasoMensaje, key: 'id' }
    }
}, {
    tableName: 'MesaCasoAdjunto',
    timestamps: true
});

module.exports = MesaCasoAdjunto;
