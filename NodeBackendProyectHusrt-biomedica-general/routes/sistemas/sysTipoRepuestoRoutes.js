const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysTipoRepuestoController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.patch('/:id/toggle', ctrl.toggleActive);

module.exports = router;
