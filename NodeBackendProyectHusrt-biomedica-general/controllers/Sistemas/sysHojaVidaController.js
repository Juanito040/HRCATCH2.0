const { Op } = require('sequelize');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const SysTrazabilidad = require('../../models/Sistemas/SysTrazabilidad');
const Servicio = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');

const CAMPOS_AUDITADOS_HV = [
    'ip', 'mac', 'procesador', 'ram', 'disco_duro', 'sistema_operativo',
    'office', 'tonner', 'nombre_usuario', 'vendedor', 'tipo_uso',
    'fecha_compra', 'fecha_instalacion', 'costo_compra', 'contrato',
    'observaciones', 'compraddirecta', 'convenio', 'donado', 'comodato'
];

async function registrarTrazabilidad({ accion, detalles, equipoId, usuarioId }) {
    try {
        await SysTrazabilidad.create({
            accion,
            detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
            id_sysequipo_fk: equipoId,
            id_sysusuario_fk: usuarioId || null
        });
    } catch (e) {
        console.error('Error al registrar trazabilidad (hoja vida):', e.message);
    }
}

const EQUIPO_INCLUDE = {
    model: SysEquipo,
    as: 'equipo',
    attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'serie', 'placa_inventario', 'ubicacion'],
    include: [
        { model: Servicio, as: 'servicio', attributes: ['id', 'nombres'] },
        { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] }
    ]
};

// Obtener todas las hojas de vida
exports.getAllSysHojasVida = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { ip: { [Op.like]: `%${search}%` } },
                { nombre_usuario: { [Op.like]: `%${search}%` } },
                { procesador: { [Op.like]: `%${search}%` } },
                { sistema_operativo: { [Op.like]: `%${search}%` } },
                { vendedor: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await SysHojaVida.findAndCountAll({
            where,
            include: [EQUIPO_INCLUDE],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Error getAllSysHojasVida:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hojas de vida', error: error.message });
    }
};

// Obtener hoja de vida por ID
exports.getSysHojaVidaById = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id, { include: [EQUIPO_INCLUDE] });

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        res.json({ success: true, data: hojaVida });
    } catch (error) {
        console.error('Error getSysHojaVidaById:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hoja de vida', error: error.message });
    }
};

// Obtener hoja de vida por equipo
exports.getSysHojaVidaByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;
        const hojaVida = await SysHojaVida.findOne({
            where: { id_sysequipo_fk: equipoId },
            include: [EQUIPO_INCLUDE]
        });

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Este equipo no tiene hoja de vida registrada' });
        }

        res.json({ success: true, data: hojaVida });
    } catch (error) {
        console.error('Error getSysHojaVidaByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al obtener hoja de vida', error: error.message });
    }
};

// Crear hoja de vida
exports.createSysHojaVida = async (req, res) => {
    try {
        const { id_sysequipo_fk } = req.body;

        if (!id_sysequipo_fk) {
            return res.status(400).json({ success: false, message: 'El equipo es requerido' });
        }

        // Verificar que el equipo existe
        const equipo = await SysEquipo.findByPk(id_sysequipo_fk);
        if (!equipo) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        // Verificar que no exista ya una hoja de vida para este equipo
        const existing = await SysHojaVida.findOne({ where: { id_sysequipo_fk } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Este equipo ya tiene una hoja de vida registrada' });
        }

        const hojaVida = await SysHojaVida.create(req.body);
        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });

        res.status(201).json({ success: true, message: 'Hoja de vida creada exitosamente', data: result });
    } catch (error) {
        console.error('Error createSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al crear hoja de vida', error: error.message });
    }
};

// Actualizar hoja de vida (reemplazo completo)
exports.updateSysHojaVida = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id);

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        await hojaVida.update(req.body);
        const result = await SysHojaVida.findByPk(id, { include: [EQUIPO_INCLUDE] });

        res.json({ success: true, message: 'Hoja de vida actualizada exitosamente', data: result });
    } catch (error) {
        console.error('Error updateSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar hoja de vida', error: error.message });
    }
};

// Actualizar hoja de vida por equipo (upsert)
exports.upsertByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;

        const equipo = await SysEquipo.findByPk(equipoId);
        if (!equipo) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
        }

        let hojaVida = await SysHojaVida.findOne({ where: { id_sysequipo_fk: equipoId } });

        if (hojaVida) {
            const cambios = CAMPOS_AUDITADOS_HV
                .filter(campo => req.body[campo] !== undefined &&
                    String(req.body[campo] ?? '') !== String(hojaVida.dataValues[campo] ?? ''))
                .map(campo => ({
                    campo,
                    anterior: hojaVida.dataValues[campo],
                    nuevo: req.body[campo]
                }));

            await hojaVida.update({ ...req.body, id_sysequipo_fk: equipoId });

            if (cambios.length > 0) {
                await registrarTrazabilidad({
                    accion: 'HOJA_VIDA',
                    detalles: cambios,
                    equipoId: Number(equipoId),
                    usuarioId: req.user?.id
                });
            }
        } else {
            hojaVida = await SysHojaVida.create({ ...req.body, id_sysequipo_fk: equipoId });
            await registrarTrazabilidad({
                accion: 'HOJA_VIDA',
                detalles: 'Hoja de vida del equipo creada',
                equipoId: Number(equipoId),
                usuarioId: req.user?.id
            });
        }

        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });
        res.json({ success: true, message: 'Hoja de vida guardada exitosamente', data: result });
    } catch (error) {
        console.error('Error upsertByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al guardar hoja de vida', error: error.message });
    }
};

// Subir / reemplazar foto del equipo
exports.uploadFotoByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
        }

        let hojaVida = await SysHojaVida.findOne({ where: { id_sysequipo_fk: equipoId } });

        if (!hojaVida) {
            // Si aún no existe hoja de vida, la crea con sólo la foto
            const equipo = await SysEquipo.findByPk(equipoId);
            if (!equipo) {
                return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
            }
            hojaVida = await SysHojaVida.create({ id_sysequipo_fk: equipoId, foto: req.file.path });
        } else {
            await hojaVida.update({ foto: req.file.path });
        }

        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });

        await registrarTrazabilidad({
            accion: 'HOJA_VIDA',
            detalles: 'Foto del equipo actualizada',
            equipoId: Number(equipoId),
            usuarioId: req.user?.id
        });

        res.json({ success: true, message: 'Foto actualizada exitosamente', data: result });
    } catch (error) {
        console.error('Error uploadFotoByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al subir la foto', error: error.message });
    }
};

// Exportar PDF de hoja de vida por equipo
exports.exportarPdfByEquipo = async (req, res) => {
    try {
        const { equipoId } = req.params;

        const hojaVida = await SysHojaVida.findOne({
            where: { id_sysequipo_fk: equipoId },
            include: [EQUIPO_INCLUDE]
        });

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Este equipo no tiene hoja de vida registrada' });
        }

        const hv = hojaVida.toJSON();
        const eq = hv.equipo || {};

        const PDFDocument = require('pdfkit');
        const fs = require('fs');
        const path = require('path');

        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
        doc.registerFont('Arial',      'C:/Windows/Fonts/arial.ttf');
        doc.registerFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf');

        const filename = `HojaVida_${String(eq.placa_inventario || equipoId).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);

        const M = 30;
        const PW = 612 - M * 2; // 552

        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };
        const chk  = (v) => v ? 'X' : '';
        const today = new Date().toLocaleDateString('es-CO');

        // ---- helpers ----
        function labelCell(x, cy, w, h, label, value) {
            doc.rect(x, cy, w, h).stroke('#000');
            doc.font('Arial-Bold').fontSize(6);
            const lw = doc.widthOfString(label + ':') + 4;
            doc.fillColor('#000').text(label + ':', x + 2, cy + (h - 6) / 2, { lineBreak: false });
            doc.font('Arial').fontSize(7).fillColor('#000')
               .text(String(value || ''), x + lw + 2, cy + (h - 7) / 2, { width: Math.max(w - lw - 6, 20), lineBreak: false });
        }

        function headerCell(x, cy, w, h, text, opts) {
            const fontSize = (opts && opts.fontSize) ? opts.fontSize : 7;
            doc.rect(x, cy, w, h).fillAndStroke('white', '#000');
            doc.font('Arial-Bold').fontSize(fontSize).fillColor('#000')
               .text(text, x + 2, cy + (h - fontSize) / 2, { width: w - 4, align: 'center', lineBreak: false });
        }

        function dataCell(x, cy, w, h, label, value) {
            doc.rect(x, cy, w, h).stroke('#555');
            if (label) {
                doc.font('Arial-Bold').fontSize(5.5).fillColor('#333')
                   .text(label, x + 2, cy + 2, { width: w - 4, lineBreak: false });
            }
            const textY = label ? cy + 10 : cy + Math.max((h - 7) / 2, 2);
            doc.font('Arial').fontSize(7).fillColor('#000')
               .text(String(value || ''), x + 3, textY, { width: w - 6, lineBreak: false });
        }

        function checkCell(x, cy, w, h, checked, label) {
            doc.rect(x, cy, w, h).stroke('#555');
            const bx = x + 4, by = cy + (h - 7) / 2;
            doc.rect(bx, by, 7, 7).stroke('#333');
            if (checked) {
                doc.font('Arial-Bold').fontSize(7).fillColor('#000')
                   .text('X', bx + 1, by, { lineBreak: false });
            }
            doc.font('Arial').fontSize(7).fillColor('#000')
               .text(label, bx + 12, cy + (h - 7) / 2, { width: Math.max(w - 16 - 12, 20), lineBreak: false });
        }

        let y = M;

        // Ruta del logo del hospital
        const logoHospitalPath = path.join(__dirname, '..', '..', '..', 'FrontAppHusrt-biomedica-general', 'public', 'SanRafa.png');

        // ===== CABECERA =====
const codeColW = 100;
const logoColW = 80;
const titleW   = PW - codeColW - logoColW;

const hdrH  = 68;
const row1H = 22; // "E.S.E HOSPITAL..." / "CÓDIGO S-F-06"
const row2H = 22; // "III NIVEL..."     / "VERSION: 06"
const row3H = hdrH - row1H - row2H; // título documento + fecha bajo logo

// --- Borde exterior ---
doc.rect(M, y, PW, hdrH).stroke('#000');

// --- Separadores verticales ---
// izquierda | central
doc.moveTo(M + codeColW, y)
   .lineTo(M + codeColW, y + hdrH)
   .strokeColor('#000').stroke();
// central | logo
doc.moveTo(M + codeColW + titleW, y)
   .lineTo(M + codeColW + titleW, y + hdrH)
   .strokeColor('#000').stroke();

// --- Separador horizontal: columna izquierda (fila1 | filas2+3) ---
doc.moveTo(M, y + row1H)
   .lineTo(M + codeColW, y + row1H)
   .strokeColor('#000').stroke();

// --- Separadores horizontales: columna central (3 filas) ---
doc.moveTo(M + codeColW, y + row1H)
   .lineTo(M + codeColW + titleW, y + row1H)
   .strokeColor('#000').stroke();
doc.moveTo(M + codeColW, y + row1H + row2H)
   .lineTo(M + codeColW + titleW, y + row1H + row2H)
   .strokeColor('#000').stroke();

// --- Separador horizontal: columna logo (logo | fecha) ---
const logoH = row1H + row2H; // el logo ocupa las 2 primeras filas
doc.moveTo(M + codeColW + titleW, y + logoH)
   .lineTo(M + PW, y + logoH)
   .strokeColor('#000').stroke();

// ---- Columna izquierda: CÓDIGO y VERSION ----
doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
   .text('CÓDIGO S-F-06',
         M + 4, y + (row1H - 6.5) / 2,
         { width: codeColW - 8, align: 'left', lineBreak: false });

doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
   .text('VERSION: 06',
         M + 4, y + row1H + ((row2H + row3H) - 6.5) / 2,
         { width: codeColW - 8, align: 'left', lineBreak: false });

// ---- Columna central: hospital / nivel / título ----
const cx = M + codeColW;
const cw  = titleW;

// Fila 1: nombre hospital
doc.font('Arial-Bold').fontSize(8).fillColor('#000')
   .text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA',
         cx, y + (row1H - 8) / 2,
         { width: cw, align: 'center', lineBreak: false });

// Fila 2: nivel de atención
doc.font('Arial-Bold').fontSize(8).fillColor('#000')
   .text('III NIVEL DE ATENCIÓN',
         cx, y + row1H + (row2H - 8) / 2,
         { width: cw, align: 'center', lineBreak: false });

// Fila 3: título documento centrado (sin fecha aquí)
const titleDocY = y + row1H + row2H;
doc.font('Arial-Bold').fontSize(8).fillColor('#000')
   .text('HOJA DE VIDA DIGITAL EQUIPO COMPUTO Y DE COMUNICACIONES HRCATCH',
         cx, titleDocY + (row3H - 16) / 2,
         { width: cw, align: 'center' });

// ---- Columna derecha: logo arriba, fecha abajo ----
const rx = M + codeColW + titleW;

// Logo (ocupa filas 1+2)
if (fs.existsSync(logoHospitalPath)) {
    try {
        doc.image(logoHospitalPath, rx + 4, y + 2, {
            width: logoColW - 8,
            height: logoH - 4,
            fit: [logoColW - 8, logoH - 4],
            align: 'center',
            valign: 'center'
        });
    } catch (e) { /* omitir si falla */ }
}

// Fecha (recuadro fila 3, bajo el logo)
doc.font('Arial').fontSize(7).fillColor('#000')
   .text(`Fecha:${today}`,
         rx + 2, y + logoH + (row3H - 7) / 2,
         { width: logoColW - 4, align: 'center', lineBreak: false });


        // Foto del equipo (se carga más abajo, en la sección IDENTIFICACIÓN)
        const fotoPath = hv.foto ? path.normalize(hv.foto) : null;

        y += hdrH;

        // ===== IDENTIFICACIÓN =====
        const idH = 14;
        doc.rect(M, y, PW, idH).fillAndStroke('white', '#000');
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('IDENTIFICACIÓN', M + 2, y + (idH - 7.5) / 2, { width: PW - 4, align: 'center', lineBreak: false });
        y += idH;

        // Foto del equipo en columna derecha de identificación (span 4 filas)
        const photoColW = 110;
        const mainColW = PW - photoColW;
        const rowH = 18;
        const idStartY = y;
        const idRows = 4;

        // Dibuja el recuadro de la foto
        doc.rect(M + mainColW, idStartY, photoColW, rowH * idRows).stroke('#000');
        if (fotoPath && fs.existsSync(fotoPath)) {
            try {
                doc.image(fotoPath, M + mainColW + 2, idStartY + 2, {
                    width: photoColW - 4,
                    height: rowH * idRows - 4,
                    fit: [photoColW - 4, rowH * idRows - 4],
                    align: 'center', valign: 'center'
                });
            } catch (e) { /* si falla, cuadro vacío */ }
        }

        // Filas de identificación (en el área izquierda)
        const halfMain = Math.floor(mainColW / 2);
        // Fila 1
        labelCell(M,            y, halfMain, rowH, 'DEPARTAMENTO', 'BOYACA');
        labelCell(M + halfMain, y, halfMain, rowH, 'MUNICIPIO', 'TUNJA');
        y += rowH;
        // Fila 2
        labelCell(M,            y, halfMain, rowH, 'DIRECCIÓN', 'CR 11 # 27-27');
        labelCell(M + halfMain, y, halfMain, rowH, 'TELÉFONO', '7405030');
        y += rowH;
        // Fila 3
        labelCell(M,            y, Math.floor(mainColW * 0.7), rowH, 'E-MAIL', 'sistemas9@hospitalsanrafaeldetunja.gov.co');
        labelCell(M + Math.floor(mainColW * 0.7), y, mainColW - Math.floor(mainColW * 0.7), rowH, 'NIVEL', '3');
        y += rowH;
        // Fila 4
        labelCell(M,            y, halfMain, rowH, 'SERVICIO', val(eq.servicio?.nombres));
        labelCell(M + halfMain, y, halfMain, rowH, 'UBICACIÓN', val(eq.ubicacion));
        y += rowH;

        // ===== TRES COLUMNAS: DATOS DEL EQUIPO / FORMA DE ADQUISICIÓN / DATOS DE LA COMPRA =====
        const c1W = 185, c2W = 168, c3W = PW - c1W - c2W;
        const colH = 14;
        const rh   = 20; // altura de fila

        // Sub-anchos internos de cada columna
        const c1LblW  = 82;          // ancho del label en col1
        const xMarkW  = 24;          // ancho de la celda con la X en col2
        const c2LblW  = c2W - xMarkW;
        const c3LblW  = 118;         // ancho del label en col3

        // Helper: celda con [LABEL | VALOR] separados por línea interna
        function splitCell(x, cy, w, h, lblW, label, value) {
            doc.rect(x, cy, w, h).stroke('#000');
            // separador vertical interno
            doc.moveTo(x + lblW, cy).lineTo(x + lblW, cy + h).strokeColor('#888').stroke();
            // label
            doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
               .text(label, x + 3, cy + 3, { width: lblW - 5, lineBreak: false });
            // valor
            const vw = Math.max(w - lblW - 5, 20);
            doc.font('Arial').fontSize(8).fillColor('#000')
               .text(String(value || ''), x + lblW + 3, cy + 3, { width: vw, lineBreak: true, height: h - 4 });
        }

        // Helper: celda de FORMA DE ADQUISICIÓN con [LABEL | X-mark]
        function adqCell(x, cy, w, h, lblW, xW, label, checked) {
            doc.rect(x, cy, w, h).stroke('#000');
            // separador vertical
            doc.moveTo(x + lblW, cy).lineTo(x + lblW, cy + h).strokeColor('#888').stroke();
            // label
            doc.font('Arial-Bold').fontSize(6.5).fillColor('#000')
               .text(label, x + 3, cy + 3, { width: lblW - 5, lineBreak: false });
            // X centrada en la sub-columna derecha
            if (checked) {
                doc.font('Arial-Bold').fontSize(9).fillColor('#000')
                   .text('X', x + lblW + Math.floor((xW - 7) / 2), cy + Math.floor((h - 9) / 2), { lineBreak: false });
            }
        }

        // ---- Cabeceras de columna ----
        headerCell(M,                y, c1W, colH, 'DATOS DEL EQUIPO');
        headerCell(M + c1W,          y, c2W, colH, 'FORMA DE ADQUISICIÓN');
        headerCell(M + c1W + c2W,    y, c3W, colH, 'DATOS DE LA COMPRA');
        y += colH;

        const triY = y;

        // ---- Columna 1: DATOS DEL EQUIPO ----
        splitCell(M, y, c1W, rh, c1LblW, 'NOMBRE DEL EQUIPO:', val(eq.nombre_equipo)); y += rh;
        splitCell(M, y, c1W, rh, c1LblW, 'MARCA:',             val(eq.marca));         y += rh;
        splitCell(M, y, c1W, rh, c1LblW, 'MODELO:',            val(eq.modelo));        y += rh;
        splitCell(M, y, c1W, rh, c1LblW, 'SERIE:',             val(eq.serie));         y += rh;
        splitCell(M, y, c1W, rh, c1LblW, 'INVENTARIO:',        val(eq.placa_inventario)); y += rh;
        splitCell(M, y, c1W, rh, c1LblW, 'TIPO DE EQUIPO:',    val(eq.tipoEquipo?.nombres)); y += rh;
        const triEndY = y;

        // ---- Columna 2: FORMA DE ADQUISICIÓN ----
        let y2 = triY;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'COMPRA DIRECTA:',             hv.compraddirecta); y2 += rh;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'CONVENIO:',                   hv.convenio);       y2 += rh;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'DONADO:',                     hv.donado);         y2 += rh;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'ASIGNADO POR EL MINISTERIO:', false);              y2 += rh;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'ASIGNADO POR LA GOBERNACIÓN:', false);             y2 += rh;
        adqCell(M + c1W, y2, c2W, rh, c2LblW, xMarkW, 'COMODATO:',                   hv.comodato);       y2 += rh;

        // ---- Columna 3: DATOS DE LA COMPRA ----
        const x3 = M + c1W + c2W;
        let y3 = triY;
        splitCell(x3, y3, c3W, rh, c3LblW, 'FECHA DE COMPRA:',              fmtF(hv.fecha_compra));      y3 += rh;
        splitCell(x3, y3, c3W, rh, c3LblW, 'FECHA DE INSTALACIÓN:',         fmtF(hv.fecha_instalacion)); y3 += rh;
        splitCell(x3, y3, c3W, rh, c3LblW, 'FECHA DE INICIO DE OPERACIÓN:', '');                         y3 += rh;
        splitCell(x3, y3, c3W, rh, c3LblW, 'FECHA VENCIMIENTO GARANTÍA:',   '');                         y3 += rh;
        splitCell(x3, y3, c3W, rh, c3LblW, 'COSTO EN PESOS:',               val(hv.costo_compra));       y3 += rh;
        splitCell(x3, y3, c3W, rh, c3LblW, 'CONTRATO:',                     val(hv.contrato));

        y = triEndY;

        // ===== REGISTRO TÉCNICO =====
        const rtH = 14;
        doc.rect(M, y, PW, rtH).fillAndStroke('white', '#000');
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('REGISTRO TÉCNICO', M + 2, y + (rtH - 7.5) / 2, { width: PW - 4, align: 'center', lineBreak: false });
        y += rtH;

        // Encabezados de la tabla de accesorios
        const a1W = Math.floor(PW * 0.35), a2W = Math.floor(PW * 0.2), a3W = Math.floor(PW * 0.2), a4W = PW - a1W - a2W - a3W;
        headerCell(M,             y, a1W, rtH, 'ACCESORIOS',    { bg: '#d9e1f2', fg: '#000', fontSize: 7 });
        headerCell(M + a1W,       y, a2W, rtH, 'MARCA:',        { bg: '#d9e1f2', fg: '#000', fontSize: 7 });
        headerCell(M + a1W + a2W, y, a3W, rtH, 'MODELO:',       { bg: '#d9e1f2', fg: '#000', fontSize: 7 });
        headerCell(M + a1W + a2W + a3W, y, a4W, rtH, 'OBSERVACIONES:', { bg: '#d9e1f2', fg: '#000', fontSize: 7 });
        y += rtH;

        // 4 filas vacías
        for (let i = 0; i < 4; i++) {
            doc.rect(M,             y, a1W, rtH).stroke('#000');
            doc.rect(M + a1W,       y, a2W, rtH).stroke('#000');
            doc.rect(M + a1W + a2W, y, a3W, rtH).stroke('#000');
            doc.rect(M + a1W + a2W + a3W, y, a4W, rtH).stroke('#000');
            y += rtH;
        }

        // ===== INFORMACIÓN DEL EQUIPO =====
        const iqH = 14;
        doc.rect(M, y, PW, iqH).fillAndStroke('white', '#000');
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('INFORMACIÓN DEL EQUIPO', M + 2, y + (iqH - 7.5) / 2, { width: PW - 4, align: 'center', lineBreak: false });
        y += iqH;

        // Sub-cabecera CARACTERÍSTICAS TÉCNICAS
        headerCell(M, y, PW, iqH, 'CARACTERÍSTICAS TÉCNICAS', { bg: '#d9e1f2', fg: '#000', fontSize: 7 });
        y += iqH;

        const hw = Math.floor(PW / 2);
        const infoLblW = 90;
        splitCell(M,      y, hw,    rh, infoLblW, 'MEMORIA RAM:',       val(hv.ram)               || 'N/A');
        splitCell(M + hw, y, PW-hw, rh, infoLblW, 'PROCESADOR:',        val(hv.procesador)        || 'N/A'); y += rh;
        splitCell(M,      y, hw,    rh, infoLblW, 'DISCO DURO:',        val(hv.disco_duro)        || 'N/A');
        splitCell(M + hw, y, PW-hw, rh, infoLblW, 'SISTEMA OPERATIVO:', val(hv.sistema_operativo) || 'N/A'); y += rh;
        splitCell(M,      y, hw,    rh, infoLblW, 'OFFICE:',            val(hv.office)            || 'N/A');
        splitCell(M + hw, y, PW-hw, rh, infoLblW, 'DIRECCIÓN IP:',      val(hv.ip)                || 'N/A'); y += rh;
        splitCell(M,      y, PW,    rh, infoLblW, 'REFERENCIA TONNER:', val(hv.tonner)            || 'N/A'); y += rh;

        // ===== OBSERVACIONES =====
        const obLabelH = 14;
        doc.rect(M, y, PW, obLabelH).fillAndStroke('white', '#000');
        doc.font('Arial-Bold').fontSize(7.5).fillColor('#000')
           .text('OBSERVACIONES:', M + 2, y + (obLabelH - 7.5) / 2, { lineBreak: false });
        y += obLabelH;

        // Filas de observaciones
        const obsRowH = 14;
        const obsText = val(hv.observaciones);
        if (obsText) {
            const obsBoxH = 56;
            doc.rect(M, y, PW, obsBoxH).stroke('#555');
            doc.font('Arial').fontSize(7).fillColor('#000')
               .text(obsText, M + 4, y + 4, { width: PW - 8, height: obsBoxH - 8 });
            y += obsBoxH;
        } else {
            for (let i = 0; i < 4; i++) {
                doc.rect(M, y, PW, obsRowH).stroke('#555');
                y += obsRowH;
            }
        }

        // ===== PIE DE PÁGINA =====
        y += 6;
        doc.font('Arial').fontSize(6.5).fillColor('#000')
           .text('ND: NO DISPONIBLE   NR: NO REGISTRA   NE: NO ESPECIFICA   NA: NO APLICA', M, y, { width: PW, lineBreak: false });

        doc.end();

    } catch (error) {
        console.error('Error exportarPdfByEquipo:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar el PDF', error: error.message });
        }
    }
};

// Eliminar hoja de vida
exports.deleteSysHojaVida = async (req, res) => {
    try {
        const { id } = req.params;
        const hojaVida = await SysHojaVida.findByPk(id);

        if (!hojaVida) {
            return res.status(404).json({ success: false, message: 'Hoja de vida no encontrada' });
        }

        await hojaVida.destroy();
        res.json({ success: true, message: 'Hoja de vida eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleteSysHojaVida:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar hoja de vida', error: error.message });
    }
};
