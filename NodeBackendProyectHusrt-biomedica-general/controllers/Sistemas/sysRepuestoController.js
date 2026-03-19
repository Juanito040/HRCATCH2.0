const { Op } = require('sequelize');
const SysRepuesto = require('../../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');

const INCLUDES_BASE = [
  { model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['id_sys_tipo_repuesto', 'nombre'] }
];

// Obtener todos los repuestos
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

// Obtener repuesto por ID
exports.getById = async (req, res) => {
  try {
    const repuesto = await SysRepuesto.findByPk(req.params.id, { include: INCLUDES_BASE });
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });
    res.json({ success: true, data: repuesto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el repuesto' });
  }
};

// Crear repuesto
exports.create = async (req, res) => {
  try {
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica
    } = req.body;

    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const repuesto = await SysRepuesto.create({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock: cantidad_stock || 0, ubicacion_fisica
    });

    const repuestoCompleto = await SysRepuesto.findByPk(repuesto.id_sysrepuesto, { include: INCLUDES_BASE });
    res.status(201).json({ success: true, message: 'Repuesto creado exitosamente', data: repuestoCompleto });
  } catch (error) {
    console.error('Error create SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el repuesto', error: error.message });
  }
};

// Actualizar repuesto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica
    } = req.body;

    const [affected] = await SysRepuesto.update({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica
    }, { where: { id_sysrepuesto: id } });

    if (affected === 0) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    const repuesto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: 'Repuesto actualizado exitosamente', data: repuesto });
  } catch (error) {
    console.error('Error update SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el repuesto' });
  }
};

// Activar / Desactivar repuesto (sin eliminar)
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const repuesto = await SysRepuesto.findByPk(id);
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    await repuesto.update({ is_active: !repuesto.is_active });
    const msg = repuesto.is_active ? 'activado' : 'desactivado';
    const repuestoCompleto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: `Repuesto ${msg} exitosamente`, data: repuestoCompleto });
  } catch (error) {
    console.error('Error toggleActive SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del repuesto' });
  }
};
