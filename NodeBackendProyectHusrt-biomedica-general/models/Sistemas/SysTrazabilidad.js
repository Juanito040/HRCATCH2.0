const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario = require('../generales/Usuario');

const SysTrazabilidad = sequelize.define('SysTrazabilidad', {
    accion: {
        type: DataTypes.STRING,
        allowNull: false
        // Valores: 'CREACION', 'EDICION', 'BODEGA', 'BAJA', 'REACTIVACION'
    },
    detalles: {
        type: DataTypes.TEXT,
        allowNull: true
        // Para EDICION: JSON array de { campo, anterior, nuevo }
        // Para otros: texto descriptivo
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    id_sysequipo_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: SysEquipo, key: 'id_sysequipo' }
    },
    id_sysusuario_fk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Usuario, key: 'id' }
    }
}, {
    tableName: 'SysTrazabilidad',
    timestamps: false
});

SysTrazabilidad.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });
SysEquipo.hasMany(SysTrazabilidad, { foreignKey: 'id_sysequipo_fk', as: 'trazabilidad' });

SysTrazabilidad.belongsTo(Usuario, { foreignKey: 'id_sysusuario_fk', as: 'usuario' });
Usuario.hasMany(SysTrazabilidad, { foreignKey: 'id_sysusuario_fk', as: 'accionesSistemas' });

module.exports = SysTrazabilidad;
