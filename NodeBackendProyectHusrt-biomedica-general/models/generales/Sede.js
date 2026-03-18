const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Sede = sequelize.define('Sede', {

    nombres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nit: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    ciudad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    departamento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    nivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Sede',
    timestamps: true,
});

module.exports = Sede;