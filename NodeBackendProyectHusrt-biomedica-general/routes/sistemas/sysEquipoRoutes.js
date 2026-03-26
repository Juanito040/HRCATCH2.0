const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysEquipoController');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const { Op } = require('sequelize');

// GET /sysequipo/tiposequipo → tipos de equipo que tienen equipos de sistemas
router.get('/tiposequipo', async (req, res) => {
  try {
    const equipos = await SysEquipo.findAll({
      attributes: ['id_tipo_equipo_fk'],
      where: { id_tipo_equipo_fk: { [Op.ne]: null } },
      include: [{ model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres', 'nombre'] }],
      group: ['id_tipo_equipo_fk', 'tipoEquipo.id']
    });
    const tipos = equipos
      .map(e => e.tipoEquipo)
      .filter(Boolean)
      .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de equipo', detalle: error.message });
  }
});

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
