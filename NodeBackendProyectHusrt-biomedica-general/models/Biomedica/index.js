const SistemaInformacion = require('./SistemaInformacion');
const Responsable = require('./Responsable');
const Usuario = require('../generales/Usuario');

SistemaInformacion.belongsTo(Usuario, { foreignKey: 'responsableId', as: 'responsableObj' });
SistemaInformacion.belongsTo(Responsable, { foreignKey: 'proveedorId', as: 'proveedorObj' });
Usuario.hasMany(SistemaInformacion, { foreignKey: 'responsableId', as: 'sistemasResponsable' });
Responsable.hasMany(SistemaInformacion, { foreignKey: 'proveedorId', as: 'sistemasProveedor' });

module.exports = { SistemaInformacion, Responsable, Usuario };
