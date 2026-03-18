const express = require('express');
const router = express.Router();
const Servicio = require('../../models/generales/Servicio');
const Equipo = require('../../models/Biomedica/Equipo');
const Sede = require('../../models/generales/Sede');

// Obtener todos los servicios
router.get('/servicios', async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            include: { model: Sede, as: 'sede' },
            order: [['nombres', 'ASC']]
        });
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los servicios', detalle: error.message });
    }
});

router.get('/serviciosactivos', async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            where: { activo: true },
            include: { model: Sede, as: 'sede' },
            order: [['nombres', 'ASC']]
        });
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los servicios', detalle: error.message });
    }
});

// Obtener servicios por sede
router.get('/servicios/sede/:idsede', async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            where: { sedeIdFk: req.params.idsede, activo: true },
            include: { model: Sede, as: 'sede' },
            order: [['nombres', 'ASC']]
        });
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los servicios por sede', detalle: error.message });
    }
});

router.get('/cantidadequiposserv/:id', async (req, res) => {
    try {
        const cantidadEquipos = await Equipo.count({ where: { servicioIdFk: req.params.id, estadoBaja: false } });
        res.json(cantidadEquipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores', detalle: error.message });
    }
});

// Obtener un servicio por ID
router.get('/servicios/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        res.json(servicio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el servicio', detalle: error.message });
    }
});

router.put('/servicios/activar/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        await servicio.update({ activo: true });
        res.json({ estado: 'Se activo el servicio' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el servicio', detalle: error.message });
    }
});

router.put('/servicios/desactivar/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        const cantidadEquipos = await Equipo.count({ where: { servicioIdFk: req.params.id, estadoBaja: false } });
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        if (cantidadEquipos > 0) {
            return res.status(404).json({ error: 'El servicio tiene equipos activos relacionados' });
        }
        await servicio.update({ activo: false });
        res.json({ estado: 'Se inactivo el servicio' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el servicio', detalle: error.message });
    }
});



router.post('/addservicio', async (req, res) => {
    try {
        const servicio = await Servicio.create(req.body);
        res.status(201).json(servicio);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el servicio', detalle: error.message });
    }
});

// Actualizar un servicio
router.put('/servicios/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        await servicio.update(req.body);
        res.json(servicio);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el servicio', detalle: error.message });
    }
});


module.exports = router;
