const express = require('express');
const router = express.Router();
const service = require('../../services/sistemas/SysCumplimientoProtocoloService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resuelve el status HTTP a partir del statusCode que el service
 * puede adjuntar al error, con 500 como fallback.
 */
const resolveErrorStatus = (error) => error.statusCode ?? 500;

// ─── Rutas ────────────────────────────────────────────────────────────────────

/**
 * GET /cumplimientos
 * Lista todos los cumplimientos.
 */
router.get('/cumplimientos', async (req, res) => {
  try {
    const data = await service.getCumplimientos();
    res.json(data);
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al obtener los cumplimientos',
      detalle: error.message,
    });
  }
});

/**
 * GET /cumplimientos/mantenimiento/:id
 * Lista los cumplimientos de un reporte/mantenimiento específico.
 */
router.get('/cumplimientos/mantenimiento/:id', async (req, res) => {
  try {
    const data = await service.getCumplimientosByReporte(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al obtener los cumplimientos del reporte',
      detalle: error.message,
    });
  }
});

/**
 * GET /cumplimiento/:id
 * Obtiene un cumplimiento por su ID.
 */
router.get('/cumplimiento/:id', async (req, res) => {
  try {
    const data = await service.getCumplimientoById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al obtener el cumplimiento',
      detalle: error.message,
    });
  }
});

/**
 * POST /addcumplimiento
 * Crea o actualiza (upsert) un cumplimiento.
 * Responde 201 si fue creado, 200 si fue actualizado.
 */
router.post('/addcumplimiento', async (req, res) => {
  try {
    const { data, created } = await service.upsertCumplimiento(req.body);
    res.status(created ? 201 : 200).json(data);
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al procesar el cumplimiento',
      detalle: error.message,
    });
  }
});

/**
 * PUT /actcumplimiento/:id
 * Actualiza un cumplimiento existente.
 */
router.put('/actcumplimiento/:id', async (req, res) => {
  try {
    const data = await service.updateCumplimiento(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al actualizar el cumplimiento',
      detalle: error.message,
    });
  }
});

/**
 * DELETE /remcumplimiento/:id
 * Elimina un cumplimiento por ID.
 */
router.delete('/remcumplimiento/:id', async (req, res) => {
  try {
    await service.deleteCumplimiento(req.params.id);
    res.json({ mensaje: 'Cumplimiento eliminado correctamente' });
  } catch (error) {
    res.status(resolveErrorStatus(error)).json({
      error: 'Error al eliminar el cumplimiento',
      detalle: error.message,
    });
  }
});

module.exports = router;