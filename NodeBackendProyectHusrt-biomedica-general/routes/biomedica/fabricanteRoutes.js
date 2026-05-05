const express = require('express');
const router = express.Router();
const Fabricante = require('../../models/Biomedica/Fabricante');

// Obtener todos los fabricantes
router.get('/fabricantes/', async (req, res) => {
    try {
        const fabricantes = await Fabricante.findAll();
        res.json(fabricantes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los fabricantes', detalle: error.message });
    }
});

// Obtener un fabricante por ID
router.get('/fabricante/:id', async (req, res) => {
    try {
        const fabricante = await Fabricante.findByPk(req.params.id);
        if (!fabricante) {
            return res.status(404).json({ error: 'Fabricante no encontrado' });
        }
        res.json(fabricante);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el fabricante', detalle: error.message });
    }
});

// Crear un nuevo fabricante
router.post('/fabricante/', async (req, res) => {
    try {
        const nuevoFabricante = await Fabricante.create(req.body);
        res.status(201).json(nuevoFabricante);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el fabricante', detalle: error.message });
    }
});

// Actualizar un fabricante por ID
router.put('/fabricante/:id', async (req, res) => {
    try {
        const fabricante = await Fabricante.findByPk(req.params.id);
        if (!fabricante) {
            return res.status(404).json({ error: 'Fabricante no encontrado' });
        }

        await fabricante.update(req.body);
        res.json(fabricante);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el fabricante', detalle: error.message });
    }
});

// Eliminar un fabricante por ID
router.delete('/fabricante/:id', async (req, res) => {
    try {
        const fabricante = await Fabricante.findByPk(req.params.id);
        if (!fabricante) {
            return res.status(404).json({ error: 'Fabricante no encontrado' });
        }

        await fabricante.destroy();
        res.json({ mensaje: 'Fabricante eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el fabricante', detalle: error.message });
    }
});

module.exports = router;
