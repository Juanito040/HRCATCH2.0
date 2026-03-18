const { Op } = require('sequelize');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const Servicio = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');

const EQUIPO_INCLUDE = {
    model: SysEquipo,
    as: 'equipo',
    attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'serie', 'placa_inventario', 'ubicacion'],
    include: [
        { model: Servicio, as: 'servicio', attributes: ['id', 'nombres'] },
        { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] }
    ]
};

// Obtener todas las hojas de vida
exports.getAllSysHojasVida = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { ip: { [Op.like]: `%${search}%` } },
                { nombre_usuario: { [Op.like]: `%${search}%` } },
                { procesador: { [Op.like]: `%${search}%` } },
                { sistema_operativo: { [Op.like]: `%${search}%` } },
                { vendedor: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await SysHojaVida.findAndCountAll({
            where,
            include: [EQUIPO_INCLUDE],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Error getAllSysHojasVida:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hojas de vida', error: error.message });
    }
};

// Obtener hoja de vida por ID
exports.getSysHojaVidaById = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id, { include: [EQUIPO_INCLUDE] });

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        res.json({ success: true, data: hojaVida });
    } catch (error) {
        console.error('Error getSysHojaVidaById:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hoja de vida', error: error.message });
    }
};

// Obtener hoja de vida por equipo
exports.getSysHojaVidaByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;
        const hojaVida = await SysHojaVida.findOne({
            where: { id_sysequipo_fk: equipoId },
            include: [EQUIPO_INCLUDE]
        });

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Este equipo no tiene hoja de vida registrada' });
        }

        res.json({ success: true, data: hojaVida });
    } catch (error) {
        console.error('Error getSysHojaVidaByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hoja de vida', error: error.message });
    }
};

// Crear hoja de vida
exports.createSysHojaVida = async (req, res) => {
    try {
        const { id_sysequipo_fk } = req.body;

        if (!id_sysequipo_fk) {
            return res.status(400).json({ success: false, message: 'El equipo es requerido' });
        }

        // Verificar que el equipo existe
        const equipo = await SysEquipo.findByPk(id_sysequipo_fk);
        if (!equipo) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        // Verificar que no exista ya una hoja de vida para este equipo
        const existing = await SysHojaVida.findOne({ where: { id_sysequipo_fk } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Este equipo ya tiene una hoja de vida registrada' });
        }

        const hojaVida = await SysHojaVida.create(req.body);
        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });

        res.status(201).json({ success: true, message: 'Hoja de vida creada exitosamente', data: result });
    } catch (error) {
        console.error('Error createSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al crear hoja de vida', error: error.message });
    }
};

// Actualizar hoja de vida (reemplazo completo)
exports.updateSysHojaVida = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id);

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        await hojaVida.update(req.body);
        const result = await SysHojaVida.findByPk(id, { include: [EQUIPO_INCLUDE] });

        res.json({ success: true, message: 'Hoja de vida actualizada exitosamente', data: result });
    } catch (error) {
        console.error('Error updateSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar hoja de vida', error: error.message });
    }
};

// Actualizar hoja de vida por equipo (upsert)
exports.upsertByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;

        const equipo = await SysEquipo.findByPk(equipoId);
        if (!equipo) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        let hojaVida = await SysHojaVida.findOne({ where: { id_sysequipo_fk: equipoId } });

        if (hojaVida) {
            await hojaVida.update({ ...req.body, id_sysequipo_fk: equipoId });
        } else {
            hojaVida = await SysHojaVida.create({ ...req.body, id_sysequipo_fk: equipoId });
        }

        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });
        res.json({ success: true, message: 'Hoja de vida guardada exitosamente', data: result });
    } catch (error) {
        console.error('Error upsertByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al guardar hoja de vida', error: error.message });
    }
};

// Eliminar hoja de vida
exports.deleteSysHojaVida = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id);

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        await hojaVida.destroy();
        res.json({ success: true, message: 'Hoja de vida eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleteSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar hoja de vida', error: error.message });
    }
};
