const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Usuario = require('../generales/Usuario');

const Firma = sequelize.define('Firma', {
    ruta: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        },
    }
}, {
    tableName: 'Firma',
    timestamps: true,
});

Usuario.hasOne(Firma, { foreignKey: 'usuarioIdFk', as: 'firma' });
Firma.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuario' });

module.exports = Firma;
