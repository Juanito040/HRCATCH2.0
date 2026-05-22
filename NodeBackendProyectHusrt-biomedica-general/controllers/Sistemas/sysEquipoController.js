const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/configDb');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const SysBaja = require('../../models/Sistemas/SysBaja');
const SysBodega = require('../../models/Sistemas/SysBodega');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const SysTraslado = require('../../models/Sistemas/SysTraslado');
const Servicio = require('../../models/generales/Servicio');
const Sede = require('../../models/generales/Sede');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Usuario = require('../../models/generales/Usuario');

const CAMPOS_AUDITADOS = [
    'nombre_equipo', 'marca', 'modelo', 'serie', 'placa_inventario',
    'codigo', 'ubicacion', 'ubicacion_especifica', 'activo',
    'id_servicio_fk', 'id_tipo_equipo_fk', 'id_usuario_fk'
];

async function registrarTrazabilidad({ accion, detalles, equipoId, usuarioId, transaction }) {
    try {
        await SysTrazabilidad.create({
            accion,
            detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
            id_sysequipo_fk: equipoId,
            id_sysusuario_fk: usuarioId || null
        }, transaction ? { transaction } : {});
    } catch (e) {
        console.error('Error al registrar trazabilidad:', e.message);
    }
}

const CAMPOS_TIPO_EQUIPO = [
    'id', 'nombres',
    'campo_ip', 'campo_mac', 'campo_procesador', 'campo_ram', 'campo_disco',
    'campo_tonner', 'campo_so', 'campo_office', 'campo_nombre_usuario',
    'campo_tipo_uso', 'campo_adquisicion', 'campo_observaciones'
];

const INCLUDES_BASE_COMMON = [
    {
        model: Servicio, as: 'servicio', attributes: ['id', 'nombres', 'ubicacion'],
        include: [{ model: Sede, as: 'sede', attributes: ['id', 'nombres'] }]
    },
    { model: TipoEquipo, as: 'tipoEquipo', attributes: CAMPOS_TIPO_EQUIPO },
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos', 'email'] }
];

const INCLUDES_BASE = [
    ...INCLUDES_BASE_COMMON,
    { model: SysHojaVida, as: 'hojaVida', attributes: ['id_syshoja_vida', 'fecha_inicio_soporte', 'anos_soporte_fabricante'], required: false }
];

const INCLUDES_FULL = [
    ...INCLUDES_BASE_COMMON,
    { model: SysHojaVida, as: 'hojaVida' }
];

// Obtener todos los equipos
exports.getAllSysEquipos = async (req, res) => {
    try {
        const {
            activo,
            id_servicio_fk,
            id_tipo_equipo_fk,
            search,
            includeAll = false
        } = req.query;

        const where = {};

        if (activo !== undefined) {
            where.activo = activo === 'true' || activo === '1';
        }
        if (id_servicio_fk) where.id_servicio_fk = id_servicio_fk;
        if (id_tipo_equipo_fk) where.id_tipo_equipo_fk = id_tipo_equipo_fk;

        if (search) {
            where[Op.or] = [
                { nombre_equipo: { [Op.like]: `%${search}%` } },
                { marca: { [Op.like]: `%${search}%` } },
                { modelo: { [Op.like]: `%${search}%` } },
                { serie: { [Op.like]: `%${search}%` } },
                { placa_inventario: { [Op.like]: `%${search}%` } },
                { codigo: { [Op.like]: `%${search}%` } }
            ];
        }

        if (includeAll !== 'true' && includeAll !== true) {
            where[Op.and] = [
                { [Op.or]: [{ ubicacion: { [Op.ne]: 'Bodega' } }, { ubicacion: null }] },
                { [Op.or]: [{ estado_baja: false }, { estado_baja: null }] }
            ];
        }

        const equipos = await SysEquipo.findAll({
            where,
            include: INCLUDES_BASE,
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: equipos });
    } catch (error) {
        console.error('Error getAllSysEquipos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener equipos' });
    }
};

// Obtener equipo por ID
exports.getSysEquipoById = async (req, res) => {
    try {
        const equipo = await SysEquipo.findByPk(req.params.id, { include: INCLUDES_FULL });
        if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        res.json({ success: true, data: equipo });
    } catch (error) {
        console.error('Error getSysEquipoById:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el equipo' });
    }
};

// Crear equipo con hoja de vida (transacción)
exports.createSysEquipo = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { hojaVida, ...equipoData } = req.body;
        const equipo = await SysEquipo.create(equipoData, { transaction: t });

        if (hojaVida && Object.keys(hojaVida).length > 0) {
            await SysHojaVida.create({ ...hojaVida, id_sysequipo_fk: equipo.id_sysequipo }, { transaction: t });
        }

        await t.commit();

        const equipoCompleto = await SysEquipo.findByPk(equipo.id_sysequipo, { include: INCLUDES_FULL });

        await registrarTrazabilidad({
            accion: 'CREACION',
            detalles: `Equipo "${equipoCompleto.nombre_equipo}" creado`,
            equipoId: equipo.id_sysequipo,
            usuarioId: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Equipo creado exitosamente', data: equipoCompleto });
    } catch (error) {
        await t.rollback();
        console.error('Error createSysEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al crear el equipo', error: error.message });
    }
};

// Actualizar equipo (PATCH)
exports.updateSysEquipo = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { hojaVida, ...equipoData } = req.body;

        // Capturar valores anteriores para auditoría
        const equipoAnterior = await SysEquipo.findByPk(id);
        if (!equipoAnterior) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        // Convertir booleanos
        ['activo', 'estado_baja', 'administrable', 'preventivo_s'].forEach(field => {
            if (equipoData[field] !== undefined) equipoData[field] = equipoData[field] ? 1 : 0;
        });

        const [affected] = await SysEquipo.update(equipoData, { where: { id_sysequipo: id }, transaction: t });
        if (affected === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        if (hojaVida && Object.keys(hojaVida).length > 0) {
            const existente = await SysHojaVida.findOne({ where: { id_sysequipo_fk: id } });
            if (existente) {
                await SysHojaVida.update(hojaVida, { where: { id_sysequipo_fk: id }, transaction: t });
            } else {
                await SysHojaVida.create({ ...hojaVida, id_sysequipo_fk: id }, { transaction: t });
            }
        }

        await t.commit();

        // Detectar y registrar campos cambiados
        const CAMPOS_BOOL = new Set(['activo', 'estado_baja', 'administrable', 'preventivo_s']);
        const normAudit = (campo, val) => CAMPOS_BOOL.has(campo) ? (val ? 1 : 0) : (val ?? '');
        const cambios = CAMPOS_AUDITADOS
            .filter(campo => equipoData[campo] !== undefined &&
                String(normAudit(campo, equipoData[campo])) !== String(normAudit(campo, equipoAnterior.dataValues[campo])))
            .map(campo => ({
                campo,
                anterior: equipoAnterior.dataValues[campo],
                nuevo: equipoData[campo]
            }));

        if (cambios.length > 0) {
            await registrarTrazabilidad({
                accion: 'EDICION',
                detalles: cambios,
                equipoId: id,
                usuarioId: req.user?.id
            });
        }

        const equipo = await SysEquipo.findByPk(id, { include: INCLUDES_FULL });
        res.json({ success: true, message: 'Equipo actualizado exitosamente', data: equipo });
    } catch (error) {
        await t.rollback();
        console.error('Error updateSysEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el equipo', error: error.message });
    }
};

// Enviar a bodega (soft delete)
exports.deleteSysEquipo = async (req, res) => {
    return exports.enviarABodegaPost(req, res);
};

// Enviar a bodega via POST (body parsing garantizado)
exports.enviarABodegaPost = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { motivo, tipo_bodega, nombre_receptor, cargo_receptor, observaciones } = req.body || {};

        if (!nombre_receptor || !cargo_receptor) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'nombre_receptor y cargo_receptor son obligatorios' });
        }

        const equipo = await SysEquipo.findByPk(id, { transaction: t });
        if (!equipo) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        const servicioAnteriorId = equipo.id_servicio_fk;

        await SysEquipo.update({
            activo: 0,
            ubicacion_anterior: equipo.ubicacion,
            ubicacion: 'Bodega',
            ubicacion_especifica: null,
            estado_baja: 0,
            ubic_bod: tipo_bodega || null,
            id_servicio_anterior_fk: servicioAnteriorId,
            id_servicio_fk: null
        }, { where: { id_sysequipo: id }, transaction: t });

        await SysBodega.destroy({ where: { id_sysequipo_fk: id }, transaction: t });
        await SysBodega.create({
            tipo_bodega: tipo_bodega || null,
            motivo: motivo || null,
            fecha_ingreso: new Date(),
            id_sysequipo_fk: id,
            id_sysusuario_fk: req.user?.id || null,
            ubicacion_origen: equipo.ubicacion || null,
            ubicacion_esp_origen: equipo.ubicacion_especifica || null
        }, { transaction: t });

        await t.commit();

        // Registro de traslado fuera de la transacción principal para no bloquear la operación de bodega
        SysTraslado.create({
            tipo: 'BODEGA',
            ubicacion_origen: equipo.ubicacion || null,
            ubicacion_destino: tipo_bodega || 'Bodega',
            nombre_receptor,
            cargo_receptor,
            observaciones: observaciones || null,
            fecha: new Date(),
            id_sysequipo_fk: id,
            id_servicio_origen_fk: servicioAnteriorId,
            id_servicio_destino_fk: null,
            id_sysusuario_fk: req.user?.id || null
        }).catch(e => console.error('[SysTraslado BODEGA] No se pudo registrar el traslado:', e.message));

        const tipoBodegaLabel = tipo_bodega || 'Bodega';
        const detallesBodega = motivo
            ? `${tipoBodegaLabel} — ${motivo}`
            : `Enviado a ${tipoBodegaLabel}`;
        await registrarTrazabilidad({
            accion: 'BODEGA',
            detalles: detallesBodega,
            equipoId: id,
            usuarioId: req.user?.id
        });

        const actualizado = await SysEquipo.findByPk(id);
        res.json({ success: true, message: 'Equipo enviado a bodega exitosamente', data: actualizado });
    } catch (error) {
        await t.rollback();
        console.error('Error enviarABodegaPost:', error);
        res.status(500).json({ success: false, message: 'Error al enviar equipo a bodega' });
    }
};

// Dar de baja permanente (requiere contraseña)
exports.hardDeleteSysEquipo = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { justificacion_baja, accesorios_reutilizables, id_usuario, password } = req.body;

        if (!password) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Se requiere la contraseña para confirmar esta acción' });
        }

        const usuarioAuth = await Usuario.findByPk(req.user.id);
        if (!usuarioAuth) {
            await t.rollback();
            return res.status(403).json({ success: false, message: 'Usuario no encontrado' });
        }

        const passwordValida = await bcrypt.compare(password, usuarioAuth.contraseña);
        if (!passwordValida) {
            await t.rollback();
            return res.status(403).json({ success: false, message: 'Contraseña incorrecta' });
        }

        const equipo = await SysEquipo.findByPk(id);
        if (!equipo) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        const ultimaUbicacion = equipo.ubicacion_anterior
            || (equipo.ubicacion !== 'Bodega' ? equipo.ubicacion : null)
            || null;

        await SysEquipo.update({
            activo: 0,
            estado_baja: 1,
            ubicacion_anterior: ultimaUbicacion
        }, { where: { id_sysequipo: id }, transaction: t });

        await SysBodega.destroy({ where: { id_sysequipo_fk: id }, transaction: t });

        await SysBaja.create({
            fecha_baja: new Date(),
            justificacion_baja: justificacion_baja || 'No especificada',
            accesorios_reutilizables: accesorios_reutilizables || '',
            id_sysequipo_fk: id,
            id_sysusuario_fk: id_usuario || req.user.id
        }, { transaction: t });

        await registrarTrazabilidad({
            accion: 'BAJA',
            detalles: justificacion_baja || 'No especificada',
            equipoId: id,
            usuarioId: id_usuario || req.user.id,
            transaction: t
        });

        await t.commit();
        res.json({ success: true, message: `Equipo "${equipo.nombre_equipo}" dado de baja permanentemente` });
    } catch (error) {
        await t.rollback();
        console.error('Error hardDeleteSysEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al dar de baja el equipo' });
    }
};

// Reactivar equipo
exports.reactivarSysEquipo = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { ubicacion, ubicacion_especifica, nombre_receptor, cargo_receptor, observaciones, servicioDestinoId } = req.body || {};

        if (!nombre_receptor || !cargo_receptor) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'nombre_receptor y cargo_receptor son obligatorios' });
        }

        const equipoActual = await SysEquipo.findByPk(id, { transaction: t });
        if (!equipoActual) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        const tipoBodega = equipoActual.ubic_bod || 'Bodega';
        const nuevaUbicacion = ubicacion || equipoActual.ubicacion_anterior || null;
        const servicioDestino = servicioDestinoId ?? equipoActual.id_servicio_anterior_fk ?? null;

        const [affected] = await SysEquipo.update(
            {
                activo: true,
                estado_baja: 0,
                ubicacion_anterior: null,
                ubicacion: nuevaUbicacion,
                ubicacion_especifica: ubicacion_especifica || null,
                ubic_bod: null,
                id_servicio_fk: servicioDestino,
                id_servicio_anterior_fk: null
            },
            { where: { id_sysequipo: id }, transaction: t }
        );
        if (affected === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        await SysBodega.destroy({ where: { id_sysequipo_fk: id }, transaction: t });

        await t.commit();

        // Registro de traslado fuera de la transacción principal
        SysTraslado.create({
            tipo: 'REACTIVACION',
            ubicacion_origen: tipoBodega,
            ubicacion_destino: nuevaUbicacion || null,
            nombre_receptor,
            cargo_receptor,
            observaciones: observaciones || null,
            fecha: new Date(),
            id_sysequipo_fk: id,
            id_servicio_origen_fk: null,
            id_servicio_destino_fk: servicioDestino,
            id_sysusuario_fk: req.user?.id || null
        }).catch(e => console.error('[SysTraslado REACTIVACION] No se pudo registrar el traslado:', e.message));

        await registrarTrazabilidad({
            accion: 'REACTIVACION',
            detalles: `Equipo reactivado desde ${tipoBodega}`,
            equipoId: id,
            usuarioId: req.user?.id
        });

        const equipo = await SysEquipo.findByPk(id);
        res.json({ success: true, message: 'Equipo reactivado exitosamente', data: equipo });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: 'Error al reactivar el equipo' });
    }
};

// Obtener equipos en bodega
exports.getEquiposEnBodega = async (req, res) => {
    try {
        const equipos = await SysEquipo.findAll({
            where: {
                ubicacion: 'Bodega',
                [Op.or]: [{ estado_baja: false }, { estado_baja: null }]
            },
            include: [
                ...INCLUDES_FULL,
                {
                    model: SysBodega,
                    as: 'bodega',
                    include: [{ model: Usuario, as: 'usuarioBodega', attributes: ['id', 'nombres', 'apellidos'] }]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json({ success: true, data: equipos, count: equipos.length });
    } catch (error) {
        console.error('Error getEquiposEnBodega:', error);
        res.status(500).json({ success: false, message: 'Error al obtener equipos en bodega' });
    }
};

// Obtener equipos dados de baja
exports.getEquiposDadosDeBaja = async (req, res) => {
    try {
        const equipos = await SysEquipo.findAll({
            where: { estado_baja: true },
            include: [
                ...INCLUDES_FULL,
                {
                    model: SysBaja,
                    as: 'baja',
                    include: [{ model: Usuario, as: 'usuarioBaja', attributes: ['id', 'nombres', 'apellidos'] }]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json({ success: true, data: equipos, count: equipos.length });
    } catch (error) {
        console.error('Error getEquiposDadosDeBaja:', error);
        res.status(500).json({ success: false, message: 'Error al obtener equipos dados de baja' });
    }
};

// Estadísticas
exports.getEstadisticasSysEquipos = async (req, res) => {
    try {
        const [total, activos, enBodega, dadosDeBaja] = await Promise.all([
            SysEquipo.count(),
            SysEquipo.count({ where: { activo: true } }),
            SysEquipo.count({
                where: {
                    ubicacion: 'Bodega',
                    [Op.or]: [{ estado_baja: false }, { estado_baja: null }]
                }
            }),
            SysEquipo.count({ where: { estado_baja: true } })
        ]);
        res.json({ success: true, data: { total, activos, enBodega, dadosDeBaja } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};
