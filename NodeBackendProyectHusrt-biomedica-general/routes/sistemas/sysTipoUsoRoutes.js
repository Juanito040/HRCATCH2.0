const express = require('express');
const router = express.Router();
const SysTipoUso = require('../../models/Sistemas/SysTipoUso');

// GET todos
router.get('/', async (req, res) => {
    try {
        const tipos = await SysTipoUso.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
        res.json({ success: true, data: tipos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tipos de uso', error: error.message });
    }
});

// POST crear
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
        const tipo = await SysTipoUso.create({ nombre });
        res.status(201).json({ success: true, data: tipo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear tipo de uso', error: error.message });
    }
});

// PUT actualizar
router.put('/:id', async (req, res) => {
    try {
        const tipo = await SysTipoUso.findByPk(req.params.id);
        if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de uso no encontrado' });
        await tipo.update(req.body);
        res.json({ success: true, data: tipo });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar tipo de uso', error: error.message });
    }
});

// DELETE (baja lógica)
router.delete('/:id', async (req, res) => {
    try {
        const tipo = await SysTipoUso.findByPk(req.params.id);
        if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de uso no encontrado' });
        await tipo.update({ activo: false });
        res.json({ success: true, message: 'Tipo de uso eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar tipo de uso', error: error.message });
    }
});

module.exports = router;
