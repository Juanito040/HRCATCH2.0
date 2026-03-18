const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');
const Servicio = require('../generales/Servicio');
const Usuario = require('../generales/Usuario');

const Traslado = sequelize.define('Traslado', {
    nombreReceptor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cargoReceptor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    equipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Equipo,
            key: 'id'
        }
    },
    servicioOrigenIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Servicio,
            key: 'id'
        }
    },
    servicioDestinoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Servicio,
            key: 'id'
        }
    },
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    }
}, {
    tableName: 'Traslado',
    timestamps: true,
});

Traslado.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });
Equipo.hasMany(Traslado, { foreignKey: 'equipoIdFk', as: 'traslados' });

Traslado.belongsTo(Servicio, { foreignKey: 'servicioOrigenIdFk', as: 'servicioOrigen' });
Traslado.belongsTo(Servicio, { foreignKey: 'servicioDestinoIdFk', as: 'servicioDestino' });

Traslado.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuario' });
Usuario.hasMany(Traslado, { foreignKey: 'usuarioIdFk', as: 'traslados' });

module.exports = Traslado;
