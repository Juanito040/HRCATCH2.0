const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/Sistemas/sysReporteController');

// PDF de baja (por id del registro SysBaja)
router.get('/baja/:bajaId/pdf', ctrl.exportarPdfBaja);

// PDF de reporte de entrega
router.get('/:id/pdf', ctrl.exportarPdfReporte);

// CRUD
router.get('/',        ctrl.getAllReportes);
router.get('/:id',     ctrl.getReporteById);
router.post('/',       ctrl.createReporte);
router.put('/:id',     ctrl.updateReporte);
router.delete('/:id',  ctrl.deleteReporte);

module.exports = router;
