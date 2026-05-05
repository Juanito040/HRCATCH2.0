const express = require('express');
const router = express.Router();

const ProtocoloPreventivo = require('../../models/Biomedica/ProtocoloPreventivo');
const TipoEquipo = require('../../models/generales/TipoEquipo');

// Obtener todos los protocolos
router.get('/protocolos', async (req, res) => {
    try {
        const protocolos = await ProtocoloPreventivo.findAll({
            include: [{ model: TipoEquipo, as: 'tipoEquipos' }],
            order: [['id', 'ASC']]
        });
        res.json(protocolos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
    }
});

// Obtener protocolos por tipo de equipo
router.get('/protocolos/tipoequipo/:idtipo', async (req, res) => {
    try {
        const protocolos = await ProtocoloPreventivo.findAll({
            where: { tipoEquipoIdFk: req.params.idtipo },
            order: [['id', 'ASC']]
        });
        res.json(protocolos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
    }
});

// Obtener protocolos por tipo de equipo activos
router.get('/protocolosactivo/tipoequipo/:idtipo', async (req, res) => {
    try {
        const protocolos = await ProtocoloPreventivo.findAll({
            where: { tipoEquipoIdFk: req.params.idtipo, estado: true },
            order: [['id', 'ASC']]
        });
        res.json(protocolos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los protocolos', detalle: error.message });
    }
});

// Obtener un protocolo por ID
router.get('/protocolo/:id', async (req, res) => {
    try {
        const protocolo = await ProtocoloPreventivo.findByPk(req.params.id, {
            include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        });

        if (!protocolo) {
            return res.status(404).json({ error: 'Protocolo no encontrado' });
        }

        res.json(protocolo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el protocolo', detalle: error.message });
    }
});

// Crear un nuevo protocolo
router.post('/addprotocolo', async (req, res) => {
    try {
        const protocolo = await ProtocoloPreventivo.create(req.body);
        res.status(201).json(protocolo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el protocolo', detalle: error.message });
    }
});

// Actualizar protocolo
router.put('/actprotocolo/:id', async (req, res) => {
    try {
        const protocolo = await ProtocoloPreventivo.findByPk(req.params.id);
        if (!protocolo) {
            return res.status(404).json({ error: 'Protocolo no encontrado' });
        }

        await protocolo.update(req.body);
        res.json(protocolo);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el protocolo', detalle: error.message });
    }
});

// Eliminar protocolo
router.delete('/remprotocolo/:id', async (req, res) => {
    try {
        const protocolo = await ProtocoloPreventivo.findByPk(req.params.id);
        if (!protocolo) {
            return res.status(404).json({ error: 'Protocolo no encontrado' });
        }

        await protocolo.destroy();
        res.json({ mensaje: 'Protocolo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el protocolo', detalle: error.message });
    }
});

module.exports = router;
