const SysReporte        = require('../../models/Sistemas/SysReporte');
const SysEquipo         = require('../../models/Sistemas/SysEquipo');
const SysBaja           = require('../../models/Sistemas/SysBaja');
const SysTrazabilidad   = require('../../models/Sistemas/SysTrazabilidad');
const SysMantenimiento  = require('../../models/Sistemas/SysMantenimiento');
const Servicio          = require('../../models/generales/Servicio');
const TipoEquipo        = require('../../models/generales/TipoEquipo');
const Usuario           = require('../../models/generales/Usuario');

const EQUIPO_INCLUDE = {
    model: SysEquipo, as: 'equipo',
    attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'serie',
                 'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
    include: [
        { model: Servicio,   as: 'servicio',    attributes: ['id', 'nombres'] },
        { model: TipoEquipo, as: 'tipoEquipo',  attributes: ['id', 'nombres'] }
    ]
};

// ── GET ALL ─────────────────────────────────────────────────────────────────
exports.getAllReportes = async (req, res) => {
    try {
        const { page = 1, limit = 20, equipoId } = req.query;
        const where  = equipoId ? { id_sysequipo_fk: equipoId } : {};
        const offset = (page - 1) * limit;

        const { count, rows } = await SysReporte.findAndCountAll({
            where,
            include: [EQUIPO_INCLUDE,
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos'] }],
            limit: parseInt(limit), offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: rows, total: count,
                   page: parseInt(page), totalPages: Math.ceil(count / limit) });
    } catch (err) {
        console.error('getAllReportes:', err);
        res.status(500).json({ success: false, message: 'Error al obtener reportes', error: err.message });
    }
};

// ── GET BY ID ────────────────────────────────────────────────────────────────
exports.getReporteById = async (req, res) => {
    try {
        const reporte = await SysReporte.findByPk(req.params.id, {
            include: [EQUIPO_INCLUDE,
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos'] }]
        });
        if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        res.json({ success: true, data: reporte });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener reporte', error: err.message });
    }
};

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createReporte = async (req, res) => {
    try {
        const reporte = await SysReporte.create(req.body);
        const result  = await SysReporte.findByPk(reporte.id_sysreporte, {
            include: [EQUIPO_INCLUDE]
        });

        // Registrar en trazabilidad
        if (reporte.id_sysequipo_fk) {
            const eq = result?.equipo;
            const detalles = [
                eq ? `Equipo: ${eq.nombre_equipo}` : '',
                reporte.servicio_anterior ? `De: ${reporte.servicio_anterior}` : '',
                reporte.servicio_nuevo    ? `Hacia: ${reporte.servicio_nuevo}` : '',
                reporte.realizado_por     ? `Por: ${reporte.realizado_por}`    : '',
                reporte.recibido_por      ? `Recibido por: ${reporte.recibido_por}` : ''
            ].filter(Boolean).join(' · ');

            SysTrazabilidad.create({
                accion: 'REPORTE_ENTREGA',
                detalles,
                fecha: new Date(),
                id_sysequipo_fk: reporte.id_sysequipo_fk,
                id_sysusuario_fk: reporte.id_sysusuario_fk || null
            }).catch(e => console.warn('trazabilidad reporte:', e.message));
        }

        res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data: result });
    } catch (err) {
        console.error('createReporte:', err);
        res.status(500).json({ success: false, message: 'Error al crear reporte', error: err.message });
    }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateReporte = async (req, res) => {
    try {
        const reporte = await SysReporte.findByPk(req.params.id);
        if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        await reporte.update(req.body);
        const result = await SysReporte.findByPk(req.params.id, { include: [EQUIPO_INCLUDE] });
        res.json({ success: true, message: 'Reporte actualizado', data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al actualizar reporte', error: err.message });
    }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteReporte = async (req, res) => {
    try {
        const reporte = await SysReporte.findByPk(req.params.id);
        if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        await reporte.destroy();
        res.json({ success: true, message: 'Reporte eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar reporte', error: err.message });
    }
};

// ── PDF REPORTE DE ENTREGA ────────────────────────────────────────────────────
// Formato S-F-03 v05 — ENTREGA DE EQUIPOS HRCATCH
exports.exportarPdfReporte = async (req, res) => {
    try {
        const reporte = await SysReporte.findByPk(req.params.id, {
            include: [EQUIPO_INCLUDE,
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos'] }]
        });
        if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });

        const r  = reporte.toJSON();
        const eq = r.equipo || {};

        const PDFDocument = require('pdfkit');
        const path        = require('path');
        const fs          = require('fs');

        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
        doc.registerFont('Arial',      'C:/Windows/Fonts/arial.ttf');
        doc.registerFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="EntregaEquipos_${r.id_sysreporte}.pdf"`);
        doc.pipe(res);

        const M   = 30;
        const PW  = 612 - M * 2; // 552
        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };
        const today = fmtF(r.fecha) || new Date().toLocaleDateString('es-CO');

        // ── helpers ────────────────────────────────────────────────────────────
        function drawRect(x, cy, w, h, fillColor) {
            if (fillColor) {
                doc.rect(x, cy, w, h).fill(fillColor).stroke('#000');
            } else {
                doc.rect(x, cy, w, h).stroke('#000');
            }
        }

        function txt(text, x, cy, w, opts = {}) {
            doc.font(opts.bold ? 'Arial-Bold' : 'Arial')
               .fontSize(opts.size || 8)
               .fillColor(opts.color || '#000')
               .text(String(text || ''), x, cy, {
                   width: w,
                   align: opts.align || 'left',
                   lineBreak: opts.wrap !== false
               });
        }

        // ── Detección de fila activa ───────────────────────────────────────────
        const normT = (s) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const tipoNorm = normT(val(eq.tipoEquipo?.nombres));
        const filaMap = {
            'TODO EN UNO': ['TODO EN UNO', 'TODOENUNO', 'ALL IN ONE'],
            'PORTATIL':    ['PORTATIL', 'LAPTOP', 'NOTEBOOK'],
            'ESCANER':     ['ESCANER', 'SCANNER'],
            'IMPRESORA':   ['IMPRESORA', 'PRINTER'],
            'TABLET':      ['TABLET'],
            'PROCESADOR':  ['PROCESADOR', 'CPU', 'TORRE'],
            'RAM':         ['RAM', 'MEMORIA RAM', 'MEMORIA'],
            'DISCO DURO':  ['DISCO DURO', 'HDD', 'SSD', 'DISCO'],
            'SOFTWARE':    ['SOFTWARE', 'LICENCIA'],
        };
        let filaActiva = null;
        for (const [fila, keys] of Object.entries(filaMap)) {
            if (keys.some(k => tipoNorm.includes(normT(k)) || normT(k).includes(tipoNorm))) {
                filaActiva = fila;
                break;
            }
        }

        // ── Dimensiones tabla ──────────────────────────────────────────────────
        const COL_EQUIPO = 90;
        const COL_MARCA  = 110;
        const COL_MODELO = 120;
        const COL_SERIE  = 120;
        const COL_INV    = PW - COL_EQUIPO - COL_MARCA - COL_MODELO - COL_SERIE;
        const ROW_H      = 18;

        // ── Logo ───────────────────────────────────────────────────────────────
        const logoPath = path.join(__dirname, '..', '..', 'utilities', 'LogoSanRafael.png');
        let hasLogo = false;
        try { hasLogo = fs.existsSync(logoPath); } catch {}

        let y = M;

        // ══════════════════════════════════════════════════════════════════════
        // ENCABEZADO — idéntico al de Hoja de Vida (S-F-06)
        // 3 columnas × 3 filas
        // ══════════════════════════════════════════════════════════════════════
        const codeColW = 100;
        const logoColW = 80;
        const titleW   = PW - codeColW - logoColW;

        const hdrH  = 68;
        const row1H = 22;
        const row2H = 22;
        const row3H = hdrH - row1H - row2H; // 24

        // Borde exterior completo
        doc.rect(M, y, PW, hdrH).stroke('#000');

        // Separadores verticales
        doc.moveTo(M + codeColW,          y).lineTo(M + codeColW,          y + hdrH).stroke();
        doc.moveTo(M + codeColW + titleW, y).lineTo(M + codeColW + titleW, y + hdrH).stroke();

        // Separador horizontal — columna izquierda (fila 1 | filas 2+3)
        doc.moveTo(M,              y + row1H).lineTo(M + codeColW, y + row1H).stroke();

        // Separadores horizontales — columna central (3 filas)
        doc.moveTo(M + codeColW,   y + row1H)        .lineTo(M + codeColW + titleW, y + row1H)        .stroke();
        doc.moveTo(M + codeColW,   y + row1H + row2H).lineTo(M + codeColW + titleW, y + row1H + row2H).stroke();

        // Separador horizontal — columna logo (logo | fecha)
        const logoH = row1H + row2H; // 44 — el logo ocupa filas 1 y 2
        doc.moveTo(M + codeColW + titleW, y + logoH).lineTo(M + PW, y + logoH).stroke();

        // ── Col izquierda: CÓDIGO y VERSION ──
        doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
           .text('CÓDIGO S-F-03', M + 4, y + (row1H - 6.5) / 2,
                 { width: codeColW - 8, align: 'left', lineBreak: false });

        doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
           .text('VERSION: 05',   M + 4, y + row1H + ((row2H + row3H) - 6.5) / 2,
                 { width: codeColW - 8, align: 'left', lineBreak: false });

        // ── Col central: hospital / nivel / título ──
        const cx = M + codeColW;
        const cw = titleW;

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA',
                 cx, y + (row1H - 8) / 2,
                 { width: cw, align: 'center', lineBreak: false });

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('III NIVEL DE ATENCIÓN',
                 cx, y + row1H + (row2H - 8) / 2,
                 { width: cw, align: 'center', lineBreak: false });

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('ENTREGA DE EQUIPOS HRCATCH',
                 cx, y + row1H + row2H + (row3H - 8) / 2,
                 { width: cw, align: 'center', lineBreak: false });

        // ── Col derecha: logo arriba, fecha abajo ──
        const rx = M + codeColW + titleW;

        if (hasLogo) {
            try {
                doc.image(logoPath, rx + 4, y + 2, {
                    width: logoColW - 8, height: logoH - 4,
                    fit:   [logoColW - 8, logoH - 4],
                    align: 'center', valign: 'center'
                });
            } catch (e) { /* omitir si falla */ }
        }

        doc.font('Arial').fontSize(7).fillColor('#000')
           .text(`Fecha: ${today}`, rx + 2, y + logoH + (row3H - 7) / 2,
                 { width: logoColW - 4, align: 'center', lineBreak: false });

        y += hdrH + 6;

        // ══════════════════════════════════════════════════════════════════════
        // ÁREA O PROCESO / FECHA
        // ══════════════════════════════════════════════════════════════════════
        const INFO_H = 16;
        const AREA_W = Math.round(PW * 0.65);
        const DATE_W = PW - AREA_W;

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('ÁREA O PROCESO:', M, y + 2, { lineBreak: false });
        const areaLblW  = doc.widthOfString('ÁREA O PROCESO:') + 4;
        const areaValX  = M + areaLblW;
        const areaValW  = AREA_W - areaLblW - 2;
        doc.font('Arial').fontSize(8)
           .text(val(r.servicio_anterior || eq.servicio?.nombres), areaValX, y + 2,
                 { width: areaValW, lineBreak: false });
        doc.moveTo(areaValX, y + INFO_H - 2).lineTo(areaValX + areaValW, y + INFO_H - 2).stroke('#000');

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('FECHA:', M + AREA_W + 4, y + 2, { lineBreak: false });
        const fechaLblW = doc.widthOfString('FECHA:') + 4;
        const fechaValX = M + AREA_W + 4 + fechaLblW;
        const fechaValW = DATE_W - fechaLblW - 6;
        doc.font('Arial').fontSize(8)
           .text(today, fechaValX, y + 2, { width: fechaValW, lineBreak: false });
        doc.moveTo(fechaValX, y + INFO_H - 2).lineTo(fechaValX + fechaValW, y + INFO_H - 2).stroke('#000');

        y += INFO_H + 2;

        // NOMBRE DE QUIEN ENTREGA
        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('NOMBRE DE QUIEN ENTREGA:', M, y + 2, { lineBreak: false });
        const entLblW  = doc.widthOfString('NOMBRE DE QUIEN ENTREGA:') + 4;
        const entValX  = M + entLblW;
        const entValW  = PW - entLblW - 2;
        doc.font('Arial').fontSize(8)
           .text(val(r.realizado_por), entValX, y + 2, { width: entValW, lineBreak: false });
        doc.moveTo(entValX, y + INFO_H - 2).lineTo(entValX + entValW, y + INFO_H - 2).stroke('#000');

        y += INFO_H + 8;

        // ══════════════════════════════════════════════════════════════════════
        // TABLA DE EQUIPOS
        // ══════════════════════════════════════════════════════════════════════
        const TBL_HDR_H = 16;

        // Encabezado en blanco con bordes (igual que hoja de vida)
        drawRect(M,                                                     y, COL_EQUIPO, TBL_HDR_H);
        drawRect(M + COL_EQUIPO,                                        y, COL_MARCA,  TBL_HDR_H);
        drawRect(M + COL_EQUIPO + COL_MARCA,                            y, COL_MODELO, TBL_HDR_H);
        drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO,               y, COL_SERIE,  TBL_HDR_H);
        drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE,   y, COL_INV,    TBL_HDR_H);

        const hOpts = { bold: true, size: 7, align: 'center' };
        txt('EQUIPO:',     M + 2,                                                    y + 4, COL_EQUIPO - 4, hOpts);
        txt('MARCA:',      M + COL_EQUIPO + 2,                                       y + 4, COL_MARCA  - 4, hOpts);
        txt('MODELO:',     M + COL_EQUIPO + COL_MARCA + 2,                           y + 4, COL_MODELO - 4, hOpts);
        txt('SERIE:',      M + COL_EQUIPO + COL_MARCA + COL_MODELO + 2,              y + 4, COL_SERIE  - 4, hOpts);
        txt('INVENTARIO:', M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 2,  y + 4, COL_INV    - 4, hOpts);
        y += TBL_HDR_H;

        // Filas con 5 columnas
        const FILAS_5COL = ['TODO EN UNO', 'PORTATIL', 'ESCANER', 'IMPRESORA', 'TABLET'];
        // Filas con celda única (sin divisiones internas)
        const FILAS_1COL = ['PROCESADOR', 'RAM', 'DISCO DURO', 'SOFTWARE'];

        for (const tipo of FILAS_5COL) {
            const esActivo = tipo === filaActiva;
            const bg = esActivo ? '#e8f4f8' : null;
            drawRect(M,                                                   y, COL_EQUIPO, ROW_H, bg);
            drawRect(M + COL_EQUIPO,                                      y, COL_MARCA,  ROW_H, bg);
            drawRect(M + COL_EQUIPO + COL_MARCA,                          y, COL_MODELO, ROW_H, bg);
            drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO,             y, COL_SERIE,  ROW_H, bg);
            drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV,    ROW_H, bg);
            txt(tipo, M + 3, y + 5, COL_EQUIPO - 6, { size: 7.5 });
            if (esActivo) {
                txt(val(eq.marca),            M + COL_EQUIPO + 3,                              y + 5, COL_MARCA  - 6, { size: 7.5 });
                txt(val(eq.modelo),           M + COL_EQUIPO + COL_MARCA + 3,                  y + 5, COL_MODELO - 6, { size: 7.5 });
                txt(val(eq.serie),            M + COL_EQUIPO + COL_MARCA + COL_MODELO + 3,     y + 5, COL_SERIE  - 6, { size: 7.5 });
                txt(val(eq.placa_inventario), M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 3, y + 5, COL_INV - 6, { size: 7.5 });
            }
            y += ROW_H;
        }

        for (const tipo of FILAS_1COL) {
            const esActivo = tipo === filaActiva;
            const bg = esActivo ? '#e8f4f8' : null;
            drawRect(M, y, PW, ROW_H, bg);
            txt(tipo, M + 3, y + 5, COL_EQUIPO - 6, { size: 7.5 });
            if (esActivo) {
                txt(val(eq.marca),            M + COL_EQUIPO + 3,                              y + 5, COL_MARCA  - 6, { size: 7.5 });
                txt(val(eq.modelo),           M + COL_EQUIPO + COL_MARCA + 3,                  y + 5, COL_MODELO - 6, { size: 7.5 });
                txt(val(eq.serie),            M + COL_EQUIPO + COL_MARCA + COL_MODELO + 3,     y + 5, COL_SERIE  - 6, { size: 7.5 });
                txt(val(eq.placa_inventario), M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 3, y + 5, COL_INV - 6, { size: 7.5 });
            }
            y += ROW_H;
        }

        // Fila EQUIPO QUE SE RETIRA
        drawRect(M,                                                   y, COL_EQUIPO, ROW_H);
        drawRect(M + COL_EQUIPO,                                      y, COL_MARCA,  ROW_H);
        drawRect(M + COL_EQUIPO + COL_MARCA,                          y, COL_MODELO, ROW_H);
        drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO,             y, COL_SERIE,  ROW_H);
        drawRect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV,    ROW_H);
        txt('EQUIPO QUE SE\nRETIRA', M + 3, y + 3, COL_EQUIPO - 6, { size: 7 });
        txt(val(eq.marca),            M + COL_EQUIPO + 3,                              y + 5, COL_MARCA  - 6, { size: 7.5 });
        txt(val(eq.modelo),           M + COL_EQUIPO + COL_MARCA + 3,                  y + 5, COL_MODELO - 6, { size: 7.5 });
        txt(val(eq.serie),            M + COL_EQUIPO + COL_MARCA + COL_MODELO + 3,     y + 5, COL_SERIE  - 6, { size: 7.5 });
        txt(val(eq.placa_inventario), M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 3, y + 5, COL_INV - 6, { size: 7.5 });
        y += ROW_H;

        // Fila UBICACIÓN ANTERIOR | UBICACIÓN ACTUAL
        const UBI_H = 24;
        const UBI_W = Math.round(PW / 2);
        drawRect(M,         y, UBI_W,       UBI_H);
        drawRect(M + UBI_W, y, PW - UBI_W,  UBI_H);

        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('UBICACIÓN\nANTERIOR:', M + 3, y + 3, { width: 58, lineBreak: true });
        doc.font('Arial').fontSize(7.5)
           .text(val(r.ubicacion_anterior || eq.ubicacion), M + 62, y + 7,
                 { width: UBI_W - 66, lineBreak: false });

        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('UBICACIÓN\nACTUAL:', M + UBI_W + 3, y + 3, { width: 52, lineBreak: true });
        doc.font('Arial').fontSize(7.5)
           .text(val(r.ubicacion_nueva), M + UBI_W + 58, y + 7,
                 { width: PW - UBI_W - 62, lineBreak: false });
        y += UBI_H;

        // ══════════════════════════════════════════════════════════════════════
        // OBSERVACIONES
        // ══════════════════════════════════════════════════════════════════════
        const OBS_H = 60;
        drawRect(M, y, PW, OBS_H);
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('OBSERVACIONES', M + 3, y + 4, { lineBreak: false });
        doc.font('Arial').fontSize(8)
           .text(val(r.observaciones), M + 5, y + 16, { width: PW - 10 });
        y += OBS_H + 10;

        // ══════════════════════════════════════════════════════════════════════
        // FOOTER — NOMBRE DE QUIEN RECIBE / FIRMA / CARGO / CEDULA
        // ══════════════════════════════════════════════════════════════════════
        const FTR_H = 18;
        const MID   = M + Math.round(PW * 0.55);

        // Fila 1
        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('NOMBRE DE QUIEN RECIBE:', M, y + 3, { lineBreak: false });
        const nLblW = doc.widthOfString('NOMBRE DE QUIEN RECIBE:') + 4;
        const nValX = M + nLblW;
        const nValW = MID - nValX - 4;
        doc.font('Arial').fontSize(8).text(val(r.recibido_por), nValX, y + 3, { width: nValW, lineBreak: false });
        doc.moveTo(nValX, y + FTR_H - 2).lineTo(nValX + nValW, y + FTR_H - 2).stroke('#000');

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('FIRMA:', MID + 4, y + 3, { lineBreak: false });
        const fLblW = doc.widthOfString('FIRMA:') + 4;
        const fValX = MID + 4 + fLblW;
        const fValW = M + PW - fValX - 2;
        doc.moveTo(fValX, y + FTR_H - 2).lineTo(fValX + fValW, y + FTR_H - 2).stroke('#000');

        y += FTR_H + 4;

        // Fila 2
        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('CARGO:', M, y + 3, { lineBreak: false });
        const cLblW = doc.widthOfString('CARGO:') + 4;
        const cValX = M + cLblW;
        const cValW = MID - cValX - 4;
        doc.moveTo(cValX, y + FTR_H - 2).lineTo(cValX + cValW, y + FTR_H - 2).stroke('#000');

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('CEDULA:', MID + 4, y + 3, { lineBreak: false });
        const dLblW = doc.widthOfString('CEDULA:') + 4;
        const dValX = MID + 4 + dLblW;
        const dValW = M + PW - dValX - 2;
        doc.moveTo(dValX, y + FTR_H - 2).lineTo(dValX + dValW, y + FTR_H - 2).stroke('#000');

        doc.end();

    } catch (err) {
        console.error('exportarPdfReporte:', err);
        if (!res.headersSent)
            res.status(500).json({ success: false, message: 'Error al generar PDF', error: err.message });
    }
};

// ── PDF DADO DE BAJA — Formato IB-F-39 v001 ──────────────────────────────────
exports.exportarPdfBaja = async (req, res) => {
    try {
        const { bajaId } = req.params;

        const baja = await SysBaja.findByPk(bajaId, {
            include: [
                {
                    model: SysEquipo, as: 'equipo',
                    attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo',
                                 'serie', 'placa_inventario', 'ubicacion'],
                    include: [
                        { model: Servicio,   as: 'servicio',   attributes: ['id', 'nombres'] },
                        { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] }
                    ]
                },
                { model: Usuario, as: 'usuarioBaja', attributes: ['id', 'nombres', 'apellidos'] }
            ]
        });

        if (!baja) return res.status(404).json({ success: false, message: 'Registro de baja no encontrado' });

        const b  = baja.toJSON();
        const eq = b.equipo || {};

        // Último mantenimiento del equipo para la sección 2
        let ultimoMtto = null;
        if (eq.id_sysequipo) {
            ultimoMtto = await SysMantenimiento.findOne({
                where: { id_sysequipo_fk: eq.id_sysequipo },
                order: [['fecha', 'DESC'], ['createdAt', 'DESC']],
                attributes: ['id_sysmtto', 'numero_reporte', 'fecha']
            });
        }

        const PDFDocument = require('pdfkit');
        const path        = require('path');
        const fs          = require('fs');

        const M   = 30;
        const PW  = 612 - M * 2; // 552
        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };
        const today = fmtF(b.fecha_baja) || new Date().toLocaleDateString('es-CO');

        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
        doc.registerFont('Arial',      'C:/Windows/Fonts/arial.ttf');
        doc.registerFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="Baja_${val(eq.placa_inventario) || bajaId}.pdf"`);
        doc.pipe(res);

        // ── helpers ────────────────────────────────────────────────────────────
        function drawRect(x, cy, w, h, fillColor) {
            if (fillColor) {
                doc.rect(x, cy, w, h).fill(fillColor).stroke('#000');
            } else {
                doc.rect(x, cy, w, h).stroke('#000');
            }
        }

        // Barra de sección — verde #009688 con texto blanco (mismo color que PDFs biomédica)
        function sectionBar(cy, title) {
            const bH = 17;
            doc.rect(M, cy, PW, bH).fill('#009688').stroke('#000');
            doc.font('Arial-Bold').fontSize(8).fillColor('#ffffff')
               .text(title, M + 4, cy + (bH - 8) / 2, { width: PW - 8, align: 'center', lineBreak: false });
            doc.fillColor('#000');
            return cy + bH;
        }

        // Celda label | value con separador interno
        function splitCell(x, cy, w, h, lblW, label, value, lblSize, valSize) {
            doc.rect(x, cy, w, h).stroke('#000');
            doc.moveTo(x + lblW, cy).lineTo(x + lblW, cy + h).stroke('#000');
            const ls = lblSize || 7;
            const vs = valSize || 8;
            doc.font('Arial-Bold').fontSize(ls).fillColor('#000')
               .text(label, x + 3, cy + (h - ls) / 2, { width: lblW - 6, lineBreak: false });
            doc.font('Arial').fontSize(vs).fillColor('#000')
               .text(val(value), x + lblW + 3, cy + (h - vs) / 2,
                     { width: w - lblW - 6, lineBreak: false });
        }

        // Celda checkbox: [ ] LABEL
        function checkCell(x, cy, w, h, label, checked) {
            doc.rect(x, cy, w, h).stroke('#000');
            const bx = x + 6, by = cy + (h - 9) / 2;
            doc.rect(bx, by, 9, 9).stroke('#000');
            if (checked) {
                doc.font('Arial-Bold').fontSize(9).fillColor('#000')
                   .text('X', bx + 1, by + 0.5, { lineBreak: false });
            }
            doc.font('Arial').fontSize(7).fillColor('#000')
               .text(label, bx + 13, cy + (h - 7) / 2, { width: w - (bx - x) - 17, lineBreak: false });
        }

        // ── Logo ───────────────────────────────────────────────────────────────
        const logoPath = path.join(__dirname, '..', '..', 'utilities', 'LogoSanRafael.png');
        let hasLogo = false;
        try { hasLogo = fs.existsSync(logoPath); } catch {}

        let y = M;

        // ══════════════════════════════════════════════════════════════════════
        // ENCABEZADO — idéntico estructura a Hoja de Vida (3 col × 3 filas)
        // ══════════════════════════════════════════════════════════════════════
        const codeColW = 100;
        const logoColW = 80;
        const titleW   = PW - codeColW - logoColW;

        const hdrH  = 68;
        const row1H = 22;
        const row2H = 22;
        const row3H = hdrH - row1H - row2H; // 24

        // Borde exterior
        doc.rect(M, y, PW, hdrH).stroke('#000');

        // Separadores verticales
        doc.moveTo(M + codeColW,          y).lineTo(M + codeColW,          y + hdrH).stroke();
        doc.moveTo(M + codeColW + titleW, y).lineTo(M + codeColW + titleW, y + hdrH).stroke();

        // Separadores horizontales — col izquierda
        doc.moveTo(M,            y + row1H).lineTo(M + codeColW, y + row1H).stroke();

        // Separadores horizontales — col central
        doc.moveTo(M + codeColW, y + row1H)        .lineTo(M + codeColW + titleW, y + row1H)        .stroke();
        doc.moveTo(M + codeColW, y + row1H + row2H).lineTo(M + codeColW + titleW, y + row1H + row2H).stroke();

        // Separador horizontal — col logo (logo | fecha)
        const logoH = row1H + row2H;
        doc.moveTo(M + codeColW + titleW, y + logoH).lineTo(M + PW, y + logoH).stroke();

        // ── Col izquierda ──
        doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
           .text('CÓDIGO: IB-F-39', M + 4, y + (row1H - 6.5) / 2,
                 { width: codeColW - 8, align: 'left', lineBreak: false });
        doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
           .text('Versión: 001', M + 4, y + row1H + ((row2H + row3H) - 6.5) / 2,
                 { width: codeColW - 8, align: 'left', lineBreak: false });

        // ── Col central ──
        const cx = M + codeColW;
        const cw = titleW;

        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('E.S.E. HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA',
                 cx, y + (row1H - 8) / 2, { width: cw, align: 'center', lineBreak: false });

        // Fila 2 central vacía (solo separador visual)

        // Fila 3 central: título del documento (en 2 líneas si hace falta)
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('CONCEPTO TÉCNICO PARA SUGERENCIA DE BAJA DE TECNOLOGÍAS BIOMÉDICAS',
                 cx, y + row1H + row2H + (row3H - 15) / 2,
                 { width: cw, align: 'center' });

        // ── Col derecha: logo arriba, fecha abajo ──
        const rx = M + codeColW + titleW;

        if (hasLogo) {
            try {
                doc.image(logoPath, rx + 4, y + 2, {
                    width: logoColW - 8, height: logoH - 4,
                    fit:   [logoColW - 8, logoH - 4],
                    align: 'center', valign: 'center'
                });
            } catch (e) { /* omitir si falla */ }
        }

        doc.font('Arial').fontSize(7).fillColor('#000')
           .text(`Fecha: ${today}`, rx + 2, y + logoH + (row3H - 7) / 2,
                 { width: logoColW - 4, align: 'center', lineBreak: false });

        y += hdrH + 6;

        // ══════════════════════════════════════════════════════════════════════
        // 1. INFORMACIÓN GENERAL
        // ══════════════════════════════════════════════════════════════════════
        y = sectionBar(y, '1. INFORMACIÓN GENERAL');

        const RH = 26; // altura de fila — espacio suficiente para texto
        const nombreLblW = 100, marcaLblW = 55;
        const nombreW    = Math.round(PW * 0.58);
        const marcaW     = PW - nombreW;

        // Fila 1: NOMBRE DE LA TECNOLOGÍA | MARCA
        splitCell(M,           y, nombreW, RH, nombreLblW, 'NOMBRE DE LA TECNOLOGÍA', val(eq.nombre_equipo), 7, 8);
        splitCell(M + nombreW, y, marcaW,  RH, marcaLblW,  'MARCA',                   val(eq.marca),         7, 8);
        y += RH;

        // Fila 2: MODELO | SERIE | CÓDIGO INTERNO
        const mW = Math.round(PW * 0.30);
        const sW = Math.round(PW * 0.32);
        const cW = PW - mW - sW;
        splitCell(M,        y, mW, RH, 55,  'MODELO',         val(eq.modelo),           7, 8);
        splitCell(M + mW,   y, sW, RH, 42,  'SERIE',          val(eq.serie),            7, 8);
        splitCell(M+mW+sW,  y, cW, RH, 82,  'CÓDIGO INTERNO', val(eq.placa_inventario), 7, 8);
        y += RH;

        // Fila 3: FECHA DE REALIZACIÓN | Nº REPORTE
        const fdW = Math.round(PW * 0.58);
        const nrW = PW - fdW;
        splitCell(M,     y, fdW, RH, 105, 'FECHA DE REALIZACIÓN', today,                                  7, 8);
        splitCell(M+fdW, y, nrW, RH, 65,  'Nº REPORTE',           String(b.id_sysbaja).padStart(5, '0'), 7, 8);
        y += RH + 6;

        // ══════════════════════════════════════════════════════════════════════
        // 2. RELACIÓN DE REPORTE DE MANTENIMIENTO
        // ══════════════════════════════════════════════════════════════════════
        y = sectionBar(y, '2. RELACIÓN DE REPORTE DE MANTENIMIENTO');

        const hFecha   = Math.round(PW / 2);
        const hReporte = PW - hFecha;
        const SUB_H    = 22; // sub-encabezado
        const DATA_H   = 26; // fila de datos

        // Sub-encabezado FECHA | Nº REPORTE — teal claro
        drawRect(M,        y, hFecha,   SUB_H, '#b2dfdb');
        drawRect(M+hFecha, y, hReporte, SUB_H, '#b2dfdb');
        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('FECHA',      M + 4,         y + (SUB_H-8)/2, { width: hFecha   - 8, align: 'center', lineBreak: false });
        doc.font('Arial-Bold').fontSize(8).fillColor('#000')
           .text('Nº REPORTE', M+hFecha + 4,  y + (SUB_H-8)/2, { width: hReporte - 8, align: 'center', lineBreak: false });
        y += SUB_H;

        // Fila de datos del último mantenimiento
        drawRect(M,        y, hFecha,   DATA_H);
        drawRect(M+hFecha, y, hReporte, DATA_H);
        const mttoFecha   = ultimoMtto ? fmtF(ultimoMtto.fecha) : '';
        const mttoReporte = ultimoMtto
            ? (ultimoMtto.numero_reporte || String(ultimoMtto.id_sysmtto).padStart(5, '0'))
            : '';
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text(mttoFecha,   M + 4,        y + (DATA_H-8)/2, { width: hFecha   - 8, align: 'center', lineBreak: false });
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text(mttoReporte, M+hFecha + 4, y + (DATA_H-8)/2, { width: hReporte - 8, align: 'center', lineBreak: false });
        y += DATA_H + 6;

        // ══════════════════════════════════════════════════════════════════════
        // 3. DESCRIPCIÓN DE LA FALLA
        // ══════════════════════════════════════════════════════════════════════
        y = sectionBar(y, '3. DESCRIPCIÓN DE LA FALLA');
        const descH = 110;
        drawRect(M, y, PW, descH);
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text(val(b.justificacion_baja), M + 6, y + 8, { width: PW - 12, height: descH - 16 });
        y += descH + 6;

        // ══════════════════════════════════════════════════════════════════════
        // 4. CONCEPTO TÉCNICO
        // ══════════════════════════════════════════════════════════════════════
        y = sectionBar(y, '4. CONCEPTO TÉCNICO');

        // Fila de checkboxes (5 opciones en igual ancho)
        const CHK_H = 24;
        const chkOpts = [
            'Daño irreparable',
            'Obsolescencia tecnológica',
            'Reparación no costo/beneficiosa',
            'Pérdida o hurto',
            'Otro'
        ];
        const chkW = Math.floor(PW / chkOpts.length);
        chkOpts.forEach((lbl, i) => {
            const isLast = i === chkOpts.length - 1;
            const w = isLast ? PW - chkW * (chkOpts.length - 1) : chkW;
            checkCell(M + chkW * i, y, w, CHK_H, lbl, false);
        });
        y += CHK_H;

        // Área de texto concepto técnico
        const ctH = 110;
        drawRect(M, y, PW, ctH);
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text(val(b.accesorios_reutilizables), M + 6, y + 8, { width: PW - 12, height: ctH - 16 });
        y += ctH + 6;

        // ══════════════════════════════════════════════════════════════════════
        // 5. FIRMAS DE CONFORMIDAD
        // ══════════════════════════════════════════════════════════════════════
        y = sectionBar(y, '5. FIRMAS DE CONFORMIDAD');

        const fw  = Math.floor(PW / 2);
        const fH  = 95;
        const SH  = 24; // altura sub-encabezado firmas
        const elaboradoNombre = `${val(b.usuarioBaja?.nombres)} ${val(b.usuarioBaja?.apellidos)}`.trim();

        // Sub-encabezados ELABORADO POR | REVISADO POR — teal claro
        drawRect(M,      y, fw,    SH, '#b2dfdb');
        drawRect(M + fw, y, PW-fw, SH, '#b2dfdb');
        doc.font('Arial-Bold').fontSize(8.5).fillColor('#000')
           .text('ELABORADO POR :', M + 4,      y + (SH-8.5)/2, { width: fw-8,    align: 'center', lineBreak: false });
        doc.font('Arial-Bold').fontSize(8.5).fillColor('#000')
           .text('REVISADO POR :',  M+fw + 4,   y + (SH-8.5)/2, { width: PW-fw-8, align: 'center', lineBreak: false });
        y += SH;

        // Cuerpo firmas
        drawRect(M,      y, fw,    fH);
        drawRect(M + fw, y, PW-fw, fH);

        // Elaborado por
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text(`Nombre:  ${elaboradoNombre}`, M + 8, y + 10, { width: fw - 16, lineBreak: false });
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text('Cargo:', M + 8, y + 26, { width: fw - 16, lineBreak: false });
        // Línea de firma
        doc.moveTo(M + 12, y + fH - 22).lineTo(M + fw - 12, y + fH - 22).stroke('#000');
        doc.font('Arial').fontSize(7.5).fillColor('#000')
           .text('Firma', M + 8, y + fH - 15, { lineBreak: false });

        // Revisado por
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text('Nombre:', M + fw + 8, y + 10, { width: PW - fw - 16, lineBreak: false });
        doc.font('Arial').fontSize(8).fillColor('#000')
           .text('Cargo:', M + fw + 8, y + 26, { width: PW - fw - 16, lineBreak: false });
        doc.moveTo(M + fw + 12, y + fH - 22).lineTo(M + PW - 12, y + fH - 22).stroke('#000');
        doc.font('Arial').fontSize(7.5).fillColor('#000')
           .text('Firma', M + fw + 8, y + fH - 15, { lineBreak: false });

        y += fH;

        doc.end();

    } catch (err) {
        console.error('exportarPdfBaja:', err);
        if (!res.headersSent)
            res.status(500).json({ success: false, message: 'Error al generar PDF de baja', error: err.message });
    }
};
