const express = require('express');
const router = express.Router();
const { SistemaInformacion, Responsable, Usuario } = require('../../models/Biomedica');

// Obtener todos los sistemas de información
router.get('/sistemasinformacion', async (req, res) => {
    try {
        const sistemas = await SistemaInformacion.findAll({
            include: [
                { model: Usuario, as: 'responsableObj', attributes: ['id', 'nombres', 'apellidos'] },
                { model: Responsable, as: 'proveedorObj' },
            ],
        });
        res.json(sistemas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los sistemas de información', detalle: error.message });
    }
});

// Obtener un sistema de información por ID
router.get('/sistemainformacion/:id', async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id, {
            include: [
                { model: Usuario, as: 'responsableObj', attributes: ['id', 'nombres', 'apellidos'] },
                { model: Responsable, as: 'proveedorObj' },
            ],
        });
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }
        res.json(sistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el sistema de información', detalle: error.message });
    }
});

// Crear un nuevo sistema de información
router.post('/sistemainformacion/', async (req, res) => {
    try {
        const nuevoSistema = await SistemaInformacion.create(req.body);
        res.status(201).json(nuevoSistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el sistema de información', detalle: error.message });
    }
});

// Actualizar un sistema de información por ID
router.put('/sistemainformacion/:id', async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id);
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }

        await sistema.update(req.body);
        res.json(sistema);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el sistema de información', detalle: error.message });
    }
});

// Eliminar un sistema de información por ID
router.delete('/sistemainformacion/:id', async (req, res) => {
    try {
        const sistema = await SistemaInformacion.findByPk(req.params.id);
        if (!sistema) {
            return res.status(404).json({ error: 'Sistema de información no encontrado' });
        }

        await sistema.destroy();
        res.json({ mensaje: 'Sistema de información eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el sistema de información', detalle: error.message });
    }
});

module.exports = router;
