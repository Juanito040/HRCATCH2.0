const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysEquipoController');

router.get('/stats', ctrl.getEstadisticasSysEquipos);
router.get('/bodega', ctrl.getEquiposEnBodega);
router.get('/dados-baja', ctrl.getEquiposDadosDeBaja);
router.get('/:id', ctrl.getSysEquipoById);
router.get('/', ctrl.getAllSysEquipos);

router.post('/', ctrl.createSysEquipo);
router.patch('/:id', ctrl.updateSysEquipo);
router.delete('/:id', ctrl.deleteSysEquipo);
router.patch('/:id/reactivar', ctrl.reactivarSysEquipo);
router.post('/:id/hard-delete', ctrl.hardDeleteSysEquipo);

module.exports = router;
