const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysEquipoController');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Servicio = require('../../models/generales/Servicio');
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
    } else {
      // Todos: excluir bodega y dados de baja (mismo filtro que getAllSysEquipos)
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
        { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
        { model: Servicio,   as: 'servicio',   attributes: ['id', 'nombres'] }
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
      { header: 'Estado',           key: 'estado',                width: 12 }
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

      const row = worksheet.addRow({
        id:                    eq.id_sysequipo,
        nombre_equipo:         eq.nombre_equipo         || '',
        marca:                 eq.marca                 || '',
        modelo:                eq.modelo                || '',
        serie:                 eq.serie                 || '',
        placa_inventario:      eq.placa_inventario      || '',
        codigo:                eq.codigo                || '',
        tipo_equipo:           eq.tipoEquipo?.nombres || '',
        servicio:              eq.servicio?.nombres      || '',
        ubicacion:             eq.ubicacion             || '',
        ubicacion_especifica:  eq.ubicacion_especifica  || '',
        ano_ingreso:           eq.ano_ingreso           || '',
        periodicidad:          eq.periodicidad          || '',
        direccionamiento_Vlan: eq.direccionamiento_Vlan || '',
        numero_puertos:        eq.numero_puertos        ?? '',
        administrable:         eq.administrable ? 'Sí' : 'No',
        estado:                estadoTexto
      });

      const fillColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF0F4FF';
      row.eachCell(cell => {
        cell.border    = cellBorder;
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
        cell.alignment = { vertical: 'middle' };
      });
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
