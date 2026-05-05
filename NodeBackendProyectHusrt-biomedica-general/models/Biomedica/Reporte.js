const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');
const Usuario = require('./../generales/Usuario');
const Servicio = require('./../generales/Servicio');

const Reporte = sequelize.define('Reporte', {
    añoProgramado: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    mesProgramado: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fechaRealizado: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    horaInicio: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    fechaFin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    horaTerminacion: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    horaTotal: {
        type: DataTypes.TIME,
        allowNull: true,
    },

    // Correctivo Activo y Correctivo Pasivo
    tipoMantenimiento: {
        type: DataTypes.ENUM('Correctivo', 'Preventivo', 'Predictivo', 'Otro'),
        allowNull: true
    },
    tipoFalla: {
        type: DataTypes.ENUM('Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios', 'Desconocido', 'Sin Falla', 'Otros', 'No Registra'),
        allowNull: true
    },
    estadoOperativo: {
        type: DataTypes.ENUM('Operativo sin restricciones', 'Operativo con restricciones', 'Fuera de servicio'),
        allowNull: true,
        defaultValue: 'Operativo sin restricciones'
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    trabajoRealizado: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    calificacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    nombreRecibio: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cedulaRecibio: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    mantenimientoPropio: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    realizado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    rutaPdf: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    servicioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Servicio,
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
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id'
        },
    },
    equipoPatronIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Equipo,
            key: 'id'
        },
    },
}, {
    tableName: 'Reporte',
    timestamps: true,
});
Servicio.hasMany(Reporte, { foreignKey: 'servicioIdFk', as: 'reporte' });
Reporte.belongsTo(Servicio, { foreignKey: 'servicioIdFk', as: 'servicio' });

Equipo.hasMany(Reporte, { foreignKey: 'equipoIdFk', as: 'reporte' });
Reporte.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });
Reporte.belongsTo(Equipo, { foreignKey: 'equipoPatronIdFk', as: 'equipoPatron' });

Usuario.hasMany(Reporte, { foreignKey: 'usuarioIdFk', as: 'reporte' });
Reporte.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuario' });

const CumplimientoCondicionInicial = require('./CumplimientoCondicionInicial');
const CumplimientoProtocoloPreventivo = require('./CumplimientoProtocoloPreventivo');

Reporte.hasMany(CumplimientoCondicionInicial, { foreignKey: 'reporteIdFk', as: 'cumplimientoCondicionesIniciales' });
CumplimientoCondicionInicial.belongsTo(Reporte, { foreignKey: 'reporteIdFk', as: 'reporte' });

Reporte.hasMany(CumplimientoProtocoloPreventivo, { foreignKey: 'reporteIdFk', as: 'cumplimientoProtocolo' });
CumplimientoProtocoloPreventivo.belongsTo(Reporte, { foreignKey: 'reporteIdFk', as: 'reporte' });

module.exports = Reporte;