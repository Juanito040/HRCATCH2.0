const express = require('express');
const router = express.Router();
const CondicionInicial = require('../../models/Biomedica/CondicionInicial');

// Get all (active and inactive? usually admin sees all, report sees active)
// Let's make an endpoint for admin (all) and one for usage (active) or filter by query.

router.get('/condicionesiniciales', async (req, res) => {
    try {
        const condiciones = await CondicionInicial.findAll();
        res.json(condiciones);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching initial conditions', detalle: error.message });
    }
});

router.get('/condicionesiniciales/activas', async (req, res) => {
    try {
        const condiciones = await CondicionInicial.findAll({ where: { activo: true } });
        res.json(condiciones);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching active initial conditions', detalle: error.message });
    }
});

router.post('/condicionesiniciales', async (req, res) => {
    try {
        const nueva = await CondicionInicial.create(req.body);
        res.json(nueva);
    } catch (error) {
        res.status(500).json({ error: 'Error creating initial condition', detalle: error.message });
    }
});

router.put('/condicionesiniciales/:id', async (req, res) => {
    try {
        const condicion = await CondicionInicial.findByPk(req.params.id);
        if (!condicion) return res.status(404).json({ error: 'Condition not found' });

        await condicion.update(req.body);
        res.json(condicion);
    } catch (error) {
        res.status(500).json({ error: 'Error updating initial condition', detalle: error.message });
    }
});

router.delete('/condicionesiniciales/:id', async (req, res) => {
    try {
        const condicion = await CondicionInicial.findByPk(req.params.id);
        if (!condicion) return res.status(404).json({ error: 'Condition not found' });

        await condicion.destroy();
        res.json({ message: 'Condition deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting initial condition', detalle: error.message });
    }
});

module.exports = router;
