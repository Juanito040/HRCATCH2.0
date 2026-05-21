const express = require('express');
const router  = express.Router();
const { checkToken } = require('../../utilities/middleware');
const ctrl    = require('../../controllers/Sistemas/sysReporteController');

router.use(checkToken);

// PDF de baja (por id del registro SysBaja)
router.get('/baja/:bajaId/pdf', ctrl.exportarPdfBaja);

// JSON de baja (para generación de PDF en el frontend)
router.get('/baja/:bajaId', ctrl.getBajaById);

// PDF de reporte de entrega
router.get('/:id/pdf', ctrl.exportarPdfReporte);

router.get('/catalogos/tipos-mantenimiento', ctrl.getCatalogoTiposMantenimiento);
router.get('/catalogos/tipos-falla', ctrl.getCatalogoTiposFalla);
router.get('/dashboard', ctrl.getDashboard);
router.get('/equipo/:idEquipo', ctrl.getByEquipo);
router.get('/tecnico/:idUsuario', ctrl.getByTecnico);

// CRUD
router.get('/',        ctrl.getAllReportes);
router.get('/:id',     ctrl.getReporteById);
router.post('/',       ctrl.createReporte);
router.put('/:id',     ctrl.updateReporte);
router.delete('/:id',  ctrl.deleteReporte);

module.exports = router;
