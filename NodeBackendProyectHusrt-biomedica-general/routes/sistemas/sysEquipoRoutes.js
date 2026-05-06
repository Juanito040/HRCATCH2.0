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

// GET /sysequipo/exportar?tipo=todos|bodega|activo|inactivo → inventario con análisis de obsolescencia
router.get('/exportar', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const Sede = require('../../models/generales/Sede');
    const tipo = req.query.tipo;
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    // --- Filtro según tipo ---
    let where = {};
    let nombreArchivo = 'Inventario_Sistemas_Todos';
    let nombreHoja = 'Todos los Equipos';

    if (tipo === 'bodega') {
      where = { ubicacion: 'Bodega', [Op.or]: [{ estado_baja: false }, { estado_baja: null }] };
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
      nombreArchivo = 'Inventario_Sistemas_Activos';
      nombreHoja = 'Equipos Activos';
    } else if (tipo === 'inactivo') {
      where = { estado_baja: 1 };
      nombreArchivo = 'Inventario_Sistemas_DadosDeBaja';
      nombreHoja = 'Dados de Baja';
    } else {
      // 'todos': sin filtro — incluye activos, bodega y dados de baja
      where = {};
    }

    const equipos = await SysEquipo.findAll({
      where,
      include: [
        { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
        {
          model: Servicio, as: 'servicio', attributes: ['id', 'nombres'],
          include: [{ model: Sede, as: 'sede', attributes: ['nombres'] }]
        },
        { model: SysReporte, as: 'sysReportes', attributes: ['tipoMantenimiento', 'fechaRealizado'], required: false },
        { model: SysHojaVida, as: 'hojaVida', required: false }
      ],
      order: [['nombre_equipo', 'ASC']]
    });

    // --- Helpers de puntaje ---
    const calcEdad = (fechaCompra) => {
      if (!fechaCompra) return null;
      return (hoy - new Date(fechaCompra)) / (365.25 * 24 * 3600 * 1000);
    };
    const puntajeEdad = (edad) => {
      if (edad === null) return 0;
      if (edad < 5)  return 1;
      if (edad <= 7) return 0.5;
      return 0;
    };
    const calcVidaRestante = (fechaInicio, anos) => {
      if (!fechaInicio || anos == null) return null;
      const fin = new Date(fechaInicio);
      fin.setFullYear(fin.getFullYear() + Number(anos));
      return (fin - hoy) / (365.25 * 24 * 3600 * 1000);
    };
    const puntajeSoporte = (vida) => {
      if (vida === null) return 0;
      if (vida > 3)  return 1;
      if (vida >= 1) return 0.5;
      return 0;
    };
    const puntajeCorrectivos = (n) => {
      if (n <= 1) return 1;
      if (n <= 4) return 0.5;
      return 0;
    };
    const clasificar = (p) => {
      if (p <= 0.33) return 'Alto';
      if (p <= 0.66) return 'Medio';
      return 'Bajo';
    };
    const fmtAnios = (val) => val !== null ? `${val.toFixed(1)} años` : 'Sin datos';

    // --- Workbook ---
    const path = require('path');
    const fs   = require('fs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HUSRT - Sistemas';
    workbook.created = hoy;
    const ws = workbook.addWorksheet(nombreHoja);

    // Leer logo del hospital
    const logoPath = path.join(__dirname, '../../utilities/LogoSanRafael.png');
    const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

    ws.columns = [
      { key: 'nombre_equipo',        width: 30 },
      { key: 'tipo_equipo',          width: 22 },
      { key: 'marca',                width: 18 },
      { key: 'modelo',               width: 18 },
      { key: 'serie',                width: 20 },
      { key: 'placa',                width: 18 },
      { key: 'usuario_dominio',      width: 24 },
      { key: 'estado',               width: 14 },
      { key: 'proceso_area',         width: 22 },
      { key: 'sede',                 width: 20 },
      { key: 'ubicacion',            width: 22 },
      { key: 'tipo_uso',             width: 16 },
      { key: 'fecha_adquisicion',    width: 16 },
      { key: 'edad_equipo',          width: 14 },
      { key: 'p1',                   width: 12 },
      { key: 'fecha_inicio_soporte', width: 18 },
      { key: 'vida_util_restante',   width: 18 },
      { key: 'p2',                   width: 12 },
      { key: 'correctivos_anuales',  width: 18 },
      { key: 'p3',                   width: 12 },
      { key: 'disp_repuestos',       width: 20 },
      { key: 'repotenciado',         width: 14 },
      { key: 'p4',                   width: 12 },
      { key: 'puntaje_final',        width: 20 },
      { key: 'clasificacion',        width: 22 },
    ];

    // --- Paleta de colores por sección ---
    const COLORS = {
      info:   { bg: 'FF1E3A5F', fg: 'FFFFFFFF' },
      item1:  { bg: 'FF4C1D95', fg: 'FFFFFFFF' },
      item2:  { bg: 'FF065F46', fg: 'FFFFFFFF' },
      item3:  { bg: 'FF92400E', fg: 'FFFFFFFF' },
      item4:  { bg: 'FF7F1D1D', fg: 'FFFFFFFF' },
      result: { bg: 'FF111827', fg: 'FFFFFFFF' },
    };
    const borderThin = {
      top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
    const styleHeader = (cell, colorKey, wrap = false, size = 11) => {
      const c = COLORS[colorKey];
      cell.font      = { bold: true, color: { argb: c.fg }, size };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: wrap };
      cell.border    = borderThin;
    };

    // --- Filas 1-2: Cabecera institucional ---
    const borderNegro = {
      top:    { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left:   { style: 'thin', color: { argb: 'FF000000' } },
      right:  { style: 'thin', color: { argb: 'FF000000' } }
    };
    const estiloCabecera = (cell, fontSize = 8) => {
      cell.font      = { bold: true, size: fontSize };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border    = borderNegro;
    };

    ws.addRow(new Array(25).fill('')); // fila 1
    ws.addRow(new Array(25).fill('')); // fila 2
    ws.getRow(1).height = 20;
    ws.getRow(2).height = 14;

    // Cabecera compacta: A-I (9 cols), igual que el original cabecera.xlsx
    // Fila 1: código (A-C) | nombre hospital (D-G) | logo (H-I, span 2 filas)
    ws.mergeCells('A1:C1');
    const cCodigo = ws.getCell('A1');
    cCodigo.value = 'CÓDIGO: S-F-48';
    estiloCabecera(cCodigo);

    ws.mergeCells('D1:G1');
    const cNombre = ws.getCell('D1');
    cNombre.value = 'ESE HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA';
    estiloCabecera(cNombre, 9);

    // Fila 2: versión + fecha (A-C) | formato (D-G)
    ws.mergeCells('A2:C2');
    const cVersion = ws.getCell('A2');
    cVersion.value = 'VERSIÓN: 01    FECHA: 05/08/2021';
    estiloCabecera(cVersion);

    ws.mergeCells('D2:G2');
    const cFormato = ws.getCell('D2');
    cFormato.value = 'FORMATO INVENTARIO SISTEMAS';
    estiloCabecera(cFormato, 8);

    // Logo — H1:I2 (span 2 filas, 2 cols)
    ws.mergeCells('H1:I2');
    ws.getCell('H1').border = borderNegro;
    if (logoBuffer) {
      const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
      ws.addImage(imageId, { tl: { col: 7.1, row: 0.05 }, br: { col: 8.9, row: 1.95 }, editAs: 'oneCell' });
    }

    // --- Fila 3: etiquetas de sección (celdas combinadas) ---
    ws.addRow(new Array(25).fill(''));
    ws.getRow(3).height = 26;
    const secciones = [
      { range: 'A3:L3', label: 'INFORMACIÓN DEL EQUIPO',                color: 'info'   },
      { range: 'M3:O3', label: 'ÍTEM 1 – AÑOS DE USO (25%)',            color: 'item1'  },
      { range: 'P3:R3', label: 'ÍTEM 2 – SOPORTE DEL FABRICANTE (15%)', color: 'item2'  },
      { range: 'S3:T3', label: 'ÍTEM 3 – TASA DE FALLAS (30%)',         color: 'item3'  },
      { range: 'U3:W3', label: 'ÍTEM 4 – DISP. HARDWARE (30%) *',       color: 'item4'  },
      { range: 'X3:Y3', label: 'RESULTADO FINAL',                        color: 'result' },
    ];
    secciones.forEach(({ range, label, color }) => {
      ws.mergeCells(range);
      const cell = ws.getCell(range.split(':')[0]);
      cell.value = label;
      styleHeader(cell, color);
    });

    // --- Fila 4: nombres de columnas ---
    const colNames = [
      'Nombre Equipo', 'Tipo Equipo', 'Marca', 'Modelo', 'Serie', 'Placa',
      'Usuario Dominio', 'Estado', 'Proceso / Área', 'Sede', 'Ubicación', 'Tipo de Uso',
      'Fecha Adquisición', 'Edad (años)', 'Puntaje',
      'Inicio Soporte', 'Vida Útil Restante', 'Puntaje',
      'Correctivos Anuales', 'Puntaje',
      'Disp. Repuestos', 'Repotenciado', 'Puntaje',
      'Puntaje Obsolescencia', 'Índice de Obsolescencia'
    ];
    const colColorKeys = [
      ...Array(12).fill('info'),
      ...Array(3).fill('item1'),
      ...Array(3).fill('item2'),
      ...Array(2).fill('item3'),
      ...Array(3).fill('item4'),
      ...Array(2).fill('result'),
    ];
    ws.addRow(colNames);
    ws.getRow(4).height = 36;
    ws.getRow(4).eachCell((cell, col) => {
      styleHeader(cell, colColorKeys[col - 1], true, 10);
    });

    // --- Helpers de color para celdas de datos ---
    const puntajeCellFill = (val) => {
      if (val === 1)   return 'FFC6EFCE';
      if (val === 0.5) return 'FFFFEB9C';
      return 'FFFFC7CE';
    };
    const puntajeFinalFill = (p) => {
      if (p >= 0.67) return 'FFC6EFCE';
      if (p >= 0.34) return 'FFFFEB9C';
      return 'FFFFC7CE';
    };
    const clasificFonts = {
      'Alto':  { bg: 'FFFFC7CE', fg: 'FF9B1C1C' },
      'Medio': { bg: 'FFFFEB9C', fg: 'FF92400E' },
      'Bajo':  { bg: 'FFC6EFCE', fg: 'FF166534' },
    };
    const estadoFills = {
      'Activo':       { bg: 'FFC6EFCE', fg: 'FF166534' },
      'En Bodega':    { bg: 'FFFFEB9C', fg: 'FF92400E' },
      'Dado de baja': { bg: 'FFFFC7CE', fg: 'FF9B1C1C' },
    };
    const PUNTAJE_COLS = new Set([15, 18, 20, 23]);

    // --- Filas de datos ---
    equipos.forEach((eq, idx) => {
      const hv = eq.hojaVida || {};
      const reportes = eq.sysReportes || [];

      const correctivosAnio = reportes.filter(r =>
        r.tipoMantenimiento === 'Correctivo' &&
        r.fechaRealizado &&
        new Date(r.fechaRealizado).getFullYear() === anioActual
      ).length;

      const edad   = calcEdad(hv.fecha_compra);
      const p1     = puntajeEdad(edad);
      const vida   = calcVidaRestante(hv.fecha_inicio_soporte, hv.anos_soporte_fabricante);
      const p2     = puntajeSoporte(vida);
      const p3     = puntajeCorrectivos(correctivosAnio);
      const p4     = 0.5; // Ítem 4: datos de ejemplo — Disponible + No repotenciado
      const pFinal = Number(((p1 * 0.25) + (p2 * 0.15) + (p3 * 0.30) + (p4 * 0.30)).toFixed(2));
      const clasif = clasificar(pFinal);

      let estadoTexto = 'Activo';
      if (eq.estado_baja)                             estadoTexto = 'Dado de baja';
      else if (!eq.activo || eq.ubicacion === 'Bodega') estadoTexto = 'En Bodega';

      const rowFill = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF5F7FF';

      const row = ws.addRow({
        nombre_equipo:        eq.nombre_equipo             || '',
        tipo_equipo:          eq.tipoEquipo?.nombres        || '',
        marca:                eq.marca                     || '',
        modelo:               eq.modelo                    || '',
        serie:                eq.serie                     || '',
        placa:                eq.placa_inventario          || '',
        usuario_dominio:      hv.nombre_usuario            || '',
        estado:               estadoTexto,
        proceso_area:         eq.servicio?.nombres         || '',
        sede:                 eq.servicio?.sede?.nombres   || '',
        ubicacion:            eq.ubicacion                 || '',
        tipo_uso:             hv.tipo_uso                  || '',
        fecha_adquisicion:    hv.fecha_compra              || '',
        edad_equipo:          fmtAnios(edad),
        p1,
        fecha_inicio_soporte: hv.fecha_inicio_soporte      || '',
        vida_util_restante:   fmtAnios(vida),
        p2,
        correctivos_anuales:  correctivosAnio,
        p3,
        disp_repuestos:       'Disponible',
        repotenciado:         'No',
        p4,
        puntaje_final:        pFinal,
        clasificacion:        clasif,
      });

      row.eachCell((cell, colNum) => {
        cell.border = borderThin;

        if (PUNTAJE_COLS.has(colNum)) {
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: puntajeCellFill(cell.value) } };
          cell.font      = { bold: true, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum === 24) {
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: puntajeFinalFill(cell.value) } };
          cell.font      = { bold: true, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.numFmt    = '0.00';
        } else if (colNum === 25) {
          const cf = clasificFonts[cell.value] || clasificFonts['Medio'];
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: cf.bg } };
          cell.font      = { bold: true, color: { argb: cf.fg }, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum === 8) {
          const ef = estadoFills[cell.value] || estadoFills['Activo'];
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: ef.bg } };
          cell.font      = { bold: true, color: { argb: ef.fg }, size: 10 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
          cell.alignment = { vertical: 'middle' };
        }
      });
    });

    // --- Nota al pie: Ítem 4 es datos de ejemplo ---
    ws.addRow([]);
    const notaRow = ws.addRow(['* ÍTEM 4 (Disponibilidad de Hardware): datos de ejemplo — módulo en desarrollo.']);
    ws.mergeCells(`A${notaRow.number}:Y${notaRow.number}`);
    const notaCell = ws.getCell(`A${notaRow.number}`);
    notaCell.font      = { italic: true, color: { argb: 'FF6B7280' }, size: 9 };
    notaCell.alignment = { horizontal: 'left', vertical: 'middle' };

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
