const { Op } = require('sequelize');
const SysRepuesto = require('../../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');
const SysAuditoriaRepuesto = require('../../models/Sistemas/SysAuditoriaRepuesto');
const Usuario = require('../../models/generales/Usuario');
const SysMovimientosStockRepuestos = require('../../models/Sistemas/SysMovimientosStockRepuestos');

const INCLUDES_BASE = [
  { model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['id_sys_tipo_repuesto', 'nombre'] }
];

// Helper para registrar auditoría
async function registrarAuditoria({ id_registro, req, accion, observacion, nombre_item }) {
  try {
    let nombreUsuarioAudit = req.user?.nombreUsuario || req.user?.nombre;

    if (!nombreUsuarioAudit && req.user?.id) {
      const u = await Usuario.findByPk(req.user.id);
      if (u) {
        nombreUsuarioAudit = u['nombreUsuario'];
      }
    }

    await SysAuditoriaRepuesto.create({
      tabla_origen: 'SysRepuesto',
      id_registro,
      nombre_item: nombre_item || null,
      usuario: nombreUsuarioAudit || 'desconocido',
      rol: req.user?.rol || null,
      accion,
      observacion: observacion || null,
      fecha_hora: new Date()
    });
  } catch (err) {
    console.error('Error al registrar auditoría repuesto:', err.message);
  }
}

// ─── Obtener todos los repuestos ──────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { is_active, search } = req.query;
    const where = {};

    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === '1';
    }

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { numero_parte: { [Op.like]: `%${search}%` } },
        { numero_serie: { [Op.like]: `%${search}%` } },
        { proveedor: { [Op.like]: `%${search}%` } }
      ];
    }

    const repuestos = await SysRepuesto.findAll({
      where,
      include: INCLUDES_BASE,
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: repuestos });
  } catch (error) {
    console.error('Error getAll SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener repuestos' });
  }
};

// ─── Obtener repuesto por ID ──────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const repuesto = await SysRepuesto.findByPk(req.params.id, { include: INCLUDES_BASE });
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });
    res.json({ success: true, data: repuesto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el repuesto' });
  }
};

// ─── Obtener repuestos por tipo ───────────────────────────────────────────────
exports.getByTipo = async (req, res) => {
  try {
    const { id_tipo } = req.params;
    const { is_active } = req.query;

    const where = { id_sys_tipo_repuesto_fk: id_tipo };
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === '1';
    }

    const repuestos = await SysRepuesto.findAll({
      where,
      include: INCLUDES_BASE,
      order: [['nombre', 'ASC']]
    });

    res.json({ success: true, data: repuestos });
  } catch (error) {
    console.error('Error getByTipo SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener repuestos por tipo' });
  }
};

// ─── Crear repuesto ───────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario,
      observacion
    } = req.body;

    if (!nombre) return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const repuesto = await SysRepuesto.create({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock: cantidad_stock || 0, ubicacion_fisica,
      garantia_inicio, garantia_fin, estado, fecha_ingreso, costo_unitario
    });

    await registrarAuditoria({
      id_registro: repuesto.id_sysrepuesto,
      req,
      accion: 'creacion',
      observacion,
      nombre_item: repuesto['nombre']
    });

    const repuestoCompleto = await SysRepuesto.findByPk(repuesto.id_sysrepuesto, { include: INCLUDES_BASE });
    res.status(201).json({ success: true, message: 'Repuesto creado exitosamente', data: repuestoCompleto });
  } catch (error) {
    console.error('Error create SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el repuesto', error: error.message });
  }
};

// ─── Actualizar repuesto ──────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, stock_minimo, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario,
      observacion
    } = req.body;

    const [affected] = await SysRepuesto.update({
      nombre, descripcion_tecnica, numero_parte, numero_serie,
      id_sys_tipo_repuesto_fk, modelo_asociado, proveedor,
      cantidad_stock, stock_minimo, ubicacion_fisica, garantia_inicio,
      garantia_fin, estado, fecha_ingreso, costo_unitario
    }, { where: { id_sysrepuesto: id } });

    if (affected === 0) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    await registrarAuditoria({
      id_registro: parseInt(id, 10),
      req,
      accion: 'edicion',
      observacion,
      nombre_item: nombre
    });

    const repuesto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: 'Repuesto actualizado exitosamente', data: repuesto });
  } catch (error) {
    console.error('Error update SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el repuesto' });
  }
};

// ─── Activar / Desactivar repuesto ────────────────────────────────────────────
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion } = req.body;
    const repuesto = await SysRepuesto.findByPk(id);
    if (!repuesto) return res.status(404).json({ success: false, message: 'Repuesto no encontrado' });

    if (repuesto['is_active'] && repuesto['cantidad_stock'] > 0) {
      return res.status(400).json({ success: false, message: `No se puede dar de baja. Aún hay ${repuesto['cantidad_stock']} unidades en stock.` });
    }

    const nuevoEstado = !repuesto['is_active'];
    const updateData = { 
      is_active: nuevoEstado,
      fecha_inactivacion: null,
      usuario_inactivacion: null
    };

    if (!nuevoEstado) {
      updateData.fecha_inactivacion = new Date();

      let username = req.user?.nombreUsuario || req.user?.nombre;
      if (!username && req.user?.id) {
        const u = await Usuario.findByPk(req.user.id);
        if (u) username = u['nombreUsuario'] || u['nombres'];
      }
      updateData.usuario_inactivacion = username || 'desconocido';
    }

    await repuesto.update(updateData);

    await registrarAuditoria({
      id_registro: parseInt(id, 10),
      req,
      accion: nuevoEstado ? 'activacion' : 'inactivacion',
      observacion,
      nombre_item: repuesto['nombre']
    });

    const msg = nuevoEstado ? 'activado' : 'desactivado';
    const repuestoCompleto = await SysRepuesto.findByPk(id, { include: INCLUDES_BASE });
    res.json({ success: true, message: `Repuesto ${msg} exitosamente`, data: repuestoCompleto });
  } catch (error) {
    console.error('Error toggleActive SysRepuesto:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del repuesto' });
  }
};

// ─── Descontar stock por uso en mantenimiento ─────────────────────────────────
// Body esperado: { repuestos: [{ sysRepuestoIdFk: number, cantidad: number }], mantenimientoId?: number }
exports.descontarStock = async (req, res) => {
  const { repuestos, mantenimientoId } = req.body;

  if (!Array.isArray(repuestos) || repuestos.length === 0) {
    return res.status(400).json({ success: false, message: 'Debe enviar al menos un repuesto.' });
  }

  const errores = [];
  const actualizados = [];

  // Obtener nombre de usuario una sola vez
  let nombreUsuario = req.user?.nombreUsuario || req.user?.nombre;
  if (!nombreUsuario && req.user?.id) {
    const u = await Usuario.findByPk(req.user.id);
    if (u) nombreUsuario = u.nombreUsuario || u.nombres;
  }
  nombreUsuario = nombreUsuario || 'desconocido';

  for (const item of repuestos) {
    const { sysRepuestoIdFk, cantidad } = item;

    if (!sysRepuestoIdFk || !cantidad || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      continue;
    }

    const cantidadNumerica = Number(cantidad);

    try {
      const repuesto = await SysRepuesto.findByPk(sysRepuestoIdFk);

      if (!repuesto) {
        errores.push(`Repuesto con ID ${sysRepuestoIdFk} no encontrado.`);
        continue;
      }
      if (!repuesto.is_active) {
        errores.push(`El repuesto "${repuesto.nombre}" está inactivo y no se puede descontar.`);
        continue;
      }
      if (repuesto.cantidad_stock < cantidadNumerica) {
        errores.push(`Stock insuficiente para "${repuesto.nombre}". Stock actual: ${repuesto.cantidad_stock}, solicitado: ${cantidadNumerica}.`);
        continue;
      }

      const stockAntes = repuesto.cantidad_stock;
      const stockDespues = stockAntes - cantidadNumerica;

      await repuesto.update({ cantidad_stock: stockDespues });

      // ✅ Registrar en SysMovimientosStockRepuestos
      await SysMovimientosStockRepuestos.create({
        id_repuesto_fk: repuesto.id_sysrepuesto,
        tipo: 'egreso',
        cantidad: cantidadNumerica,
        stock_antes: stockAntes,
        stock_despues: stockDespues,
        motivo: `Usado en mantenimiento ID ${mantenimientoId}`,
        referencia: `Reporte #${mantenimientoId}`,
        sysReporteIdFk: mantenimientoId || null,  // ← así de simple
        usuario: nombreUsuario,
        fecha_movimiento: new Date()
      });

      // Auditoría (ya existía)
      await registrarAuditoria({
        id_registro: repuesto.id_sysrepuesto,
        req,
        accion: 'descuento_stock',
        observacion: `Usado en mantenimiento${mantenimientoId ? ` ID ${mantenimientoId}` : ''}. Cant: ${cantidadNumerica}. Stock: ${stockAntes}→${stockDespues}.`,
        nombre_item: repuesto.nombre
      });

      actualizados.push({
        id: repuesto.id_sysrepuesto,
        nombre: repuesto.nombre,
        stockAnterior: stockAntes,
        stockNuevo: stockDespues
      });

    } catch (error) {
      console.error(`Error descontando stock para repuesto ${sysRepuestoIdFk}:`, error);
      errores.push(`Error interno al procesar repuesto ID ${sysRepuestoIdFk}.`);
    }
  }

  if (errores.length > 0 && actualizados.length === 0) {
    return res.status(400).json({ success: false, message: errores.join(' | '), errores });
  }

  return res.json({
    success: true,
    message: `Stock actualizado para ${actualizados.length} repuesto(s).${errores.length > 0 ? ' Algunos tuvieron errores.' : ''}`,
    actualizados,
    errores: errores.length > 0 ? errores : undefined
  });
};


exports.ajustarStockEdicion = async (req, res) => {
  let { repuestosEliminados = [], repuestosNuevos = [], mantenimientoId } = req.body;

  // ✅ Deduplicar por si el front manda repetidos
  const agrupar = (lista) => {
    const mapa = new Map();
    for (const item of lista) {
      const key = item.sysRepuestoIdFk;
      if (!key) continue;
      if (mapa.has(key)) {
        mapa.get(key).cantidad = Number(mapa.get(key).cantidad) + Number(item.cantidad);
      } else {
        mapa.set(key, { ...item, cantidad: Number(item.cantidad) });
      }
    }
    return Array.from(mapa.values());
  };

  repuestosEliminados = agrupar(repuestosEliminados);
  repuestosNuevos = agrupar(repuestosNuevos);

  const errores = [];
  const actualizados = [];

  let nombreUsuario = req.user?.nombreUsuario || req.user?.nombre;
  if (!nombreUsuario && req.user?.id) {
    const u = await Usuario.findByPk(req.user.id);
    if (u) nombreUsuario = u.nombreUsuario || u.nombres;
  }
  nombreUsuario = nombreUsuario || 'desconocido';

  // 1️⃣ DEVOLVER stock + LIMPIAR movimientos de egreso del reporte
  for (const item of repuestosEliminados) {
    const { sysRepuestoIdFk, cantidad } = item;
    if (!sysRepuestoIdFk || !cantidad || Number(cantidad) <= 0) continue;

    try {
      const repuesto = await SysRepuesto.findByPk(sysRepuestoIdFk);
      if (!repuesto) { errores.push(`Repuesto ID ${sysRepuestoIdFk} no encontrado.`); continue; }

      const cantNum = Number(cantidad);
      const stockAntes = repuesto.cantidad_stock;
      const stockDespues = stockAntes + cantNum;

      // 1. Devolver stock
      await repuesto.update({ cantidad_stock: stockDespues });

      // 2. 🗑️ Eliminar TODOS los egresos de este repuesto vinculados a este reporte
      await SysMovimientosStockRepuestos.destroy({
        where: {
          id_repuesto_fk: repuesto.id_sysrepuesto,
          sysReporteIdFk: mantenimientoId,
          tipo: 'egreso'
        }
      });

      // 3. ✅ Registrar ingreso de auditoría
      await SysMovimientosStockRepuestos.create({
        id_repuesto_fk: repuesto.id_sysrepuesto,
        tipo: 'ingreso',
        cantidad: cantNum,
        stock_antes: stockAntes,
        stock_despues: stockDespues,
        motivo: `Devolución por edición de mantenimiento ID ${mantenimientoId}`,
        referencia: `Reporte #${mantenimientoId}`,
        sysReporteIdFk: mantenimientoId || null,
        usuario: nombreUsuario,
        fecha_movimiento: new Date()
      });

      await registrarAuditoria({
        id_registro: repuesto.id_sysrepuesto,
        req,
        accion: 'devolucion_stock',
        observacion: `Devuelto por edición mantenimiento ID ${mantenimientoId}. Cant: ${cantNum}. Stock: ${stockAntes}→${stockDespues}.`,
        nombre_item: repuesto.nombre
      });

      actualizados.push({
        id: repuesto.id_sysrepuesto,
        nombre: repuesto.nombre,
        accion: 'devuelto',
        stockAnterior: stockAntes,
        stockNuevo: stockDespues
      });

    } catch (err) {
      console.error(err);
      errores.push(`Error al devolver repuesto ID ${sysRepuestoIdFk}.`);
    }
  }

  // 2️⃣ DESCONTAR stock de los repuestos nuevos (sin cambios)
  // 2️⃣ DESCONTAR stock de los repuestos nuevos/modificados
  for (const item of repuestosNuevos) {
    const { sysRepuestoIdFk, cantidad } = item;
    if (!sysRepuestoIdFk || !cantidad || Number(cantidad) <= 0) continue;

    try {
      const repuesto = await SysRepuesto.findByPk(sysRepuestoIdFk);
      if (!repuesto) { errores.push(`Repuesto ID ${sysRepuestoIdFk} no encontrado.`); continue; }
      if (!repuesto.is_active) { errores.push(`"${repuesto.nombre}" está inactivo.`); continue; }

      const cantNum = Number(cantidad);
      if (repuesto.cantidad_stock < cantNum) {
        errores.push(`Stock insuficiente para "${repuesto.nombre}". Disponible: ${repuesto.cantidad_stock}, solicitado: ${cantNum}.`);
        continue;
      }

      const stockAntes = repuesto.cantidad_stock;
      const stockDespues = stockAntes - cantNum;

      await repuesto.update({ cantidad_stock: stockDespues });

      // ✅ Si ya existe un egreso de este repuesto en este reporte, actualizar su cantidad
      // en lugar de crear un movimiento nuevo (evita duplicados en el modal)
      const movimientoExistente = await SysMovimientosStockRepuestos.findOne({
        where: {
          id_repuesto_fk: repuesto.id_sysrepuesto,
          sysReporteIdFk: mantenimientoId,
          tipo: 'egreso'
        }
      });

      if (movimientoExistente) {
        // Actualizar cantidad sumando la diferencia
        const cantidadNueva = Number(movimientoExistente.cantidad) + cantNum;
        await movimientoExistente.update({
          cantidad: cantidadNueva,
          stock_antes: movimientoExistente.stock_antes, // conservar stock_antes original
          stock_despues: stockDespues,
          motivo: `Cantidad actualizada en edición de mantenimiento ID ${mantenimientoId}`,
          usuario: nombreUsuario,
          fecha_movimiento: new Date()
        });
      } else {
        // Es genuinamente nuevo, crear el movimiento
        await SysMovimientosStockRepuestos.create({
          id_repuesto_fk: repuesto.id_sysrepuesto,
          tipo: 'egreso',
          cantidad: cantNum,
          stock_antes: stockAntes,
          stock_despues: stockDespues,
          motivo: `Nuevo repuesto agregado en edición de mantenimiento ID ${mantenimientoId}`,
          referencia: `Reporte #${mantenimientoId}`,
          sysReporteIdFk: mantenimientoId || null,
          usuario: nombreUsuario,
          fecha_movimiento: new Date()
        });
      }

      await registrarAuditoria({
        id_registro: repuesto.id_sysrepuesto,
        req,
        accion: 'descuento_stock',
        observacion: `Edición mantenimiento ID ${mantenimientoId}. Cant ajustada: ${cantNum}. Stock: ${stockAntes}→${stockDespues}.`,
        nombre_item: repuesto.nombre
      });

      actualizados.push({
        id: repuesto.id_sysrepuesto,
        nombre: repuesto.nombre,
        accion: 'descontado',
        stockAnterior: stockAntes,
        stockNuevo: stockDespues
      });

    } catch (err) {
      console.error(err);
      errores.push(`Error al descontar repuesto ID ${sysRepuestoIdFk}.`);
    }
  }

  return res.json({
    success: true,
    message: `Ajuste de stock completado: ${actualizados.length} repuesto(s) procesados.`,
    actualizados,
    errores: errores.length > 0 ? errores : undefined
  });
};