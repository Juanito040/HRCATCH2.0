const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysBaja = require('../../models/Sistemas/SysBaja');
const Usuario = require('../../models/generales/Usuario');

const INCLUDE_USUARIO = [
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos', 'email'] }
];
const INCLUDE_EQUIPO = [
    { model: SysEquipo, as: 'equipo', attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'serie'] }
];

// Historial completo de un equipo específico (trazabilidad + bajas históricas)
router.get('/equipo/:id', async (req, res) => {
    try {
        const equipoId = req.params.id;

        const [trazabilidad, bajas] = await Promise.all([
            SysTrazabilidad.findAll({
                where: { id_sysequipo_fk: equipoId },
                include: INCLUDE_USUARIO,
                order: [['fecha', 'DESC']]
            }),
            SysBaja.findAll({
                where: { id_sysequipo_fk: equipoId },
                include: [{ model: Usuario, as: 'usuarioBaja', attributes: ['id', 'nombres', 'apellidos'] }]
            })
        ]);

        // Normalizar eventos de trazabilidad
        const eventosTraz = trazabilidad.map(t => ({
            accion: t.accion,
            detalles: t.detalles,
            fecha: t.fecha,
            usuario: t.usuario,
            fuente: 'trazabilidad'
        }));

        // Incluir bajas históricas solo si no hay ya un evento BAJA en trazabilidad
        const tieneBajaEnTraz = eventosTraz.some(e => e.accion === 'BAJA');
        const eventosBaja = tieneBajaEnTraz ? [] : bajas.map(b => ({
            accion: 'BAJA',
            detalles: b.justificacion_baja || 'No especificada',
            fecha: b.fecha_baja || b.createdAt,
            usuario: b.usuarioBaja ? { nombres: b.usuarioBaja.nombres, apellidos: b.usuarioBaja.apellidos } : null,
            fuente: 'baja',
            extra: b.accesorios_reutilizables
        }));

        const eventos = [...eventosTraz, ...eventosBaja]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        res.json({ success: true, data: eventos });
    } catch (error) {
        console.error('Error historial equipo:', error);
        res.status(500).json({ success: false, message: 'Error al obtener historial', detalle: error.message });
    }
});

// Trazabilidad global (todos los equipos) con filtros
router.get('/', async (req, res) => {
    try {
        const { accion, equipoId, desde, hasta } = req.query;
        const where = {};

        if (accion) where.accion = accion;
        if (equipoId) where.id_sysequipo_fk = equipoId;
        if (desde || hasta) {
            where.fecha = {};
            if (desde) where.fecha[Op.gte] = new Date(desde);
            if (hasta) where.fecha[Op.lte] = new Date(hasta + 'T23:59:59');
        }

        const logs = await SysTrazabilidad.findAll({
            where,
            include: [...INCLUDE_USUARIO, ...INCLUDE_EQUIPO],
            order: [['fecha', 'DESC']],
            limit: 500
        });

        res.json({ success: true, data: logs, count: logs.length });
    } catch (error) {
        console.error('Error trazabilidad global:', error);
        res.status(500).json({ success: false, message: 'Error al obtener trazabilidad', detalle: error.message });
    }
});

module.exports = router;
