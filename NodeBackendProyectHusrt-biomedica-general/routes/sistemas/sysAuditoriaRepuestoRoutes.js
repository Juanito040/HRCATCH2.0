const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysAuditoriaRepuestoController');
const requireRoles = require('../../utilities/requireRoles');
const { checkToken } = require('../../utilities/middleware');

const ROLES_PERMITIDOS = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SISTEMASADMIN', 'SISTEMASUSER', 'SISTEMASTECNICO'];

router.use(checkToken);

router.get('/', requireRoles(...ROLES_PERMITIDOS), ctrl.getAll);

module.exports = router;
