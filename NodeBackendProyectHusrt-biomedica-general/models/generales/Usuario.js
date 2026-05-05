const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');
const Cargo = require('./Cargo');
const Rol = require('./Rol');
const Servicio = require('./Servicio');
const MesaServicioRol = require('../MesaServicios/MesaServicioRol');

const Usuario = sequelize.define('Usuario', {
  nombres: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombreUsuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tipoId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registroInvima: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  rolId: {
    type: DataTypes.INTEGER,
    references: {
      model: Rol,
      key: 'id'
    },
    allowNull: false,
  },
  cargoId: {
    type: DataTypes.INTEGER,
    references: {
      model: Cargo,
      key: 'id'
    },
    allowNull: false,
    defaultValue: 1,
  },
  servicioId: {
    type: DataTypes.INTEGER,
    references: {
      model: Servicio,
      key: 'id'
    },
    allowNull: false,
    defaultValue: 1,
  },
  mesaServicioRolId: {
    type: DataTypes.INTEGER,
    references: {
      model: MesaServicioRol,
      key: 'id'
    },
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'Usuario',
  timestamps: true,
});

Usuario.belongsTo(Rol, { foreignKey: 'rolId', as: 'rol' });
Rol.hasMany(Usuario, { foreignKey: 'rolId', as: 'usuarios' });

Usuario.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });
Cargo.hasMany(Usuario, { foreignKey: 'cargoId', as: 'usuarios' });

Usuario.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicio' });
Servicio.hasMany(Usuario, { foreignKey: 'servicioId', as: 'usuarios' });

module.exports = Usuario;
