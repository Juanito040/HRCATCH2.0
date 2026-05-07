const express = require('express');
const router = express.Router();
const service = require('./../../services/sistemas/SysProgramacionPreventivosService');

/**
 * POST /sysprogramacion/programacion-preventivos
 */
router.post('/programacion-preventivos', async (req, res) => {
  try {
    const { mes, anio } = req.body;

    if (!mes || !anio) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar mes y anio en el cuerpo de la solicitud',
      });
    }

    const yaExiste = await service.existeProgramacion(mes, anio);
    if (yaExiste) {
      return res.status(400).json({
        success: false,
        error: 'Ya se realizó la programación de mantenimientos para el mes y año seleccionados',
      });
    }

    const { reportes, mensaje } = await service.programarPreventivos(mes, anio);

    const status = reportes.length === 0 ? 200 : 201;
    return res.status(status).json({ success: true, message: mensaje, data: reportes });
  } catch (error) {
    console.error('Error en programacion-preventivos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al programar los mantenimientos preventivos',
      detalle: error.message,
    });
  }
});

/**
 * GET /sysprogramacion/programaciones
 */
router.get('/programaciones', async (req, res) => {
  try {
    const data = await service.getProgramaciones();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener programaciones' });
  }
});

/**
 * GET /sysprogramacion/programacionPreventivaMeses
 */
router.get('/programacionPreventivaMeses', async (req, res) => {
  try {
    const meses = await service.getProgramacionMeses();
    res.json(meses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los meses programados', detalle: error.message });
  }
});

module.exports = router;