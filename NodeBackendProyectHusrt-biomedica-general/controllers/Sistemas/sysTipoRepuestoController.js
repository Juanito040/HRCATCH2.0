const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');

// Obtener todos los tipos de repuesto
exports.getAll = async (req, res) => {
  try {
    const tipos = await SysTipoRepuesto.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error('Error getAll SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tipos de repuesto' });
  }
};

// Obtener tipo por ID
exports.getById = async (req, res) => {
  try {
    const tipo = await SysTipoRepuesto.findByPk(req.params.id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });
    res.json({ success: true, data: tipo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el tipo de repuesto' });
  }
};

// Crear tipo de repuesto
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const tipo = await SysTipoRepuesto.create({ nombre, descripcion });
    res.status(201).json({ success: true, message: 'Tipo de repuesto creado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error create SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el tipo de repuesto' });
  }
};

// Actualizar tipo de repuesto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const [affected] = await SysTipoRepuesto.update({ nombre, descripcion }, { where: { id_sys_tipo_repuesto: id } });
    if (affected === 0) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });

    const tipo = await SysTipoRepuesto.findByPk(id);
    res.json({ success: true, message: 'Tipo de repuesto actualizado exitosamente', data: tipo });
  } catch (error) {
    console.error('Error update SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el tipo de repuesto' });
  }
};

// Activar / Desactivar tipo de repuesto
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await SysTipoRepuesto.findByPk(id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });

    await tipo.update({ is_active: !tipo.is_active });
    const msg = tipo.is_active ? 'activado' : 'desactivado';
    res.json({ success: true, message: `Tipo de repuesto ${msg} exitosamente`, data: tipo });
  } catch (error) {
    console.error('Error toggleActive SysTipoRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del tipo de repuesto' });
  }
};

// Eliminar (borrado físico) tipo de repuesto
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await SysTipoRepuesto.findByPk(id);
    if (!tipo) return res.status(404).json({ success: false, message: 'Tipo de repuesto no encontrado' });

    await tipo.destroy();
    res.json({ success: true, message: 'Tipo de repuesto eliminado físicamente' });
  } catch (error) {
    console.error('Error delete SysTipoRepuesto:', error);
    // Si falla suele ser porque tiene repuestos asociados por foreign key
    res.status(500).json({ success: false, message: 'Error al eliminar el tipo de repuesto. Verifica que no tenga repuestos asociados.' });
  }
};
