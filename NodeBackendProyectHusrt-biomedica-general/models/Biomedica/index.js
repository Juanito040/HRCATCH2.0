const SistemaInformacion = require('./SistemaInformacion');
const Responsable = require('./Responsable');
const Usuario = require('../generales/Usuario');
const BackupSistema = require('./BackupSistema');

SistemaInformacion.belongsTo(Usuario, { foreignKey: 'responsableId', as: 'responsableObj' });
SistemaInformacion.belongsTo(Responsable, { foreignKey: 'proveedorId', as: 'proveedorObj' });
Usuario.hasMany(SistemaInformacion, { foreignKey: 'responsableId', as: 'sistemasResponsable' });
Responsable.hasMany(SistemaInformacion, { foreignKey: 'proveedorId', as: 'sistemasProveedor' });

SistemaInformacion.hasMany(BackupSistema, { foreignKey: 'sistemaInformacionId', as: 'backups' });
BackupSistema.belongsTo(SistemaInformacion, { foreignKey: 'sistemaInformacionId', as: 'sistema' });

module.exports = { SistemaInformacion, Responsable, Usuario, BackupSistema };
