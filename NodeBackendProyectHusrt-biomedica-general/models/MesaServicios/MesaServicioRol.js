const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const MesaServicioRol = sequelize.define('MesaServicioRol', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    codigo: {
        type: DataTypes.STRING, // ADMIN_SERVICIO, RESOLUTOR, CREADOR
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'MesaServicioRol',
    timestamps: true
});

module.exports = MesaServicioRol;
