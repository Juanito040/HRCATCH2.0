const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysAuditoriaRepuestoController');
const requireRoles = require('../../utilities/requireRoles');

const ROLES_PERMITIDOS = ['SUPERADMIN', 'ADMINISTRADOR', 'AG'];

router.get('/', requireRoles(...ROLES_PERMITIDOS), ctrl.getAll);

module.exports = router;
