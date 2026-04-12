const express = require('express');
const router = express.Router();

const sysCumplimientoProtocoloPreventivo = require('../../models/Sistemas/SysCumplimientoProtocoloPreventivo');
const SysProtocoloPreventivo = require('../../models/Sistemas/SysProtocoloPreventivo');
const Reporte = require('../../models/Sistemas/SysReporte');

router.get('/cumplimientos', async (req, res) => {
    try {
        const cumplimientos = await sysCumplimientoProtocoloPreventivo.findAll({
            include: [
                { model: SysProtocoloPreventivo, as: 'protocolo' },
                { model: Reporte, as: 'reporte' }
            ],
            order: [['id', 'ASC']]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos', detalle: error.message });
    }
});

// Obtener cumplimientos por ID de mantenimiento
router.get('/cumplimientos/mantenimiento/:id', async (req, res) => {
    try {
        const cumplimientos = await sysCumplimientoProtocoloPreventivo.findAll({
            where: { sysReporteIdFk: req.params.id },
            include: [{ model: SysProtocoloPreventivo, as: 'protocolo' }]
        });
        res.json(cumplimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cumplimientos del reporte', detalle: error.message });
    }
});

// Obtener un cumplimiento por ID
router.get('/cumplimiento/:id', async (req, res) => {
    try {
        const cumplimiento = await sysCumplimientoProtocoloPreventivo.findByPk(req.params.id, {
            include: [
                { model: SysProtocoloPreventivo, as: 'protocolo' },
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
        const { sysProtocoloPreventivoIdFk, sysReporteIdFk, cumple, paso, observaciones } = req.body;

        // Buscar si ya existe un cumplimiento para este protocolo y reporte
        const cumplimientoExistente = await sysCumplimientoProtocoloPreventivo.findOne({
            where: {
                sysProtocoloPreventivoIdFk: sysProtocoloPreventivoIdFk,
                sysReporteIdFk: sysReporteIdFk
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
