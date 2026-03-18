const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const CondicionInicial = sequelize.define('CondicionInicial', {
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'CondicionInicial',
    timestamps: true,
});

module.exports = CondicionInicial;
