const express = require('express');
const router = express.Router();
const SysProtocoloPreventivo = require('../../models/Sistemas/SysProtocoloPreventivo');
const TipoEquipo = require('../../models/generales/TipoEquipo');

// GET /sysprotocolo → todos los protocolos
router.get('/', async (req, res) => {
  try {
    const protocolos = await SysProtocoloPreventivo.findAll({
      include: [{ model: TipoEquipo, as: 'tipoEquipo' }],
      order: [['id_sysprotocolo', 'ASC']]
    });
    res.json(protocolos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
  }
});

// GET /sysprotocolo/tipoequipo/:idtipo → protocolos por tipo de equipo
router.get('/tipoequipo/:idtipo', async (req, res) => {
  try {
    const protocolos = await SysProtocoloPreventivo.findAll({
      where: { id_tipo_equipo_fk: req.params.idtipo },
      order: [['id_sysprotocolo', 'ASC']]
    });
    res.json(protocolos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
  }
});

// GET /sysprotocolo/activo/tipoequipo/:idtipo → protocolos activos por tipo de equipo
router.get('/activo/tipoequipo/:idtipo', async (req, res) => {
  try {
    const protocolos = await SysProtocoloPreventivo.findAll({
      where: { id_tipo_equipo_fk: req.params.idtipo, estado: true },
      order: [['id_sysprotocolo', 'ASC']]
    });
    res.json(protocolos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
  }
});

// GET /sysprotocolo/:id → un protocolo por ID
router.get('/:id', async (req, res) => {
  try {
    const protocolo = await SysProtocoloPreventivo.findByPk(req.params.id, {
      include: [{ model: TipoEquipo, as: 'tipoEquipo' }]
    });
    if (!protocolo) return res.status(404).json({ error: 'Protocolo no encontrado' });
    res.json(protocolo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el protocolo', detalle: error.message });
  }
});

// POST /sysprotocolo → crear protocolo
router.post('/', async (req, res) => {
  try {
    const protocolo = await SysProtocoloPreventivo.create(req.body);
    res.status(201).json(protocolo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el protocolo', detalle: error.message });
  }
});

// PUT /sysprotocolo/:id → actualizar protocolo
router.put('/:id', async (req, res) => {
  try {
    const protocolo = await SysProtocoloPreventivo.findByPk(req.params.id);
    if (!protocolo) return res.status(404).json({ error: 'Protocolo no encontrado' });
    await protocolo.update(req.body);
    res.json(protocolo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el protocolo', detalle: error.message });
  }
});

// DELETE /sysprotocolo/:id → eliminar protocolo
router.delete('/:id', async (req, res) => {
  try {
    const protocolo = await SysProtocoloPreventivo.findByPk(req.params.id);
    if (!protocolo) return res.status(404).json({ error: 'Protocolo no encontrado' });
    await protocolo.destroy();
    res.json({ mensaje: 'Protocolo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el protocolo', detalle: error.message });
  }
});

module.exports = router;
