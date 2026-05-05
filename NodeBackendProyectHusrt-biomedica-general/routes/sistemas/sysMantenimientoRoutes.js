const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysMantenimientoController');

router.get('/catalogos/tipos-mantenimiento', ctrl.getCatalogoTiposMantenimiento);
router.get('/catalogos/tipos-falla', ctrl.getCatalogoTiposFalla);
router.get('/dashboard', ctrl.getDashboard);
router.get('/equipo/:idEquipo', ctrl.getByEquipo);
router.get('/tecnico/:idUsuario', ctrl.getByTecnico);
router.get('/:id', ctrl.getById);
router.get('/', ctrl.getAll);

router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
