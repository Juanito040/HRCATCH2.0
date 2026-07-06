const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysRepuestoController');
const requireRoles = require('../../utilities/requireRoles');
const { checkToken } = require('../../utilities/middleware');

// Solo administradores pueden crear/editar/deshabilitar
const ADMIN_ROLES = ['SUPERADMIN', 'SISTEMASADMIN', 'SYSTEMADMIN'];
// Usuarios con acceso de solo lectura
// const READ_ROLES = ['SISTEMASUSER', 'SYSTEMUSER'];

router.use(checkToken);

router.get('/', ctrl.getAll);
router.get('/tipo/:id_tipo', ctrl.getByTipo);
router.get('/usados/tecnico', ctrl.getUsadosPorTecnico);
router.get('/:id', ctrl.getById);
router.post('/', requireRoles(...ADMIN_ROLES), ctrl.create);
router.post('/descontar-stock', ctrl.descontarStock);
router.post('/ajustar-stock-edicion', ctrl.ajustarStockEdicion);
router.patch('/:id', requireRoles(...ADMIN_ROLES), ctrl.update);
router.patch('/:id/toggle', requireRoles(...ADMIN_ROLES), ctrl.toggleActive);

module.exports = router;