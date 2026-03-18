const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const Cargo = sequelize.define('Cargo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Cargo',
    timestamps: true,
});

module.exports = Cargo;
