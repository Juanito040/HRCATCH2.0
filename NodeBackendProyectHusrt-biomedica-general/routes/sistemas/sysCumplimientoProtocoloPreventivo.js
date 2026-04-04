const express = require('express');
const router = express.Router();

const sysCumplimientoProtocoloPreventivo = require('../../models/Sistemas/sysCumplimientoProtocoloPreventivo');
const ProtocoloPreventivo = require('../../models/Biomedica/ProtocoloPreventivo');
const Mantenimiento = require('../../models/Sistemas/SysMantenimiento');

router.get('/cumplimientos', async (req, res) => {
    try {
        const cumplimientos = await sysCumplimientoProtocoloPreventivo.findAll({
            include: [
                { model: ProtocoloPreventivo, as: 'protocolo' },
                { model: Mantenimiento, as: 'mantenimiento' }
            ],
            order: [['id', 'ASC']]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos', detalle: error.message });
    }
});

// Obtener cumplimientos por ID de reporte
router.get('/cumplimientos/mantenimiento/:id', async (req, res) => {
    try {
        const cumplimientos = await sysCumplimientoProtocoloPreventivo.findAll({
            where: { mantenimientoIdFk: req.params.id },
            include: [{ model: ProtocoloPreventivo, as: 'protocolo' }]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos del mantenimiento', detalle: error.message });
    }
});

// Obtener un cumplimiento por ID
router.get('/cumplimiento/:id', async (req, res) => {
    try {
        const cumplimiento = await sysCumplimientoProtocoloPreventivo.findByPk(req.params.id, {
            include: [
                { model: ProtocoloPreventivo, as: 'protocolo' },
                { model: Mantenimiento, as: 'mantenimiento' }
            ]
        });

        if (!cumplimiento) {
            return res.status(404).json({ error: 'Cumplimiento no encontrado' });
        }

        res.json(cumplimiento);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el cumplimiento', detalle: error.message });
    }
});

// Crear nuevo cumplimiento
router.post('/addcumplimiento', async (req, res) => {
    try {
        const { protocoloPreventivoIdFk, mantenimientoIdFk, cumple, paso, observaciones } = req.body;

        // Buscar si ya existe un cumplimiento para este protocolo y mantenimiento
        const cumplimientoExistente = await sysCumplimientoProtocoloPreventivo.findOne({
            where: {
                protocoloPreventivoIdFk: protocoloPreventivoIdFk,
                mantenimientoIdFk: mantenimientoIdFk
            }
        });

        if (cumplimientoExistente) {
            // Si existe, actualizarlo
            await cumplimientoExistente.update({
                cumple: cumple,
                paso: paso,
                observaciones: observaciones
            });
            return res.status(200).json(cumplimientoExistente);
        } else {
            // Si no existe, crearlo
            const nuevoCumplimiento = await sysCumplimientoProtocoloPreventivo.create(req.body);
            return res.status(201).json(nuevoCumplimiento);
        }

    } catch (error) {
        console.error('Error en addcumplimiento:', error);
        res.status(500).json({ error: 'Error al procesar el cumplimiento', detalle: error.message });
    }
});

// Actualizar cumplimiento
router.put('/actcumplimiento/:id', async (req, res) => {
    try {
        const cumplimiento = await sysCumplimientoProtocoloPreventivo.findByPk(req.params.id);
        if (!cumplimiento) {
            return res.status(404).json({ error: 'Cumplimiento no encontrado' });
        }

        await cumplimiento.update(req.body);
        res.json(cumplimiento);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el cumplimiento', detalle: error.message });
    }
});

// Eliminar cumplimiento
router.delete('/remcumplimiento/:id', async (req, res) => {
    try {
        const cumplimiento = await sysCumplimientoProtocoloPreventivo.findByPk(req.params.id);
        if (!cumplimiento) {
            return res.status(404).json({ error: 'Cumplimiento no encontrado' });
        }

        await cumplimiento.destroy();
        res.json({ mensaje: 'Cumplimiento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el cumplimiento', detalle: error.message });
    }
});

module.exports = router;
