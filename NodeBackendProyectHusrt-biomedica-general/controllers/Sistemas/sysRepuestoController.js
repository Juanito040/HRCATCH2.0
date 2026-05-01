const { Op } = require('sequelize');
const SysRepuesto = require('../../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');
const SysAuditoriaRepuesto = require('../../models/Sistemas/SysAuditoriaRepuesto');
const Usuario = require('../../models/generales/Usuario');

const INCLUDES_BASE = [
  { model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['id_sys_tipo_repuesto', 'nombre'] }
];

// Helper para registrar auditoría
async function registrarAuditoria({ id_registro, req, accion, observacion, nombre_item }) {
  try {
    let nombreUsuarioAudit = req.user?.nombreUsuario || req.user?.nombre;
    
    // Si el JWT no contiene el nombre (solo el id), lo buscamos en BD
    if (!nombreUsuarioAudit && req.user?.id) {
      const u = await Usuario.findByPk(req.user.id);
      if (u) {
        nombreUsuarioAudit = u['nombreUsuario'];
      }
    }

    await SysAuditoriaRepuesto.create({
      tabla_origen: 'SysRepuesto',
      id_registro,
      nombre_item: nombre_item || null,
      usuario: nombreUsuarioAudit || 'desconocido',
      rol: req.user?.rol || null,
      accion,
      observacion: observacion || null,
      fecha_hora: new Date()
    });
  } catch (err) {
    console.error('Error al registrar auditoría repuesto:', err.message);
  }
}

// ─── Obtener todos los repuestos ──────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { is_active, search } = req.query;
    const where = {};

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === '1';
    }

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { numero_parte: { [Op.like]: `%${search}%` } },
        { numero_serie: { [Op.like]: `%${search}%` } },
        { proveedor: { [Op.like]: `%${search}%` } }
      ];
    }

    const repuestos = await SysRepuesto.findAll({
      where,
      include: INCLUDES_BASE,
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: repuestos });
  } catch (error) {
    console.error('Error getAll SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener repuestos' });
  }
};

// ─── Obtener repuesto por ID ──────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const repuesto = await SysRepuesto.findByPk(req.params.id, { include: INCLUDES_BASE });
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });
    res.json({ success: true, data: repuesto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el repuesto' });
  }
};

// ─── Crear repuesto ───────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario,
      observacion
    } = req.body;

    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const repuesto = await SysRepuesto.create({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock: cantidad_stock || 0, ubicacion_fisica,
      garantia_inicio, garantia_fin, estado, fecha_ingreso, costo_unitario
    });

    await registrarAuditoria({
      id_registro: repuesto.id_sysrepuesto,
      req,
      accion: 'creacion',
      observacion,
      nombre_item: repuesto['nombre']
    });

    const repuestoCompleto = await SysRepuesto.findByPk(repuesto.id_sysrepuesto, { include: INCLUDES_BASE });
    res.status(201).json({ success: true, message: 'Repuesto creado exitosamente', data: repuestoCompleto });
  } catch (error) {
    console.error('Error create SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el repuesto', error: error.message });
  }
};

// ─── Actualizar repuesto ──────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario,
      observacion
    } = req.body;

    const [affected] = await SysRepuesto.update({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario
    }, { where: { id_sysrepuesto: id } });

    if (affected === 0) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    await registrarAuditoria({
      id_registro: parseInt(id, 10),
      req,
      accion: 'edicion',
      observacion,
      nombre_item: nombre
    });

    const repuesto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: 'Repuesto actualizado exitosamente', data: repuesto });
  } catch (error) {
    console.error('Error update SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el repuesto' });
  }
};

// ─── Activar / Desactivar repuesto ────────────────────────────────────────────
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion } = req.body;
    const repuesto = await SysRepuesto.findByPk(id);
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    if (repuesto['is_active'] && repuesto['cantidad_stock'] > 0) {
      return res.status(400).json({ success: false, message: `No se puede dar de baja. Aún hay ${repuesto['cantidad_stock']} unidades en stock.` });
    }

    const nuevoEstado = !repuesto['is_active'];
    const updateData = { 
      is_active: nuevoEstado,
      fecha_inactivacion: null,
      usuario_inactivacion: null
    };

    if (!nuevoEstado) {
      updateData.fecha_inactivacion = new Date();
      
      // Intentar obtener el nombre del usuario
      let username = req.user?.nombreUsuario || req.user?.nombre;
      if (!username && req.user?.id) {
        const u = await Usuario.findByPk(req.user.id);
        if (u) username = u['nombreUsuario'] || u['nombres'];
      }
      updateData.usuario_inactivacion = username || 'desconocido';
    }

    await repuesto.update(updateData);

    await registrarAuditoria({
      id_registro: parseInt(id, 10),
      req,
      accion: nuevoEstado ? 'activacion' : 'inactivacion',
      observacion,
      nombre_item: repuesto['nombre']
    });

    const msg = nuevoEstado ? 'activado' : 'desactivado';
    const repuestoCompleto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: `Repuesto ${msg} exitosamente`, data: repuestoCompleto });
  } catch (error) {
    console.error('Error toggleActive SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del repuesto' });
  }
};
