const express = require('express');
const router = express.Router();
const SysPlanMantenimiento = require('../../models/Sistemas/SysPlanMantenimiento');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const Servicio = require('../../models/generales/Servicio');

// GET /sysplanmantenimiento → todos los planes
router.get('/', async (req, res) => {
  try {
    const planes = await SysPlanMantenimiento.findAll({
      include: [{ model: SysEquipo, as: 'equipo' }],
      order: [['ano', 'ASC'], ['mes', 'ASC']]
    });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los planes', detalle: error.message });
  }
});

// GET /sysplanmantenimiento/equipo/:idEquipo → planes de un equipo
router.get('/equipo/:idEquipo', async (req, res) => {
  try {
    const planes = await SysPlanMantenimiento.findAll({
      where: { id_sysequipo_fk: req.params.idEquipo },
      order: [['ano', 'ASC'], ['mes', 'ASC']]
    });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los planes', detalle: error.message });
  }
});

// POST /sysplanmantenimiento/mes → planes por mes y año
router.post('/mes', async (req, res) => {
  try {
    const { mes, ano } = req.body;

        if (!mes || !ano) {
            return res.status(400).json({ error: 'Mes y año son requeridos' });
        }
        const planes = await SysPlanMantenimiento.findAll({
            where: {
                mes: parseInt(mes),
                ano: parseInt(ano)
            },
            include: [{
                model: SysEquipo,
                as: 'equipo',
                where: { estado_baja: false },
                required: true,
                include: { model: Servicio, as: 'servicio' }
            }]
        });
    res.json(planes);
  } catch (error) {
     console.error(error);
    res.status(500).json({ error: 'Error al obtener los planes', detalle: error.message });
  }
});

router.get('/planmantenimientotipoequipo/:idtipoequipo', async (req, res) => {
    try {
        const tipoEquipoId = req.params.idtipoequipo;

        if (!tipoEquipoId) {
            return res.status(400).json({ error: 'El parámetro tipoEquipoId es requerido' });
        }
        const planes = await SysPlanMantenimiento.findAll({
            include: {
                model: SysEquipo,
                as: 'equipo',
                required: true,
                where: {
                    id_tipo_equipo_fk: tipoEquipoId,
                    estado_baja: false
               },
                include: { model: Servicio, as: 'servicio' }
            }
        });
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener los planes de mantenimiento',
            detalle: error.message
        });
    }
});

router.get('/planmantenimientoservicio/:idservicio', async (req, res) => {
    try {
        const servicioId = req.params.idservicio;

        if (!servicioId) {
            return res.status(400).json({ error: 'El parámetro servicioId es requerido' });
        }
        const planes = await SysPlanMantenimiento.findAll({
            include: {
                model: SysEquipo,
                as: 'equipo',
                required: true,
                where: {
                    id_servicio_fk: servicioId,
                    estado_baja: false
                },
                include: { model: Servicio, as: 'servicio' }
            }
        });
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener los planes de mantenimiento',
            detalle: error.message
        });
    }
});

// GET /sysplanmantenimiento/:id → un plan por ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await SysPlanMantenimiento.findByPk(req.params.id, {
      include: [{ model: SysEquipo, as: 'equipo' }]
    });
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el plan', detalle: error.message });
  }
});

// POST /sysplanmantenimiento → crear plan
router.post('/', async (req, res) => {
  try {
    const plan = await SysPlanMantenimiento.create(req.body);
    SysTrazabilidad.create({
      accion: 'PLAN_MANTENIMIENTO',
      detalles: `Mes ${plan.mes}/${plan.ano} añadido al plan`,
      id_sysequipo_fk: plan.id_sysequipo_fk,
      id_sysusuario_fk: req.user?.id || null
    }).catch(err => console.error('Error trazabilidad plan:', err));
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el plan', detalle: error.message });
  }
});

// PUT /sysplanmantenimiento/equipo/:idEquipo/reemplazar → elimina planes existentes y crea los nuevos
router.put('/equipo/:idEquipo/reemplazar', async (req, res) => {
  const sequelize = SysPlanMantenimiento.sequelize;
  const t = await sequelize.transaction();
  try {
    const { planes } = req.body; // Array de { mes, ano, rango_inicio, rango_fin }
    if (!Array.isArray(planes)) {
      await t.rollback();
      return res.status(400).json({ error: 'El campo planes debe ser un array' });
    }
    await SysPlanMantenimiento.destroy({ where: { id_sysequipo_fk: req.params.idEquipo }, transaction: t });
    const nuevos = planes.map(p => ({ ...p, id_sysequipo_fk: req.params.idEquipo }));
    const creados = await SysPlanMantenimiento.bulkCreate(nuevos, { transaction: t });
    await t.commit();

    // Registrar en trazabilidad (aislado para no afectar la respuesta si falla)
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const detallesPlan = planes.map(p => `${MESES[p.mes - 1]} ${p.ano}`).join(' · ');
    SysTrazabilidad.create({
      accion: 'PLAN_MANTENIMIENTO',
      detalles: `Plan actualizado: ${detallesPlan}`,
      id_sysequipo_fk: req.params.idEquipo,
      id_sysusuario_fk: req.user?.id || null
    }).catch(err => console.error('Error al registrar trazabilidad del plan:', err));

    res.json(creados);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al reemplazar los planes', detalle: error.message });
  }
});

// PUT /sysplanmantenimiento/:id → actualizar plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await SysPlanMantenimiento.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
    await plan.update(req.body);
    SysTrazabilidad.create({
      accion: 'PLAN_MANTENIMIENTO',
      detalles: `Mes ${plan.mes}/${plan.ano} actualizado`,
      id_sysequipo_fk: plan.id_sysequipo_fk,
      id_sysusuario_fk: req.user?.id || null
    }).catch(err => console.error('Error trazabilidad plan:', err));
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el plan', detalle: error.message });
  }
});

// DELETE /sysplanmantenimiento/:id → eliminar plan
router.delete('/:id', async (req, res) => {
  try {
    const plan = await SysPlanMantenimiento.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
    SysTrazabilidad.create({
      accion: 'PLAN_MANTENIMIENTO',
      detalles: `Mes ${plan.mes}/${plan.ano} eliminado del plan`,
      id_sysequipo_fk: plan.id_sysequipo_fk,
      id_sysusuario_fk: req.user?.id || null
    }).catch(err => console.error('Error trazabilidad plan:', err));
    await plan.destroy();
    res.json({ mensaje: 'Plan eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el plan', detalle: error.message });
  }
});

module.exports = router;
