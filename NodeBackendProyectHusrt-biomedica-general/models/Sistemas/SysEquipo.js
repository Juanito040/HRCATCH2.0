const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Servicio = require('../generales/Servicio');
const TipoEquipo = require('../generales/TipoEquipo');
const Usuario = require('../generales/Usuario');

const SysEquipo = sequelize.define('SysEquipo', {
  id_sysequipo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_equipo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  serie: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  placa_inventario: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  codigo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ubicacion_especifica: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ubicacion_anterior: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  ano_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  dias_mantenimiento: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  periodicidad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estado_baja: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  administrable: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  direccionamiento_Vlan: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  numero_puertos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  mtto: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  preventivo_s: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  fecha_modificacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  id_servicio_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Servicio,
      key: 'id'
    }
  },
  id_tipo_equipo_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TipoEquipo,
      key: 'id'
    }
  },
  id_usuario_fk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Usuario,
      key: 'id'
    }
  }
}, {
  tableName: 'SysEquipo',
  timestamps: true
});

// Asociaciones
SysEquipo.belongsTo(Servicio, { foreignKey: 'id_servicio_fk', as: 'servicio' });
Servicio.hasMany(SysEquipo, { foreignKey: 'id_servicio_fk', as: 'sysEquipos' });

SysEquipo.belongsTo(TipoEquipo, { foreignKey: 'id_tipo_equipo_fk', as: 'tipoEquipo' });
TipoEquipo.hasMany(SysEquipo, { foreignKey: 'id_tipo_equipo_fk', as: 'sysEquipos' });

SysEquipo.belongsTo(Usuario, { foreignKey: 'id_usuario_fk', as: 'usuario' });
Usuario.hasMany(SysEquipo, { foreignKey: 'id_usuario_fk', as: 'sysEquipos' });

module.exports = SysEquipo;
