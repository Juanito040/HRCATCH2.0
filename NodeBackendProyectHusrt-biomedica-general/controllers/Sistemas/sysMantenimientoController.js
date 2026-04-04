const { Op } = require('sequelize');
const SysMantenimiento = require('../../models/Sistemas/SysMantenimiento');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const Servicio = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Usuario = require('../../models/generales/Usuario');
const { getAllTiposMantenimiento, getAllTiposFalla } = require('../../utilities/sysConstants');

const INCLUDES_FULL = [
    {
        model: SysEquipo,
        as: 'equipo',
        include: [
            { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
            { model: Servicio, as: 'servicio', attributes: ['id', 'nombres', 'ubicacion'] },
            { model: SysHojaVida, as: 'hojaVida' }
        ]
    },
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos', 'email'] }
];

exports.getAll = async (req, res) => {
    try {
        const where = {};
        if (req.query.id_equipo) where.id_sysequipo_fk = req.query.id_equipo;
        if (req.query.tipo_mantenimiento) where.tipo_mantenimiento = req.query.tipo_mantenimiento;
        if (req.query.fecha_inicio && req.query.fecha_fin) {
            where.fecha = { [Op.between]: [req.query.fecha_inicio, req.query.fecha_fin] };
        }

        const data = await SysMantenimiento.findAll({
            where,
            include: INCLUDES_FULL,
            order: [['fecha', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('Error getAll SysMantenimiento:', error);
        res.status(500).json({ success: false, message: 'Error al obtener mantenimientos' });
    }
};

exports.getById = async (req, res) => {
    try {
        const mantenimiento = await SysMantenimiento.findByPk(req.params.id, { include: INCLUDES_FULL });
        if (!mantenimiento) return res.status(404).json({ success: false, message: 'Mantenimiento no encontrado' });
        res.json({ success: true, data: mantenimiento });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener mantenimiento' });
    }
};

exports.getByEquipo = async (req, res) => {
    try {
        const data = await SysMantenimiento.findAll({
            where: { id_sysequipo_fk: req.params.idEquipo },
            include: INCLUDES_FULL,
            order: [['fecha', 'DESC']]
        });
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener mantenimientos del equipo' });
    }
};

exports.getByTecnico = async (req, res) => {
    try {
        const where = { id_sysusuario_fk: req.params.idUsuario };
        if (req.query.fecha_inicio && req.query.fecha_fin) {
            where.fecha = { [Op.between]: [req.query.fecha_inicio, req.query.fecha_fin] };
        }
        const data = await SysMantenimiento.findAll({
            where,
            include: INCLUDES_FULL,
            order: [['fecha', 'DESC']]
        });
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener mantenimientos del técnico' });
    }
};

exports.create = async (req, res) => {
    try {
        if (!req.body.id_sysequipo_fk) {
            return res.status(400).json({ success: false, message: 'El ID del equipo es requerido' });
        }
        const mantenimiento = await SysMantenimiento.create(req.body);
        const completo = await SysMantenimiento.findByPk(mantenimiento.id_sysmtto, { include: INCLUDES_FULL });
        res.status(201).json({ success: true, message: 'Mantenimiento creado exitosamente', data: completo });
    } catch (error) {
        console.error('Error create SysMantenimiento:', error);
        res.status(500).json({ success: false, message: 'Error al crear mantenimiento', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const mantenimiento = await SysMantenimiento.findByPk(req.params.id);
        if (!mantenimiento) return res.status(404).json({ success: false, message: 'Mantenimiento no encontrado' });
        await mantenimiento.update(req.body);
        const actualizado = await SysMantenimiento.findByPk(req.params.id, { include: INCLUDES_FULL });
        res.json({ success: true, message: 'Mantenimiento actualizado exitosamente', data: actualizado });
    } catch (error) {
        console.error('Error update SysMantenimiento:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar mantenimiento', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const mantenimiento = await SysMantenimiento.findByPk(req.params.id);
        if (!mantenimiento) return res.status(404).json({ success: false, message: 'Mantenimiento no encontrado' });
        await mantenimiento.destroy();
        res.json({ success: true, message: 'Mantenimiento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar mantenimiento' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        let { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            const hoy = new Date();
            fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
            fecha_fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        }

        const where = { fecha: { [Op.between]: [fecha_inicio, fecha_fin] } };

        const [total, correctivos, preventivos, predictivos, otros, recientes] = await Promise.all([
            SysMantenimiento.count({ where }),
            SysMantenimiento.count({ where: { ...where, tipo_mantenimiento: 1 } }),
            SysMantenimiento.count({ where: { ...where, tipo_mantenimiento: 2 } }),
            SysMantenimiento.count({ where: { ...where, tipo_mantenimiento: 3 } }),
            SysMantenimiento.count({ where: { ...where, tipo_mantenimiento: 4 } }),
            SysMantenimiento.findAll({ where, include: INCLUDES_FULL, order: [['fecha', 'DESC']], limit: 20 })
        ]);

        res.json({
            success: true,
            data: {
                total,
                estadisticasTipo: [
                    { tipo: 'Correctivo', cantidad: correctivos },
                    { tipo: 'Preventivo', cantidad: preventivos },
                    { tipo: 'Predictivo', cantidad: predictivos },
                    { tipo: 'Otro', cantidad: otros }
                ],
                mantenimientosRecientes: recientes,
                fecha_inicio,
                fecha_fin
            }
        });
    } catch (error) {
        console.error('Error getDashboard SysMantenimiento:', error);
        res.status(500).json({ success: false, message: 'Error al obtener dashboard' });
    }
};

exports.getCatalogoTiposMantenimiento = (req, res) => {
    res.json({ success: true, data: getAllTiposMantenimiento() });
};

exports.getCatalogoTiposFalla = (req, res) => {
    res.json({ success: true, data: getAllTiposFalla() });
};
