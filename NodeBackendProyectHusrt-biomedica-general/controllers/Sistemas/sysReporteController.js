const service    = require('../../services/sistemas/SysReporteService');
const pdfService = require('../../services/sistemas/SysReportePdfService');

// ─── Helper ───────────────────────────────────────────────────────────────────

const resolveErrorStatus = (err) => err.statusCode ?? 500;

// ─── Catálogos ────────────────────────────────────────────────────────────────

exports.getCatalogoTiposMantenimiento = (req, res) => {
  res.json({ success: true, data: service.getCatalogoTiposMantenimiento() });
};

exports.getCatalogoTiposFalla = (req, res) => {
  res.json({ success: true, data: service.getCatalogoTiposFalla() });
};

// ─── Queries ──────────────────────────────────────────────────────────────────

exports.getAllReportes = async (req, res) => {
  try {
    const data = await service.getAllReportes(req.query);
    res.json(data);
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: 'Error al obtener los reportes', detalle: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await service.getDashboard(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al obtener dashboard' });
  }
};

exports.getByEquipo = async (req, res) => {
  try {
    const data = await service.getByEquipo(req.params.idEquipo);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al obtener reportes del equipo' });
  }
};

exports.getByTecnico = async (req, res) => {
  try {
    const data = await service.getByTecnico(req.params.idUsuario, req.query);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al obtener reportes del técnico' });
  }
};

exports.getReportesByUsuario = async (req, res) => {
  try {
    const data = await service.getReportesByUsuario(req.params.idUsuario);
    res.json(data);
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ error: 'Error al obtener reportes por usuario', detalle: err.message });
  }
};

exports.getReporteById = async (req, res) => {
  try {
    const data = await service.getReporteById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: err.message });
  }
};

// ─── Mutaciones ───────────────────────────────────────────────────────────────

exports.createReporte = async (req, res) => {
  try {
    const data = await service.createReporte(req.body);
    res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al crear reporte', error: err.message });
  }
};

exports.updateReporte = async (req, res) => {
  try {
    const data = await service.updateReporte(req.params.id, req.body);
    res.json({ success: true, message: 'Reporte actualizado', data });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al actualizar reporte', error: err.message });
  }
};

exports.deleteReporte = async (req, res) => {
  try {
    await service.deleteReporte(req.params.id);
    res.json({ success: true, message: 'Reporte eliminado' });
  } catch (err) {
    res.status(resolveErrorStatus(err)).json({ success: false, message: 'Error al eliminar reporte', error: err.message });
  }
};

// ─── PDFs ─────────────────────────────────────────────────────────────────────

exports.exportarPdfReporte = async (req, res) => {
  try {
    const { buffer, filename } = await pdfService.generarPdfReporte(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    if (!res.headersSent)
      res.status(resolveErrorStatus(err)).json({ success: false, message: err.message });
  }
};

exports.exportarPdfBaja = async (req, res) => {
  try {
    const { buffer, filename } = await pdfService.generarPdfBaja(req.params.bajaId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    if (!res.headersSent)
      res.status(resolveErrorStatus(err)).json({ success: false, message: err.message });
  }
};