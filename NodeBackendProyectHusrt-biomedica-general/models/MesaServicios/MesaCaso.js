const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Servicio = require('../generales/Servicio');
const Sede = require('../generales/Sede');
const Usuario = require('../generales/Usuario');
const MesaCategoria = require('./MesaCategoria');
const MesaSubcategoria = require('./MesaSubcategoria');

const MesaCaso = sequelize.define('MesaCaso', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('INCIDENCIA', 'REQUERIMIENTO'),
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('NUEVO', 'EN_CURSO', 'EN_ESPERA', 'RESUELTO', 'CERRADO'),
        defaultValue: 'NUEVO',
        allowNull: false,
    },
    sumerce: {
        type: DataTypes.ENUM(
            'S_SEGURO',
            'U_UNIVERSITARIO',
            'M_MEJORADO',
            'E_EFICIENTE',
            'R_RESPONSABLE',
            'C_CALIDO',
            'E_EXCELENTE'
        ),
        allowNull: false,
    },
    prioridad: {
        type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA'),
        defaultValue: 'MEDIA'
    },
    fechaCreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    fechaCierre: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fechaUltimaAccion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    servicioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Servicio, key: 'id' }
    },
    sedeId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Denormalized for easier filtering
        references: { model: Sede, key: 'id' }
    },
    servicioSolicitanteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Servicio, key: 'id' }
    },
    creadorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Usuario, key: 'id' }
    },
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: MesaCategoria, key: 'id' }
    },
    subcategoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: MesaSubcategoria, key: 'id' }
    }
}, {
    tableName: 'MesaCaso',
    timestamps: true,
    indexes: [
        { fields: ['servicioId', 'estado'] },
        { fields: ['creadorId'] },
        { fields: ['estado'] }
    ]
});

module.exports = MesaCaso;
