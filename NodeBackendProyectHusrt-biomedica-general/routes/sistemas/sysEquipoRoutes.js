const express = require('express');
const router = express.Router();
const { checkToken } = require('../../utilities/middleware');
const ctrl = require('../../controllers/Sistemas/sysEquipoController');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysTraslado = require('../../models/Sistemas/SysTraslado');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Servicio = require('../../models/generales/Servicio');
const SysProtocoloPreventivo = require('../../models/Sistemas/SysProtocoloPreventivo');
const SysReporte = require('../../models/Sistemas/SysReporte');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const Usuario = require('../../models/generales/Usuario');
const { Op } = require('sequelize');

router.use(checkToken);

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
    const incluirObsolescencia = req.query.obsolescencia !== 'false';
    const completo = req.query.completo === 'true';
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

    if (incluirObsolescencia) nombreArchivo += '_Obsolescencia';
    else if (completo) nombreArchivo += '_Completo';

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

    // --- Helpers compartidos ---
    const borderThin = {
      top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };
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
    const estadoFills = {
      'Activo':       { bg: 'FFC6EFCE', fg: 'FF166534' },
      'En Bodega':    { bg: 'FFFFEB9C', fg: 'FF92400E' },
      'Dado de baja': { bg: 'FFFFC7CE', fg: 'FF9B1C1C' },
    };

    // --- Filas 1-2: Cabecera institucional (común a ambas versiones) ---
    ws.addRow(new Array(25).fill('')); // fila 1
    ws.addRow(new Array(25).fill('')); // fila 2
    ws.getRow(1).height = 20;
    ws.getRow(2).height = 14;

    ws.mergeCells('A1:C1');
    const cCodigo = ws.getCell('A1');
    cCodigo.value = 'CÓDIGO: S-F-48';
    estiloCabecera(cCodigo);

    ws.mergeCells('D1:G1');
    const cNombre = ws.getCell('D1');
    cNombre.value = 'ESE HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA';
    estiloCabecera(cNombre, 9);

    ws.mergeCells('A2:C2');
    const cVersion = ws.getCell('A2');
    const diaHoy = hoy.getDate().toString().padStart(2, '0');
    const mesHoy = (hoy.getMonth() + 1).toString().padStart(2, '0');
    cVersion.value = `VERSIÓN: 01    FECHA: ${diaHoy}/${mesHoy}/${hoy.getFullYear()}`;
    estiloCabecera(cVersion);

    ws.mergeCells('D2:G2');
    const cFormato = ws.getCell('D2');
    cFormato.value = 'FORMATO INVENTARIO SISTEMAS';
    estiloCabecera(cFormato, 8);

    ws.mergeCells('H1:I2');
    ws.getCell('H1').border = borderNegro;
    if (logoBuffer) {
      const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
      ws.addImage(imageId, { tl: { col: 7.1, row: 0.05 }, br: { col: 8.9, row: 1.95 }, editAs: 'oneCell' });
    }

    // Fecha de emisión del reporte
    const mesesES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fechaEmisionStr = `${hoy.getDate()} de ${mesesES[hoy.getMonth()]} de ${hoy.getFullYear()}`;
    ws.mergeCells('J1:L2');
    const cEmision = ws.getCell('J1');
    cEmision.value = `FECHA DE EMISIÓN:\n${fechaEmisionStr.toUpperCase()}`;
    cEmision.font      = { bold: true, size: 8, color: { argb: 'FF1E3A5F' } };
    cEmision.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
    cEmision.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cEmision.border    = borderNegro;

    if (incluirObsolescencia) {
      // ============================================================
      // VERSIÓN COMPLETA — 25 columnas con análisis de obsolescencia
      // ============================================================
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

      const COLORS = {
        info:   { bg: 'FF1E3A5F', fg: 'FFFFFFFF' },
        item1:  { bg: 'FF4C1D95', fg: 'FFFFFFFF' },
        item2:  { bg: 'FF065F46', fg: 'FFFFFFFF' },
        item3:  { bg: 'FF92400E', fg: 'FFFFFFFF' },
        item4:  { bg: 'FF7F1D1D', fg: 'FFFFFFFF' },
        result: { bg: 'FF111827', fg: 'FFFFFFFF' },
      };
      const styleHeader = (cell, colorKey, wrap = false, size = 11) => {
        const c = COLORS[colorKey];
        cell.font      = { bold: true, color: { argb: c.fg }, size };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.bg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: wrap };
        cell.border    = borderThin;
      };

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
      const PUNTAJE_COLS = new Set([15, 18, 20, 23]);

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
        const p4     = 0.5;
        const pFinal = Number(((p1 * 0.25) + (p2 * 0.15) + (p3 * 0.30) + (p4 * 0.30)).toFixed(2));
        const clasif = clasificar(pFinal);
        let estadoTexto = 'Activo';
        if (eq.estado_baja)                               estadoTexto = 'Dado de baja';
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

      ws.addRow([]);
      const notaRow = ws.addRow(['* ÍTEM 4 (Disponibilidad de Hardware): datos de ejemplo — módulo en desarrollo.']);
      ws.mergeCells(`A${notaRow.number}:Y${notaRow.number}`);
      const notaCell = ws.getCell(`A${notaRow.number}`);
      notaCell.font      = { italic: true, color: { argb: 'FF6B7280' }, size: 9 };
      notaCell.alignment = { horizontal: 'left', vertical: 'middle' };

    } else if (completo) {
      // ============================================================
      // VERSIÓN COMPLETA — todos los campos equipo + hoja de vida
      // ============================================================
      ws.columns = [
        { key: 'nombre_equipo',        width: 30 },
        { key: 'tipo_equipo',          width: 22 },
        { key: 'marca',                width: 18 },
        { key: 'modelo',               width: 18 },
        { key: 'serie',                width: 20 },
        { key: 'placa',                width: 18 },
        { key: 'estado',               width: 14 },
        { key: 'sede',                 width: 20 },
        { key: 'proceso_area',         width: 22 },
        { key: 'ubicacion',            width: 22 },
        { key: 'nombre_usuario',       width: 24 },
        { key: 'tipo_uso',             width: 16 },
        { key: 'ip',                   width: 18 },
        { key: 'mac',                  width: 20 },
        { key: 'procesador',           width: 28 },
        { key: 'ram',                  width: 14 },
        { key: 'disco_duro',           width: 18 },
        { key: 'sistema_operativo',    width: 24 },
        { key: 'office',               width: 16 },
        { key: 'tonner',               width: 14 },
        { key: 'vendedor',             width: 22 },
        { key: 'fecha_compra',         width: 16 },
        { key: 'fecha_instalacion',    width: 16 },
        { key: 'costo_compra',         width: 16 },
        { key: 'contrato',             width: 20 },
        { key: 'fecha_inicio_soporte', width: 18 },
        { key: 'anos_soporte',         width: 18 },
        { key: 'compra_directa',       width: 14 },
        { key: 'convenio',             width: 12 },
        { key: 'donado',               width: 12 },
        { key: 'comodato',             width: 12 },
        { key: 'observaciones_hv',     width: 35 },
      ];

      const NUM_COLS = 32;
      ws.addRow(new Array(NUM_COLS).fill(''));
      ws.getRow(3).height = 26;

      ws.mergeCells('A3:J3');
      const seccEquipo = ws.getCell('A3');
      seccEquipo.value     = 'INFORMACIÓN DEL EQUIPO';
      seccEquipo.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      seccEquipo.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      seccEquipo.alignment = { horizontal: 'center', vertical: 'middle' };
      seccEquipo.border    = borderThin;

      ws.mergeCells('K3:AF3');
      const seccHV = ws.getCell('K3');
      seccHV.value     = 'HOJA DE VIDA';
      seccHV.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      seccHV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
      seccHV.alignment = { horizontal: 'center', vertical: 'middle' };
      seccHV.border    = borderThin;

      const colNamesCompleto = [
        'Nombre Equipo', 'Tipo Equipo', 'Marca', 'Modelo', 'Serie', 'Placa',
        'Estado', 'Sede', 'Servicio / Área', 'Ubicación',
        'Usuario Dominio', 'Tipo de Uso', 'IP', 'MAC', 'Procesador',
        'RAM', 'Disco Duro', 'Sistema Operativo', 'Office', 'Toner',
        'Vendedor', 'Fecha Compra', 'Fecha Instalación', 'Costo Compra', 'Contrato',
        'Inicio Soporte', 'Años Soporte', 'Compra Directa', 'Convenio', 'Donado', 'Comodato',
        'Observaciones'
      ];
      const colColorCompleto = [
        ...Array(10).fill('FF1E3A5F'),
        ...Array(22).fill('FF065F46'),
      ];
      ws.addRow(colNamesCompleto);
      ws.getRow(4).height = 36;
      ws.getRow(4).eachCell((cell, col) => {
        cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: colColorCompleto[col - 1] } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border    = borderThin;
      });

      equipos.forEach((eq, idx) => {
        const hv = eq.hojaVida || {};
        let estadoTexto = 'Activo';
        if (eq.estado_baja)                               estadoTexto = 'Dado de baja';
        else if (!eq.activo || eq.ubicacion === 'Bodega') estadoTexto = 'En Bodega';
        const rowFill = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF0FDF4';
        const boolVal = (v) => v ? 'Sí' : 'No';
        const row = ws.addRow({
          nombre_equipo:        eq.nombre_equipo                    || '',
          tipo_equipo:          eq.tipoEquipo?.nombres               || '',
          marca:                eq.marca                            || '',
          modelo:               eq.modelo                           || '',
          serie:                eq.serie                            || '',
          placa:                eq.placa_inventario                 || '',
          estado:               estadoTexto,
          sede:                 eq.servicio?.sede?.nombres          || '',
          proceso_area:         eq.servicio?.nombres                || '',
          ubicacion:            eq.ubicacion                        || '',
          nombre_usuario:       hv.nombre_usuario                   || '',
          tipo_uso:             hv.tipo_uso                         || '',
          ip:                   hv.ip                               || '',
          mac:                  hv.mac                              || '',
          procesador:           hv.procesador                       || '',
          ram:                  hv.ram                              || '',
          disco_duro:           hv.disco_duro                       || '',
          sistema_operativo:    hv.sistema_operativo                || '',
          office:               hv.office                           || '',
          tonner:               hv.tonner                           || '',
          vendedor:             hv.vendedor                         || '',
          fecha_compra:         hv.fecha_compra                     || '',
          fecha_instalacion:    hv.fecha_instalacion                || '',
          costo_compra:         hv.costo_compra                     || '',
          contrato:             hv.contrato                         || '',
          fecha_inicio_soporte: hv.fecha_inicio_soporte             || '',
          anos_soporte:         hv.anos_soporte_fabricante != null ? `${hv.anos_soporte_fabricante} años` : '',
          compra_directa:       hv.compraddirecta != null ? boolVal(hv.compraddirecta) : '',
          convenio:             hv.convenio   != null ? boolVal(hv.convenio)   : '',
          donado:               hv.donado     != null ? boolVal(hv.donado)     : '',
          comodato:             hv.comodato   != null ? boolVal(hv.comodato)   : '',
          observaciones_hv:     hv.observaciones                    || '',
        });
        row.eachCell((cell, colNum) => {
          cell.border = borderThin;
          if (colNum === 7) {
            const ef = estadoFills[cell.value] || estadoFills['Activo'];
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: ef.bg } };
            cell.font      = { bold: true, color: { argb: ef.fg }, size: 10 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
            cell.alignment = { vertical: 'middle', wrapText: colNum === NUM_COLS };
          }
        });
      });

    } else {
      // ============================================================
      // VERSIÓN SIMPLE — 12 columnas sin análisis de obsolescencia
      // ============================================================
      ws.columns = [
        { key: 'nombre_equipo',   width: 30 },
        { key: 'tipo_equipo',     width: 22 },
        { key: 'marca',           width: 18 },
        { key: 'modelo',          width: 18 },
        { key: 'serie',           width: 20 },
        { key: 'placa',           width: 18 },
        { key: 'usuario_dominio', width: 24 },
        { key: 'estado',          width: 14 },
        { key: 'proceso_area',    width: 22 },
        { key: 'sede',            width: 20 },
        { key: 'ubicacion',       width: 22 },
        { key: 'tipo_uso',        width: 16 },
      ];

      ws.addRow(new Array(12).fill(''));
      ws.getRow(3).height = 26;
      ws.mergeCells('A3:L3');
      const seccInfo = ws.getCell('A3');
      seccInfo.value     = 'INFORMACIÓN DEL EQUIPO';
      seccInfo.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      seccInfo.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      seccInfo.alignment = { horizontal: 'center', vertical: 'middle' };
      seccInfo.border    = borderThin;

      ws.addRow(['Nombre Equipo', 'Tipo Equipo', 'Marca', 'Modelo', 'Serie', 'Placa', 'Usuario Dominio', 'Estado', 'Proceso / Área', 'Sede', 'Ubicación', 'Tipo de Uso']);
      ws.getRow(4).height = 36;
      ws.getRow(4).eachCell((cell) => {
        cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border    = borderThin;
      });

      equipos.forEach((eq, idx) => {
        const hv = eq.hojaVida || {};
        let estadoTexto = 'Activo';
        if (eq.estado_baja)                               estadoTexto = 'Dado de baja';
        else if (!eq.activo || eq.ubicacion === 'Bodega') estadoTexto = 'En Bodega';
        const rowFill = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF5F7FF';
        const row = ws.addRow({
          nombre_equipo:   eq.nombre_equipo            || '',
          tipo_equipo:     eq.tipoEquipo?.nombres       || '',
          marca:           eq.marca                    || '',
          modelo:          eq.modelo                   || '',
          serie:           eq.serie                    || '',
          placa:           eq.placa_inventario         || '',
          usuario_dominio: hv.nombre_usuario           || '',
          estado:          estadoTexto,
          proceso_area:    eq.servicio?.nombres        || '',
          sede:            eq.servicio?.sede?.nombres  || '',
          ubicacion:       eq.ubicacion                || '',
          tipo_uso:        hv.tipo_uso                 || '',
        });
        row.eachCell((cell, colNum) => {
          cell.border = borderThin;
          if (colNum === 8) {
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
    }

    // ============================================================
    // HOJA DE LEYENDA DE COLORES
    // ============================================================
    const wsL = workbook.addWorksheet('Leyenda de Colores');
    wsL.columns = [
      { key: 'color',  width: 4  },
      { key: 'etiq',   width: 22 },
      { key: 'desc',   width: 52 },
    ];

    const lB = borderNegro;
    const bloque = (bg, fg, etiqueta, descripcion) => {
      const r = wsL.addRow(['', etiqueta, descripcion]);
      r.height = 26;
      r.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      r.getCell(1).border    = lB;
      r.getCell(2).value     = etiqueta;
      r.getCell(2).font      = { bold: true, color: { argb: fg }, size: 11 };
      r.getCell(2).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      r.getCell(2).border    = lB;
      r.getCell(3).font      = { size: 11 };
      r.getCell(3).alignment = { vertical: 'middle', wrapText: true };
      r.getCell(3).border    = lB;
    };
    const seccion = (titulo) => {
      wsL.addRow([]);
      const n = wsL.lastRow.number;
      wsL.mergeCells(`A${n}:C${n}`);
      const c = wsL.getCell(`A${n}`);
      c.value     = titulo;
      c.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      c.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      c.border    = lB;
      wsL.getRow(n).height = 24;
    };

    // ── Encabezado ──────────────────────────────────────────────
    wsL.mergeCells('A1:C1');
    const lTit = wsL.getCell('A1');
    lTit.value     = 'LEYENDA DE COLORES — INVENTARIO SISTEMAS';
    lTit.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
    lTit.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    lTit.alignment = { horizontal: 'center', vertical: 'middle' };
    lTit.border    = lB;
    wsL.getRow(1).height = 34;

    // ── Sección 1: Estado del equipo ────────────────────────────
    seccion('ESTADO DEL EQUIPO');
    bloque('FFC6EFCE', 'FF166534', '🟢  ACTIVO',       'El equipo está en uso y operativo.');
    bloque('FFFFEB9C', 'FF92400E', '🟡  EN BODEGA',    'El equipo está guardado temporalmente, fuera de servicio.');
    bloque('FFFFC7CE', 'FF9B1C1C', '🔴  DADO DE BAJA', 'El equipo fue retirado definitivamente del inventario.');

    if (incluirObsolescencia) {
      // ── Sección 2: Riesgo de obsolescencia ──────────────────
      seccion('RIESGO DE OBSOLESCENCIA');
      bloque('FFC6EFCE', 'FF166534', '🟢  RIESGO BAJO',   'El equipo está en buen estado. No requiere reemplazo.');
      bloque('FFFFEB9C', 'FF92400E', '🟡  RIESGO MEDIO',  'El equipo presenta desgaste. Hacer seguimiento.');
      bloque('FFFFC7CE', 'FF9B1C1C', '🔴  RIESGO ALTO',   'El equipo está obsoleto. Se recomienda reemplazo urgente.');

      // ── Sección 3: Puntaje por ítem ─────────────────────────
      seccion('PUNTAJE POR CRITERIO (columnas de Puntaje)');
      bloque('FFC6EFCE', 'FF166534', '🟢  1.0 — Óptimo',  'Cumple el criterio satisfactoriamente.');
      bloque('FFFFEB9C', 'FF92400E', '🟡  0.5 — Regular',  'Cumple parcialmente. Requiere atención.');
      bloque('FFFFC7CE', 'FF9B1C1C', '🔴  0.0 — Crítico',  'No cumple el criterio o no hay datos registrados.');
    }

    // ── Nota ────────────────────────────────────────────────────
    wsL.addRow([]);
    wsL.mergeCells(`A${wsL.lastRow.number}:C${wsL.lastRow.number}`);
    const lNota = wsL.getCell(`A${wsL.lastRow.number}`);
    lNota.value     = 'Reporte generado por HRCATCH 2.0 — ESE Hospital Universitario San Rafael de Tunja';
    lNota.font      = { italic: true, color: { argb: 'FF9CA3AF' }, size: 9 };
    lNota.alignment = { horizontal: 'center', vertical: 'middle' };

    // ============================================================
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando inventario de sistemas:', error);
    res.status(500).json({ error: 'Error al exportar inventario', detalle: error.message });
  }
});

// GET traslados de un equipo específico
router.get('/:id/traslados', async (req, res) => {
  try {
    const traslados = await SysTraslado.findAll({
      where: { id_sysequipo_fk: req.params.id },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos'] },
        { model: Servicio, as: 'servicioOrigen', attributes: ['id', 'nombres'] },
        { model: Servicio, as: 'servicioDestino', attributes: ['id', 'nombres'] }
      ],
      order: [['fecha', 'DESC']]
    });
    res.json({ success: true, data: traslados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener traslados', detalle: error.message });
  }
});

router.get('/:id', ctrl.getSysEquipoById);
router.get('/', ctrl.getAllSysEquipos);

router.post('/', ctrl.createSysEquipo);
router.post('/:id/bodega', ctrl.enviarABodegaPost);
router.patch('/:id', ctrl.updateSysEquipo);
router.delete('/:id', ctrl.deleteSysEquipo);
router.patch('/:id/reactivar', ctrl.reactivarSysEquipo);
router.post('/:id/hard-delete', ctrl.hardDeleteSysEquipo);

module.exports = router;
