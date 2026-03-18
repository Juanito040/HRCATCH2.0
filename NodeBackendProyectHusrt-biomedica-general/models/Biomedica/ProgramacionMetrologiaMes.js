const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const ProgramacionMetrologiaMes = sequelize.define('ProgramacionMetrologiaMes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'ProgramacionMetrologiaMes',
    timestamps: true
});

module.exports = ProgramacionMetrologiaMes;
