const { Op } = require('sequelize');
const sequelize = require('../../config/configDb');
const SysMovimientosStockRepuestos = require('../../models/Sistemas/SysMovimientosStockRepuestos');
const SysRepuesto = require('../../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');
const Usuario = require('../../models/generales/Usuario');

const INCLUDES_REPUESTO = [
  {
    model: SysRepuesto,
    as: 'repuesto',
    attributes: ['id_sysrepuesto', 'nombre', 'numero_parte', 'cantidad_stock', 'stock_minimo'],
    include: [{ model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['nombre'] }]
  }
];

// Helper para obtener el nombre de usuario del JWT/BD
async function getNombreUsuario(req) {
  let nombre = req.user?.nombreUsuario || req.user?.nombre;
  if (!nombre && req.user?.id) {
    const u = await Usuario.findByPk(req.user.id);
    if (u) nombre = u.nombreUsuario || u.nombres;
  }
  return nombre || 'desconocido';
}

// Helper para construir where de filtros
function buildWhere(query) {
  const where = {};
  if (query.id_repuesto) where.id_repuesto_fk = query.id_repuesto;
  if (query.tipo && ['ingreso', 'egreso'].includes(query.tipo)) where.tipo = query.tipo;
  if (query.fechaDesde || query.fechaHasta) {
    where.fecha_movimiento = {};
    if (query.fechaDesde) where.fecha_movimiento[Op.gte] = new Date(query.fechaDesde);
    if (query.fechaHasta) {
      const hasta = new Date(query.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      where.fecha_movimiento[Op.lte] = hasta;
    }
  }
  return where;
}

// ─── GET /sysmovimientosstock ─────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const where = buildWhere(req.query);
    const movimientos = await SysMovimientosStockRepuestos.findAll({
      where,
      include: INCLUDES_REPUESTO,
      order: [['fecha_movimiento', 'DESC']]
    });
    res.json({ success: true, data: movimientos });
  } catch (error) {
    console.error('Error getAll movimientos stock:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos de stock' });
  }
};

// ─── GET /sysmovimientosstock/alertas ─────────────────────────────────────────
exports.getAlertas = async (req, res) => {
  try {
    const repuestos = await SysRepuesto.findAll({
      where: {
        is_active: true,
        [Op.and]: [
          { cantidad_stock: { [Op.lte]: sequelize.col('stock_minimo') } }
        ]
      },
      include: [{ model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['nombre'] }],
      order: [['cantidad_stock', 'ASC']]
    });
    res.json({ success: true, data: repuestos });
  } catch (error) {
    console.error('Error getAlertas stock:', error);
    res.status(500).json({ success: false, message: 'Error al obtener alertas de stock' });
  }
};

// ─── GET /sysmovimientosstock/exportar ────────────────────────────────────────
exports.exportarCSV = async (req, res) => {
  try {
    const where = buildWhere(req.query);
    const movimientos = await SysMovimientosStockRepuestos.findAll({
      where,
      include: INCLUDES_REPUESTO,
      order: [['fecha_movimiento', 'DESC']]
    });

    const encabezado = 'ID;Repuesto;N° Parte;Tipo;Cantidad;Stock Antes;Stock Después;Motivo;Referencia;Usuario;Fecha\n';
    const filas = movimientos.map(m => {
      const fecha = m.fecha_movimiento
        ? new Date(m.fecha_movimiento).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
        : '';
      return [
        m.id,
        `"${m.repuesto?.nombre || ''}"`,
        `"${m.repuesto?.numero_parte || ''}"`,
        m.tipo,
        m.cantidad,
        m.stock_antes,
        m.stock_despues,
        `"${(m.motivo || '').replace(/"/g, "'")}"`,
        `"${(m.referencia || '').replace(/"/g, "'")}"`,
        `"${m.usuario || ''}"`,
        `"${fecha}"`
      ].join(';');
    }).join('\n');

    const csv = '\uFEFF' + encabezado + filas; // BOM para Excel

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="movimientos_stock_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exportarCSV movimientos stock:', error);
    res.status(500).json({ success: false, message: 'Error al exportar movimientos' });
  }
};

// ─── POST /sysmovimientosstock ────────────────────────────────────────────────
exports.registrarMovimiento = async (req, res) => {
  const { id_repuesto_fk, tipo, cantidad, motivo, referencia, garantia_inicio, garantia_fin } = req.body;

  if (!id_repuesto_fk || !tipo || !cantidad || !motivo) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }
  if (!['ingreso', 'egreso'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'El tipo debe ser "ingreso" o "egreso"' });
  }
  const cantNum = parseInt(cantidad, 10);
  if (isNaN(cantNum) || cantNum <= 0) {
    return res.status(400).json({ success: false, message: 'La cantidad debe ser un número mayor a 0' });
  }

  let factura_ruta = null;
  if (req.file) {
    factura_ruta = req.file.path;
  }

  const t = await sequelize.transaction();
  try {
    const repuesto = await SysRepuesto.findByPk(id_repuesto_fk, { transaction: t });
    if (!repuesto) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });
    }
    if (!repuesto.is_active) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No se puede mover stock de un repuesto dado de baja' });
    }

    const stockAntes = repuesto.cantidad_stock;
    let stockDespues;

    if (tipo === 'ingreso') {
      stockDespues = stockAntes + cantNum;
    } else {
      if (cantNum > stockAntes) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${stockAntes}, solicitado: ${cantNum}`
        });
      }
      stockDespues = stockAntes - cantNum;
    }

    const nombreUsuario = await getNombreUsuario(req);

    const movimientoData = {
      id_repuesto_fk,
      tipo,
      cantidad: cantNum,
      stock_antes: stockAntes,
      stock_despues: stockDespues,
      motivo: motivo.trim(),
      referencia: referencia?.trim() || null,
      usuario: nombreUsuario,
      fecha_movimiento: new Date(),
      factura_ruta
    };

    if (tipo === 'ingreso') {
      if (garantia_inicio) movimientoData.garantia_inicio = garantia_inicio;
      if (garantia_fin) movimientoData.garantia_fin = garantia_fin;
    }

    const movimiento = await SysMovimientosStockRepuestos.create(movimientoData, { transaction: t });

    await repuesto.update({ cantidad_stock: stockDespues }, { transaction: t });

    const movimientoCompleto = await SysMovimientosStockRepuestos.findByPk(movimiento.id, {
      include: INCLUDES_REPUESTO,
      transaction: t
    });

    await t.commit();

    res.status(201).json({
      success: true,
      message: `Movimiento de ${tipo} registrado exitosamente. Stock actualizado: ${stockAntes} → ${stockDespues}`,
      data: movimientoCompleto
    });
  } catch (error) {
    await t.rollback();
    console.error('Error registrarMovimiento stock:', error);
    res.status(500).json({ success: false, message: 'Error al registrar el movimiento de stock', error: error.message });
  }
};

// ─── GET /sysmovimientosstock/descargar-factura/:id ──────────────────────────
exports.descargarFactura = async (req, res) => {
  try {
    const movimiento = await SysMovimientosStockRepuestos.findByPk(req.params.id);
    if (!movimiento || !movimiento.factura_ruta) {
      return res.status(404).json({ error: 'Movimiento no encontrado o sin factura' });
    }

    const fs = require('fs');
    if (!fs.existsSync(movimiento.factura_ruta)) {
      return res.status(404).json({ error: 'El archivo físico no existe en el servidor' });
    }

    res.download(movimiento.factura_ruta);
  } catch (error) {
    console.error('Error al descargar factura de movimiento:', error);
    res.status(500).json({ error: 'Error al descargar la factura' });
  }
};
