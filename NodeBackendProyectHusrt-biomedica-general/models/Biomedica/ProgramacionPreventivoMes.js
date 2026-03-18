const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const ProgramacionPreventivoMes = sequelize.define('ProgramacionPreventivoMes', {
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
    tableName: 'ProgramacionPreventivoMes',
    timestamps: true
});

module.exports = ProgramacionPreventivoMes;
