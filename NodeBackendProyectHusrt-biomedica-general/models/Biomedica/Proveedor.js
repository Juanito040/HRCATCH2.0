const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Proveedor = sequelize.define('Proveedor', {
    nombres: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ciudad: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    representante: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telRepresentante: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, { tableName: 'Proveedor', timestamps: true });

module.exports = Proveedor;