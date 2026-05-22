/**
 * Middleware de control de acceso por roles.
 * Uso: requireRoles('SUPERADMIN', 'ADMINISTRADOR', 'AG')
 * Requiere que checkToken haya corrido antes (req.user debe estar disponible).
 */
const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado.' });
  }
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Su rol no tiene permiso para esta acción.'
    });
  }
  next();
};

module.exports = requireRoles;
