const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysEquipo = require('./SysEquipo');
const Usuario = require('../generales/Usuario');
const SysCumplimientoProtocoloPreventivo = require('./SysCumplimientoProtocoloPreventivo');
const Servicio = require('../generales/Servicio');

const SysReporte = sequelize.define('SysReporte', {
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
    tipoMantenimiento: {
        type: DataTypes.ENUM('Correctivo', 'Preventivo', 'Predictivo', 'Otro'),
        allowNull: true,
    },
    tipoFalla: {
        type: DataTypes.ENUM('Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios', 'Desconocido', 'Sin Falla', 'Otros', 'No Registra'),
        allowNull: true,
    },
    estadoOperativo: {
        type: DataTypes.ENUM('Operativo sin restricciones', 'Operativo con restricciones', 'Fuera de servicio'),
        allowNull: true,
        defaultValue: 'Operativo sin restricciones',
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
    // FK al equipo de sistemas (equivalente a equipoIdFk en Reporte)
    id_sysequipo_fk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SysEquipo,
            key: 'id_sysequipo',
        },
    },
    usuarioIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id',
        },
    },
}, {
    tableName: 'SysReporte',
    timestamps: true,
});

// Asociaciones
Servicio.hasMany(SysReporte, { foreignKey: 'servicioIdFk', as: 'sysReportes' });
SysReporte.belongsTo(Servicio, { foreignKey: 'servicioIdFk', as: 'servicio' });

SysReporte.belongsTo(SysEquipo, { foreignKey: 'id_sysequipo_fk', as: 'equipo' });
SysEquipo.hasMany(SysReporte, { foreignKey: 'id_sysequipo_fk', as: 'sysReportes' });

Usuario.hasMany(SysReporte, { foreignKey: 'usuarioIdFk', as: 'sysReportes' });
SysReporte.belongsTo(Usuario, { foreignKey: 'usuarioIdFk', as: 'usuario' });

// Cumplimiento protocolo preventivo (equivalente a Reporte)


SysReporte.hasMany(SysCumplimientoProtocoloPreventivo, { foreignKey: 'sysReporteIdFk', as: 'sysCumplimientoProtocolo' });
SysCumplimientoProtocoloPreventivo.belongsTo(SysReporte, { foreignKey: 'sysReporteIdFk', as: 'sysReporte' });

module.exports = SysReporte;