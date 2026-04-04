const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const SysMantenimiento = require('../../models/Sistemas/SysMantenimiento');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysProgramacionPreventivoMes = require('../../models/Sistemas/SysProgramacionPreventivoMes');

/**
 * POST /sysprogramacion/programacion-preventivos
 * Llamado por el módulo de calendario.
 * Recibe { mes, anio } y genera un SysMantenimiento preventivo
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

        // Validar que no se haya programado ya ese mes/año
        const yaExiste = await SysProgramacionPreventivoMes.findOne({
            where: { mes, anio }
        });
        if (yaExiste) {
            return res.status(400).json({
                success: false,
                error: 'Ya se realizó la programación de mantenimientos para el mes y año seleccionados'
            });
        }

        // Traer equipos activos con mantenimiento preventivo habilitado
        const equipos = await SysEquipo.findAll({
            where: {
                preventivo_s: true,
                estado_baja: false,
                activo: true
            }
        });

        if (equipos.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay equipos con mantenimiento preventivo habilitado',
                data: []
            });
        }

        // Crear un mantenimiento preventivo pendiente por cada equipo
        for (const equipo of equipos) {
            const nuevoMtto = await SysMantenimiento.create({
                mesProgramado: mes,
                añoProgramado: anio,
                tipo_mantenimiento: 2,        // 2 = Preventivo
                mphardware: true,
                mpsoftware: true,
                entega: false,
                dano: false,
                id_sysequipo_fk: equipo.id_sysequipo,
                // Campos que el técnico completará después desde el frontend:
                // fecha, horas, observaciones, autor_realizado, autor_recibido,
                // tipo_falla, rutinah, rutinas, tiempo_fuera_servicio
            });
            reportes.push(nuevoMtto);
        }

        // Registrar que este mes/año ya fue programado
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

module.exports = router;