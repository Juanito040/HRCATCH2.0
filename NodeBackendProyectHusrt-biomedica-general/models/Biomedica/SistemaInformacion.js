const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const SistemaInformacion = sequelize.define('SistemaInformacion', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    version: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha_implementacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    tecnologia: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    responsableId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    proveedorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, { tableName: 'sistemasinformacion', timestamps: true });

module.exports = SistemaInformacion;
