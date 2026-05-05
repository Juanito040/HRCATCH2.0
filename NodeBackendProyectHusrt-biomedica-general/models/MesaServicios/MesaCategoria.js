const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Servicio = require('../generales/Servicio');

const MesaCategoria = sequelize.define('MesaCategoria', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    servicioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Servicio,
            key: 'id'
        }
    }
}, {
    tableName: 'MesaCategoria',
    timestamps: true
});

module.exports = MesaCategoria;
