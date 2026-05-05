const express = require('express');
const router = express.Router();
const TipoDocumento = require('../../models/generales/TipoDocumento');

// Obtener todos los tipos de documentos
router.get('/tiposdocumento', async (req, res) => {
    try {
        const tiposDocumento = await TipoDocumento.findAll();
        res.json(tiposDocumento);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de documento', detalle: error.message });
    }
});

// Obtener un tipo de documento por ID
router.get('/tiposdocumento/:id', async (req, res) => {
    try {
        const tipoDocumento = await TipoDocumento.findByPk(req.params.id);
        if (!tipoDocumento) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado' });
        }
        res.json(tipoDocumento);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el tipo de documento', detalle: error.message });
    }
});

// Crear un nuevo tipo de documento
router.post('/addtiposdocumento', async (req, res) => {
    try {
        const nuevoTipoDocumento = await TipoDocumento.create(req.body);
        res.status(201).json(nuevoTipoDocumento);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el tipo de documento', detalle: error.message });
    }
});

// Actualizar un tipo de documento
router.put('/tiposdocumento/:id', async (req, res) => {
    try {
        const tipoDocumento = await TipoDocumento.findByPk(req.params.id);
        if (!tipoDocumento) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado' });
        }

        await tipoDocumento.update(req.body);
        res.json(tipoDocumento);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el tipo de documento', detalle: error.message });
    }
});

// Eliminar un tipo de documento
router.delete('/tiposdocumento/:id', async (req, res) => {
    try {
        const tipoDocumento = await TipoDocumento.findByPk(req.params.id);
        if (!tipoDocumento) {
            return res.status(404).json({ error: 'Tipo de documento no encontrado' });
        }

        await tipoDocumento.destroy();
        res.json({ mensaje: 'Tipo de documento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el tipo de documento', detalle: error.message });
    }
});

module.exports = router;
