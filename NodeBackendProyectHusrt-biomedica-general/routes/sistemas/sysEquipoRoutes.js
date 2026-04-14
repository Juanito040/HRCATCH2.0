const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysEquipoController');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Servicio = require('../../models/generales/Servicio');
const SysProtocoloPreventivo = require('../../models/Sistemas/SysProtocoloPreventivo');
const SysReporte = require('../../models/Sistemas/SysReporte');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const { Op } = require('sequelize');

// GET /sysequipo/tiposequipo → tipos de equipo que tienen equipos de sistemas
router.get('/tiposequipo', async (req, res) => {
  try {
    const equipos = await SysEquipo.findAll({
      attributes: ['id_tipo_equipo_fk'],
      where: { id_tipo_equipo_fk: { [Op.ne]: null } },
      include: [{ model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres', 'nombre'] }],
      group: ['id_tipo_equipo_fk', 'tipoEquipo.id']
    });
    const tipos = equipos
      .map(e => e.tipoEquipo)
      .filter(Boolean)
      .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de equipo', detalle: error.message });
  }
});

router.get('/stats', ctrl.getEstadisticasSysEquipos);
router.get('/bodega', ctrl.getEquiposEnBodega);
router.get('/dados-baja', ctrl.getEquiposDadosDeBaja);

// GET /sysequipo/exportar?tipo=todos|bodega  → exportar inventario a Excel
router.get('/exportar', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const tipo = req.query.tipo; // 'todos' o 'bodega'

    let where = {};
    let nombreArchivo = 'Inventario_Sistemas_Todos';
    let nombreHoja = 'Todos los Equipos';

    if (tipo === 'bodega') {
      // Mismo filtro que getEquiposEnBodega del controlador
      where = {
        ubicacion: 'Bodega',
        [Op.or]: [{ estado_baja: false }, { estado_baja: null }]
      };
      nombreArchivo = 'Inventario_Sistemas_Bodega';
      nombreHoja = 'En Bodega';
    } else if (tipo === 'activo') {
      where = {
        activo: 1,
        [Op.and]: [
          { [Op.or]: [{ ubicacion: { [Op.ne]: 'Bodega' } }, { ubicacion: null }] },
          { [Op.or]: [{ estado_baja: false }, { estado_baja: null }] }
        ]
      };
      nombreArchivo = 'Inventario_Sistemas_Activo';
      nombreHoja = 'Equipos Activos';
    } else if (tipo === 'inactivo') {
      where = { estado_baja: 1 };
      nombreArchivo = 'Inventario_Sistemas_DadosDeBaja';
      nombreHoja = 'Dados de Baja';
    } else {
      // 'todos': excluir bodega y dados de baja (mismo filtro que getAllSysEquipos)
      where = {
        [Op.and]: [
          { [Op.or]: [{ ubicacion: { [Op.ne]: 'Bodega' } }, { ubicacion: null }] },
          { [Op.or]: [{ estado_baja: false }, { estado_baja: null }] }
        ]
      };
    }

    const equipos = await SysEquipo.findAll({
      where,
      include: [
        {
          model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'],
          include: [
            { model: SysProtocoloPreventivo, as: 'sysProtocolos', attributes: ['paso', 'estado'],
              where: { estado: true }, required: false }
          ]
        },
        { model: Servicio, as: 'servicio', attributes: ['id', 'nombres'] },
        { model: SysReporte, as: 'sysReportes',
          attributes: ['tipoMantenimiento'],
          required: false },
        { model: SysHojaVida, as: 'hojaVida', required: false }
      ],
      order: [['nombre_equipo', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HUSRT - Sistemas';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(nombreHoja);

    worksheet.columns = [
      { header: 'ID',               key: 'id',                    width: 8  },
      { header: 'Nombre Equipo',    key: 'nombre_equipo',         width: 30 },
      { header: 'Marca',            key: 'marca',                 width: 18 },
      { header: 'Modelo',           key: 'modelo',                width: 18 },
      { header: 'Serie',            key: 'serie',                 width: 20 },
      { header: 'Placa Inventario', key: 'placa_inventario',      width: 18 },
      { header: 'Código',           key: 'codigo',                width: 15 },
      { header: 'Tipo Equipo',      key: 'tipo_equipo',           width: 22 },
      { header: 'Servicio',         key: 'servicio',              width: 22 },
      { header: 'Ubicación',        key: 'ubicacion',             width: 22 },
      { header: 'Ubic. Específica', key: 'ubicacion_especifica',  width: 20 },
      { header: 'Año Ingreso',      key: 'ano_ingreso',           width: 14 },
      { header: 'Periodicidad',     key: 'periodicidad',          width: 14 },
      { header: 'VLAN',             key: 'direccionamiento_Vlan', width: 18 },
      { header: 'N° Puertos',       key: 'numero_puertos',        width: 12 },
      { header: 'Administrable',    key: 'administrable',         width: 14 },
      { header: 'Estado',           key: 'estado',                width: 12 },
      // Hoja de Vida
      { header: 'IP',               key: 'ip',                    width: 16 },
      { header: 'MAC',              key: 'mac',                   width: 20 },
      { header: 'Procesador',       key: 'procesador',            width: 28 },
      { header: 'RAM',              key: 'ram',                   width: 16 },
      { header: 'Disco Duro',       key: 'disco_duro',            width: 18 },
      { header: 'Sistema Operativo',key: 'sistema_operativo',     width: 22 },
      { header: 'Office',           key: 'office',                width: 22 },
      { header: 'Tóner',            key: 'tonner',                width: 16 },
      { header: 'Usuario Asignado', key: 'nombre_usuario',        width: 24 },
      { header: 'Vendedor',         key: 'vendedor',              width: 22 },
      { header: 'Tipo de Uso',      key: 'tipo_uso',              width: 16 },
      { header: 'Fecha Compra',     key: 'fecha_compra',          width: 16 },
      { header: 'Fecha Instalación',key: 'fecha_instalacion',     width: 18 },
      { header: 'Costo Compra',     key: 'costo_compra',          width: 16 },
      { header: 'Contrato',         key: 'contrato',              width: 20 },
      { header: 'Observaciones HV', key: 'observaciones_hv',      width: 35 },
      { header: 'Compra Directa',   key: 'compraddirecta',        width: 15 },
      { header: 'Convenio',         key: 'convenio',              width: 12 },
      { header: 'Donado',           key: 'donado',                width: 12 },
      { header: 'Comodato',         key: 'comodato',              width: 12 },
      // Protocolos y mantenimientos
      { header: 'Protocolos Preventivos', key: 'protocolos_preventivos', width: 55 },
      { header: 'N° Mant. Preventivos',   key: 'conteo_preventivos',     width: 20 },
      { header: 'N° Mant. Correctivos',   key: 'conteo_correctivos',     width: 20 }
    ];

    // Estilo de cabecera (asignación directa de propiedades ExcelJS)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border    = {
        top:    { style: 'thin', color: { argb: 'FF93C5FD' } },
        bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
        left:   { style: 'thin', color: { argb: 'FF93C5FD' } },
        right:  { style: 'thin', color: { argb: 'FF93C5FD' } }
      };
    });

    const cellBorder = {
      top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };

    equipos.forEach((eq, index) => {
      const estadoTexto = eq.activo ? 'Activo' : 'En Bodega';

      // Protocolos preventivos del tipo de equipo (pasos activos, separados por coma)
      const protocolos = (eq.tipoEquipo?.sysProtocolos || []);
      const protocolosTexto = protocolos.length > 0
        ? protocolos.map(p => p.paso).join(', ')
        : 'Sin protocolos definidos';

      // Conteo de mantenimientos por tipo
      const reportes = eq.sysReportes || [];
      const conteoPreventivos = reportes.filter(r => r.tipoMantenimiento === 'Preventivo').length;
      const conteoCorrectivos = reportes.filter(r => r.tipoMantenimiento === 'Correctivo').length;

      const hv = eq.hojaVida || {};
      const fmtBool = v => v ? 'Sí' : 'No';

      const row = worksheet.addRow({
        id:                    eq.id_sysequipo,
        nombre_equipo:         eq.nombre_equipo         || '',
        marca:                 eq.marca                 || '',
        modelo:                eq.modelo                || '',
        serie:                 eq.serie                 || '',
        placa_inventario:      eq.placa_inventario      || '',
        codigo:                eq.codigo                || '',
        tipo_equipo:           eq.tipoEquipo?.nombres   || '',
        servicio:              eq.servicio?.nombres      || '',
        ubicacion:             eq.ubicacion             || '',
        ubicacion_especifica:  eq.ubicacion_especifica  || '',
        ano_ingreso:           eq.ano_ingreso           || '',
        periodicidad:          eq.periodicidad          || '',
        direccionamiento_Vlan: eq.direccionamiento_Vlan || '',
        numero_puertos:        eq.numero_puertos        ?? '',
        administrable:         eq.administrable ? 'Sí' : 'No',
        estado:                estadoTexto,
        // Hoja de Vida
        ip:                    hv.ip                || '',
        mac:                   hv.mac               || '',
        procesador:            hv.procesador        || '',
        ram:                   hv.ram               || '',
        disco_duro:            hv.disco_duro        || '',
        sistema_operativo:     hv.sistema_operativo || '',
        office:                hv.office            || '',
        tonner:                hv.tonner            || '',
        nombre_usuario:        hv.nombre_usuario    || '',
        vendedor:              hv.vendedor          || '',
        tipo_uso:              hv.tipo_uso          || '',
        fecha_compra:          hv.fecha_compra      || '',
        fecha_instalacion:     hv.fecha_instalacion || '',
        costo_compra:          hv.costo_compra      || '',
        contrato:              hv.contrato          || '',
        observaciones_hv:      hv.observaciones     || '',
        compraddirecta:        hv.compraddirecta != null ? fmtBool(hv.compraddirecta) : '',
        convenio:              hv.convenio          != null ? fmtBool(hv.convenio)    : '',
        donado:                hv.donado            != null ? fmtBool(hv.donado)      : '',
        comodato:              hv.comodato          != null ? fmtBool(hv.comodato)    : '',
        // Protocolos y mantenimientos
        protocolos_preventivos: protocolosTexto,
        conteo_preventivos:    conteoPreventivos,
        conteo_correctivos:    conteoCorrectivos
      });

      const fillColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF0F4FF';
      // col 38 = protocolos_preventivos (17 base + 21 HV = col 38)
      row.eachCell((cell, colNumber) => {
        cell.border    = cellBorder;
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.alignment = colNumber === 38
          ? { vertical: 'top', wrapText: true }
          : { vertical: 'middle' };
      });
      // Ajustar altura de fila según cantidad de protocolos
      if (protocolos.length > 1) row.height = Math.min(15 * protocolos.length, 120);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando inventario de sistemas:', error);
    res.status(500).json({ error: 'Error al exportar inventario', detalle: error.message });
  }
});

router.get('/:id', ctrl.getSysEquipoById);
router.get('/', ctrl.getAllSysEquipos);

router.post('/', ctrl.createSysEquipo);
router.patch('/:id', ctrl.updateSysEquipo);
router.delete('/:id', ctrl.deleteSysEquipo);
router.patch('/:id/reactivar', ctrl.reactivarSysEquipo);
router.post('/:id/hard-delete', ctrl.hardDeleteSysEquipo);

module.exports = router;
