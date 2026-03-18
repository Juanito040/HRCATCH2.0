const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const MesaCategoria = require('./MesaCategoria');

const MesaSubcategoria = sequelize.define('MesaSubcategoria', {
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
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MesaCategoria,
            key: 'id'
        }
    }
}, {
    tableName: 'MesaSubcategoria',
    timestamps: true
});

module.exports = MesaSubcategoria;
