const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysRepuestoController');
const requireRoles = require('../../utilities/requireRoles');

const ROLES = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SISTEMASADMIN', 'SISTEMASUSER'];

router.get('/', ctrl.getAll);
router.get('/tipo/:id_tipo', ctrl.getByTipo);
router.get('/:id', ctrl.getById);
router.post('/', requireRoles(...ROLES), ctrl.create);
router.post('/descontar-stock', ctrl.descontarStock);
router.post('/ajustar-stock-edicion', ctrl.ajustarStockEdicion);
router.patch('/:id', requireRoles(...ROLES), ctrl.update);
router.patch('/:id/toggle', requireRoles(...ROLES), ctrl.toggleActive);

module.exports = router;