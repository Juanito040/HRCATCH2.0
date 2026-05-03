const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysTipoRepuestoController');
const requireRoles = require('../../utilities/requireRoles');

const ROLES = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SYSTEMADMIN'];

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', requireRoles(...ROLES), ctrl.create);
router.patch('/:id', requireRoles(...ROLES), ctrl.update);
router.patch('/:id/toggle', requireRoles(...ROLES), ctrl.toggleActive);

module.exports = router;
