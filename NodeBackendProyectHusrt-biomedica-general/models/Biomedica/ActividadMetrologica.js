const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');
const Usuario = require('./../generales/Usuario');

const ActividadMetrologica = sequelize.define('ActividadMetrologica', {

    tipoActividad: {
        type: DataTypes.ENUM('Calibración', 'Calificación', 'Validación'),
        allowNull: false,
    },

    mesProgramado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    añoProgramado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    fechaRealizado: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    empresa: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    errorMaximoIdentificado: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resultado: {
        type: DataTypes.ENUM('Cumple', 'No Cumple', 'No Aplica'),
        allowNull: true,
    },
    realizado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    rutaReporte: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id'
        },
    },
    equipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Equipo,
            key: 'id'
        },
    },
    confirmacionMetrologica: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    }
}, {
    tableName: 'actividadMetrologica',
    timestamps: true

});

Equipo.hasMany(ActividadMetrologica, { foreignKey: 'equipoIdFk', as: 'ActividadMetrologica' });
ActividadMetrologica.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });

Usuario.hasMany(ActividadMetrologica, { foreignKey: 'usuarioIdFk', as: 'ActividadMetrologica' });
ActividadMetrologica.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuarioAprobo' });


module.exports = ActividadMetrologica;