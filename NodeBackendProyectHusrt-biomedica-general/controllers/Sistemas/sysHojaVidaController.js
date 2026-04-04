const { Op } = require('sequelize');
const SysHojaVida = require('../../models/Sistemas/SysHojaVida');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const Servicio = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');

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
            await hojaVida.update({ ...req.body, id_sysequipo_fk: equipoId });
        } else {
            hojaVida = await SysHojaVida.create({ ...req.body, id_sysequipo_fk: equipoId });
        }

        const result = await SysHojaVida.findByPk(hojaVida.id_syshoja_vida, { include: [EQUIPO_INCLUDE] });
        res.json({ success: true, message: 'Hoja de vida guardada exitosamente', data: result });
    } catch (error) {
        console.error('Error upsertByEquipo:', error);
        res.status(500).json({ success: false, message: 'Error al guardar hoja de vida', error: error.message });
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
        const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });

        const filename = `HojaVida_${String(eq.placa_inventario || equipoId).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);

        const M = 30;
        const PW = 612 - M * 2; // 552

        const val  = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';
        const fmtF = (v) => { if (!v) return ''; try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); } };
        const chk  = (v) => v ? '[X]' : '[ ]';

        // ---- helpers ----
        function cell(x, cy, w, h, label, value) {
            doc.rect(x, cy, w, h).stroke('#999');
            if (label) {
                doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#444')
                   .text(label, x + 2, cy + 2, { width: w - 4, lineBreak: false });
            }
            const textY = label ? cy + 11 : cy + Math.max((h - 8) / 2, 3);
            doc.font('Helvetica').fontSize(7.5).fillColor('#111')
               .text(String(value || ''), x + 3, textY, { width: w - 6, lineBreak: false });
        }

        function subHeader(x, cy, w, h, title) {
            doc.rect(x, cy, w, h).fill('#dce8f7');
            doc.rect(x, cy, w, h).stroke('#999');
            doc.font('Helvetica-Bold').fontSize(7).fillColor('#1a3a5c')
               .text(title, x + 2, cy + (h - 7) / 2, { width: w - 4, align: 'center', lineBreak: false });
            doc.fillColor('#111');
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

        // ===== CABECERA =====
        doc.rect(M, y, PW, 68).stroke('#555');
        doc.rect(M + PW - 122, y, 122, 68).stroke('#555');
        doc.moveTo(M + PW - 122, y + 34).lineTo(M + PW, y + 34).stroke('#bbb');

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a3a6c')
           .text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', M + 6, y + 6, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica').fontSize(7.5).fillColor('#333')
           .text('II NIVEL DE ATENCIÓN', M + 6, y + 19, { width: PW - 134, lineBreak: false })
           .text('NIT: 891.800.611-7', M + 6, y + 29, { width: PW - 134, lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#2c5282')
           .text('HOJA DE VIDA DIGITAL DE EQUIPO DE CÓMPUTO', M + 6, y + 41, { width: PW - 134, lineBreak: false })
           .text('Y COMUNICACIONES (HCAT)', M + 6, y + 53, { width: PW - 134, lineBreak: false });

        const cx = M + PW - 120;
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('CÓDIGO:', cx + 2, y + 5, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('GI-F-013', cx + 38, y + 5, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('VERSIÓN:', cx + 2, y + 14, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('01', cx + 38, y + 14, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
           .text('VIGENCIA:', cx + 2, y + 23, { lineBreak: false });
        doc.font('Helvetica').fontSize(6.5).fillColor('#000')
           .text('2024', cx + 38, y + 23, { lineBreak: false });
        doc.font('Helvetica').fontSize(6).fillColor('#888')
           .text('FOTO DEL EQUIPO', cx + 2, y + 39, { width: 116, align: 'center', lineBreak: false });
        doc.rect(cx + 8, y + 49, 104, 14).stroke('#ccc');
        doc.fillColor('#111');

        y += 68;

        // ===== IDENTIFICACIÓN =====
        y = sectionBar(y, 'IDENTIFICACIÓN');

        const c3 = Math.floor(PW / 3);
        cell(M,        y, c3,       22, 'DEPARTAMENTO', 'BOYACÁ');
        cell(M + c3,   y, c3,       22, 'DIRECCIÓN', 'CALLE 54 No. 10-60');
        cell(M + c3*2, y, PW-c3*2,  22, 'E-MAIL', 'info@hospitalsanrafael.gov.co');
        y += 22;

        const c4 = Math.floor(PW / 4);
        cell(M,          y, c4,        22, 'SERVICIO', val(eq.servicio?.nombres));
        cell(M + c4,     y, c4,        22, 'DENOMINACIÓN', val(eq.nombre_equipo));
        cell(M + c4*2,   y, c4,        22, 'TELÉFONO', '(8) 7 440 055');
        cell(M + c4*3,   y, PW-c4*3,   22, 'PLACA / ACTIVO', val(eq.placa_inventario));
        y += 22;

        // ===== DATOS DEL EQUIPO =====
        y = sectionBar(y, 'DATOS DEL EQUIPO');

        const lW = 198, mW = 150, rW = PW - lW - mW;
        subHeader(M,        y, lW,  14, 'DATOS DEL EQUIPO');
        subHeader(M + lW,   y, mW,  14, 'FORMA DE ADQUISICIÓN');
        subHeader(M+lW+mW,  y, rW,  14, 'DATOS DE LA COMPRA');
        y += 14;

        const rh = 18;
        const yS = y;

        // Columna izquierda
        cell(M, y, lW, rh, 'TIPO DE EQUIPO',    val(eq.tipoEquipo?.nombres)); y += rh;
        cell(M, y, lW, rh, 'UBICACIÓN',          val(eq.ubicacion));           y += rh;
        cell(M, y, lW, rh, 'NÚMERO DE SERIE',    val(eq.serie));               y += rh;
        cell(M, y, lW, rh, 'MARCA',              val(eq.marca));               y += rh;
        cell(M, y, lW, rh, 'MODELO',             val(eq.modelo));              y += rh;
        const yEnd = y;

        // Columna central
        let ym = yS;
        cell(M + lW, ym, mW, rh, '', `${chk(hv.compraddirecta)}  COMPRA DIRECTA`); ym += rh;
        cell(M + lW, ym, mW, rh, '', `${chk(hv.convenio)}        CONVENIO`);       ym += rh;
        cell(M + lW, ym, mW, rh, '', `${chk(hv.donado)}          DONADO`);         ym += rh;
        cell(M + lW, ym, mW, rh, '', `${chk(hv.comodato)}        COMODATO`);       ym += rh;
        doc.rect(M + lW, ym, mW, rh).stroke('#999');

        // Columna derecha
        let yr = yS;
        cell(M+lW+mW, yr, rW, rh, 'VENDEDOR',             val(hv.vendedor));                         yr += rh;
        cell(M+lW+mW, yr, rW, rh, 'FECHA DE COMPRA',      fmtF(hv.fecha_compra));                    yr += rh;
        cell(M+lW+mW, yr, rW, rh, 'FECHA DE INSTALACIÓN', fmtF(hv.fecha_instalacion));               yr += rh;
        cell(M+lW+mW, yr, rW, rh, 'COSTO DE COMPRA',      hv.costo_compra ? `$ ${hv.costo_compra}` : ''); yr += rh;
        cell(M+lW+mW, yr, rW, rh, 'CONTRATO',             val(hv.contrato));

        y = yEnd;

        // ===== INFORMACIÓN DEL EQUIPO =====
        y = sectionBar(y, 'INFORMACIÓN DEL EQUIPO (HARDWARE Y TÉCNICA)');

        const hw = Math.floor(PW / 2);
        cell(M,      y, hw,     18, 'DIRECCIÓN IP',           val(hv.ip));
        cell(M + hw, y, PW-hw,  18, 'DIRECCIÓN MAC',          val(hv.mac));               y += 18;
        cell(M,      y, hw,     18, 'PROCESADOR',             val(hv.procesador));
        cell(M + hw, y, PW-hw,  18, 'SISTEMA OPERATIVO',      val(hv.sistema_operativo)); y += 18;
        cell(M,      y, hw,     18, 'MEMORIA RAM',            val(hv.ram));
        cell(M + hw, y, PW-hw,  18, 'OFFICE / SUITE',         val(hv.office));            y += 18;
        cell(M,      y, hw,     18, 'DISCO DURO',             val(hv.disco_duro));
        cell(M + hw, y, PW-hw,  18, 'TÓNER / CARTUCHO',       val(hv.tonner));            y += 18;
        cell(M,      y, hw,     18, 'NOMBRE DE USUARIO',      val(hv.nombre_usuario));
        cell(M + hw, y, PW-hw,  18, 'TIPO DE USO',            val(hv.tipo_uso));          y += 18;

        // ===== OBSERVACIONES =====
        y = sectionBar(y, 'OBSERVACIONES GENERALES');

        const obsH = 60;
        doc.rect(M, y, PW, obsH).stroke('#999');
        doc.font('Helvetica').fontSize(8).fillColor('#111')
           .text(val(hv.observaciones), M + 5, y + 5, { width: PW - 10, height: obsH - 10 });
        y += obsH + 8;

        // ===== PIE =====
        doc.font('Helvetica').fontSize(6).fillColor('#888')
           .text('NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO', M, y, { width: PW, align: 'center', lineBreak: false });

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
