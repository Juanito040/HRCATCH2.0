const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysHojaVidaController');

router.get('/equipo/:equipoId/pdf', ctrl.exportarPdfByEquipo);
router.get('/equipo/:equipoId', ctrl.getSysHojaVidaByEquipo);
router.put('/equipo/:equipoId', ctrl.upsertByEquipo);

router.get('/:id', ctrl.getSysHojaVidaById);
router.get('/', ctrl.getAllSysHojasVida);
router.post('/', ctrl.createSysHojaVida);
router.put('/:id', ctrl.updateSysHojaVida);
router.delete('/:id', ctrl.deleteSysHojaVida);

module.exports = router;
