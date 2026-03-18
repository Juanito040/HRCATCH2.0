const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const TipoEquipo = require('../generales/TipoEquipo');
const Servicio = require('../generales/Servicio');
const Sede = require('../generales/Sede');
const Responsable = require('./Responsable');

const Equipo = sequelize.define('Equipo', {
    nombres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    serie: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    registroInvima: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    riesgo: {
        type: DataTypes.ENUM('NA', 'I', 'IIA', 'IIB', 'III'),
        allowNull: true
    },
    ubicacion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ubicacionEspecifica: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    periodicidadM: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    periodicidadC: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    estadoBaja: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
    },
    tipoEquipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoEquipo,
            key: 'id'
        },
    },
    servicioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Servicio,
            key: 'id'
        },
    },
    responsableIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Responsable,
            key: 'id'
        },
    }
}, {
    tableName: 'Equipo',
    timestamps: true,
});

Equipo.belongsTo(TipoEquipo, { foreignKey: 'tipoEquipoIdFk', as: 'tipoEquipos' });
TipoEquipo.hasMany(Equipo, { foreignKey: 'tipoEquipoIdFk', as: 'equipos' });

Equipo.belongsTo(Servicio, { foreignKey: 'servicioIdFk', as: 'servicios' });
Servicio.hasMany(Equipo, { foreignKey: 'servicioIdFk', as: 'equipos' });

Equipo.belongsTo(Responsable, { foreignKey: 'responsableIdFk', as: 'responsables' });
Responsable.hasMany(Equipo, { foreignKey: 'responsableIdFk', as: 'equipos' });

module.exports = Equipo;
