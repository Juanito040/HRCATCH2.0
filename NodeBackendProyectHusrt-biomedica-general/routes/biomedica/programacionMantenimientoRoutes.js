const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const PlanMantenimiento = require('../../models/Biomedica/PlanMantenimiento');
const Reporte = require('../../models/Biomedica/Reporte');
const Usuario = require('../../models/generales/Usuario');
const Equipo = require('../../models/Biomedica/Equipo');
const ProgramacionPreventivoMes = require('../../models/Biomedica/ProgramacionPreventivoMes');
const Responsable = require('../../models/Biomedica/Responsable');

//programar mantenimientos preventivos
router.get('/programacion-preventiva-meses', async (req, res) => {
  try {
    const meses = await ProgramacionPreventivoMes.findAll();
    res.json(meses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los meses programados', detalle: error.message });
  }
});
router.post('/programacionpreventivos', async (req, res) => {
  const reportes = [];
  try {
    const { mes, anio } = req.body;

    if (!mes || !anio) {
      return res.status(400).json({ error: 'Debe proporcionar mes y año en el cuerpo de la solicitud' });
    }
    const validarReportes = await ProgramacionPreventivoMes.findAll({
      where: {
        mes: mes,
        anio: anio
      }
    });
    if (validarReportes.length > 0) {
      return res.status(400).json({ error: 'Ya se realizo la programacion de mantenimientos para el mes seleccionado' });
    }
    const planMantenimiento = await PlanMantenimiento.findAll({
      where: {
        mes: mes,
        ano: anio
      },
      include: [{
        model: Equipo,
        as: 'equipo',
        where: { estadoBaja: false },
        required: true
      }],
    });
    for (const plan of planMantenimiento) {
      const nuevoReporte = {
        añoProgramado: plan.ano,
        mesProgramado: plan.mes,
        tipoMantenimiento: 'Preventivo',
        servicioIdFk: plan.equipo.servicioIdFk,
        equipoIdFk: plan.equipo.id
      };
      const reporte = await Reporte.create(nuevoReporte);
      reportes.push(reporte);
    };


    await ProgramacionPreventivoMes.create({
      mes: mes,
      anio: anio
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el plan de mantenimiento en la fecha seleccionada', detalle: error.message });
  }
});


router.post('/programacionpreventivosresponsable', async (req, res) => {
  const reportes = [];
  try {
    const { mes, anio } = req.body;

    if (!mes || !anio) {
      return res.status(400).json({ error: 'Debe proporcionar mes y año en el cuerpo de la solicitud' });
    }

    const validarReportes = await ProgramacionPreventivoMes.findAll({
      where: {
        mes: mes,
        anio: anio
      }
    });
    if (validarReportes.length > 0) {
      return res.status(400).json({ error: 'Ya se realizó la programación de mantenimientos para el mes seleccionado' });
    }
    const planMantenimiento = await PlanMantenimiento.findAll({
      where: {
        mes: mes,
        ano: anio
      },
      include: [{
        model: Equipo,
        as: 'equipo',
        where: { estadoBaja: false },
        required: true
      }]
    });

    for (const plan of planMantenimiento) {
      const nuevoReporte = {
        añoProgramado: plan.ano,
        mesProgramado: plan.mes,
        tipoMantenimiento: 'Preventivo',
        servicioIdFk: plan.equipo.servicioIdFk,
        equipoIdFk: plan.equipo.id
      };

      const reporte = await Reporte.create(nuevoReporte);
      reportes.push(reporte);
    }
    const usuarios = await Usuario.findAll({
      where: {
        estado: true,
        rolId: 7
      },
      attributes: ['id', 'registroInvima']
    });

    const usuariosComodato = await Usuario.findAll({
      where: {
        estado: true,
        rolId: 6
      },
      attributes: ['id']
    });

    console.log('Usuarios mantenimiento encontrados:', usuarios.length);
    console.log('Usuarios comodato encontrados:', usuariosComodato.length);

    if (usuarios.length === 0) {
      return res.status(400).json({ error: 'No hay técnicos (rol 7) disponibles para asignar responsables' });
    }

    // Categorizar técnicos
    // Básicos: null, 'NA', 'NR'
    // Autorizados: Cualquier otro valor (que se asume es un registro real)
    const usuariosBasicos = usuarios.filter(u => !u.registroInvima || u.registroInvima === 'NA' || u.registroInvima === 'NR');
    const usuariosAutorizados = usuarios.filter(u => u.registroInvima && u.registroInvima !== 'NA' && u.registroInvima !== 'NR');

    // Inicializar contadores de tareas (excluyendo al 59 del pool general)
    const taskCounts = {};
    usuarios.forEach(u => {
      if (u.id !== 59) {
        taskCounts[u.id] = 0;
      }
    });

    const reportesConEquipos = await Reporte.findAll({
      where: {
        id: reportes.map(r => r.id)
      },
      include: [{
        model: Equipo,
        as: 'equipo',
        attributes: ['id', 'riesgo'],
        include: [{
          model: Responsable,
          as: 'responsables',
          attributes: ['comodato']
        }]
      }]
    });

    // 1. Asignar Comodatos primero (al usuario 59)
    for (const reporte of reportesConEquipos) {
      const esComodato = reporte.equipo?.responsables?.comodato;
      if (esComodato) {
        reporte.usuarioIdFk = 59;
      }
    }

    // 2. Separar reportes no asignados por riesgo
    const reportesAltaPrioridad = reportesConEquipos.filter(r => !r.usuarioIdFk && (r.equipo?.riesgo === 'IIB' || r.equipo?.riesgo === 'III'));
    const reportesBajaPrioridad = reportesConEquipos.filter(r => !r.usuarioIdFk);

    // 3. Asignar Alta Prioridad (Solo a Autorizados)
    for (const reporte of reportesAltaPrioridad) {
      if (usuariosAutorizados.length > 0) {
        // Buscar el autorizado con menos tareas
        const poolAutorizados = usuariosAutorizados.filter(u => u.id !== 59);
        if (poolAutorizados.length > 0) {
          const uAsignado = poolAutorizados.reduce((prev, curr) => (taskCounts[prev.id] <= taskCounts[curr.id] ? prev : curr));
          reporte.usuarioIdFk = uAsignado.id;
          taskCounts[uAsignado.id]++;
        } else {
          // Fallback a básicos si no hay otros autorizados fuera del 59
          const poolBasicos = usuariosBasicos.filter(u => u.id !== 59);
          if (poolBasicos.length > 0) {
            const uAsignado = poolBasicos.reduce((prev, curr) => (taskCounts[prev.id] <= taskCounts[curr.id] ? prev : curr));
            reporte.usuarioIdFk = uAsignado.id;
            taskCounts[uAsignado.id]++;
          }
        }
      } else {
        // Fallback a básicos si no hay autorizados
        const poolBasicos = usuariosBasicos.filter(u => u.id !== 59);
        if (poolBasicos.length > 0) {
          const uAsignado = poolBasicos.reduce((prev, curr) => (taskCounts[prev.id] <= taskCounts[curr.id] ? prev : curr));
          reporte.usuarioIdFk = uAsignado.id;
          taskCounts[uAsignado.id]++;
        }
      }
    }

    // 4. Asignar Baja Prioridad (A cualquier técnico disponible fuera del 59)
    const poolGeneral = usuarios.filter(u => u.id !== 59);
    for (const reporte of reportesBajaPrioridad) {
      if (reporte.usuarioIdFk) continue; // Ya asignado arriba

      if (poolGeneral.length > 0) {
        const uAsignado = poolGeneral.reduce((prev, curr) => (taskCounts[prev.id] <= taskCounts[curr.id] ? prev : curr));
        reporte.usuarioIdFk = uAsignado.id;
        taskCounts[uAsignado.id]++;
      }
    }

    // Guardar todos los cambios
    for (const reporte of reportesConEquipos) {
      if (reporte.usuarioIdFk) {
        await reporte.save();
      }
    }

    res.json(reportesConEquipos);

    await ProgramacionPreventivoMes.create({
      mes: mes,
      anio: anio
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el plan de mantenimiento o asignar responsables',
      detalle: error.message
    });
  }
});



module.exports = router;