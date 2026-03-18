const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Reporte = require('../../models/Biomedica/Reporte');
const Equipo = require('../../models/Biomedica/Equipo');
const Servicio = require('../../models/generales/Servicio');
const Usuario = require('../../models/generales/Usuario');
const Sede = require('../../models/generales/Sede');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Cargo = require('../../models/generales/Cargo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para guardar archivos en C:\AppHusrt\Biomedica\reportes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'C:/AppHusrt/Biomedica/reportes';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reporte-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Preventivos en rango de meses
router.post('/reportes/preventivosrango', async (req, res) => {
  try {
    const { mesInicio, mesFin, anio } = req.body;
    if (!mesInicio || !mesFin || !anio) {
      return res.status(400).json({ error: 'Se requieren los parámetros mesInicio, mesFin y anio' });
    }

    const reportes = await Reporte.findAll({
      where: {
        tipoMantenimiento: 'Preventivo',
        mesProgramado: {
          [Op.between]: [parseInt(mesInicio), parseInt(mesFin)]
        },
        añoProgramado: parseInt(anio),
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes preventivos por rango', detalle: error.message });
  }
});

// ...

// Correctivos en rango de meses (rango amplio)
router.post('/reportes/correctivosrango', async (req, res) => {
  try {
    const { mesInicio, mesFin, anio } = req.body;

    if (!mesInicio || !mesFin || !anio) {
      return res.status(400).json({ error: 'Debe proporcionar mesInicio, mesFin y año' });
    }

    // Fecha inicio: Dia 1 del mesInicio
    const fechaInicio = new Date(anio, mesInicio - 1, 1);
    // Fecha fin: Ultimo dia del mesFin
    const fechaFin = new Date(anio, mesFin, 0);

    const reportes = await Reporte.findAll({
      where: {
        tipoMantenimiento: 'Correctivo',
        fechaRealizado: {
          [Op.between]: [fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0]],
        },
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes correctivos por rango', detalle: error.message });
  }
});
router.get('/reportes', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      include: [
        { model: Equipo, as: 'equipo' },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
      order: [['fecha', 'DESC']]
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los reportes', detalle: error.message });
  }
});

// Obtener un reporte por ID
router.get('/reporte/:id', async (req, res) => {
  try {
    const ValorMedicionPreventivo = require('../../models/Biomedica/ValorMedicionPreventivo');
    const MedicionPreventivo = require('../../models/Biomedica/MedicionPreventivo');
    const RepuestoReporte = require('../../models/Biomedica/RepuestoReporte');
    const CumplimientoCondicionInicial = require('../../models/Biomedica/CumplimientoCondicionInicial');
    const CondicionInicial = require('../../models/Biomedica/CondicionInicial');
    const CumplimientoProtocoloPreventivo = require('../../models/Biomedica/CumplimientoProtocoloPreventivo');
    const ProtocoloPreventivo = require('../../models/Biomedica/ProtocoloPreventivo');
    const Responsable = require('../../models/Biomedica/Responsable');

    const reporte = await Reporte.findByPk(req.params.id, {
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: Responsable, as: 'responsables' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        },
        {
          model: Equipo,
          as: 'equipoPatron'
        },
        {
          model: ValorMedicionPreventivo,
          as: 'valoresMediciones',
          include: [{ model: MedicionPreventivo, as: 'medicion' }]
        },
        {
          model: RepuestoReporte,
          as: 'repuestos'
        },
        {
          model: CumplimientoCondicionInicial,
          as: 'cumplimientoCondicionesIniciales',
          include: [{ model: CondicionInicial, as: 'condicionInicial' }]
        },
        {
          model: CumplimientoProtocoloPreventivo,
          as: 'cumplimientoProtocolo',
          include: [{ model: ProtocoloPreventivo, as: 'protocolo' }]
        }
      ]
    });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(reporte);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Error al obtener el reporte', detalle: error.message, stack: error.stack });
  }
});

// Crear un nuevo reporte
router.post('/addreporte', async (req, res) => {
  try {
    const nuevoReporte = await Reporte.create(req.body);
    const { mediciones } = req.body;

    // Guardar valores de mediciones específicas si existen
    if (mediciones && Array.isArray(mediciones)) {
      const ValorMedicionPreventivo = require('../../models/Biomedica/ValorMedicionPreventivo');
      for (const medicion of mediciones) {
        if (medicion.id && medicion.valor !== undefined) {
          await ValorMedicionPreventivo.create({
            valor: medicion.valor,
            medicionIdFk: medicion.id,
            reporteIdFk: nuevoReporte.id
          });
        }
      }
    }

    // Guardar repuestos si existen
    const { repuestos } = req.body;
    if (repuestos && Array.isArray(repuestos)) {
      const RepuestoReporte = require('../../models/Biomedica/RepuestoReporte');
      for (const repuesto of repuestos) {
        await RepuestoReporte.create({
          nombreInsumo: repuesto.nombreInsumo,
          cantidad: repuesto.cantidad,
          comprobanteEgreso: repuesto.comprobanteEgreso,
          reporteIdFk: nuevoReporte.id
        });
      }
    }

    // Guardar condiciones iniciales
    const { condicionesIniciales } = req.body;
    if (condicionesIniciales && Array.isArray(condicionesIniciales)) {
      const CumplimientoCondicionInicial = require('../../models/Biomedica/CumplimientoCondicionInicial');
      for (const cond of condicionesIniciales) {
        if (cond.id) {
          // Here cond.id is the CondicionInicial ID (definition), not the cumplimiento ID.
          // But we need to be careful what the frontend sends.
          // Assuming frontend sends { id: <CondicionInicialId>, cumple: <val>, observacion: <val> }
          // Wait, if it's new report, we create entries.
          await CumplimientoCondicionInicial.create({
            cumple: cond.cumple,
            observacion: cond.observacion,
            condicionInicialIdFk: cond.id,
            reporteIdFk: nuevoReporte.id
          });
        }
      }
    }

    // Registrar trazabilidad
    if (req.user && req.user.id && nuevoReporte.equipoIdFk) {
      const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
      await Trazabilidad.create({
        accion: 'NUEVO REPORTE',
        detalles: `Se creó un reporte de tipo: ${nuevoReporte.tipoMantenimiento}. ID Reporte: ${nuevoReporte.id}`,
        equipoIdFk: nuevoReporte.equipoIdFk,
        usuarioIdFk: req.user.id
      });
    }

    // Actualizar calificación del equipo
    if (nuevoReporte.equipoIdFk && nuevoReporte.calificacion) {
      const equipo = await Equipo.findByPk(nuevoReporte.equipoIdFk);
      if (equipo) {
        equipo.calificacion = nuevoReporte.calificacion;
        await equipo.save();
      }
    }

    res.status(201).json(nuevoReporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el reporte', detalle: error.message });
  }
});

// Actualizar un reporte
router.put('/actualizarreporte/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    // Clonar datos anteriores para comparacion
    const oldData = reporte.toJSON();

    await reporte.update(req.body);

    const newData = reporte.toJSON();
    const cambios = {};

    // Campos a monitorear
    const camposMonitoreados = ['usuarioIdFk', 'mesProgramado', 'añoProgramado', 'anioProgramado'];

    camposMonitoreados.forEach(field => {
      let oldVal = oldData[field];
      let newVal = newData[field];

      // Normalizar comparación (undefined vs null vs empty)
      if (oldVal != newVal) {
        cambios[field] = { anterior: oldVal, nuevo: newVal };
      }
    });

    if (Object.keys(cambios).length > 0 && req.user && req.user.id) {
      const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
      // Buscar ID Equipo asociado al reporte
      // Si reporte ya tiene equipoIdFk, usarlo. Si no, quizas no se pueda ligar al equipo (pero reporte debe tener equipo)
      if (reporte.equipoIdFk) {
        await Trazabilidad.create({
          accion: 'EDICIÓN DE PROGRAMACIÓN DE MANTENIMIENTO PREVENTIVO',
          detalles: JSON.stringify(cambios),
          equipoIdFk: reporte.equipoIdFk,
          usuarioIdFk: req.user.id,
          fecha: new Date()
        });
      }
    }

    // Actualizar Mediciones Específicas
    const { mediciones } = req.body;
    if (mediciones && Array.isArray(mediciones)) {
      const ValorMedicionPreventivo = require('../../models/Biomedica/ValorMedicionPreventivo');
      for (const medicion of mediciones) {
        if (medicion.id && medicion.valor !== undefined) {
          // Check if exists
          const existingVal = await ValorMedicionPreventivo.findOne({
            where: {
              reporteIdFk: reporte.id,
              medicionIdFk: medicion.id
            }
          });

          if (existingVal) {
            await existingVal.update({
              valor: medicion.valor,
              unidadRegistrada: medicion.unidadRegistrada,
              conforme: medicion.conforme
            });
          } else {
            await ValorMedicionPreventivo.create({
              valor: medicion.valor,
              unidadRegistrada: medicion.unidadRegistrada,
              conforme: medicion.conforme,
              medicionIdFk: medicion.id,
              reporteIdFk: reporte.id
            });
          }
        }
      }
    }

    // Actualizar Repuestos
    const { repuestos } = req.body;
    if (repuestos && Array.isArray(repuestos)) {
      const RepuestoReporte = require('../../models/Biomedica/RepuestoReporte');

      // Get existing IDs to handle deletions if needed (optional, or just update/create)
      // Strategy: Upsert existing ones provided with ID, create new ones without ID.
      // Ideally, deleted ones should be removed. For now, let's implement upsert.

      // Simplify: Create new provided ones or update if id exists.
      // If we want to support deletion, the frontend should maybe identify what to delete?
      // Or we can delete all and recreate? NO, ID churn.
      // Let's iterate.

      for (const repuesto of repuestos) {
        if (repuesto.id) {
          const existingRep = await RepuestoReporte.findByPk(repuesto.id);
          if (existingRep) {
            await existingRep.update({
              nombreInsumo: repuesto.nombreInsumo,
              cantidad: repuesto.cantidad,
              comprobanteEgreso: repuesto.comprobanteEgreso
            });
          }
        } else {
          await RepuestoReporte.create({
            nombreInsumo: repuesto.nombreInsumo,
            cantidad: repuesto.cantidad,
            comprobanteEgreso: repuesto.comprobanteEgreso,
            reporteIdFk: reporte.id
          });
        }
      }
    }

    // Actualizar Condiciones Iniciales
    const { condicionesIniciales } = req.body;
    if (condicionesIniciales && Array.isArray(condicionesIniciales)) {
      const CumplimientoCondicionInicial = require('../../models/Biomedica/CumplimientoCondicionInicial');
      for (const cond of condicionesIniciales) {
        // Frontend might send the definition ID as 'id' or maybe 'condicionInicialIdFk'?
        // Let's assume 'id' is the definition ID if it's new, or we look for existing cumplimiento.

        // Strategy: Check if compliance exists for this report and condition definition.

        if (cond.id) {
          const existing = await CumplimientoCondicionInicial.findOne({
            where: {
              reporteIdFk: reporte.id,
              condicionInicialIdFk: cond.id
            }
          });

          if (existing) {
            await existing.update({
              cumple: cond.cumple,
              observacion: cond.observacion
            });
          } else {
            await CumplimientoCondicionInicial.create({
              cumple: cond.cumple,
              observacion: cond.observacion,
              condicionInicialIdFk: cond.id,
              reporteIdFk: reporte.id
            });
          }
        }
      }
    }

    // Actualizar calificación del equipo
    if (reporte.equipoIdFk && reporte.calificacion) {
      const equipo = await Equipo.findByPk(reporte.equipoIdFk);
      if (equipo) {
        equipo.calificacion = reporte.calificacion;
        await equipo.save();
      }
    }

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el reporte', detalle: error.message });
  }
});

// Eliminar un reporte
router.delete('/remreporte/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    await reporte.destroy();
    res.json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el reporte', detalle: error.message });
  }
});

// Obtener reportes por equipo
router.get('/reportes/equipo/:id', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { equipoIdFk: req.params.id },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
      order: [['createdAt', 'DESC']] // 🔹 Ordena del último al primero
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener reportes por equipo',
      detalle: error.message
    });
  }
});

router.post('/reportes/preventivosmes', async (req, res) => {
  try {
    const { mes, anio } = req.body;
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Se requieren los parámetros mes y anio' });
    }

    const reportes = await Reporte.findAll({
      where: {
        tipoMantenimiento: 'Preventivo',
        mesProgramado: parseInt(mes),
        añoProgramado: parseInt(anio),
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes preventivos programados', detalle: error.message });
  }
});

// Correctivos por Mes
router.post('/reportes/correctivosmes', async (req, res) => {
  try {
    const { mes, anio } = req.body;
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Se requieren los parámetros mes y anio' });
    }

    // Calcular fecha inicio y fin del mes
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const reportes = await Reporte.findAll({
      where: {
        tipoMantenimiento: 'Correctivo',
        fechaRealizado: {
          [Op.between]: [fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0]]
        }
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
        },
        {
          model: Servicio,
          as: 'servicio',
          include: [{ model: Sede, as: 'sede' }]
        },
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }]
        }
      ],
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes correctivos del mes', detalle: error.message });
  }
});





// Obtener reportes por servicio
router.get('/reportes/servicio/:id', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { servicioIdFk: req.params.id },
      include: [{
        model: Equipo,
        as: 'equipo',
        include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
      }, 'servicio', { model: Usuario, as: 'usuario', include: [{ model: Cargo, as: 'cargo' }] }]
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes por servicio', detalle: error.message });
  }
});

// Obtener reportes por usuario
router.get('/reportes/usuario/:id', async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { usuarioIdFk: req.params.id },
      include: [{
        model: Equipo,
        as: 'equipo',
        include: [{ model: TipoEquipo, as: 'tipoEquipos' }]
      }, 'servicio', { model: Usuario, as: 'usuario', include: [{ model: Cargo, as: 'cargo' }] }]
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes por usuario', detalle: error.message });
  }
});



router.get('/reportes/rango', async (req, res) => {
  try {
    const { inicio, fin, limit = 100, offset = 0 } = req.query;

    if (!inicio || !fin) {
      return res.status(400).json({
        error: 'Debe proporcionar los parámetros de fecha "inicio" y "fin" en formato YYYY-MM-DD'
      });
    }

    const isYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (!isYYYYMMDD(inicio) || !isYYYYMMDD(fin)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD.' });
    }
    const reportes = await Reporte.findAll({
      where: {
        fechaRealizado: {
          [Op.gte]: inicio,
          [Op.lte]: fin,
        },
      },
      include: [
        {
          model: Equipo,
          as: 'equipo',
          include: [
            { model: Servicio, as: 'servicios' },
            { model: TipoEquipo, as: 'tipoEquipos' }
          ]
        },
        { model: Usuario, as: 'usuario', include: [{ model: Cargo, as: 'cargo' }] },
        { model: Servicio, as: 'servicio' },
      ],
      order: [['fechaRealizado', 'DESC'], ['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener reportes por rango de fechas',
      detalle: error.message,
    });
  }
});

// Subir PDF de reporte
router.post('/uploadreportepdf/:id', upload.single('reportePdf'), async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    if (reporte.rutaPdf) {
      return res.status(400).json({ error: 'El reporte ya tiene un PDF asignado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    await reporte.update({ rutaPdf: req.file.path });
    res.json({ mensaje: 'PDF subido correctamente', rutaPdf: req.file.path });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el PDF', detalle: error.message });
  }
});

module.exports = router;
