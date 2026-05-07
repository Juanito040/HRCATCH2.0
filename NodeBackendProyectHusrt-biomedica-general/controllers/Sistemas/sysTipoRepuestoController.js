const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');
const SysAuditoriaRepuesto = require('../../models/Sistemas/SysAuditoriaRepuesto');
const Usuario = require('../../models/generales/Usuario');

// Helper para registrar auditoría
async function registrarAuditoria({ tabla_origen, id_registro, req, accion, observacion, nombre_item }) {
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
      tabla_origen,
      id_registro,
      nombre_item: nombre_item || null,
      usuario: nombreUsuarioAudit || 'desconocido',
      rol: req.user?.rol || null,
      accion,
      observacion: observacion || null,
      fecha_hora: new Date()
    });
  } catch (err) {
    console.error('Error al registrar auditoría:', err.message);
  }
}

// ─── Obtener todos los tipos de repuesto ─────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === '1';
    }
    const tipos = await SysTipoRepuesto.findAll({ where, order: [['nombre', 'ASC']] });
    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error('Error getAll SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipos de repuesto' });
  }
};

// ─── Obtener tipo por ID ──────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const tipo = await SysTipoRepuesto.findByPk(req.params.id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });
    res.json({ success: true, data: tipo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el tipo de repuesto' });
  }
};

// ─── Crear tipo de repuesto ───────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, observacion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const tipo = await SysTipoRepuesto.create({ nombre, descripcion });

    await registrarAuditoria({
      tabla_origen: 'SysTipoRepuesto',
      id_registro: tipo.id_sys_tipo_repuesto,
      req,
      accion: 'creacion',
      observacion,
      nombre_item: tipo['nombre']
    });

    res.status(201).json({ success: true, message: 'Tipo de repuesto creado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error create SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el tipo de repuesto' });
  }
};

// ─── Actualizar tipo de repuesto ──────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, observacion } = req.body;

    const [affected] = await SysTipoRepuesto.update(
      { nombre, descripcion },
      { where: { id_sys_tipo_repuesto: id } }
    );
    if (affected === 0) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });

    await registrarAuditoria({
      tabla_origen: 'SysTipoRepuesto',
      id_registro: parseInt(id, 10),
      req,
      accion: 'edicion',
      observacion,
      nombre_item: nombre
    });

    const tipo = await SysTipoRepuesto.findByPk(id);
    res.json({ success: true, message: 'Tipo de repuesto actualizado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error update SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el tipo de repuesto' });
  }
};

// ─── Activar / Desactivar tipo de repuesto ────────────────────────────────────
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion } = req.body;
    const tipo = await SysTipoRepuesto.findByPk(id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });

    const nuevoEstado = !tipo['is_active'];
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

    await tipo.update(updateData);

    await registrarAuditoria({
      tabla_origen: 'SysTipoRepuesto',
      id_registro: parseInt(id, 10),
      req,
      accion: nuevoEstado ? 'activacion' : 'inactivacion',
      observacion,
      nombre_item: tipo['nombre']
    });

    const msg = nuevoEstado ? 'activado' : 'desactivado';
    res.json({ success: true, message: `Tipo de repuesto ${msg} exitosamente`, data: tipo });
  } catch (error) {
    console.error('Error toggleActive SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del tipo de repuesto' });
  }
};
