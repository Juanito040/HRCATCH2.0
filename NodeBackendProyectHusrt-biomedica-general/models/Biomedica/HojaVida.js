const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Equipo = require('./Equipo');
const Proveedor = require('./Proveedor');
const Fabricante = require('./Fabricante');
const DatosTecnicos = require('./DatosTecnicos');


const HojaVida = sequelize.define('HojaVida', {
    codigoInternacional: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    contrato: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipoAdquisicion: {
        type: DataTypes.ENUM('Compra', 'Convenio', 'Donación', 'Comodato', 'Alquiler', 'NR'),
        allowNull: true
    },
    fechaCompra: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fechaInstalacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fechaIncorporacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fechaVencimientoGarantia: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    costoCompra: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fuente: {
        type: DataTypes.ENUM('Electricidad', 'Energia Solar', 'Agua', 'Gas', 'Vapor de agua', 'Derivados del petroleo', 'Otra'),
        allowNull: true
    },
    tipoUso: {
        //('Diagnostico', 'Terapeutico', 'Soporte Vital', 'Quirurgico', 'Equipo de laboratorio', 'Rehabilitacion', 'Gestion y Soporte Hospitalario'),
        type: DataTypes.ENUM('Diagnostico', 'Terapéutico', 'Soporte Vital', 'Quirúrgico', 'Equipo de laboratorio', 'Rehabilitación', 'Gestión y Soporte Hospitalario', 'NR'),
        allowNull: true
    },
    clase: {
        type: DataTypes.ENUM('Electrico', 'Electronico', 'Mecanico', 'Electromecanico', 'Hidraulico', 'Neumatico', 'Vapor', 'Solar', 'Otro'),
        allowNull: true
    },
    mantenimiento: {
        type: DataTypes.ENUM('Propio', 'Contratado', 'Comodato', 'Garantia'),
        allowNull: true
    },
    propiedad: {
        type: DataTypes.ENUM('Hospital', 'Proveedor', 'otro'),
        allowNull: true
    },
    equipoPortatil: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
    },
    datosTecnicosIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: DatosTecnicos,
            key: 'id'
        },
    },
    equipoIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Equipo,
            key: 'id'
        },
    },
    fabricanteIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Fabricante,
            key: 'id'
        },
    },
    proveedorIdFk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Proveedor,
            key: 'id'
        },
    },
}, {
    tableName: 'HojaVida',
    timestamps: true,
}
);

const Accesorios = require('./Accesorios');

Equipo.hasOne(HojaVida, { foreignKey: 'equipoIdFk', as: 'hojaVida' });
HojaVida.belongsTo(Equipo, { foreignKey: 'equipoIdFk', as: 'equipo' });

Fabricante.hasMany(HojaVida, { foreignKey: 'fabricanteIdFk', as: 'hojaVida' });
HojaVida.belongsTo(Fabricante, { foreignKey: 'fabricanteIdFk', as: 'fabricante' });

Proveedor.hasMany(HojaVida, { foreignKey: 'proveedorIdFk', as: 'hojaVida' });
HojaVida.belongsTo(Proveedor, { foreignKey: 'proveedorIdFk', as: 'proveedor' });

DatosTecnicos.hasOne(HojaVida, { foreignKey: 'datosTecnicosIdFk', as: 'hojaVida' });
HojaVida.belongsTo(DatosTecnicos, { foreignKey: 'datosTecnicosIdFk', as: 'datosTecnicos' });

HojaVida.hasMany(Accesorios, { foreignKey: 'hojaVidaIdFk', as: 'accesorios' });
Accesorios.belongsTo(HojaVida, { foreignKey: 'hojaVidaIdFk', as: 'hojaVida' });

module.exports = HojaVida;