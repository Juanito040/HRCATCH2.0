const express = require('express');
const router = express.Router();
const DatosTecnicos = require('../../models/Biomedica/DatosTecnicos');

// Obtener todos los datos técnicos
router.get('/datostecnicos/', async (req, res) => {
    try {
        const datos = await DatosTecnicos.findAll();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos técnicos', detalle: error.message });
    }
});

// Obtener un dato técnico por ID
router.get('/datostecnicos/:id', async (req, res) => {
    try {
        const dato = await DatosTecnicos.findByPk(req.params.id);
        if (!dato) {
            return res.status(404).json({ error: 'Dato técnico no encontrado' });
        }
        res.json(dato);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el dato técnico', detalle: error.message });
    }
});

// Crear un nuevo dato técnico
router.post('/datostecnicos/', async (req, res) => {
    try {
        const nuevoDato = await DatosTecnicos.create(req.body);
        res.status(201).json(nuevoDato);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el dato técnico', detalle: error.message });
    }
});

// Actualizar un dato técnico por ID
router.put('/datostecnicos/:id', async (req, res) => {
    try {
        const dato = await DatosTecnicos.findByPk(req.params.id);
        if (!dato) {
            return res.status(404).json({ error: 'Dato técnico no encontrado' });
        }

        await dato.update(req.body);
        res.json(dato);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el dato técnico', detalle: error.message });
    }
});

// Eliminar un dato técnico por ID
router.delete('/datostecnicos/:id', async (req, res) => {
    try {
        const dato = await DatosTecnicos.findByPk(req.params.id);
        if (!dato) {
            return res.status(404).json({ error: 'Dato técnico no encontrado' });
        }
        await dato.destroy();
        res.json({ mensaje: 'Dato técnico eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el dato técnico', detalle: error.message });
    }
});

module.exports = router;
