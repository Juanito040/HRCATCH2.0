const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const SysReporte = require('../../models/Sistemas/SysReporte');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysProgramacionPreventivoMes = require('../../models/Sistemas/Sysprogramacionpreventivomes');
const SysPlanMantenimiento = require('../../models/Sistemas/SysPlanMantenimiento');

/**
 * POST /sysprogramacion/programacion-preventivos
 * Llamado por el módulo de calendario.
 * Recibe { mes, anio } y genera un SysReporte preventivo
 * por cada equipo sys activo con preventivo_s = true.
 */
router.post('/programacion-preventivos', async (req, res) => {
    const reportes = [];
    try {
        const { mes, anio } = req.body;

        if (!mes || !anio) {
            return res.status(400).json({
                success: false,
                error: 'Debe proporcionar mes y anio en el cuerpo de la solicitud'
            });
        }

        const yaExiste = await SysProgramacionPreventivoMes.findOne({
            where: { mes, anio }
        });
        if (yaExiste) {
            return res.status(400).json({
                success: false,
                error: 'Ya se realizó la programación de mantenimientos para el mes y año seleccionados'
            });
        }

        const planes = await SysPlanMantenimiento.findAll({
            where: { mes, ano: anio },  // ← ajusta 'ano' al nombre real de tu columna
            include: [{
                model: SysEquipo,
                as: 'equipo',  // ← ajusta al alias real de tu asociación
                where: {
                    preventivo_s: true,
                    estado_baja: false,
                    activo: true
                }
            }]
        });

        if (planes.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay equipos con plan de mantenimiento para el mes y año seleccionados',
                data: []
            });
        }

        // Crear un mantenimiento por cada plan encontrado
        for (const plan of planes) {
            const equipo = plan.equipo;
            const nuevoMtto = await SysReporte.create({
                añoProgramado: anio,
                mesProgramado: mes,
                tipoMantenimiento: 'Preventivo',
                servicioIdFk: equipo.id_servicio_fk,
                id_sysequipo_fk: equipo.id_sysequipo
            });
            reportes.push(nuevoMtto);
        }

        await SysProgramacionPreventivoMes.create({ mes, anio });

        return res.status(201).json({
            success: true,
            message: `Se crearon ${reportes.length} mantenimientos preventivos programados`,
            data: reportes
        });

    } catch (error) {
        console.error('Error en programacion-preventivos:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al programar los mantenimientos preventivos',
            detalle: error.message
        });
    }
});
/**
 * GET /sysprogramacion/programaciones
 * Consulta qué meses/años ya fueron programados.
 */
router.get('/programaciones', async (req, res) => {
    try {
        const programaciones = await SysProgramacionPreventivoMes.findAll({
            order: [['anio', 'DESC'], ['mes', 'DESC']]
        });
        res.json({ success: true, data: programaciones });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener programaciones' });
    }
});
router.get('/programacionPreventivaMeses', async (req, res) => {
    try {
        const meses = await SysProgramacionPreventivoMes.findAll();
        res.json(meses);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los meses programados', detalle: error.message });
    }
});

module.exports = router;