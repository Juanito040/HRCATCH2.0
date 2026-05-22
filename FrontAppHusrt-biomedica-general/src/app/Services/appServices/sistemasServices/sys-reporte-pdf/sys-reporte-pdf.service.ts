import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { jsPDF } from 'jspdf';
import { FirmaService } from '../../biomedicaServices/firma/firma.service';
import { API_URL } from '../../../../constantes';

@Injectable({ providedIn: 'root' })
export class SysReportePdfService {
  private http = inject(HttpClient);
  private firmaService = inject(FirmaService);

  private readonly M = 30;
  private readonly PW = 552;

  private fmtF(v: any): string {
    if (!v) return '';
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    try { return new Date(v).toLocaleDateString('es-CO'); } catch { return String(v); }
  }

  private val(v: any): string {
    return (v !== undefined && v !== null && v !== '') ? String(v) : '';
  }

  private async loadImage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  }

  private async getFirmaBase64(userId: number): Promise<string | null> {
    try {
      const blob = await this.firmaService.getFirmaImage(userId);
      if (!blob) return null;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  }

  // Draw text; ty = top of text box (not baseline). Handles \n by splitting.
  private txt(
    doc: jsPDF,
    text: string,
    x: number,
    ty: number,
    w: number,
    opts: { bold?: boolean; size?: number; align?: 'left' | 'center' | 'right'; color?: string } = {}
  ): void {
    const fs = opts.size || 8;
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(fs);
    if (opts.color) {
      const r = parseInt(opts.color.slice(1, 3), 16);
      const g = parseInt(opts.color.slice(3, 5), 16);
      const b = parseInt(opts.color.slice(5, 7), 16);
      doc.setTextColor(r, g, b);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    const baseline = ty + fs * 0.75;
    const lines = String(text || '').split('\n');
    lines.forEach((line, i) => {
      const by = baseline + i * fs * 1.2;
      const align = opts.align || 'left';
      if (align === 'center') {
        doc.text(line, x + w / 2, by, { align: 'center', maxWidth: w });
      } else if (align === 'right') {
        doc.text(line, x + w, by, { align: 'right', maxWidth: w });
      } else {
        doc.text(line, x, by, { maxWidth: w });
      }
    });
  }

  // ─── 3-column hospital header (S-F-03 and IB-F-39) ──────────────────────────
  private drawHeader(
    doc: jsPDF,
    y: number,
    logoImg: string | null,
    codigoLine1: string,
    codigoLine2: string,
    titleRow2: string,
    titleRow3: string,
    fecha: string
  ): number {
    const M = this.M, PW = this.PW;
    const codeColW = 100, logoColW = 80, titleW = PW - codeColW - logoColW;
    const hdrH = 68, row1H = 22, row2H = 22, row3H = 24, logoH = row1H + row2H;

    doc.setDrawColor(0, 0, 0);
    doc.rect(M, y, PW, hdrH);
    doc.line(M + codeColW, y, M + codeColW, y + hdrH);
    doc.line(M + codeColW + titleW, y, M + codeColW + titleW, y + hdrH);
    doc.line(M, y + row1H, M + codeColW, y + row1H);
    doc.line(M + codeColW, y + row1H, M + codeColW + titleW, y + row1H);
    doc.line(M + codeColW, y + row1H + row2H, M + codeColW + titleW, y + row1H + row2H);
    doc.line(M + codeColW + titleW, y + logoH, M + PW, y + logoH);

    this.txt(doc, codigoLine1, M + 4, y + (row1H - 6.5) / 2, codeColW - 8, { bold: true, size: 6.5 });
    this.txt(doc, codigoLine2, M + 4, y + row1H + (row2H + row3H - 6.5) / 2, codeColW - 8, { bold: true, size: 6.5 });

    const cx = M + codeColW;
    this.txt(doc, 'E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', cx, y + (row1H - 8) / 2, titleW, { bold: true, size: 8, align: 'center' });
    if (titleRow2) this.txt(doc, titleRow2, cx, y + row1H + (row2H - 8) / 2, titleW, { bold: true, size: 8, align: 'center' });
    if (titleRow3) this.txt(doc, titleRow3, cx, y + row1H + row2H + (row3H - 7.5) / 2, titleW, { bold: true, size: 7.5, align: 'center' });

    const rx = M + codeColW + titleW;
    if (logoImg) {
      try { doc.addImage(logoImg, 'PNG', rx + 4, y + 2, logoColW - 8, logoH - 4); } catch {}
    }
    this.txt(doc, `Fecha: ${fecha}`, rx + 2, y + logoH + (row3H - 7) / 2, logoColW - 4, { size: 7, align: 'center' });

    return y + hdrH + 6;
  }

  // ─── S-F-03: Reporte de Entrega ──────────────────────────────────────────────
  async generarReporteEntrega(id: number): Promise<void> {
    const res = await firstValueFrom(this.http.get<any>(`${API_URL}/sysreporteentrega/${id}`));
    const r = res.data;
    const eq = r?.equipo || {};

    const firmaImg = r?.usuario?.id ? await this.getFirmaBase64(r.usuario.id) : null;
    const logoImg = await this.loadImage('LogoSanRafael.png');

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setDrawColor(0, 0, 0);
    const M = this.M, PW = this.PW;
    const val = this.val.bind(this), fmtF = this.fmtF.bind(this);
    const today = fmtF(r?.fecha);

    let y = this.drawHeader(doc, M, logoImg, 'CÓDIGO S-F-03', 'VERSION: 05',
      'III NIVEL DE ATENCIÓN', 'ENTREGA DE EQUIPOS HRCATCH', today);

    // ÁREA O PROCESO / FECHA
    const INFO_H = 16, AREA_W = Math.round(PW * 0.65);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
    const areaLabel = 'ÁREA O PROCESO:';
    const aLblW = doc.getTextWidth(areaLabel) + 4;
    doc.text(areaLabel, M, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(val(r?.servicio_anterior || eq.servicio?.nombres), M + aLblW, y + 11, { maxWidth: AREA_W - aLblW - 2 });
    doc.line(M + aLblW, y + INFO_H - 2, M + AREA_W, y + INFO_H - 2);

    doc.setFont('helvetica', 'bold');
    const fechaLabel = 'FECHA:';
    const fLblW = doc.getTextWidth(fechaLabel) + 4;
    doc.text(fechaLabel, M + AREA_W + 4, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(today, M + AREA_W + 4 + fLblW, y + 11, { maxWidth: PW - AREA_W - fLblW - 6 });
    doc.line(M + AREA_W + 4 + fLblW, y + INFO_H - 2, M + PW, y + INFO_H - 2);
    y += INFO_H + 2;

    // NOMBRE DE QUIEN ENTREGA
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    const entLabel = 'NOMBRE DE QUIEN ENTREGA:';
    const eLblW = doc.getTextWidth(entLabel) + 4;
    doc.text(entLabel, M, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(val(r?.realizado_por), M + eLblW, y + 11, { maxWidth: PW - eLblW - 2 });
    doc.line(M + eLblW, y + INFO_H - 2, M + PW, y + INFO_H - 2);
    y += INFO_H + 8;

    // ── Tabla de equipos ──────────────────────────────────────────────────────
    const COL_EQUIPO = 90, COL_MARCA = 110, COL_MODELO = 120, COL_SERIE = 120;
    const COL_INV = PW - COL_EQUIPO - COL_MARCA - COL_MODELO - COL_SERIE;
    const ROW_H = 18, TBL_HDR_H = 16;

    doc.rect(M, y, COL_EQUIPO, TBL_HDR_H);
    doc.rect(M + COL_EQUIPO, y, COL_MARCA, TBL_HDR_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA, y, COL_MODELO, TBL_HDR_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO, y, COL_SERIE, TBL_HDR_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV, TBL_HDR_H);
    this.txt(doc, 'EQUIPO:', M + 2, y + 4, COL_EQUIPO - 4, { bold: true, size: 7, align: 'center' });
    this.txt(doc, 'MARCA:', M + COL_EQUIPO + 2, y + 4, COL_MARCA - 4, { bold: true, size: 7, align: 'center' });
    this.txt(doc, 'MODELO:', M + COL_EQUIPO + COL_MARCA + 2, y + 4, COL_MODELO - 4, { bold: true, size: 7, align: 'center' });
    this.txt(doc, 'SERIE:', M + COL_EQUIPO + COL_MARCA + COL_MODELO + 2, y + 4, COL_SERIE - 4, { bold: true, size: 7, align: 'center' });
    this.txt(doc, 'INVENTARIO:', M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 2, y + 4, COL_INV - 4, { bold: true, size: 7, align: 'center' });
    y += TBL_HDR_H;

    // Detect active row — unicode escapes strip accents safely regardless of file encoding
    const normT = (s: string) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tipoNorm = normT(val(eq.tipoEquipo?.nombres));
    const filaMap: Record<string, string[]> = {
      'TODO EN UNO': ['TODO EN UNO', 'TODOENUNO', 'ALL IN ONE', 'AIO'],
      'PORTATIL': ['PORTATIL', 'LAPTOP', 'NOTEBOOK'],
      'ESCANER': ['ESCANER', 'SCANNER', 'DIGITALIZADOR'],
      'IMPRESORA': ['IMPRESORA', 'PRINTER', 'MULTIFUNCIONAL'],
      'TABLET': ['TABLET', 'TABLETA'],
      'PROCESADOR': ['PROCESADOR', 'CPU', 'TORRE'],
      'RAM': ['RAM', 'MEMORIA RAM', 'MEMORIA'],
      'DISCO DURO': ['DISCO DURO', 'HDD', 'SSD', 'DISCO'],
      'SOFTWARE': ['SOFTWARE', 'LICENCIA'],
    };
    let filaActiva: string | null = null;
    if (tipoNorm) {
      for (const [fila, keys] of Object.entries(filaMap)) {
        if (keys.some(k => tipoNorm.includes(normT(k)) || normT(k).includes(tipoNorm))) {
          filaActiva = fila; break;
        }
      }
    }

    const drawEquipoRow = (tipo: string, singleCol: boolean) => {
      const esActivo = tipo === filaActiva;
      if (esActivo) {
        doc.setFillColor(232, 244, 248);
        if (singleCol) { doc.rect(M, y, PW, ROW_H, 'FD'); }
        else {
          doc.rect(M, y, COL_EQUIPO, ROW_H, 'FD');
          doc.rect(M + COL_EQUIPO, y, COL_MARCA, ROW_H, 'FD');
          doc.rect(M + COL_EQUIPO + COL_MARCA, y, COL_MODELO, ROW_H, 'FD');
          doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO, y, COL_SERIE, ROW_H, 'FD');
          doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV, ROW_H, 'FD');
        }
      } else {
        if (singleCol) { doc.rect(M, y, PW, ROW_H); }
        else {
          doc.rect(M, y, COL_EQUIPO, ROW_H);
          doc.rect(M + COL_EQUIPO, y, COL_MARCA, ROW_H);
          doc.rect(M + COL_EQUIPO + COL_MARCA, y, COL_MODELO, ROW_H);
          doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO, y, COL_SERIE, ROW_H);
          doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV, ROW_H);
        }
      }
      this.txt(doc, tipo, M + 3, y + 5, COL_EQUIPO - 6, { size: 7.5 });
      if (esActivo) {
        this.txt(doc, val(eq.marca), M + COL_EQUIPO + 3, y + 5, COL_MARCA - 6, { size: 7.5 });
        this.txt(doc, val(eq.modelo), M + COL_EQUIPO + COL_MARCA + 3, y + 5, COL_MODELO - 6, { size: 7.5 });
        this.txt(doc, val(eq.serie), M + COL_EQUIPO + COL_MARCA + COL_MODELO + 3, y + 5, COL_SERIE - 6, { size: 7.5 });
        this.txt(doc, val(eq.placa_inventario), M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 3, y + 5, COL_INV - 6, { size: 7.5 });
      }
    };

    for (const tipo of ['TODO EN UNO', 'PORTATIL', 'ESCANER', 'IMPRESORA', 'TABLET']) {
      drawEquipoRow(tipo, false); y += ROW_H;
    }
    for (const tipo of ['PROCESADOR', 'RAM', 'DISCO DURO', 'SOFTWARE']) {
      drawEquipoRow(tipo, true); y += ROW_H;
    }

    // EQUIPO QUE SE RETIRA row
    doc.rect(M, y, COL_EQUIPO, ROW_H);
    doc.rect(M + COL_EQUIPO, y, COL_MARCA, ROW_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA, y, COL_MODELO, ROW_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO, y, COL_SERIE, ROW_H);
    doc.rect(M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE, y, COL_INV, ROW_H);
    this.txt(doc, 'EQUIPO QUE SE\nRETIRA', M + 3, y + 2, COL_EQUIPO - 6, { size: 7 });
    this.txt(doc, val(eq.marca), M + COL_EQUIPO + 3, y + 5, COL_MARCA - 6, { size: 7.5 });
    this.txt(doc, val(eq.modelo), M + COL_EQUIPO + COL_MARCA + 3, y + 5, COL_MODELO - 6, { size: 7.5 });
    this.txt(doc, val(eq.serie), M + COL_EQUIPO + COL_MARCA + COL_MODELO + 3, y + 5, COL_SERIE - 6, { size: 7.5 });
    this.txt(doc, val(eq.placa_inventario), M + COL_EQUIPO + COL_MARCA + COL_MODELO + COL_SERIE + 3, y + 5, COL_INV - 6, { size: 7.5 });
    y += ROW_H;

    // UBICACIÓN ANTERIOR | ACTUAL
    const UBI_H = 24, UBI_W = Math.round(PW / 2);
    doc.rect(M, y, UBI_W, UBI_H);
    doc.rect(M + UBI_W, y, PW - UBI_W, UBI_H);
    this.txt(doc, 'UBICACIÓN\nANTERIOR:', M + 3, y + 3, 58, { bold: true, size: 7.5 });
    this.txt(doc, val(r?.ubicacion_anterior || eq.ubicacion), M + 62, y + 7, UBI_W - 66, { size: 7.5 });
    this.txt(doc, 'UBICACIÓN\nACTUAL:', M + UBI_W + 3, y + 3, 52, { bold: true, size: 7.5 });
    this.txt(doc, val(r?.ubicacion_nueva), M + UBI_W + 58, y + 7, PW - UBI_W - 62, { size: 7.5 });
    y += UBI_H;

    // OBSERVACIONES
    const OBS_H = 60;
    doc.rect(M, y, PW, OBS_H);
    this.txt(doc, 'OBSERVACIONES', M + 3, y + 4, PW - 6, { bold: true, size: 7.5 });
    this.txt(doc, val(r?.observaciones), M + 5, y + 16, PW - 10, { size: 8 });
    y += OBS_H + 10;

    // FIRMAS — 2 columnas de altura fija: QUIEN ENTREGA (izq, firma electrónica) | QUIEN RECIBE (der, en blanco)
    const FIRMA_H = 80;
    const leftW = Math.floor(PW / 2);
    const rightW = PW - leftW;

    doc.rect(M, y, leftW, FIRMA_H);
    doc.rect(M + leftW, y, rightW, FIRMA_H);

    // Columna izquierda — QUIEN ENTREGA
    this.txt(doc, 'FIRMA QUIEN ENTREGA', M, y + 3, leftW, { bold: true, size: 7, align: 'center' });
    const sigLineY = y + FIRMA_H - 22;
    if (firmaImg) {
      const sigH = 30, sigW = 110;
      const sigX = M + (leftW - sigW) / 2;
      const sigY = sigLineY - sigH - 2;
      try { doc.addImage(firmaImg, 'PNG', sigX, sigY, sigW, sigH); } catch {}
    }
    doc.line(M + 15, sigLineY, M + leftW - 15, sigLineY);
    this.txt(doc, val(r?.realizado_por), M, sigLineY + 3, leftW, { size: 6.5, align: 'center' });

    // Columna derecha — QUIEN RECIBE
    this.txt(doc, 'FIRMA QUIEN RECIBE', M + leftW, y + 3, rightW, { bold: true, size: 7, align: 'center' });
    const receiveLabels = ['NOMBRE:', 'FIRMA:', 'CARGO:', 'CÉDULA:'];
    const rowH = Math.floor((FIRMA_H - 16) / receiveLabels.length);
    const rx = M + leftW;
    doc.setTextColor(0, 0, 0);
    receiveLabels.forEach((lbl, i) => {
      const ry = y + 14 + i * rowH;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      const lw = doc.getTextWidth(lbl) + 2;
      doc.text(lbl, rx + 4, ry + rowH - 4);
      if (i === 0 && val(r?.recibido_por)) {
        doc.setFont('helvetica', 'normal');
        doc.text(val(r?.recibido_por), rx + 4 + lw + 1, ry + rowH - 4, { maxWidth: rightW - lw - 14 });
      }
      doc.line(rx + 4 + lw, ry + rowH - 2, rx + rightW - 4, ry + rowH - 2);
    });
    y += FIRMA_H + 6;

    doc.save(`ReporteEntrega_${id}.pdf`);
  }

  // ─── IB-F-39: Baja Entrega ───────────────────────────────────────────────────
  async generarBajaEntrega(bajaId: number): Promise<void> {
    const res = await firstValueFrom(this.http.get<any>(`${API_URL}/sysreporteentrega/baja/${bajaId}`));
    const b = res.data;
    const eq = b?.equipo || {};
    const mtto = b?.ultimoMtto;

    const firmaImg = b?.usuarioBaja?.id ? await this.getFirmaBase64(b.usuarioBaja.id) : null;
    const logoImg = await this.loadImage('LogoSanRafael.png');

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setDrawColor(0, 0, 0);
    const M = this.M, PW = this.PW;
    const val = this.val.bind(this), fmtF = this.fmtF.bind(this);
    const today = fmtF(b?.fecha_baja);
    const elaboradoNombre = `${val(b?.usuarioBaja?.nombres)} ${val(b?.usuarioBaja?.apellidos)}`.trim();

    let y = this.drawHeader(doc, M, logoImg, 'CÓDIGO: IB-F-39', 'Versión: 001',
      '', 'CONCEPTO TÉCNICO PARA SUGERENCIA DE BAJA DE TECNOLOGÍAS DE SISTEMAS', today);

    const sectionBar = (cy: number, title: string): number => {
      const bH = 17;
      doc.setFillColor(0, 150, 136);
      doc.rect(M, cy, PW, bH, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      doc.text(title, M + PW / 2, cy + 12, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      return cy + bH;
    };

    const splitCell = (x: number, cy: number, w: number, h: number, lblW: number, label: string, value: string): void => {
      doc.setDrawColor(0, 0, 0); doc.rect(x, cy, w, h);
      doc.line(x + lblW, cy, x + lblW, cy + h);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.text(label, x + 3, cy + h * 0.55);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(val(value), x + lblW + 3, cy + h * 0.55, { maxWidth: w - lblW - 6 });
    };

    // 1. INFORMACIÓN GENERAL
    y = sectionBar(y, '1. INFORMACIÓN GENERAL');
    const RH = 26;
    const nombreW = Math.round(PW * 0.58), marcaW = PW - Math.round(PW * 0.58);
    splitCell(M, y, nombreW, RH, 100, 'NOMBRE DE LA TECNOLOGÍA', val(eq.nombre_equipo));
    splitCell(M + nombreW, y, marcaW, RH, 55, 'MARCA', val(eq.marca));
    y += RH;
    const mW = Math.round(PW * 0.30), sW = Math.round(PW * 0.32), cW = PW - mW - sW;
    splitCell(M, y, mW, RH, 55, 'MODELO', val(eq.modelo));
    splitCell(M + mW, y, sW, RH, 42, 'SERIE', val(eq.serie));
    splitCell(M + mW + sW, y, cW, RH, 82, 'CÓDIGO INTERNO', val(eq.placa_inventario));
    y += RH;
    const fdW = Math.round(PW * 0.58), nrW = PW - fdW;
    splitCell(M, y, fdW, RH, 105, 'FECHA DE REALIZACIÓN', today);
    splitCell(M + fdW, y, nrW, RH, 65, 'Nº REPORTE', String(b?.id_sysbaja || '').padStart(5, '0'));
    y += RH + 6;

    // 2. RELACIÓN DE REPORTE DE MANTENIMIENTO
    y = sectionBar(y, '2. RELACIÓN DE REPORTE DE MANTENIMIENTO');
    const hFecha = Math.round(PW / 2), hReporte = PW - hFecha;
    const SUB_H = 22, DATA_H = 26;
    doc.setFillColor(178, 223, 219);
    doc.rect(M, y, hFecha, SUB_H, 'FD');
    doc.rect(M + hFecha, y, hReporte, SUB_H, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
    doc.text('FECHA', M + hFecha / 2, y + 15, { align: 'center' });
    doc.text('Nº REPORTE', M + hFecha + hReporte / 2, y + 15, { align: 'center' });
    y += SUB_H;
    doc.rect(M, y, hFecha, DATA_H);
    doc.rect(M + hFecha, y, hReporte, DATA_H);
    const mttoFecha = mtto ? fmtF(mtto.fecha) : '';
    const mttoReporte = mtto ? (val(mtto.numero_reporte) || String(mtto.id_sysmtto || '').padStart(5, '0')) : '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(mttoFecha, M + hFecha / 2, y + 17, { align: 'center' });
    doc.text(mttoReporte, M + hFecha + hReporte / 2, y + 17, { align: 'center' });
    y += DATA_H + 6;

    // 3. DESCRIPCIÓN DE LA FALLA
    y = sectionBar(y, '3. DESCRIPCIÓN DE LA FALLA');
    doc.rect(M, y, PW, 110);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
    doc.text(val(b?.justificacion_baja), M + 6, y + 14, { maxWidth: PW - 12 });
    y += 110 + 6;

    // 4. CONCEPTO TÉCNICO
    y = sectionBar(y, '4. CONCEPTO TÉCNICO');
    const CHK_H = 24;
    const chkOpts = ['Daño irreparable', 'Obsolescencia tecnológica', 'Reparación no costo/beneficiosa', 'Pérdida o hurto', 'Otro'];
    const chkW = Math.floor(PW / chkOpts.length);
    chkOpts.forEach((lbl, i) => {
      const w = i === chkOpts.length - 1 ? PW - chkW * (chkOpts.length - 1) : chkW;
      doc.setDrawColor(0, 0, 0); doc.rect(M + chkW * i, y, w, CHK_H);
      doc.rect(M + chkW * i + 6, y + (CHK_H - 9) / 2, 9, 9);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(0, 0, 0);
      doc.text(lbl, M + chkW * i + 19, y + CHK_H / 2 + 2.5, { maxWidth: w - 22 });
    });
    y += CHK_H;
    doc.rect(M, y, PW, 110);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(val(b?.accesorios_reutilizables), M + 6, y + 14, { maxWidth: PW - 12 });
    y += 110 + 6;

    // 5. FIRMAS DE CONFORMIDAD
    y = sectionBar(y, '5. FIRMAS DE CONFORMIDAD');
    const fw = Math.floor(PW / 2), fH = 95, SH = 24;
    doc.setFillColor(178, 223, 219);
    doc.rect(M, y, fw, SH, 'FD');
    doc.rect(M + fw, y, PW - fw, SH, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(0, 0, 0);
    doc.text('ELABORADO POR :', M + fw / 2, y + 16, { align: 'center' });
    doc.text('REVISADO POR :', M + fw + (PW - fw) / 2, y + 16, { align: 'center' });
    y += SH;

    doc.setDrawColor(0, 0, 0);
    doc.rect(M, y, fw, fH);
    doc.rect(M + fw, y, PW - fw, fH);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
    doc.text(`Nombre:  ${elaboradoNombre}`, M + 8, y + 16);
    doc.text('Cargo:', M + 8, y + 30);

    if (firmaImg) {
      const sigH = 28, sigW = 120;
      const sigX = M + (fw - sigW) / 2;
      const sigY = y + fH - 14 - sigH - 4;
      try { doc.addImage(firmaImg, 'PNG', sigX, sigY, sigW, sigH); } catch {}
    }
    doc.line(M + 12, y + fH - 14, M + fw - 12, y + fH - 14);
    doc.setFontSize(7.5);
    doc.text('Firma', M + fw / 2, y + fH - 4, { align: 'center' });

    doc.setFontSize(8);
    doc.text('Nombre:', M + fw + 8, y + 16);
    doc.text('Cargo:', M + fw + 8, y + 30);
    doc.line(M + fw + 12, y + fH - 14, M + PW - 12, y + fH - 14);
    doc.setFontSize(7.5);
    doc.text('Firma', M + fw + (PW - fw) / 2, y + fH - 4, { align: 'center' });

    doc.save(`Baja_Entrega_${val(eq.placa_inventario) || bajaId}.pdf`);
  }

  // ─── GI-F-014: Reporte de Mantenimiento ──────────────────────────────────────
  async generarReporteMantenimiento(id: number): Promise<void> {
    const resData = await firstValueFrom(this.http.get<any>(`${API_URL}/sysreporte/${id}`));
    const r = resData.data;
    const eq = r?.equipo || {};

    const firmaImg = r?.usuario?.id ? await this.getFirmaBase64(r.usuario.id) : null;
    const logoImg = await this.loadImage('LogoSanRafael.png');

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setDrawColor(0, 0, 0);
    const M = this.M, PW = this.PW;
    const val = this.val.bind(this), fmtF = this.fmtF.bind(this);

    let y = M;

    // CABECERA
    doc.rect(M, y, PW, 60);
    doc.rect(M + PW - 122, y, 122, 60);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(26, 58, 108);
    doc.text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', M + 6, y + 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(51, 51, 51);
    doc.text('II NIVEL DE ATENCIÓN  ·  NIT: 891.800.611-7', M + 6, y + 23);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(44, 82, 130);
    doc.text('REPORTE DE ENTREGA DE EQUIPO DE SISTEMAS', M + 6, y + 37);

    const hdrRx = M + PW - 120;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(85, 85, 85);
    doc.text('CÓDIGO:', hdrRx + 2, y + 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(0, 0, 0);
    doc.text('GI-F-014', hdrRx + 40, y + 13);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(85, 85, 85);
    doc.text('VERSIÓN:', hdrRx + 2, y + 23);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(0, 0, 0);
    doc.text('01', hdrRx + 40, y + 23);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(26, 58, 108);
    doc.text(`N° ${String(r?.id || '').padStart(4, '0')}`, hdrRx + 61, y + 37, { align: 'center' });
    if (logoImg) {
      try { doc.addImage(logoImg, 'PNG', hdrRx + 2, y + 2, 50, 28); } catch {}
    }
    doc.setTextColor(0, 0, 0);
    y += 60;

    const sectionBar = (cy: number, title: string): number => {
      doc.setFillColor(26, 58, 108);
      doc.rect(M, cy, PW, 14, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      doc.text(title, M + 6, cy + 10);
      doc.setTextColor(0, 0, 0);
      return cy + 14;
    };

    const cell = (x: number, cy: number, w: number, h: number, label: string, value: string): void => {
      doc.setDrawColor(153, 153, 153); doc.rect(x, cy, w, h);
      doc.setDrawColor(0, 0, 0);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(68, 68, 68);
      doc.text(label, x + 2, cy + 8);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(17, 17, 17);
      doc.text(val(value), x + 3, cy + 18, { maxWidth: w - 6 });
    };

    const c3 = Math.floor(PW / 3);
    y = sectionBar(y, 'DATOS DEL REPORTE');
    cell(M, y, c3, 22, 'NÚMERO DE REPORTE', String(r?.id || '').padStart(4, '0'));
    cell(M + c3, y, c3, 22, 'PLACA DE INVENTARIO', val(eq.placa_inventario));
    cell(M + c3 * 2, y, PW - c3 * 2, 22, 'FECHA REALIZADO', fmtF(r?.fechaRealizado));
    y += 22;
    cell(M, y, c3, 22, 'SERVICIO', val(eq.servicio?.nombres));
    cell(M + c3, y, c3, 22, 'UBICACIÓN', val(eq.ubicacion));
    cell(M + c3 * 2, y, PW - c3 * 2, 22, 'EQUIPO', val(eq.nombre_equipo));
    y += 22;
    cell(M, y, c3, 20, 'TIPO MANTENIMIENTO', val(r?.tipoMantenimiento));
    cell(M + c3, y, c3, 20, 'HORA INICIO', val(r?.horaInicio));
    cell(M + c3 * 2, y, PW - c3 * 2, 20, 'HORA TERMINACIÓN', val(r?.horaTerminacion));
    y += 20;

    const h2 = Math.floor(PW / 2);
    const tecnico = r?.usuario ? `${val(r.usuario.nombres)} ${val(r.usuario.apellidos)}`.trim() : '';
    y = sectionBar(y, 'DETALLE DEL MANTENIMIENTO');
    cell(M, y, h2, 22, 'TIPO DE FALLA', val(r?.tipoFalla));
    cell(M + h2, y, PW - h2, 22, 'ESTADO OPERATIVO', val(r?.estadoOperativo));
    y += 22;
    cell(M, y, h2, 22, 'TIPO DE EQUIPO', val(eq.tipoEquipo?.nombres));
    cell(M + h2, y, PW - h2, 22, 'HORA TOTAL', val(r?.horaTotal));
    y += 22;
    cell(M, y, h2, 22, 'TÉCNICO RESPONSABLE', tecnico);
    cell(M + h2, y, PW - h2, 22, 'RECIBIÓ', val(r?.nombreRecibio));
    y += 22;

    y = sectionBar(y, 'DATOS TÉCNICOS DEL EQUIPO');
    cell(M, y, c3, 20, 'MARCA', val(eq.marca));
    cell(M + c3, y, c3, 20, 'MODELO', val(eq.modelo));
    cell(M + c3 * 2, y, PW - c3 * 2, 20, 'SERIE', val(eq.serie));
    y += 20;

    y = sectionBar(y, 'OBSERVACIONES');
    doc.setDrawColor(153, 153, 153); doc.rect(M, y, PW, 55);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(17, 17, 17);
    doc.text(val(r?.observaciones), M + 5, y + 12, { maxWidth: PW - 10 });
    y += 55;

    y = sectionBar(y, 'FIRMAS DE CONFORMIDAD');
    const fw = Math.floor(PW / 2);
    doc.setDrawColor(153, 153, 153);
    doc.rect(M, y, fw, 60);
    doc.rect(M + fw, y, PW - fw, 60);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(85, 85, 85);
    doc.text('ENTREGADO POR', M + fw / 2, y + 10, { align: 'center' });
    doc.text('RECIBIDO POR', M + fw + (PW - fw) / 2, y + 10, { align: 'center' });

    if (firmaImg) {
      const sigH = 22, sigW = 100;
      const sigX = M + (fw - sigW) / 2;
      const sigY = y + 50 - sigH - 3;
      try { doc.addImage(firmaImg, 'PNG', sigX, sigY, sigW, sigH); } catch {}
    }
    doc.setDrawColor(136, 136, 136);
    doc.line(M + 10, y + 50, M + fw - 10, y + 50);
    doc.line(M + fw + 10, y + 50, M + PW - 10, y + 50);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(102, 102, 102);
    doc.text(tecnico, M + fw / 2, y + 56, { align: 'center', maxWidth: fw - 4 });
    doc.text(val(r?.nombreRecibio), M + fw + (PW - fw) / 2, y + 56, { align: 'center', maxWidth: PW - fw - 4 });
    y += 68;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(136, 136, 136);
    doc.text('NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO', M + PW / 2, y, { align: 'center' });

    doc.save(`Mantenimiento_${String(r?.id || '').padStart(4, '0')}.pdf`);
  }

  // ─── GI-F-015: Baja Mantenimiento ────────────────────────────────────────────
  async generarBajaMantenimiento(bajaId: number): Promise<void> {
    const res = await firstValueFrom(this.http.get<any>(`${API_URL}/sysreporte/baja/${bajaId}`));
    const b = res.data;
    const eq = b?.equipo || {};

    const firmaImg = b?.usuarioBaja?.id ? await this.getFirmaBase64(b.usuarioBaja.id) : null;
    const logoImg = await this.loadImage('LogoSanRafael.png');

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setDrawColor(0, 0, 0);
    const M = this.M, PW = this.PW;
    const val = this.val.bind(this), fmtF = this.fmtF.bind(this);

    let y = M;

    // CABECERA
    doc.rect(M, y, PW, 62);
    doc.rect(M + PW - 122, y, 122, 62);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(123, 31, 31);
    doc.text('E.S.E HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', M + 6, y + 13);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(51, 51, 51);
    doc.text('II NIVEL DE ATENCIÓN  ·  NIT: 891.800.611-7', M + 6, y + 23);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(123, 31, 31);
    doc.text('CONCEPTO TÉCNICO PARA EVIDENCIA DE', M + 6, y + 35);
    doc.text('BAJA DE TECNOLOGÍA (CTEBT)', M + 6, y + 47);

    const hdrRx2 = M + PW - 120;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(85, 85, 85);
    doc.text('CÓDIGO:', hdrRx2 + 2, y + 13); doc.text('VERSIÓN:', hdrRx2 + 2, y + 23); doc.text('FECHA:', hdrRx2 + 2, y + 33);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(0, 0, 0);
    doc.text('GI-F-015', hdrRx2 + 40, y + 13);
    doc.text('01', hdrRx2 + 40, y + 23);
    doc.text(fmtF(b?.fecha_baja), hdrRx2 + 40, y + 33);
    if (logoImg) {
      try { doc.addImage(logoImg, 'PNG', hdrRx2 + 2, y + 36, 50, 22); } catch {}
    }
    doc.setTextColor(0, 0, 0);
    y += 62;

    const sectionBar = (cy: number, title: string): number => {
      doc.setFillColor(123, 31, 31);
      doc.rect(M, cy, PW, 14, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      doc.text(title, M + 6, cy + 10);
      doc.setTextColor(0, 0, 0);
      return cy + 14;
    };

    const cell = (x: number, cy: number, w: number, h: number, label: string, value: string): void => {
      doc.setDrawColor(153, 153, 153); doc.rect(x, cy, w, h);
      doc.setDrawColor(0, 0, 0);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(68, 68, 68);
      doc.text(label, x + 2, cy + 8);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(17, 17, 17);
      doc.text(val(value), x + 3, cy + 18, { maxWidth: w - 6 });
    };

    const c3 = Math.floor(PW / 3), h2 = Math.floor(PW / 2);

    y = sectionBar(y, '1. INFORMACIÓN GENERAL');
    cell(M, y, c3, 22, 'FECHA DE BAJA', fmtF(b?.fecha_baja));
    cell(M + c3, y, c3, 22, 'SERVICIO', val(eq.servicio?.nombres));
    cell(M + c3 * 2, y, PW - c3 * 2, 22, 'RESPONSABLE', `${val(b?.usuarioBaja?.nombres)} ${val(b?.usuarioBaja?.apellidos)}`);
    y += 22;

    y = sectionBar(y, '2. RELACIÓN DEL EQUIPO');
    cell(M, y, h2, 20, 'NOMBRE DEL EQUIPO', val(eq.nombre_equipo));
    cell(M + h2, y, PW - h2, 20, 'TIPO DE EQUIPO', val(eq.tipoEquipo?.nombres));
    y += 20;
    cell(M, y, c3, 20, 'MARCA', val(eq.marca));
    cell(M + c3, y, c3, 20, 'MODELO', val(eq.modelo));
    cell(M + c3 * 2, y, PW - c3 * 2, 20, 'SERIE', val(eq.serie));
    y += 20;
    cell(M, y, h2, 20, 'PLACA / ACTIVO', val(eq.placa_inventario));
    cell(M + h2, y, PW - h2, 20, 'UBICACIÓN', val(eq.ubicacion));
    y += 20;

    y = sectionBar(y, '3. JUSTIFICACIÓN DE LA BAJA');
    doc.setDrawColor(153, 153, 153); doc.rect(M, y, PW, 70);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(17, 17, 17);
    doc.text(val(b?.justificacion_baja), M + 5, y + 12, { maxWidth: PW - 10 });
    y += 70;

    y = sectionBar(y, '4. ACCESORIOS / COMPONENTES REUTILIZABLES');
    doc.setDrawColor(153, 153, 153); doc.rect(M, y, PW, 55);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(val(b?.accesorios_reutilizables) || 'Ninguno', M + 5, y + 12, { maxWidth: PW - 10 });
    y += 55;

    y = sectionBar(y, '5. CONCEPTO TÉCNICO');
    doc.setDrawColor(153, 153, 153); doc.rect(M, y, PW, 60);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(85, 85, 85);
    doc.text(
      'El equipo descrito ha sido evaluado técnicamente y se determina que no es viable su reparación o reutilización, ' +
      'por lo que se procede a dar de baja definitiva del inventario institucional.',
      M + 5, y + 12, { maxWidth: PW - 10 }
    );
    y += 60;

    y = sectionBar(y, '6. FIRMAS DE CONFORMIDAD');
    const fw = Math.floor(PW / 2), fhH = 65;
    doc.setDrawColor(153, 153, 153);
    doc.rect(M, y, fw, fhH);
    doc.rect(M + fw, y, PW - fw, fhH);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(85, 85, 85);
    doc.text('RESPONSABLE TÉCNICO', M + fw / 2, y + 10, { align: 'center' });
    doc.text('JEFE DE SERVICIO', M + fw + (PW - fw) / 2, y + 10, { align: 'center' });

    if (firmaImg) {
      const sigH = 24, sigW = 110;
      const sigX = M + (fw - sigW) / 2;
      const sigY = y + 53 - sigH - 3;
      try { doc.addImage(firmaImg, 'PNG', sigX, sigY, sigW, sigH); } catch {}
    }
    doc.setDrawColor(136, 136, 136);
    doc.line(M + 15, y + 53, M + fw - 15, y + 53);
    doc.line(M + fw + 15, y + 53, M + PW - 15, y + 53);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(102, 102, 102);
    doc.text(`${val(b?.usuarioBaja?.nombres)} ${val(b?.usuarioBaja?.apellidos)}`, M + fw / 2, y + 58, { align: 'center', maxWidth: fw - 4 });
    doc.text('_______________________', M + fw + (PW - fw) / 2, y + 58, { align: 'center' });
    y += fhH + 8;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(136, 136, 136);
    doc.text('NO ES VÁLIDO SIN REGISTRO EN EL SISTEMA DE GESTIÓN DEL APLICATIVO', M + PW / 2, y, { align: 'center' });

    doc.save(`Baja_Mantenimiento_${val(eq.placa_inventario) || bajaId}.pdf`);
  }
}
