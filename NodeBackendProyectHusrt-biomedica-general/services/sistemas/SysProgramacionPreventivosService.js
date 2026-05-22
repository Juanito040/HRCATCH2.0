const SysReporte = require('../../models/Sistemas/SysReporte');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysProgramacionPreventivoMes = require('../../models/Sistemas/Sysprogramacionpreventivomes');
const SysPlanMantenimiento = require('../../models/Sistemas/SysPlanMantenimiento');
const Usuario = require('../../models/generales/Usuario');

class SysProgramacionPreventivoService {
  /**
   * Verifica si ya existe una programación para el mes y año dados.
   * @param {number} mes
   * @param {number} anio
   * @returns {Promise<boolean>}
   */
  async existeProgramacion(mes, anio) {
    const registro = await SysProgramacionPreventivoMes.findOne({
      where: { mes, anio },
    });
    return !!registro;
  }

  /**
   * Busca los planes de mantenimiento activos para el mes y año,
   * crea los reportes preventivos y asigna técnicos de forma balanceada.
   * @param {number} mes
   * @param {number} anio
   * @returns {Promise<{ reportes: object[], mensaje: string }>}
   */
  async programarPreventivos(mes, anio) {
    // 1. Obtener planes con equipos activos y con preventivo habilitado
    const planes = await SysPlanMantenimiento.findAll({
      where: { mes, ano: anio },
      include: [
        {
          model: SysEquipo,
          as: 'equipo',
          where: {
            preventivo_s: true,
            estado_baja: false,
            activo: true,
          },
        },
      ],
    });

    if (planes.length === 0) {
      return {
        reportes: [],
        mensaje: 'No hay equipos con plan de mantenimiento para el mes y año seleccionados',
      };
    }

    // 2. Crear un reporte preventivo por cada plan encontrado
    const reportes = [];
    for (const plan of planes) {
      const equipo = plan.equipo;
      const nuevoMtto = await SysReporte.create({
        añoProgramado: anio,
        mesProgramado: mes,
        tipoMantenimiento: 'Preventivo',
        servicioIdFk: equipo.id_servicio_fk,
        id_sysequipo_fk: equipo.id_sysequipo,
      });
      reportes.push(nuevoMtto);
    }

    // 3. Asignar técnicos de sistemas (rolId 10) de forma balanceada
    await this._asignarTecnicos(reportes);

    // 4. Registrar que este mes/año ya fue programado
    await SysProgramacionPreventivoMes.create({ mes, anio });

    return {
      reportes,
      mensaje: `Se crearon ${reportes.length} mantenimientos preventivos programados`,
    };
  }

  /**
   * Obtiene todos los registros de meses/años programados,
   * ordenados de más reciente a más antiguo.
   * @returns {Promise<object[]>}
   */
  async getProgramaciones() {
    return SysProgramacionPreventivoMes.findAll({
      order: [
        ['anio', 'DESC'],
        ['mes', 'DESC'],
      ],
    });
  }

  /**
   * Obtiene todos los meses programados sin orden específico.
   * @returns {Promise<object[]>}
   */
  async getProgramacionMeses() {
    return SysProgramacionPreventivoMes.findAll();
  }

  // ─── Método privado ────────────────────────────────────────────────────────

  /**
   * Distribuye los reportes recién creados entre los técnicos disponibles
   * asignando siempre al técnico con menos tareas pendientes.
   * @param {object[]} reportes - Instancias de SysReporte recién creadas
   */
  async _asignarTecnicos(reportes) {
    const tecnicos = await Usuario.findAll({
      where: { estado: true, rolId: 10 },
      attributes: ['id'],
    });

    if (tecnicos.length === 0) {
      console.warn('No hay técnicos de sistemas (rol 10) disponibles para asignar');
      return;
    }

    // Cargar la cantidad actual de tareas pendientes de cada técnico
    const conteos = await Promise.all(
      tecnicos.map(async (t) => {
        const count = await SysReporte.count({
          where: { usuarioIdFk: t.id, realizado: false },
        });
        return { id: t.id, tareas: count };
      })
    );

    const taskCounts = {};
    conteos.forEach((c) => {
      taskCounts[c.id] = c.tareas;
    });

    // Recuperar los reportes desde BD para tener instancias actualizadas
    const reportesCreados = await SysReporte.findAll({
      where: { id: reportes.map((r) => r.id) },
    });

    // Asignar al técnico con menos carga en ese momento
    for (const reporte of reportesCreados) {
      const asignado = tecnicos.reduce((prev, curr) =>
        taskCounts[prev.id] <= taskCounts[curr.id] ? prev : curr
      );
      reporte.usuarioIdFk = asignado.id;
      taskCounts[asignado.id]++;
      await reporte.save();
    }
  }
}

module.exports = new SysProgramacionPreventivoService();