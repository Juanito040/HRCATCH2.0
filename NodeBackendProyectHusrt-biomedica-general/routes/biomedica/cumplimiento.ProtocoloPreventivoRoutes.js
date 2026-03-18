const express = require('express');
const router = express.Router();

const CumplimientoProtocoloPreventivo = require('../../models/Biomedica/CumplimientoProtocoloPreventivo');
const ProtocoloPreventivo = require('../../models/Biomedica/ProtocoloPreventivo');
const Reporte = require('../../models/Biomedica/Reporte');

// Obtener todos los cumplimientos
router.get('/cumplimientos', async (req, res) => {
    try {
        const cumplimientos = await CumplimientoProtocoloPreventivo.findAll({
            include: [
                { model: ProtocoloPreventivo, as: 'protocolo' },
                { model: Reporte, as: 'reporte' }
            ],
            order: [['id', 'ASC']]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos', detalle: error.message });
    }
});

// Obtener cumplimientos por ID de reporte
router.get('/cumplimientos/reporte/:id', async (req, res) => {
    try {
        const cumplimientos = await CumplimientoProtocoloPreventivo.findAll({
            where: { reporteIdFk: req.params.id },
            include: [{ model: ProtocoloPreventivo, as: 'protocolo' }]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos del reporte', detalle: error.message });
    }
});

// Obtener un cumplimiento por ID
router.get('/cumplimiento/:id', async (req, res) => {
    try {
        const cumplimiento = await CumplimientoProtocoloPreventivo.findByPk(req.params.id, {
            include: [
                { model: ProtocoloPreventivo, as: 'protocolo' },
                { model: Reporte, as: 'reporte' }
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
        const { protocoloPreventivoIdFk, reporteIdFk, cumple, paso, observaciones } = req.body;

        // Buscar si ya existe un cumplimiento para este protocolo y reporte
        const cumplimientoExistente = await CumplimientoProtocoloPreventivo.findOne({
            where: {
                protocoloPreventivoIdFk: protocoloPreventivoIdFk,
                reporteIdFk: reporteIdFk
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
            const nuevoCumplimiento = await CumplimientoProtocoloPreventivo.create(req.body);
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
        const cumplimiento = await CumplimientoProtocoloPreventivo.findByPk(req.params.id);
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
        const cumplimiento = await CumplimientoProtocoloPreventivo.findByPk(req.params.id);
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
