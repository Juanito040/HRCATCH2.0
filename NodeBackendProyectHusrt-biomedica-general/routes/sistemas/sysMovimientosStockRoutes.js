const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysMovimientosStockController');
const requireRoles = require('../../utilities/requireRoles');

const ROLES = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SYSTEMADMIN'];

// Rutas de consulta (accesibles para todos los roles autenticados)
router.get('/', ctrl.getAll);
router.get('/alertas', ctrl.getAlertas);
router.get('/exportar', ctrl.exportarCSV);

// Registrar movimiento (solo roles con permiso)
router.post('/', requireRoles(...ROLES), ctrl.registrarMovimiento);

module.exports = router;
