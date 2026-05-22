const SysAuditoriaRepuesto = require('../../models/Sistemas/SysAuditoriaRepuesto');

// Obtener historial de auditoría
// Query params opcionales: tabla_origen, id_registro
exports.getAll = async (req, res) => {
  try {
    const { tabla_origen, id_registro } = req.query;
    const where = {};

    if (tabla_origen) where.tabla_origen = tabla_origen;
    if (id_registro) where.id_registro = parseInt(id_registro, 10);

    const registros = await SysAuditoriaRepuesto.findAll({
      where,
      order: [['fecha_hora', 'DESC']]
    });

    res.json({ success: true, data: registros });
  } catch (error) {
    console.error('Error getAll SysAuditoriaRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial de auditoría' });
  }
};
