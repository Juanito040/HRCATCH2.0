const express = require('express');
const router = express.Router();
const Proveedor = require('../../models/Biomedica/Proveedor');

// Obtener todos los proveedores
router.get('/proveedores', async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores', detalle: error.message });
    }
});

// Obtener un proveedor por ID
router.get('/proveedor/:id', async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor', detalle: error.message });
    }
});

// Crear un nuevo proveedor
router.post('/proveedor/', async (req, res) => {
    try {
        const nuevoProveedor = await Proveedor.create(req.body);
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el proveedor', detalle: error.message });
    }
});

// Actualizar un proveedor por ID
router.put('/proveedor/:id', async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        await proveedor.update(req.body);
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el proveedor', detalle: error.message });
    }
});

// Eliminar un proveedor por ID
router.delete('/proveedor/:id', async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        await proveedor.destroy();
        res.json({ mensaje: 'Proveedor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proveedor', detalle: error.message });
    }
});

module.exports = router;
