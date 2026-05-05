const express = require('express');
const router  = express.Router();
const SysReporteMantenimiento = require('../../models/Sistemas/SysReporteMantenimiento');
const SysEquipo               = require('../../models/Sistemas/SysEquipo');
const Usuario                 = require('../../models/generales/Usuario');

const EQUIPO_ATTRS  = ['id_sysequipo', 'nombre_equipo', 'placa_inventario', 'marca', 'modelo', 'serie'];
const USUARIO_ATTRS = ['id', 'nombres', 'apellidos'];

// GET /sysreportesmtto/equipo/:id_sysequipo — lista por equipo (DEBE ir antes de /:id)
router.get('/equipo/:id_sysequipo', async (req, res) => {
    try {
        const { id_sysequipo } = req.params;

        const equipo = await SysEquipo.findByPk(id_sysequipo);
        if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

        const reportes = await SysReporteMantenimiento.findAll({
            where: { id_sysequipo_fk: id_sysequipo },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Usuario,   as: 'usuario', attributes: USUARIO_ATTRS, required: false },
                { model: SysEquipo, as: 'equipo',  attributes: EQUIPO_ATTRS,  required: false }
            ]
        });

        res.json({ success: true, data: reportes });
    } catch (err) {
        console.error('Error al obtener reportes de mantenimiento:', err);
        res.status(500).json({ success: false, message: 'Error interno', error: err.message });
    }
});

// GET /sysreportesmtto/:id_reporte — detalle de un reporte
router.get('/:id_reporte', async (req, res) => {
    try {
        const reporte = await SysReporteMantenimiento.findByPk(req.params.id_reporte, {
            include: [
                { model: Usuario,   as: 'usuario', attributes: USUARIO_ATTRS, required: false },
                { model: SysEquipo, as: 'equipo',  attributes: EQUIPO_ATTRS,  required: false }
            ]
        });
        if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        res.json({ success: true, data: reporte });
    } catch (err) {
        console.error('Error al obtener reporte:', err);
        res.status(500).json({ success: false, message: 'Error interno', error: err.message });
    }
});

// POST /sysreportesmtto — crear reporte
router.post('/', async (req, res) => {
    try {
        const { id_sysequipo_fk, trabajo_realizado } = req.body;

        if (!id_sysequipo_fk)    return res.status(400).json({ success: false, message: 'id_sysequipo_fk es requerido' });
        if (!trabajo_realizado)  return res.status(400).json({ success: false, message: 'trabajo_realizado es requerido' });

        const equipo = await SysEquipo.findByPk(id_sysequipo_fk);
        if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

        const reporte = await SysReporteMantenimiento.create({
            titulo:             req.body.titulo             || null,
            tipo_mantenimiento: req.body.tipo_mantenimiento || 'Correctivo',
            tipo_falla:         req.body.tipo_falla         || null,
            estado_operativo:   req.body.estado_operativo   || 'Operativo sin restricciones',
            motivo:             req.body.motivo             || null,
            trabajo_realizado,
            calificacion:       req.body.calificacion       || null,
            nombre_recibio:     req.body.nombre_recibio     || null,
            cedula_recibio:     req.body.cedula_recibio     || null,
            observaciones:      req.body.observaciones      || null,
            fecha_realizado:    req.body.fecha_realizado     || new Date().toISOString().slice(0, 10),
            hora_inicio:        req.body.hora_inicio         || null,
            hora_terminacion:   req.body.hora_terminacion    || null,
            hora_total:         req.body.hora_total          || null,
            mesa_caso_id:       req.body.mesa_caso_id        || null,
            id_sysequipo_fk,
            id_usuario_fk:      req.body.id_usuario_fk       || null
        });

        res.status(201).json({ success: true, data: reporte });
    } catch (err) {
        console.error('Error al crear reporte de mantenimiento:', err);
        res.status(500).json({ success: false, message: 'Error interno', error: err.message });
    }
});

module.exports = router;
