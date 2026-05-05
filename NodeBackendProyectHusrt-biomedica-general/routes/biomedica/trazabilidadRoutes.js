const express = require('express');
const router = express.Router();
const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
const Usuario = require('../../models/generales/Usuario');

// Crear registro de trazabilidad
router.post('/trazabilidad', async (req, res) => {
    try {
        const { accion, detalles, equipoIdFk, usuarioIdFk } = req.body;
        const log = await Trazabilidad.create({
            accion,
            detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
            equipoIdFk,
            usuarioIdFk
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar trazabilidad', detalle: error.message });
    }
});

// Obtener historial de un equipo
router.get('/trazabilidad/equipo/:id', async (req, res) => {
    try {
        const logs = await Trazabilidad.findAll({
            where: { equipoIdFk: req.params.id },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['id', 'nombres', 'apellidos', 'email']
                }
            ],
            order: [['fecha', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial', detalle: error.message });
    }
});

module.exports = router;
