const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Accesorios = sequelize.define('Accesorios', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // true = Operativo, false = No Operativo
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    hojaVidaIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Accesorios',
    timestamps: false
});

module.exports = Accesorios;
