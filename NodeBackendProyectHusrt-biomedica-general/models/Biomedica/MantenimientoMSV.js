const { DataTypes } = require('sequelize');
const sequelize = require('../config/configDb');
const Equipo = require('./Equipo');

const MantenimientoMSV = sequelize.define('MantenimientoMSV', {

    v100Medidospo2: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    v120Medidoecg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    v120MedidoSistolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v150MedidoDiastolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v167MedidoMedia: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v180Medidoecg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v200MedidoSistolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v30MedidoDiastolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v40MedidoMedia: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v45Medidoecg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v50MedidoDiastolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v60Medidoecg: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v60MedidoMedia: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v60MedidoSistolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v65medidospo2: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v75Medidospo2: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v80MedidoDiastolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v80MedidoSistolica: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },
    v92MedidoMedia: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        unique: true,
    },

    equipoIdFk: {
        type: DataTypes.INTEGER,
        references: {
            model: Equipo,
            key: 'id'
        },
        allowNull: false,
    },
}, {
    tableName: 'MantenimientoMSV',
    timestamps: true,
});