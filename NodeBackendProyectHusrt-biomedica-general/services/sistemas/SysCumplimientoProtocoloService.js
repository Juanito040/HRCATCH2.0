const SysCumplimientoProtocoloPreventivo = require('../../models/Sistemas/SysCumplimientoProtocoloPreventivo');
const SysProtocoloPreventivo = require('../../models/Sistemas/SysProtocoloPreventivo');
const SysReporte = require('../../models/Sistemas/SysReporte');

class SysCumplimientoProtocoloPreventivoService {

  // ─── Includes reutilizables ───────────────────────────────────────────────

  get _includeProtocolo() {
    return { model: SysProtocoloPreventivo, as: 'protocolo' };
  }

  get _includeReporte() {
    return { model: SysReporte, as: 'reporte' };
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  /**
   * Retorna todos los cumplimientos con su protocolo y reporte asociados.
   */
  async getCumplimientos() {
    return SysCumplimientoProtocoloPreventivo.findAll({
      include: [this._includeProtocolo, this._includeReporte],
      order: [['id', 'ASC']],
    });
  }

  /**
   * Retorna los cumplimientos asociados a un reporte (mantenimiento) específico.
   * @param {number} reporteId - ID del reporte/mantenimiento
   */
  async getCumplimientosByReporte(reporteId) {
    return SysCumplimientoProtocoloPreventivo.findAll({
      where: { sysReporteIdFk: reporteId },
      include: [this._includeProtocolo],
    });
  }

  /**
   * Retorna un cumplimiento por su PK. Lanza error si no existe.
   * @param {number} id
   */
  async getCumplimientoById(id) {
    const cumplimiento = await SysCumplimientoProtocoloPreventivo.findByPk(id, {
      include: [this._includeProtocolo, this._includeReporte],
    });

    if (!cumplimiento) {
      const error = new Error('Cumplimiento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return cumplimiento;
  }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  /**
   * Crea o actualiza un cumplimiento según si ya existe la combinación
   * protocolo + reporte. Retorna { data, created } para que el controlador
   * elija el status HTTP correcto.
   *
   * @param {{ sysProtocoloPreventivoIdFk, sysReporteIdFk, cumple, paso, observaciones }} payload
   * @returns {{ data: SysCumplimientoProtocoloPreventivo, created: boolean }}
   */
  async upsertCumplimiento({ sysProtocoloPreventivoIdFk, sysReporteIdFk, cumple, paso, observaciones }) {
    const existente = await SysCumplimientoProtocoloPreventivo.findOne({
      where: { sysProtocoloPreventivoIdFk, sysReporteIdFk },
    });

    if (existente) {
      await existente.update({ cumple, paso, observaciones });
      return { data: existente, created: false };
    }

    const nuevo = await SysCumplimientoProtocoloPreventivo.create({
      sysProtocoloPreventivoIdFk,
      sysReporteIdFk,
      cumple,
      paso,
      observaciones,
    });

    return { data: nuevo, created: true };
  }

  /**
   * Actualiza los campos de un cumplimiento existente. Lanza error si no existe.
   * @param {number} id
   * @param {object} payload
   */
  async updateCumplimiento(id, payload) {
    const cumplimiento = await this.getCumplimientoById(id);
    await cumplimiento.update(payload);
    return cumplimiento;
  }

  /**
   * Elimina un cumplimiento por ID. Lanza error si no existe.
   * @param {number} id
   */
  async deleteCumplimiento(id) {
    const cumplimiento = await this.getCumplimientoById(id);
    await cumplimiento.destroy();
  }
}

module.exports = new SysCumplimientoProtocoloPreventivoService();