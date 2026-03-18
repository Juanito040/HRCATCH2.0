const express = require('express');
const router = express.Router();
const Sede = require('../../models/generales/Sede');

const Servicio = require('../../models/generales/Servicio');

// Obtener todas las sedes
router.get('/sedes', async (req, res) => {
    try {
        const sedes = await Sede.findAll({
            include: [{ model: Servicio, as: 'servicios' }]
        });
        res.json(sedes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las sedes', detalle: error.message });
    }
});

// Obtener una sede por ID
router.get('/sedes/:id', async (req, res) => {
    try {
        const sede = await Sede.findByPk(req.params.id, {
            include: [{ model: Servicio, as: 'servicios' }]
        });
        if (!sede) {
            return res.status(404).json({ error: 'Sede no encontrada' });
        }
        res.json(sede);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la sede', detalle: error.message });
    }
});

// Crear una nueva sede
router.post('/addsede', async (req, res) => {
    try {
        const nuevaSede = await Sede.create(req.body);
        res.status(201).json(nuevaSede);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la sede', detalle: error.message });
    }
});

// Actualizar una sede por ID
router.put('/sedes/:id', async (req, res) => {
    try {
        const sede = await Sede.findByPk(req.params.id);
        if (!sede) {
            return res.status(404).json({ error: 'Sede no encontrada' });
        }

        await sede.update(req.body);
        res.json(sede);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la sede', detalle: error.message });
    }
});

// Eliminar una sede por ID
router.delete('/sedes/:id', async (req, res) => {
    try {
        const sede = await Sede.findByPk(req.params.id);
        if (!sede) {
            return res.status(404).json({ error: 'Sede no encontrada' });
        }

        await sede.destroy();
        res.json({ mensaje: 'Sede eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la sede', detalle: error.message });
    }
});

module.exports = router;
