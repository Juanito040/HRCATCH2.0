const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCaso = require('./MesaCaso');
const Usuario = require('../generales/Usuario');

const MesaCasoCalificacion = sequelize.define('MesaCasoCalificacion', {
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    casoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One rating per case
        references: { model: MesaCaso, key: 'id' }
    },
    usuarioId: { // Creador que califica
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Usuario, key: 'id' }
    }
}, {
    tableName: 'MesaCasoCalificacion',
    timestamps: true
});

module.exports = MesaCasoCalificacion;
