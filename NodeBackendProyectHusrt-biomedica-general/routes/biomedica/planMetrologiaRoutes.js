const express = require('express');
const router = express.Router();
const PlanActividadMetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
const Equipo = require('../../models/Biomedica/Equipo');
const Servicio = require('../../models/generales/Servicio');

// Obtener todos los planes de actividad metrológica
router.get('/planactividadmetrologica', async (req, res) => {
    try {
        const planes = await PlanActividadMetrologica.findAll({
            include: [{ model: Equipo, as: 'equipo' }]
        });
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los planes de actividad metrológica', detalle: error.message });
    }
});

// Obtener un plan por ID
router.get('/planactividadmetrologica/:id', async (req, res) => {
    try {
        const plan = await PlanActividadMetrologica.findByPk(req.params.id, {
            include: [{ model: Equipo, as: 'equipo' }]
        });
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el plan', detalle: error.message });
    }
});

// Obtener planes por equipo
router.get('/planmetrologiaequipo/:equipoId', async (req, res) => {
    try {
        const planes = await PlanActividadMetrologica.findAll({
            where: { equipoIdFk: req.params.equipoId }
        });
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los planes por equipo', detalle: error.message });
    }
});

// Obtener planes por mes y año
router.post('/planactividadmetrologicames', async (req, res) => {
    try {
        const { mes, ano } = req.body;
        if (!mes || !ano) {
            return res.status(400).json({ error: 'Mes y año son requeridos' });
        }

        const planes = await PlanActividadMetrologica.findAll({
            where: {
                mes: parseInt(mes),
                ano: parseInt(ano)
            },
            include: [{ model: Equipo, as: 'equipo', include: { model: Servicio, as: 'servicios' } }]
        });

        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los planes por mes y año', detalle: error.message });
    }
});

// Crear un nuevo plan
router.post('/planactividadmetrologica', async (req, res) => {
    try {
        const nuevoPlan = await PlanActividadMetrologica.create(req.body);
        res.status(201).json(nuevoPlan);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el plan', detalle: error.message });
    }
});

// Actualizar un plan por ID
router.put('/planactividadmetrologica/:id', async (req, res) => {
    try {
        const plan = await PlanActividadMetrologica.findByPk(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        const changes = { ...req.body };
        const oldData = plan.toJSON();

        await plan.update(req.body);

        // Registrar trazabilidad
        if (req.user && req.user.id) {
            const DetallesCambios = {};
            for (const key in changes) {
                if (changes[key] !== oldData[key] && key !== 'updatedAt') {
                    DetallesCambios[key] = { anterior: oldData[key], nuevo: changes[key] };
                }
            }

            if (Object.keys(DetallesCambios).length > 0) {
                const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
                await Trazabilidad.create({
                    accion: 'ACTUALIZACIÓN PLAN METROLOGÍA',
                    detalles: JSON.stringify(DetallesCambios),
                    equipoIdFk: plan.equipoIdFk,
                    usuarioIdFk: req.user.id
                });
            }
        }

        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el plan', detalle: error.message });
    }
});

// Eliminar un plan por ID
router.delete('/planactividadmetrologica/:id', async (req, res) => {
    try {
        const plan = await PlanActividadMetrologica.findByPk(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        await plan.destroy();
        res.json({ mensaje: 'Plan eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el plan', detalle: error.message });
    }
});

// Plan de Actividades Metrologicas completo de un tipo de equipo
router.get('/planametrologicastipoequipo/:idtipoequipo', async (req, res) => {
    try {
        const tipoEquipoId = req.params.idtipoequipo;

        if (!tipoEquipoId) {
            return res.status(400).json({ error: 'El parámetro tipoEquipoId es requerido' });
        }
        const planes = await PlanActividadMetrologica.findAll({
            include: {
                model: Equipo,
                as: 'equipo',
                required: true,
                where: { tipoEquipoIdFk: tipoEquipoId },
                include: { model: Servicio, as: 'servicios' }
            }
        });
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener los planes de actividades metrológicas',
            detalle: error.message
        });
    }
});

// Plan de Actividades metrologicas completo de un servicio
router.get('/planametrologicasservicio/:idservicio', async (req, res) => {
    try {
        const servicioId = req.params.idservicio;
        if (!servicioId) {
            return res.status(400).json({ error: 'El parámetro ServicioId es requerido' });
        }
        const planes = await PlanActividadMetrologica.findAll({
            include: {
                model: Equipo,
                as: 'equipo',
                required: true,
                where: { servicioIdFk: servicioId },
                include: { model: Servicio, as: 'servicios' }
            }
        });
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener los planes de actividades metrológicas',
            detalle: error.message
        });
    }
});

module.exports = router;
