const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');
const Usuario = require('../generales/Usuario');

const Trazabilidad = sequelize.define('Trazabilidad', {
    accion: {
        type: DataTypes.STRING, // 'CREACION', 'EDICION', 'ACTUALIZACION_HV', 'REPORTE'
        allowNull: false
    },
    detalles: {
        type: DataTypes.TEXT, // Store JSON string or descriptive text
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    equipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Equipo,
            key: 'id'
        }
    },
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false, // The user who performed the action
        references: {
            model: Usuario,
            key: 'id'
        }
    }
}, {
    tableName: 'Trazabilidad',
    timestamps: false
});

Trazabilidad.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });
Equipo.hasMany(Trazabilidad, { foreignKey: 'equipoIdFk', as: 'historial' });

Trazabilidad.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuario' });
Usuario.hasMany(Trazabilidad, { foreignKey: 'usuarioIdFk', as: 'acciones' });

module.exports = Trazabilidad;
