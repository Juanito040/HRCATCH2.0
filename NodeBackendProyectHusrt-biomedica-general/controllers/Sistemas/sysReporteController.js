const SysReporte      = require('../../models/Sistemas/SysReporte');
const SysEquipo       = require('../../models/Sistemas/SysEquipo');
const SysBaja         = require('../../models/Sistemas/SysBaja');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const Servicio        = require('../../models/generales/Servicio');
const TipoEquipo      = require('../../models/generales/TipoEquipo');
const Usuario         = require('../../models/generales/Usuario');

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
        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="Reporte_${r.id_sysreporte}.pdf"`);
        doc.pipe(res);

        const M  = 30;
        const PW = 552;
        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };

        function cell(x, cy, w, h, label, value) {
            doc.rect(x, cy, w, h).stroke('#999');
            if (label) {
                doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#444')
                   .text(label, x + 2, cy + 2, { width: w - 4, lineBreak: false });
            }
            doc.font('Helvetica').fontSize(7.5).fillColor('#111')
               .text(String(value || ''), x + 3, label ? cy + 11 : cy + 4,
                     { width: w - 6, lineBreak: false });
        }

        function sectionBar(cy, title) {
            const bH = 14;
            doc.rect(M, cy, PW, bH).fill('#1a3a6c');
            doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5)
               .text(title, M + 6, cy + 3, { width: PW - 12, lineBreak: false });
            doc.fillColor('#111');
            return cy + bH;
        }

        let y = M;

        // ── CABECERA ──
        doc.rect(M, y, PW, 60).stroke('#555');
        doc.rect(M + PW - 122, y, 122, 60).stroke('#555');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a3a6c')
           .text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', M + 6, y + 6, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica').fontSize(7.5).fillColor('#333')
           .text('II NIVEL DE ATENCIÓN  ·  NIT: 891.800.611-7', M + 6, y + 18, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#2c5282')
           .text('REPORTE DE ENTREGA DE EQUIPO DE SISTEMAS', M + 6, y + 32, { width: PW - 134, lineBreak: false });

        const cx = M + PW - 120;
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('CÓDIGO:', cx + 2, y + 6, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('GI-F-014', cx + 38, y + 6, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('VERSIÓN:', cx + 2, y + 16, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('01', cx + 38, y + 16, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#1a3a6c')
           .text(`N° ${String(r.id_sysreporte).padStart(4, '0')}`, cx + 2, y + 32, { width: 116, align: 'center', lineBreak: false });
        doc.fillColor('#111');
        y += 60;

        // ── DATOS DEL REPORTE ──
        y = sectionBar(y, 'DATOS DEL REPORTE');
        const c3 = Math.floor(PW / 3);
        cell(M,        y, c3,      22, 'NÚMERO DE REPORTE', String(r.id_sysreporte).padStart(4, '0'));
        cell(M + c3,   y, c3,      22, 'PLACA DE INVENTARIO', val(eq.placa_inventario));
        cell(M + c3*2, y, PW-c3*2, 22, 'FECHA', fmtF(r.fecha));
        y += 22;

        cell(M,        y, c3,      22, 'SERVICIO ANTERIOR', val(r.servicio_anterior || eq.servicio?.nombres));
        cell(M + c3,   y, c3,      22, 'UBICACIÓN ANTERIOR', val(r.ubicacion_anterior || eq.ubicacion));
        cell(M + c3*2, y, PW-c3*2, 22, 'EQUIPO', val(eq.nombre_equipo));
        y += 22;

        const c4 = Math.floor(PW / 3);
        cell(M,        y, c4,      20, 'HORA DE LLAMADO',     val(r.hora_llamado));
        cell(M + c4,   y, c4,      20, 'HORA DE INICIO',      val(r.hora_inicio));
        cell(M + c4*2, y, PW-c4*2, 20, 'HORA DE TERMINACIÓN', val(r.hora_terminacion));
        y += 20;

        // ── DATOS DE ENTREGA ──
        y = sectionBar(y, 'DATOS DE ENTREGA');
        const h2 = Math.floor(PW / 2);
        cell(M,      y, h2,     22, 'SERVICIO DESTINO',    val(r.servicio_nuevo));
        cell(M + h2, y, PW-h2,  22, 'UBICACIÓN DESTINO',   val(r.ubicacion_nueva));
        y += 22;
        cell(M,      y, h2,     22, 'UBICACIÓN ESPECÍFICA', val(r.ubicacion_especifica));
        cell(M + h2, y, PW-h2,  22, 'TIPO DE EQUIPO',       val(eq.tipoEquipo?.nombres));
        y += 22;
        cell(M,      y, h2,     22, 'REALIZADO POR',  val(r.realizado_por));
        cell(M + h2, y, PW-h2,  22, 'RECIBIDO POR',   val(r.recibido_por));
        y += 22;

        // ── DATOS TÉCNICOS DEL EQUIPO ──
        y = sectionBar(y, 'DATOS TÉCNICOS DEL EQUIPO');
        cell(M,        y, c3,      20, 'MARCA',  val(eq.marca));
        cell(M + c3,   y, c3,      20, 'MODELO', val(eq.modelo));
        cell(M + c3*2, y, PW-c3*2, 20, 'SERIE',  val(eq.serie));
        y += 20;

        // ── OBSERVACIONES ──
        y = sectionBar(y, 'OBSERVACIONES');
        const obsH = 55;
        doc.rect(M, y, PW, obsH).stroke('#999');
        doc.font('Helvetica').fontSize(8).fillColor('#111')
           .text(val(r.observaciones), M + 5, y + 5, { width: PW - 10, height: obsH - 10 });
        y += obsH;

        // ── FIRMAS ──
        y = sectionBar(y, 'FIRMAS DE CONFORMIDAD');
        const fw = Math.floor(PW / 2);
        doc.rect(M,      y, fw,     60).stroke('#999');
        doc.rect(M + fw, y, PW-fw,  60).stroke('#999');
        doc.font('Helvetica-Bold').fontSize(6).fillColor('#555')
           .text('ENTREGADO POR', M + 2, y + 4, { width: fw - 4, align: 'center', lineBreak: false })
           .text('RECIBIDO POR',  M + fw + 2, y + 4, { width: PW-fw-4, align: 'center', lineBreak: false });
        doc.moveTo(M + 10,      y + 50).lineTo(M + fw - 10,      y + 50).stroke('#888');
        doc.moveTo(M + fw + 10, y + 50).lineTo(M + PW - 10,      y + 50).stroke('#888');
        doc.font('Helvetica').fontSize(6).fillColor('#666')
           .text(val(r.realizado_por), M + 2,      y + 52, { width: fw - 4,    align: 'center', lineBreak: false })
           .text(val(r.recibido_por),  M + fw + 2, y + 52, { width: PW-fw-4,   align: 'center', lineBreak: false });
        y += 60;

        y += 8;
        doc.font('Helvetica').fontSize(6).fillColor('#888')
           .text('NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO',
                 M, y, { width: PW, align: 'center', lineBreak: false });

        doc.end();

    } catch (err) {
        console.error('exportarPdfReporte:', err);
        if (!res.headersSent)
            res.status(500).json({ success: false, message: 'Error al generar PDF', error: err.message });
    }
};

// ── PDF DADO DE BAJA ──────────────────────────────────────────────────────────
exports.exportarPdfBaja = async (req, res) => {
    try {
        const { bajaId } = req.params;

        const baja = await SysBaja.findByPk(bajaId, {
            include: [
                {
                    model: SysEquipo, as: 'equipo',
                    attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo',
                                 'serie', 'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
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

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });

        const M  = 30;
        const PW = 552;
        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="Baja_${val(eq.placa_inventario) || bajaId}.pdf"`);
        doc.pipe(res);

        function cell(x, cy, w, h, label, value) {
            doc.rect(x, cy, w, h).stroke('#999');
            if (label) {
                doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#444')
                   .text(label, x + 2, cy + 2, { width: w - 4, lineBreak: false });
            }
            doc.font('Helvetica').fontSize(7.5).fillColor('#111')
               .text(String(value || ''), x + 3, label ? cy + 11 : cy + 4,
                     { width: w - 6, lineBreak: false });
        }

        function sectionBar(cy, title) {
            const bH = 14;
            doc.rect(M, cy, PW, bH).fill('#7b1f1f');
            doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5)
               .text(title, M + 6, cy + 3, { width: PW - 12, lineBreak: false });
            doc.fillColor('#111');
            return cy + bH;
        }

        let y = M;

        // ── CABECERA ──
        doc.rect(M, y, PW, 62).stroke('#555');
        doc.rect(M + PW - 122, y, 122, 62).stroke('#555');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#7b1f1f')
           .text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', M + 6, y + 6, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica').fontSize(7.5).fillColor('#333')
           .text('II NIVEL DE ATENCIÓN  ·  NIT: 891.800.611-7', M + 6, y + 18, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#7b1f1f')
           .text('CONCEPTO TÉCNICO PARA EVIDENCIA DE', M + 6, y + 32, { width: PW - 134, lineBreak: false })
           .text('BAJA DE TECNOLOGÍA (CTEBT)', M + 6, y + 43, { width: PW - 134, lineBreak: false });

        const cx = M + PW - 120;
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('CÓDIGO:', cx + 2, y + 6, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('GI-F-015', cx + 38, y + 6, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('VERSIÓN:', cx + 2, y + 16, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('01', cx + 38, y + 16, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('FECHA:', cx + 2, y + 26, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text(fmtF(b.fecha_baja), cx + 38, y + 26, { lineBreak: false });
        doc.fillColor('#111');
        y += 62;

        // ── SECCIÓN 1: INFORMACIÓN GENERAL ──
        y = sectionBar(y, '1. INFORMACIÓN GENERAL');
        const c3 = Math.floor(PW / 3);
        cell(M,        y, c3,      22, 'FECHA DE BAJA',       fmtF(b.fecha_baja));
        cell(M + c3,   y, c3,      22, 'SERVICIO',             val(eq.servicio?.nombres));
        cell(M + c3*2, y, PW-c3*2, 22, 'RESPONSABLE',          `${val(b.usuarioBaja?.nombres)} ${val(b.usuarioBaja?.apellidos)}`);
        y += 22;

        // ── SECCIÓN 2: RELACIÓN DEL EQUIPO ──
        y = sectionBar(y, '2. RELACIÓN DEL EQUIPO');
        const h2 = Math.floor(PW / 2);
        cell(M,      y, h2,     20, 'NOMBRE DEL EQUIPO',  val(eq.nombre_equipo));
        cell(M + h2, y, PW-h2,  20, 'TIPO DE EQUIPO',     val(eq.tipoEquipo?.nombres));
        y += 20;
        cell(M,        y, c3,      20, 'MARCA',            val(eq.marca));
        cell(M + c3,   y, c3,      20, 'MODELO',           val(eq.modelo));
        cell(M + c3*2, y, PW-c3*2, 20, 'SERIE',            val(eq.serie));
        y += 20;
        cell(M,      y, h2,     20, 'PLACA / ACTIVO',     val(eq.placa_inventario));
        cell(M + h2, y, PW-h2,  20, 'UBICACIÓN',          val(eq.ubicacion));
        y += 20;

        // ── SECCIÓN 3: JUSTIFICACIÓN / DESCRIPCIÓN ──
        y = sectionBar(y, '3. JUSTIFICACIÓN DE LA BAJA');
        const j1H = 70;
        doc.rect(M, y, PW, j1H).stroke('#999');
        doc.font('Helvetica').fontSize(8).fillColor('#111')
           .text(val(b.justificacion_baja), M + 5, y + 5, { width: PW - 10, height: j1H - 10 });
        y += j1H;

        // ── SECCIÓN 4: ACCESORIOS REUTILIZABLES ──
        y = sectionBar(y, '4. ACCESORIOS / COMPONENTES REUTILIZABLES');
        const a1H = 55;
        doc.rect(M, y, PW, a1H).stroke('#999');
        const accesorios = val(b.accesorios_reutilizables) || 'Ninguno';
        doc.font('Helvetica').fontSize(8).fillColor('#111')
           .text(accesorios, M + 5, y + 5, { width: PW - 10, height: a1H - 10 });
        y += a1H;

        // ── SECCIÓN 5: CONCEPTO TÉCNICO ──
        y = sectionBar(y, '5. CONCEPTO TÉCNICO');
        const ct = 60;
        doc.rect(M, y, PW, ct).stroke('#999');
        doc.font('Helvetica').fontSize(8).fillColor('#555')
           .text('El equipo descrito ha sido evaluado técnicamente y se determina que no es viable su reparación o reutilización, ' +
                 'por lo que se procede a dar de baja definitiva del inventario institucional.',
                 M + 5, y + 5, { width: PW - 10, height: ct - 10 });
        y += ct;

        // ── SECCIÓN 6: FIRMAS ──
        y = sectionBar(y, '6. FIRMAS DE CONFORMIDAD');
        const fw  = Math.floor(PW / 2);
        const fhH = 65;
        doc.rect(M,      y, fw,    fhH).stroke('#999');
        doc.rect(M + fw, y, PW-fw, fhH).stroke('#999');
        doc.font('Helvetica-Bold').fontSize(6).fillColor('#555')
           .text('RESPONSABLE TÉCNICO', M + 2,      y + 4, { width: fw-4,   align: 'center', lineBreak: false })
           .text('JEFE DE SERVICIO',    M + fw + 2, y + 4, { width: PW-fw-4, align: 'center', lineBreak: false });
        doc.moveTo(M + 15,      y + 53).lineTo(M + fw - 15,      y + 53).stroke('#888');
        doc.moveTo(M + fw + 15, y + 53).lineTo(M + PW - 15,      y + 53).stroke('#888');
        doc.font('Helvetica').fontSize(6).fillColor('#666')
           .text(`${val(b.usuarioBaja?.nombres)} ${val(b.usuarioBaja?.apellidos)}`,
                 M + 2,      y + 55, { width: fw-4,   align: 'center', lineBreak: false })
           .text('_______________________',
                 M + fw + 2, y + 55, { width: PW-fw-4, align: 'center', lineBreak: false });
        y += fhH + 8;

        doc.font('Helvetica').fontSize(6).fillColor('#888')
           .text('NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO',
                 M, y, { width: PW, align: 'center', lineBreak: false });

        doc.end();

    } catch (err) {
        console.error('exportarPdfBaja:', err);
        if (!res.headersSent)
            res.status(500).json({ success: false, message: 'Error al generar PDF de baja', error: err.message });
    }
};
