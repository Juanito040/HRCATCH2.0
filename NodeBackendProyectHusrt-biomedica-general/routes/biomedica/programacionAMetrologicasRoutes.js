const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const planactividadmetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
const Equipo = require('../../models/Biomedica/Equipo');
const Usuario = require('../../models/generales/Usuario');
const ActividadMetrologica = require('../../models/Biomedica/ActividadMetrologica');
const PlanActividadMetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
const ProgramacionMetrologiaMes = require('../../models/Biomedica/ProgramacionMetrologiaMes');



router.get('/programacion-metrologia-meses', async (req, res) => {
    try {
        const meses = await ProgramacionMetrologiaMes.findAll();
        res.json(meses);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los meses programados', detalle: error.message });
    }
});

//programar Actividades Metrológicas
router.post('/programacionmetrologiames', async (req, res) => {
    const actividadesMetrologicas = [];
    try {
        const { mes, anio } = req.body;

        if (!mes || !anio) {
            return res.status(400).json({ error: 'Debe proporcionar mes y año en el cuerpo de la solicitud' });
        }
        const validarActividades = await ProgramacionMetrologiaMes.findAll({
            where: {
                mes: mes,
                anio: anio,
            }
        });
        if (validarActividades.length > 0) {
            return res.status(400).json({ error: 'Ya se realizo la programacion de actividades metrologicas para el mes seleccionado' });
        }
        const planAMetrologicas = await PlanActividadMetrologica.findAll({
            where: {
                mes: mes,
                ano: anio
            },
            include: ['equipo'],
        });
        for (const plan of planAMetrologicas) {
            const nuevaActividadMetrologica = {
                añoProgramado: plan.ano,
                mesProgramado: plan.mes,
                tipoActividad: plan.tipoActividad,
                equipoIdFk: plan.equipo.id,
                realizado: false,
            };
            const actividad = await ActividadMetrologica.create(nuevaActividadMetrologica);
            actividadesMetrologicas.push(actividad);
        };


        await ProgramacionMetrologiaMes.create({
            mes: mes,
            anio: anio
        });

        res.json(actividadesMetrologicas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el plan de actividades metrologicas en la fecha seleccionada', detalle: error.message });
    }
});


module.exports = router;