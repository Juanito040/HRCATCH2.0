const express = require('express');
const router = express.Router();
const { SistemaInformacion, Responsable, Usuario, BackupSistema } = require('../../models/Biomedica');
const { checkToken } = require('../../utilities/middleware');

const ROLES_ADMIN = ['SUPERADMIN', 'SYSTEMADMIN'];
const ROLES_MODULO_SISTEMAS = ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'];

function requireAdminRole(req, res, next) {
    if (!ROLES_ADMIN.includes(req.user?.rol)) {
        return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }
    next();
}

// Bloquea el acceso al módulo cuando el usuario no tiene un rol habilitado
// (SUPERADMIN/SYSTEMADMIN/SYSTEMUSER) o, salvo SUPERADMIN, no tiene al menos
// un sistema de información asignado como responsable.
async function requireSistemasModuloAccess(req, res, next) {
    try {
        const rol = req.user?.rol ?? null;

        if (!ROLES_MODULO_SISTEMAS.includes(rol)) {
            return res.status(403).json({ error: 'Rol no autorizado para el módulo de sistemas' });
        }

        if (rol === 'SUPERADMIN') return next();

        const tieneSistemas = await SistemaInformacion.count({
            where: { responsableId: req.user.id }
        });

        if (tieneSistemas === 0) {
            return res.status(403).json({ error: 'No tiene sistemas de información asignados' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            error: 'Error verificando acceso al módulo',
            detalle: error.message
        });
    }
}

// Verificar acceso del usuario autenticado al módulo de sistemas/backups
router.get('/usuarios/me/acceso-modulo-sistemas', checkToken, async (req, res) => {
    try {
        const rol = req.user?.rol ?? null;
        const usuarioId = req.user?.id;

        const sistemasAsignados = usuarioId
            ? await SistemaInformacion.count({ where: { responsableId: usuarioId } })
            : 0;

        const rolHabilitado = ROLES_MODULO_SISTEMAS.includes(rol);
        const esSuperadmin = rol === 'SUPERADMIN';
        const puedeAcceder = rolHabilitado && (esSuperadmin || sistemasAsignados > 0);

        return res.json({ puedeAcceder, rol, sistemasAsignados });
    } catch (error) {
        return res.status(500).json({
            error: 'Error al verificar acceso al módulo de sistemas',
            detalle: error.message
        });
    }
});

// Obtener todos los sistemas de información
router.get('/sistemasinformacion', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        const sistemas = await SistemaInformacion.findAll({
            include: [
                { model: Usuario, as: 'responsableObj', attributes: ['id', 'nombres', 'apellidos'] },
                { model: Responsable, as: 'proveedorObj' },
                {
                    model: BackupSistema,
                    as: 'backups',
                    attributes: ['frecuencia_backup'],
                    order: [['fecha', 'DESC']],
                    limit: 1,
                    separate: true   // requerido para que limit aplique por sistema y no globalmente
                }
            ],
        });
        res.json(sistemas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los sistemas de información', detalle: error.message });
    }
});

// Obtener un sistema de información por ID
router.get('/sistemainformacion/:id', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id, {
            include: [
                { model: Usuario, as: 'responsableObj', attributes: ['id', 'nombres', 'apellidos'] },
                { model: Responsable, as: 'proveedorObj' },
                {
                    model: BackupSistema,
                    as: 'backups',
                    attributes: ['frecuencia_backup'],
                    order: [['fecha', 'DESC']],
                    limit: 1,
                    separate: true
                }
            ],
        });
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }
        res.json(sistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el sistema de información', detalle: error.message });
    }
});

// Crear un nuevo sistema de información
router.post('/sistemainformacion/', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
    try {
        const nuevoSistema = await SistemaInformacion.create(req.body);
        res.status(201).json(nuevoSistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el sistema de información', detalle: error.message });
    }
});

// Actualizar un sistema de información por ID
router.put('/sistemainformacion/:id', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id);
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }

        await sistema.update(req.body);
        res.json(sistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el sistema de información', detalle: error.message });
    }
});

// Eliminar un sistema de información por ID
router.delete('/sistemainformacion/:id', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id);
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }

        await sistema.destroy();
        res.json({ mensaje: 'Sistema de información eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el sistema de información', detalle: error.message });
    }
});

module.exports = router;
