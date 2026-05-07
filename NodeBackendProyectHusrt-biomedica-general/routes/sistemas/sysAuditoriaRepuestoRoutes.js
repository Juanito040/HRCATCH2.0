const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysAuditoriaRepuestoController');
const requireRoles = require('../../utilities/requireRoles');

const ROLES_PERMITIDOS = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SISTEMASADMIN', 'SISTEMASUSER'];

router.get('/', requireRoles(...ROLES_PERMITIDOS), ctrl.getAll);

module.exports = router;
