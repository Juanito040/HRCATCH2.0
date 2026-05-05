const express = require('express');
const router = express.Router();
const Equipo = require('../../models/Biomedica/Equipo');
const Usuario = require('../../models/generales/Usuario');
const Servicio = require('../../models/generales/Servicio');
const ActividadMetrologica = require('../../models/Biomedica/ActividadMetrologica');


// Obtener todas las actividades metrológicas
router.get('/actividades', async (req, res) => {
  try {
    const actividades = await ActividadMetrologica.findAll({
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Usuario, as: 'usuarioAprobo' }
      ],
      order: [['fecha', 'DESC']]
    });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las actividades', detalle: error.message });
  }
});

// Obtener una actividad por ID
router.get('/actividad/:id', async (req, res) => {
  try {
    const actividad = await ActividadMetrologica.findByPk(req.params.id, {
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Usuario, as: 'usuarioAprobo' }
      ]
    });
    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(actividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la actividad', detalle: error.message });
  }
});

// Crear una nueva actividad
router.post('/addactividad', async (req, res) => {
  try {
    const nuevaActividad = await ActividadMetrologica.create(req.body);
    res.status(201).json(nuevaActividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la actividad', detalle: error.message });
  }
});

// Actualizar una actividad
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = '';

    if (file.fieldname === 'confirmacionMetrologica') {
      dir = 'C:/AppHusrt/Biomedica/ConfirmacionMetrologica';
    } else {
      // Sanitizar el nombre de la carpeta (reemplazar espacios y caracteres especiales)
      const tipoFolder = req.body.tipoActividad ? req.body.tipoActividad.trim() : 'Otros';
      dir = path.join('C:/AppHusrt/Biomedica', tipoFolder);
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const uploadFields = upload.fields([
  { name: 'rutaReporte', maxCount: 1 },
  { name: 'confirmacionMetrologica', maxCount: 1 }
]);

// Actualizar una actividad (con archivos opcionales)
router.put('/actactividad/:id', uploadFields, async (req, res) => {
  try {
    console.log('--- ACTUALIZANDO ACTIVIDAD METROLOGICA ---');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const actividad = await ActividadMetrologica.findByPk(req.params.id);
    if (!actividad) {
      console.log('Actividad no encontrada');
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Preparar datos para actualizar
    const datosActualizados = {
      ...req.body,
      realizado: true // Marcar como realizado al actualizar
    };

    // Si se subió reporte
    if (req.files && req.files['rutaReporte']) {
      datosActualizados.rutaReporte = req.files['rutaReporte'][0].path;
    }

    // Si se subió confirmación metrológica
    if (req.files && req.files['confirmacionMetrologica']) {
      datosActualizados.confirmacionMetrologica = req.files['confirmacionMetrologica'][0].path;
    }

    try {
      await actividad.update(datosActualizados);
    } catch (err) {
      throw err;
    }

    res.json(actividad);
  } catch (error) {
    console.error('ERROR AL ACTUALIZAR ACTIVIDAD:', error);
    res.status(500).json({ error: 'Error al actualizar la actividad', detalle: error.message });
  }
});

// Crear nueva actividad con archivo (POST)
router.post('/addactividadWithFile', uploadFields, async (req, res) => {
  try {
    console.log('--- CREANDO ACTIVIDAD METROLOGICA CON ARCHIVO ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Preparar datos para crear
    const datosCreacion = {
      ...req.body,
      realizado: true
    };

    // Auto-calculate scheduled date if missing
    if (datosCreacion.fechaRealizado && (!datosCreacion.mesProgramado || !datosCreacion.añoProgramado)) {
      const fecha = new Date(datosCreacion.fechaRealizado);
      if (!isNaN(fecha.getTime())) {
        datosCreacion.mesProgramado = datosCreacion.mesProgramado || (fecha.getMonth() + 1);
        datosCreacion.añoProgramado = datosCreacion.añoProgramado || fecha.getFullYear();
      }
    }

    // Si se subió reporte
    if (req.files && req.files['rutaReporte']) {
      datosCreacion.rutaReporte = req.files['rutaReporte'][0].path;
    }

    // Si se subió confirmación metrológica
    if (req.files && req.files['confirmacionMetrologica']) {
      datosCreacion.confirmacionMetrologica = req.files['confirmacionMetrologica'][0].path;
    }

    const nuevaActividad = await ActividadMetrologica.create(datosCreacion);
    res.status(201).json(nuevaActividad);

  } catch (error) {
    console.error('ERROR AL CREAR ACTIVIDAD:', error);
    res.status(500).json({ error: 'Error al crear la actividad', detalle: error.message });
  }
});

// Descargar reporte de actividad metrológica
router.get('/downloadReporte/:id', async (req, res) => {
  try {
    const actividad = await ActividadMetrologica.findByPk(req.params.id);
    if (!actividad || !actividad.rutaReporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const filePath = actividad.rutaReporte;

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'El archivo físico no existe en el servidor' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error al descargar reporte:', error);
    res.status(500).json({ error: 'Error al descargar el reporte' });
  }
});

// Eliminar una actividad
router.delete('/remactividad/:id', async (req, res) => {
  try {
    const actividad = await ActividadMetrologica.findByPk(req.params.id);
    if (!actividad) return res.status(404).json({ error: 'Actividad no encontrada' });

    await actividad.destroy();
    res.json({ mensaje: 'Actividad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la actividad', detalle: error.message });
  }
});

// Obtener actividades por equipo
router.get('/actividadesequipo/:id', async (req, res) => {
  try {
    const actividades = await ActividadMetrologica.findAll({
      where: { equipoIdFk: req.params.id },
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Usuario, as: 'usuarioAprobo' }
      ]
    });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener actividades por equipo', detalle: error.message });
  }
});

// Obtener actividades por usuario
router.get('/actividades/usuario/:id', async (req, res) => {
  try {
    const actividades = await ActividadMetrologica.findAll({
      where: { usuarioIdFk: req.params.id },
      include: [
        { model: Equipo, as: 'equipo' },
        { model: Usuario, as: 'usuarioAprobo' }
      ]
    });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener actividades por usuario', detalle: error.message });
  }
});

router.post('/reportesMetrologicosmes', async (req, res) => {
  try {
    const { mes, anio } = req.body;
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Se requieren los parámetros mes y anio' });
    }

    const actividades = await ActividadMetrologica.findAll({
      where: {
        mesProgramado: parseInt(mes),
        añoProgramado: parseInt(anio),
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [
            {
              model: Servicio,
              as: 'servicios'
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioAprobo' // ⚠️ Asegúrate de que este alias también esté bien definido
        }
      ],
    });

    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes de actividades metrologicas en el periodo seleccionado', detalle: error.message });
  }
});

module.exports = router;
