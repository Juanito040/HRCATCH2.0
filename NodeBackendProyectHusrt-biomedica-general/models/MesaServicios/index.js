const MesaCategoria = require('./MesaCategoria');
const MesaSubcategoria = require('./MesaSubcategoria');
const MesaServicioRol = require('./MesaServicioRol');
// MesaServicioUsuario removed
const MesaCaso = require('./MesaCaso');
const MesaCasoAsignado = require('./MesaCasoAsignado');
const MesaCasoMensaje = require('./MesaCasoMensaje');
const MesaCasoAdjunto = require('./MesaCasoAdjunto');
const MesaCasoHistorial = require('./MesaCasoHistorial');
const MesaCasoCalificacion = require('./MesaCasoCalificacion');

const Servicio = require('../generales/Servicio');
const Usuario = require('../generales/Usuario');
const Sede = require('../generales/Sede');
const SysEquipo = require('../Sistemas/SysEquipo');

// Parametrization Associations
Servicio.hasMany(MesaCategoria, { foreignKey: 'servicioId', as: 'mesaCategorias' });
MesaCategoria.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicio' });

MesaCategoria.hasMany(MesaSubcategoria, { foreignKey: 'categoriaId', as: 'subcategorias' });
MesaSubcategoria.belongsTo(MesaCategoria, { foreignKey: 'categoriaId', as: 'categoria' });

// Rol Association
Usuario.belongsTo(MesaServicioRol, { foreignKey: 'mesaServicioRolId', as: 'mesaServicioRol' });
MesaServicioRol.hasMany(Usuario, { foreignKey: 'mesaServicioRolId', as: 'usuarios' });

// Case Associations
Servicio.hasMany(MesaCaso, { foreignKey: 'servicioId', as: 'mesaCasos' });
MesaCaso.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicio' });

Sede.hasMany(MesaCaso, { foreignKey: 'sedeId', as: 'mesaCasos' });
MesaCaso.belongsTo(Sede, { foreignKey: 'sedeId', as: 'sede' });

MesaCaso.belongsTo(Servicio, { foreignKey: 'servicioSolicitanteId', as: 'servicioSolicitante' });

Usuario.hasMany(MesaCaso, { foreignKey: 'creadorId', as: 'mesaCasosCreados' });
MesaCaso.belongsTo(Usuario, { foreignKey: 'creadorId', as: 'creador' });

MesaCategoria.hasMany(MesaCaso, { foreignKey: 'categoriaId', as: 'casos' });
MesaCaso.belongsTo(MesaCategoria, { foreignKey: 'categoriaId', as: 'categoria' });

MesaSubcategoria.hasMany(MesaCaso, { foreignKey: 'subcategoriaId', as: 'casos' });
MesaCaso.belongsTo(MesaSubcategoria, { foreignKey: 'subcategoriaId', as: 'subcategoria' });

// Assignment Associations
MesaCaso.hasMany(MesaCasoAsignado, { foreignKey: 'casoId', as: 'asignaciones' });
MesaCasoAsignado.belongsTo(MesaCaso, { foreignKey: 'casoId', as: 'caso' });

Usuario.hasMany(MesaCasoAsignado, { foreignKey: 'usuarioId', as: 'mesaCasosAsignados' });
MesaCasoAsignado.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Usuario.hasMany(MesaCasoAsignado, { foreignKey: 'asignadoPor', as: 'mesaAsignacionesRealizadas' });
MesaCasoAsignado.belongsTo(Usuario, { foreignKey: 'asignadoPor', as: 'asignador' });

// Message Associations
MesaCaso.hasMany(MesaCasoMensaje, { foreignKey: 'casoId', as: 'mensajes' });
MesaCasoMensaje.belongsTo(MesaCaso, { foreignKey: 'casoId', as: 'caso' });

Usuario.hasMany(MesaCasoMensaje, { foreignKey: 'usuarioId', as: 'mesaMensajes' });
MesaCasoMensaje.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Attachment Associations
MesaCasoMensaje.hasMany(MesaCasoAdjunto, { foreignKey: 'mensajeId', as: 'adjuntos' });
MesaCasoAdjunto.belongsTo(MesaCasoMensaje, { foreignKey: 'mensajeId', as: 'mensaje' });

// History Associations
MesaCaso.hasMany(MesaCasoHistorial, { foreignKey: 'casoId', as: 'historial' });
MesaCasoHistorial.belongsTo(MesaCaso, { foreignKey: 'casoId', as: 'caso' });

Usuario.hasMany(MesaCasoHistorial, { foreignKey: 'usuarioId', as: 'mesaHistorialAcciones' });
MesaCasoHistorial.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Rating Associations
MesaCaso.hasOne(MesaCasoCalificacion, { foreignKey: 'casoId', as: 'calificacion' });
MesaCasoCalificacion.belongsTo(MesaCaso, { foreignKey: 'casoId', as: 'caso' });

// Equipo de Sistemas Association (EP-24)
MesaCaso.belongsTo(SysEquipo, { foreignKey: 'equipoId', as: 'equipo' });
SysEquipo.hasMany(MesaCaso, { foreignKey: 'equipoId', as: 'mesaCasos' });

module.exports = {
    MesaCategoria,
    MesaSubcategoria,
    MesaServicioRol,
    // MesaServicioUsuario,
    MesaCaso,
    MesaCasoAsignado,
    MesaCasoMensaje,
    MesaCasoAdjunto,
    MesaCasoHistorial,
    MesaCasoCalificacion
};
