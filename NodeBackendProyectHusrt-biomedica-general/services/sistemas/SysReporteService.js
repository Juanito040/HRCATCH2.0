const { Op } = require('sequelize');

const SysReporte = require('../../models/Sistemas/SysReporte');
const SysBaja    = require('../../models/Sistemas/SysBaja');
const SysEquipo  = require('../../models/Sistemas/SysEquipo');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const SysMovimientosStockRepuestos = require('../../models/Sistemas/SysMovimientosStockRepuestos');
const SysRepuesto = require('../../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../../models/Sistemas/SysTipoRepuesto');
const Servicio  = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Usuario   = require('../../models/generales/Usuario');
const Cargo     = require('../../models/generales/Cargo');

// ─── Catálogos estáticos ──────────────────────────────────────────────────────

const TIPOS_MANTENIMIENTO = [
  { id: 1, nombre: 'Correctivo' },
  { id: 2, nombre: 'Preventivo' },
  { id: 3, nombre: 'Predictivo' },
  { id: 4, nombre: 'Otro' },
];

const TIPOS_FALLA = [
  { id: 1, nombre: 'Desgaste' },
  { id: 2, nombre: 'Operación Indebida' },
  { id: 3, nombre: 'Causa Externa' },
  { id: 4, nombre: 'Accesorios' },
  { id: 5, nombre: 'Desconocido' },
  { id: 6, nombre: 'Sin Falla' },
  { id: 7, nombre: 'Otros' },
  { id: 8, nombre: 'No Registra' },
];

// ─── Includes reutilizables ───────────────────────────────────────────────────

const INCLUDE_EQUIPO_BASE = {
  model: SysEquipo,
  as: 'equipo',
  attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'serie',
    'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
  include: [
    { model: Servicio,   as: 'servicio',   attributes: ['id', 'nombres'] },
    { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
  ],
};

const INCLUDE_USUARIO_BASICO = {
  model: Usuario,
  as: 'usuario',
  attributes: ['id', 'nombres', 'apellidos', 'numeroId'],
};

const INCLUDE_SERVICIO_FULL = {
  model: Servicio,
  as: 'servicio',
  attributes: ['id', 'nombres', 'ubicacion','sedeIdFk'],
};

const INCLUDES_LISTA = [INCLUDE_EQUIPO_BASE, INCLUDE_USUARIO_BASICO, INCLUDE_SERVICIO_FULL];
const INCLUDES_BASE  = [INCLUDE_EQUIPO_BASE, INCLUDE_USUARIO_BASICO];

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Construye la cláusula where para filtros de fecha.
 */
function _buildFechaWhere(fecha_inicio, fecha_fin) {
  if (fecha_inicio && fecha_fin) return { [Op.between]: [fecha_inicio, fecha_fin] };
  if (fecha_inicio)              return { [Op.gte]: fecha_inicio };
  if (fecha_fin)                 return { [Op.lte]: fecha_fin };
  return null;
}

/**
 * Lanza un error semántico que el controller puede mapear a su status HTTP.
 */
function _notFound(entidad) {
  const err = new Error(`${entidad} no encontrado`);
  err.statusCode = 404;
  throw err;
}

// ─── Clase de servicio ────────────────────────────────────────────────────────

class SysReporteService {

  // ── Catálogos ──────────────────────────────────────────────────────────────

  getCatalogoTiposMantenimiento() { return TIPOS_MANTENIMIENTO; }
  getCatalogoTiposFalla()         { return TIPOS_FALLA; }

  // ── Queries ────────────────────────────────────────────────────────────────

  /**
   * Lista todos los reportes con filtros opcionales de fecha, equipo y tipo.
   * @param {{ fecha_inicio?, fecha_fin?, id_equipo?, tipo_mantenimiento? }} filters
   */
  async getAllReportes({ fecha_inicio, fecha_fin, id_equipo, tipo_mantenimiento } = {}) {
    const where = {};

    const fechaWhere = _buildFechaWhere(fecha_inicio, fecha_fin);
    if (fechaWhere) where.fechaRealizado = fechaWhere;
    if (id_equipo)         where.id_sysequipo_fk = id_equipo;
    if (tipo_mantenimiento) where.tipoMantenimiento = tipo_mantenimiento;

    return SysReporte.findAll({
      where,
      include: INCLUDES_LISTA,
      order: [['fechaRealizado', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  /**
   * Retorna métricas del mes actual (o rango indicado) para el dashboard.
   * @param {{ fecha_inicio?, fecha_fin? }} params
   */
  async getDashboard({ fecha_inicio, fecha_fin } = {}) {
    if (!fecha_inicio || !fecha_fin) {
      const hoy = new Date();
      fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        .toISOString().split('T')[0];
      fecha_fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
        .toISOString().split('T')[0];
    }

    const whereBase = { fechaRealizado: { [Op.between]: [fecha_inicio, fecha_fin] } };

    const [total, correctivos, preventivos, predictivos, otros, recientes] =
      await Promise.all([
        SysReporte.count({ where: whereBase }),
        SysReporte.count({ where: { ...whereBase, tipoMantenimiento: 'Correctivo' } }),
        SysReporte.count({ where: { ...whereBase, tipoMantenimiento: 'Preventivo' } }),
        SysReporte.count({ where: { ...whereBase, tipoMantenimiento: 'Predictivo' } }),
        SysReporte.count({ where: { ...whereBase, tipoMantenimiento: 'Otro' } }),
        SysReporte.findAll({
          where: whereBase,
          include: INCLUDES_BASE,
          order: [['fechaRealizado', 'DESC']],
          limit: 20,
        }),
      ]);

    return {
      total,
      estadisticasTipo: [
        { tipo: 'Correctivo',  cantidad: correctivos },
        { tipo: 'Preventivo',  cantidad: preventivos },
        { tipo: 'Predictivo',  cantidad: predictivos },
        { tipo: 'Otro',        cantidad: otros },
      ],
      mantenimientosRecientes: recientes,
      fecha_inicio,
      fecha_fin,
    };
  }

  /**
   * Reportes de un técnico con filtro de fechas opcional.
   * @param {number} idUsuario
   * @param {{ fecha_inicio?, fecha_fin? }} filters
   */
  async getByTecnico(idUsuario, { fecha_inicio, fecha_fin } = {}) {
    const where = { usuarioIdFk: idUsuario };

    const fechaWhere = _buildFechaWhere(fecha_inicio, fecha_fin);
    if (fechaWhere) where.fechaRealizado = fechaWhere;

    return SysReporte.findAll({
      where,
      include: INCLUDES_BASE,
      order: [['fechaRealizado', 'DESC']],
    });
  }

  /**
   * Reportes de un usuario incluyendo su cargo y tipo de equipo (vista detallada).
   * @param {number} idUsuario
   */
  async getReportesByUsuario(idUsuario) {
    return SysReporte.findAll({
      where: { usuarioIdFk: idUsuario },
      include: [
        {
          model: SysEquipo,
          as: 'equipo',
          include: [{ model: TipoEquipo, as: 'tipoEquipo' }],
        },
        INCLUDE_SERVICIO_FULL,
        {
          model: Usuario,
          as: 'usuario',
          include: [{ model: Cargo, as: 'cargo' }],
        },
      ],
    });
  }

  /**
   * Reportes de un equipo específico.
   * @param {number} idEquipo
   */
  async getByEquipo(idEquipo) {
    return SysReporte.findAll({
      where: { id_sysequipo_fk: idEquipo },
      include: INCLUDES_BASE,
      order: [['fechaRealizado', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  /**
   * Obtiene un reporte por ID con sus repuestos mapeados al formato del front.
   * Lanza error 404 si no existe.
   * @param {number} id
   */
  async getReporteById(id) {
    const reporte = await SysReporte.findByPk(id, {
      include: [
        INCLUDE_EQUIPO_BASE,
        INCLUDE_USUARIO_BASICO,
        INCLUDE_SERVICIO_FULL,
        {
          model: SysMovimientosStockRepuestos,
          as: 'movimientosStock',
          required: false,
          where: { tipo: 'egreso' },
          include: [{
            model: SysRepuesto,
            as: 'repuesto',
            attributes: ['id_sysrepuesto', 'nombre', 'id_sys_tipo_repuesto_fk'],
            include: [{
              model: SysTipoRepuesto,
              as: 'tipoRepuesto',
              attributes: ['id_sys_tipo_repuesto', 'nombre'],
            }],
          }],
        },
      ],
    });

    if (!reporte) _notFound('Reporte');

    const data = reporte.toJSON();
    data.repuestos = (data.movimientosStock || []).map(m => ({
      id: m.id,
      sysRepuestoIdFk: m.id_repuesto_fk,
      cantidad: m.cantidad,
      tipoRepuestoIdFk: m.repuesto?.id_sys_tipo_repuesto_fk ?? null,
      nombreInsumo: m.repuesto?.nombre ?? '',
      tipoNombre: m.repuesto?.tipoRepuesto?.nombre ?? '',
    }));
    delete data.movimientosStock;

    return data;
  }

  // ── Mutaciones ─────────────────────────────────────────────────────────────

  /**
   * Crea un reporte y registra trazabilidad si corresponde.
   * Retorna el reporte con su equipo asociado.
   * @param {object} payload
   */
  async createReporte(payload) {
    const reporte = await SysReporte.create(payload);

    const result = await SysReporte.findByPk(reporte.id, {
      include: [INCLUDE_EQUIPO_BASE],
    });

    await this._registrarTrazabilidad(reporte, result?.equipo ?? null);

    return result;
  }

  /**
   * Actualiza un reporte existente. Lanza 404 si no existe.
   * @param {number} id
   * @param {object} payload
   */
  async updateReporte(id, payload) {
    const reporte = await SysReporte.findByPk(id);
    if (!reporte) _notFound('Reporte');

    await reporte.update(payload);

    return SysReporte.findByPk(id, { include: [INCLUDE_EQUIPO_BASE] });
  }

  /**
   * Obtiene un registro de baja por su ID con equipo y responsable.
   * Lanza 404 si no existe.
   * @param {number} bajaId
   */
  async getBajaById(bajaId) {
    const baja = await SysBaja.findByPk(bajaId, {
      include: [
        {
          model: SysEquipo,
          as: 'equipo',
          attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo',
            'serie', 'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
          include: [
            { model: Servicio,   as: 'servicio',   attributes: ['id', 'nombres'] },
            { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
          ],
        },
        { model: Usuario, as: 'usuarioBaja', attributes: ['id', 'nombres', 'apellidos'] },
      ],
    });
    if (!baja) _notFound('Registro de baja');
    return baja.toJSON();
  }

  /**
   * Elimina un reporte. Lanza 404 si no existe.
   * @param {number} id
   */
  async deleteReporte(id) {
    const reporte = await SysReporte.findByPk(id);
    if (!reporte) _notFound('Reporte');
    await reporte.destroy();
  }

  // ── Privados ───────────────────────────────────────────────────────────────

  /**
   * Registra en SysTrazabilidad tras crear un reporte.
   * El fallo es tolerado (no rompe el flujo principal).
   */
  async _registrarTrazabilidad(reporte, equipo) {
    if (!reporte.id_sysequipo_fk) return;

    const detalles = [
      equipo ? `Equipo: ${equipo.nombre_equipo}` : '',
      reporte.servicio_anterior ? `De: ${reporte.servicio_anterior}` : '',
      reporte.servicio_nuevo    ? `Hacia: ${reporte.servicio_nuevo}` : '',
      reporte.realizado_por     ? `Por: ${reporte.realizado_por}` : '',
      reporte.recibido_por      ? `Recibido por: ${reporte.recibido_por}` : '',
    ].filter(Boolean).join(' · ');

    try {
      await SysTrazabilidad.create({
        accion: 'REPORTE_ENTREGA',
        detalles,
        id_sysequipo_fk: reporte.id_sysequipo_fk,
        id_sysusuario_fk: reporte.id_sysusuario_fk || null,
      });
    } catch (e) {
      console.warn('[SysReporteService] trazabilidad omitida:', e.message);
    }
  }
}

module.exports = new SysReporteService();