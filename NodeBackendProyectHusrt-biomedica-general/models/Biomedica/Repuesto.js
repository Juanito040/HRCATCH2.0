const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Repuesto = sequelize.define('Repuesto', {

    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'Repuesto',
    timestamps: true,
});

module.exports = Repuesto;