const PDFDocument = require('pdfkit');

const SysReporte = require('../../models/Sistemas/SysReporte');
const SysBaja    = require('../../models/Sistemas/SysBaja');
const SysEquipo  = require('../../models/Sistemas/SysEquipo');
const Servicio   = require('../../models/generales/Servicio');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Usuario    = require('../../models/generales/Usuario');

// ─── Constantes de diseño compartidas ────────────────────────────────────────

const HOSPITAL_NOMBRE  = 'E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA';
const HOSPITAL_SUBTITULO = 'II NIVEL DE ATENCIÓN  ·  NIT: 891.800.611-7';
const PIE_PAGINA       = 'NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO';

const COLOR_AZUL  = '#1a3a6c';
const COLOR_ROJO  = '#7b1f1f';
const COLOR_GRIS  = '#999';
const COLOR_TEXTO = '#111';

const MARGIN = 30;
const PAGE_W = 552; // LETTER (612) - 2 * margen

// ─── Helpers de formato ───────────────────────────────────────────────────────

/**
 * Retorna el valor como string limpio, o vacío si es null/undefined.
 */
const val = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';

/**
 * Formatea una fecha al locale colombiano.
 */
const fmtF = (v) => {
  if (!v) return '';
  try { return new Date(v).toLocaleDateString('es-CO'); }
  catch { return String(v); }
};

// ─── Helpers de dibujo ────────────────────────────────────────────────────────

/**
 * Construye una celda con etiqueta y valor dentro del documento PDF.
 */
function cell(doc, x, y, w, h, label, value) {
  doc.rect(x, y, w, h).stroke(COLOR_GRIS);

  if (label) {
    doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#444')
      .text(label, x + 2, y + 2, { width: w - 4, lineBreak: false });
  }

  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXTO)
    .text(val(value), x + 3, label ? y + 11 : y + 4, { width: w - 6, lineBreak: false });
}

/**
 * Dibuja una barra de sección coloreada y retorna la nueva posición Y.
 */
function sectionBar(doc, y, title, color) {
  const BAR_H = 14;
  doc.rect(MARGIN, y, PAGE_W, BAR_H).fill(color);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(7.5)
    .text(title, MARGIN + 6, y + 3, { width: PAGE_W - 12, lineBreak: false });
  doc.fillColor(COLOR_TEXTO);
  return y + BAR_H;
}

/**
 * Dibuja la línea de pie de página estándar.
 */
function pieDePagina(doc, y) {
  doc.font('Helvetica').fontSize(6).fillColor('#888')
    .text(PIE_PAGINA, MARGIN, y, { width: PAGE_W, align: 'center', lineBreak: false });
}

/**
 * Convierte un PDFDocument en un Buffer (Promise-based).
 * Permite que el controller elija cómo enviar la respuesta.
 */
function docToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/**
 * Crea un PDFDocument nuevo con la configuración estándar del sistema.
 */
function crearDoc() {
  return new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
}

// ─── Include compartido para equipo ──────────────────────────────────────────

const INCLUDE_EQUIPO_PDF = {
  model: SysEquipo,
  as: 'equipo',
  attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo',
    'serie', 'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
  include: [
    { model: Servicio,   as: 'servicio',   attributes: ['id', 'nombres'] },
    { model: TipoEquipo, as: 'tipoEquipo', attributes: ['id', 'nombres'] },
  ],
};

// ─── Clase de servicio PDF ────────────────────────────────────────────────────

class SysReportePdfService {

  /**
   * Genera el PDF de reporte de entrega de equipo.
   * @param {number} id - ID del SysReporte
   * @returns {{ buffer: Buffer, filename: string }}
   */
  async generarPdfReporte(id) {
    const reporte = await SysReporte.findByPk(id, {
      include: [
        INCLUDE_EQUIPO_PDF,
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombres', 'apellidos'] },
      ],
    });

    if (!reporte) {
      const err = new Error('Reporte no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const r  = reporte.toJSON();
    const eq = r.equipo || {};
    const tecnico = r.usuario
      ? `${val(r.usuario.nombres)} ${val(r.usuario.apellidos)}`.trim()
      : '';

    const doc = crearDoc();
    const bufferPromise = docToBuffer(doc);

    let y = MARGIN;

    // ── Cabecera ──────────────────────────────────────────────────────────────
    doc.rect(MARGIN, y, PAGE_W, 60).stroke('#555');
    doc.rect(MARGIN + PAGE_W - 122, y, 122, 60).stroke('#555');

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_AZUL)
      .text(HOSPITAL_NOMBRE, MARGIN + 6, y + 6, { width: PAGE_W - 134, lineBreak: false });
    doc.font('Helvetica').fontSize(7.5).fillColor('#333')
      .text(HOSPITAL_SUBTITULO, MARGIN + 6, y + 18, { width: PAGE_W - 134, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#2c5282')
      .text('REPORTE DE ENTREGA DE EQUIPO DE SISTEMAS', MARGIN + 6, y + 32, { width: PAGE_W - 134, lineBreak: false });

    const cx = MARGIN + PAGE_W - 120;
    this._bloqueCodigoVersionFecha(doc, cx, y, 'GI-F-014', '01', null);
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_AZUL)
      .text(`N° ${String(r.id).padStart(4, '0')}`, cx + 2, y + 32,
        { width: 116, align: 'center', lineBreak: false });
    doc.fillColor(COLOR_TEXTO);
    y += 60;

    // ── Datos del reporte ─────────────────────────────────────────────────────
    const c3 = Math.floor(PAGE_W / 3);
    const h2 = Math.floor(PAGE_W / 2);

    y = sectionBar(doc, y, 'DATOS DEL REPORTE', COLOR_AZUL);
    cell(doc, MARGIN,          y, c3,            22, 'NÚMERO DE REPORTE',  String(r.id).padStart(4, '0'));
    cell(doc, MARGIN + c3,     y, c3,            22, 'PLACA DE INVENTARIO', val(eq.placa_inventario));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 22, 'FECHA REALIZADO',    fmtF(r.fechaRealizado));
    y += 22;
    cell(doc, MARGIN,          y, c3,            22, 'SERVICIO',  val(eq.servicio?.nombres));
    cell(doc, MARGIN + c3,     y, c3,            22, 'UBICACIÓN', val(eq.ubicacion));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 22, 'EQUIPO',   val(eq.nombre_equipo));
    y += 22;
    cell(doc, MARGIN,          y, c3,            20, 'TIPO MANTENIMIENTO', val(r.tipoMantenimiento));
    cell(doc, MARGIN + c3,     y, c3,            20, 'HORA INICIO',        val(r.horaInicio));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 20, 'HORA TERMINACIÓN',  val(r.horaTerminacion));
    y += 20;

    // ── Detalle del mantenimiento ─────────────────────────────────────────────
    y = sectionBar(doc, y, 'DETALLE DEL MANTENIMIENTO', COLOR_AZUL);
    cell(doc, MARGIN,      y, h2,          22, 'TIPO DE FALLA',       val(r.tipoFalla));
    cell(doc, MARGIN + h2, y, PAGE_W - h2, 22, 'ESTADO OPERATIVO',   val(r.estadoOperativo));
    y += 22;
    cell(doc, MARGIN,      y, h2,          22, 'TIPO DE EQUIPO',      val(eq.tipoEquipo?.nombres));
    cell(doc, MARGIN + h2, y, PAGE_W - h2, 22, 'HORA TOTAL',         val(r.horaTotal));
    y += 22;
    cell(doc, MARGIN,      y, h2,          22, 'TÉCNICO RESPONSABLE', tecnico);
    cell(doc, MARGIN + h2, y, PAGE_W - h2, 22, 'RECIBIÓ',            val(r.nombreRecibio));
    y += 22;

    // ── Datos técnicos del equipo ─────────────────────────────────────────────
    y = sectionBar(doc, y, 'DATOS TÉCNICOS DEL EQUIPO', COLOR_AZUL);
    cell(doc, MARGIN,          y, c3,            20, 'MARCA',  val(eq.marca));
    cell(doc, MARGIN + c3,     y, c3,            20, 'MODELO', val(eq.modelo));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 20, 'SERIE', val(eq.serie));
    y += 20;

    // ── Observaciones ─────────────────────────────────────────────────────────
    y = sectionBar(doc, y, 'OBSERVACIONES', COLOR_AZUL);
    const obsH = 55;
    doc.rect(MARGIN, y, PAGE_W, obsH).stroke(COLOR_GRIS);
    doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXTO)
      .text(val(r.observaciones), MARGIN + 5, y + 5, { width: PAGE_W - 10, height: obsH - 10 });
    y += obsH;

    // ── Equipo de backup (condicional) ────────────────────────────────────────
    if (r.equipoBackup) {
      const bkW = Math.floor(PAGE_W / 3);
      y = sectionBar(doc, y, 'EQUIPO DE BACKUP', COLOR_AZUL);
      cell(doc, MARGIN,           y, bkW,            20, 'BACKUP DEJADO',           'SÍ');
      cell(doc, MARGIN + bkW,     y, bkW,            20, 'HORA ENTREGA BACKUP',     val(r.horaEntregaBackup));
      cell(doc, MARGIN + bkW * 2, y, PAGE_W - bkW*2, 20, 'HORA RECOLECCIÓN BACKUP', val(r.horaRecoleccionBackup));
      y += 20;
    }

    // ── Firmas ────────────────────────────────────────────────────────────────
    y = sectionBar(doc, y, 'FIRMAS DE CONFORMIDAD', COLOR_AZUL);
    y = this._bloqueFiremas(doc, y, tecnico, val(r.nombreRecibio), 'ENTREGADO POR', 'RECIBIDO POR');

    y += 8;
    pieDePagina(doc, y);

    doc.end();
    const buffer = await bufferPromise;
    return { buffer, filename: `Reporte_${String(r.id).padStart(4, '0')}.pdf` };
  }

  /**
   * Genera el PDF de concepto técnico para baja de tecnología.
   * @param {number} bajaId - ID del SysBaja
   * @returns {{ buffer: Buffer, filename: string }}
   */
  async generarPdfBaja(bajaId) {
    const baja = await SysBaja.findByPk(bajaId, {
      include: [
        {
          ...INCLUDE_EQUIPO_PDF,
          attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo',
            'serie', 'placa_inventario', 'ubicacion', 'ubicacion_especifica'],
        },
        { model: Usuario, as: 'usuarioBaja', attributes: ['id', 'nombres', 'apellidos'] },
      ],
    });

    if (!baja) {
      const err = new Error('Registro de baja no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const b  = baja.toJSON();
    const eq = b.equipo || {};
    const responsable = `${val(b.usuarioBaja?.nombres)} ${val(b.usuarioBaja?.apellidos)}`.trim();

    const doc = crearDoc();
    const bufferPromise = docToBuffer(doc);

    const c3 = Math.floor(PAGE_W / 3);
    const h2 = Math.floor(PAGE_W / 2);
    let y = MARGIN;

    // ── Cabecera ──────────────────────────────────────────────────────────────
    doc.rect(MARGIN, y, PAGE_W, 62).stroke('#555');
    doc.rect(MARGIN + PAGE_W - 122, y, 122, 62).stroke('#555');

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_ROJO)
      .text(HOSPITAL_NOMBRE, MARGIN + 6, y + 6, { width: PAGE_W - 134, lineBreak: false });
    doc.font('Helvetica').fontSize(7.5).fillColor('#333')
      .text(HOSPITAL_SUBTITULO, MARGIN + 6, y + 18, { width: PAGE_W - 134, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_ROJO)
      .text('CONCEPTO TÉCNICO PARA EVIDENCIA DE',  MARGIN + 6, y + 32, { width: PAGE_W - 134, lineBreak: false })
      .text('BAJA DE TECNOLOGÍA (CTEBT)',           MARGIN + 6, y + 43, { width: PAGE_W - 134, lineBreak: false });

    this._bloqueCodigoVersionFecha(doc, MARGIN + PAGE_W - 120, y, 'GI-F-015', '01', fmtF(b.fecha_baja));
    doc.fillColor(COLOR_TEXTO);
    y += 62;

    // ── 1. Información general ────────────────────────────────────────────────
    y = sectionBar(doc, y, '1. INFORMACIÓN GENERAL', COLOR_ROJO);
    cell(doc, MARGIN,          y, c3,            22, 'FECHA DE BAJA', fmtF(b.fecha_baja));
    cell(doc, MARGIN + c3,     y, c3,            22, 'SERVICIO',      val(eq.servicio?.nombres));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 22, 'RESPONSABLE',  responsable);
    y += 22;

    // ── 2. Relación del equipo ────────────────────────────────────────────────
    y = sectionBar(doc, y, '2. RELACIÓN DEL EQUIPO', COLOR_ROJO);
    cell(doc, MARGIN,      y, h2,          20, 'NOMBRE DEL EQUIPO', val(eq.nombre_equipo));
    cell(doc, MARGIN + h2, y, PAGE_W - h2, 20, 'TIPO DE EQUIPO',   val(eq.tipoEquipo?.nombres));
    y += 20;
    cell(doc, MARGIN,          y, c3,            20, 'MARCA',  val(eq.marca));
    cell(doc, MARGIN + c3,     y, c3,            20, 'MODELO', val(eq.modelo));
    cell(doc, MARGIN + c3 * 2, y, PAGE_W - c3*2, 20, 'SERIE', val(eq.serie));
    y += 20;
    cell(doc, MARGIN,      y, h2,          20, 'PLACA / ACTIVO', val(eq.placa_inventario));
    cell(doc, MARGIN + h2, y, PAGE_W - h2, 20, 'UBICACIÓN',     val(eq.ubicacion));
    y += 20;

    // ── 3. Justificación ──────────────────────────────────────────────────────
    y = sectionBar(doc, y, '3. JUSTIFICACIÓN DE LA BAJA', COLOR_ROJO);
    y = this._bloqueTextoLibre(doc, y, val(b.justificacion_baja), 70);

    // ── 4. Accesorios reutilizables ───────────────────────────────────────────
    y = sectionBar(doc, y, '4. ACCESORIOS / COMPONENTES REUTILIZABLES', COLOR_ROJO);
    y = this._bloqueTextoLibre(doc, y, val(b.accesorios_reutilizables) || 'Ninguno', 55);

    // ── 5. Concepto técnico (texto fijo institucional) ────────────────────────
    y = sectionBar(doc, y, '5. CONCEPTO TÉCNICO', COLOR_ROJO);
    const textoConcepto =
      'El equipo descrito ha sido evaluado técnicamente y se determina que no es viable ' +
      'su reparación o reutilización, por lo que se procede a dar de baja definitiva del ' +
      'inventario institucional.';
    doc.rect(MARGIN, y, PAGE_W, 60).stroke(COLOR_GRIS);
    doc.font('Helvetica').fontSize(8).fillColor('#555')
      .text(textoConcepto, MARGIN + 5, y + 5, { width: PAGE_W - 10, height: 50 });
    y += 60;

    // ── 6. Firmas ─────────────────────────────────────────────────────────────
    y = sectionBar(doc, y, '6. FIRMAS DE CONFORMIDAD', COLOR_ROJO);
    y = this._bloqueFiremas(doc, y, responsable, '_______________________', 'RESPONSABLE TÉCNICO', 'JEFE DE SERVICIO');

    y += 8;
    pieDePagina(doc, y);

    doc.end();
    const buffer = await bufferPromise;
    return { buffer, filename: `Baja_${val(eq.placa_inventario) || bajaId}.pdf` };
  }

  // ── Fragmentos de UI reutilizables entre ambos PDFs ────────────────────────

  /**
   * Dibuja el bloque de código / versión / fecha en la esquina del encabezado.
   */
  _bloqueCodigoVersionFecha(doc, cx, y, codigo, version, fecha) {
    const rows = [
      ['CÓDIGO:',  codigo],
      ['VERSIÓN:', version],
      ['FECHA:',   fecha || ''],
    ];
    rows.forEach(([label, valor], i) => {
      doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#555')
        .text(label, cx + 2, y + 6 + i * 10, { lineBreak: false });
      doc.font('Helvetica').fontSize(6.5).fillColor('#000')
        .text(valor, cx + 38, y + 6 + i * 10, { lineBreak: false });
    });
  }

  /**
   * Dibuja el bloque de dos firmas y retorna la Y final (después del bloque).
   */
  _bloqueFiremas(doc, y, textoIzq, textoDer, labelIzq, labelDer) {
    const fw  = Math.floor(PAGE_W / 2);
    const fhH = 65;

    doc.rect(MARGIN,      y, fw,          fhH).stroke(COLOR_GRIS);
    doc.rect(MARGIN + fw, y, PAGE_W - fw, fhH).stroke(COLOR_GRIS);

    doc.font('Helvetica-Bold').fontSize(6).fillColor('#555')
      .text(labelIzq, MARGIN + 2,      y + 4, { width: fw - 4,          align: 'center', lineBreak: false })
      .text(labelDer, MARGIN + fw + 2, y + 4, { width: PAGE_W - fw - 4, align: 'center', lineBreak: false });

    doc.moveTo(MARGIN + 15,      y + 53).lineTo(MARGIN + fw - 15,    y + 53).stroke('#888');
    doc.moveTo(MARGIN + fw + 15, y + 53).lineTo(MARGIN + PAGE_W - 15, y + 53).stroke('#888');

    doc.font('Helvetica').fontSize(6).fillColor('#666')
      .text(textoIzq, MARGIN + 2,      y + 55, { width: fw - 4,          align: 'center', lineBreak: false })
      .text(textoDer, MARGIN + fw + 2, y + 55, { width: PAGE_W - fw - 4, align: 'center', lineBreak: false });

    return y + fhH;
  }

  /**
   * Dibuja un bloque de texto libre con altura fija y retorna la Y siguiente.
   */
  _bloqueTextoLibre(doc, y, texto, altura) {
    doc.rect(MARGIN, y, PAGE_W, altura).stroke(COLOR_GRIS);
    doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXTO)
      .text(texto, MARGIN + 5, y + 5, { width: PAGE_W - 10, height: altura - 10 });
    return y + altura;
  }
}

module.exports = new SysReportePdfService();