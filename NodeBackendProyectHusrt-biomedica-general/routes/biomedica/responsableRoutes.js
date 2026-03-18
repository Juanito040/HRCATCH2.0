const express = require('express');
const router = express.Router();
const Responsable = require('../../models/Biomedica/Responsable');
const Equipo = require('../../models/Biomedica/Equipo');

// Obtener todos los responsables
router.get('/responsables', async (req, res) => {
    try {
        const responsables = await Responsable.findAll();
        res.json(responsables);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los responsables', detalle: error.message });
    }
});

// 
router.get('/cantidadequiposprov/:id', async (req, res) => {
    try {
        const cantidadEquipos = await Equipo.count({where:{ responsableIdFk: req.params.id, estadoBaja: false }});
        res.json(cantidadEquipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores', detalle: error.message });
    }
});

// Obtener todos los responsables de comodatos 
router.get('/responsablescomodatos', async (req, res) => {
    try {
        const responsables = await Responsable.findAll({where:{calificacion: 150}});
        res.json(responsables);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los responsables', detalle: error.message });
    }
});

router.get('/responsablestodos', async (req, res) => {
    try {
        const responsables = await Responsable.findAll();
        res.json(responsables);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los responsables', detalle: error.message });
    }
});

// Obtener un responsable por ID
router.get('/responsable/:id', async (req, res) => {
    try {
        const responsable = await Responsable.findByPk(req.params.id);
        if (!responsable) {
            return res.status(404).json({ error: 'Responsable no encontrado' });
        }
        res.json(responsable);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el responsable', detalle: error.message });
    }
});

// Crear un nuevo responsable
router.post('/addresponsable', async (req, res) => {
    try {
        const nuevoResponsable = await Responsable.create(req.body);
        res.status(201).json(nuevoResponsable);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el responsable', detalle: error.message });
    }
});

// Actualizar un responsable por ID
router.put('/responsable/:id', async (req, res) => {
    try {
        const responsable = await Responsable.findByPk(req.params.id);
        if (!responsable) {
            return res.status(404).json({ error: 'Responsable no encontrado' });
        }

        await responsable.update(req.body);
        res.json(responsable);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el responsable', detalle: error.message });
    }
});

// Eliminar un responsable por ID
router.delete('/responsable/:id', async (req, res) => {
    try {
        const responsable = await Responsable.findByPk(req.params.id);
        if (!responsable) {
            return res.status(404).json({ error: 'Responsable no encontrado' });
        }

        await responsable.destroy();
        res.json({ mensaje: 'Responsable eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el responsable', detalle: error.message });
    }
});

module.exports = router;