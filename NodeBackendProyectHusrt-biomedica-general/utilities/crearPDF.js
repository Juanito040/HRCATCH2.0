const PDFDocument = require('pdfkit');
const fs = require('fs');
require('pdfkit-table');
const path = require('path');

// Datos de ejemplo
const data = {
  id: 1,
  nombres: "ECOGRAFO",
  marca: "SIEMENS",
  modelo: "SONOLINE G 50",
  serie: "GEA0305",
  placa: "2225",
  registroInvima: "HOMOLOGADO 2007DM-00",
  riesgo: "IIA",
  ubicacion: "SEGUNDO PISO",
  ubicacionEspecifica: "CONSULTORIO ROTACION",
  activo: true,
  periodicidadM: 2,
  periodicidadC: 0,
  estadoBaja: false,
  calibracion: false,
  calificacion: false,
  validacion: false,
  tipoEquipos: {
    nombres: "ECOGRAFO",
  },
  servicios: {
    nombres: "HOSPITALIZACION SEGUNDO PISO",
    ubicacion: "SEGUNDO PISO",
  },
  sedes: {
    nombres: "HOSPITAL UNIVERSITARIO SAN RAFAEL T",
    ciudad: "TUNJA",
    departamento: "BOYACÁ",
  },
  responsables: {
    nombres: "INGENIERIA BIOMEDICA"
  }
};

const data2 = {
  "id": 1,
  "codigoInternacional": "15-657",

  "contrato": "ND",
  "tipoAdquisicion": "Compra",
  "fechaCompra": "2004-05-01T00:00:00.000Z",
  "fechaInstalacion": "2004-05-01T00:00:00.000Z",
  "fechaIncorporacion": "2004-05-01T00:00:00.000Z",
  "fechaVencimientoGarantia": "2006-05-01T00:00:00.000Z",
  "costoCompra": null,
  "fuente": "Electricidad",
  "tipoUso": "Diagnostico",
  "clase": "Electrico",
  "mantenimiento": "Propio",
  "propiedad": "Hospital",
  "equipoPortatil": true,
  "foto": "/images/111 Ecógrafo Siemens Sonoline G 50.png",
  "observaciones": "NA",
  "datosTecnicosIdFk": 1,
  "equipoIdFk": 1,
  "fabricanteIdFk": null,
  "proveedorIdFk": null,
  "createdAt": "2025-06-04T09:52:22.000Z",
  "updatedAt": "2025-06-04T09:52:22.000Z",
  "datosTecnicos": {
    "id": 1,
    "vMaxOperacion": "240",
    "vMinOperacion": "100",
    "iMaxOperacion": "2",
    "iMinOperacion": "1,5",
    "wConsumida": "240",
    "frecuencia": "60",
    "presion": "NA",
    "velocidad": "NA",
    "temperatura": "10 - 40",
    "peso": "90",
    "capacidad": "NA",
    "createdAt": "2025-06-04T10:31:35.000Z",
    "updatedAt": "2025-06-04T10:31:35.000Z"
  }
}

// ⚙️ Parámetros configurables
const config = {
  columnasPorFila: 3,
  anchoColumna: 166.7,
  altoFila: 30,
  padding: 5,
  margen: 50,
  rutaSalida: path.join(__dirname, '../files/equipo_med.pdf')  // ✅ Ruta específica para guardar

};

function generarPDF() {
  // Crear carpeta si no existe
  const directorio = path.dirname(config.rutaSalida);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }

  // Crear documento en landscape
  const doc = new PDFDocument({
    margin: config.margen,
    layout: 'landscape', // 📐 orientación horizontal
    size: 'A4'
  });

  doc.pipe(fs.createWriteStream(config.rutaSalida));

  doc.font('Helvetica-Bold').fontSize(10)
  doc.table({
    columnStyles: [50, "*", "*"],
    data: [
      [{ colSpan: 9, text: 'E.S.E. HOSPITAL UNIVERSITARIO SAN RAFAEL DE TUNJA', align: 'center', fontSize: 50 }, { rowSpan: 2, text: 'Logo Hospital', align: 'center' }],
      [{ colSpan: 1, text: 'CÓDIGO: IB-F-13', align: 'center' }, { colSpan: 8, rowSpan: 2, text: 'HOJA DE VIDA DE TECNOLOGÍA BIOMÉDICA', align: 'center' }],
      [{ colSpan: 1, text: 'Versión: 006', align: 'center' }, { colSpan: 1, rowSpan: 2, text: 'Fecha:', align: 'center' }]
    ],
  });

  doc.moveDown(0.5);

  doc.table({
    columnStyles: [50, "*", "*"],
    data: [
      [{ colSpan: 4, text: 'Sede:' + (data.sedes?.nombres || 'N/A'), align: 'center' }, { colSpan: 3, text: 'Servicio:' + (data.servicios?.nombres || 'N/A'), align: 'center' }, { colSpan: 3, text: 'Ubicación:' + (data.ubicacion), align: 'center' }]
    ],
  });

  doc.table({
    columnStyles: [50, "*", "*"],
    data: [
      [{ colSpan: 3, text: 'Identificación del Equipo', align: 'center' }, { colSpan: 3, text: 'Datos de Adquisición', align: 'center' }, { colSpan: 2, text: 'Clas. Riesgo', align: 'center' }, { colSpan: 2, text: 'Foto', align: 'center' }],
    ],
  });

  doc.font('Helvetica').fontSize(8)

  doc.table({
    columnStyles: [50, "*", "*"],
    data: [
      [{
        colSpan: 3, rowSpan: 8, text: 'Nombre:' + (data?.nombres || 'N/A') +
          '\nMarca: ' + (data?.marca || 'N/A') +
          '\nModelo: ' + (data?.modelo || 'N/A' +
            '\nSerie:' + (data?.serie || 'N/A') +
            '\nActivo Fijo: ' + (data?.placa || 'N/A')
          )
      },
      { colSpan: 3, rowSpan: 8, text: 'Datos de Adquisición', align: 'center' },
      { colSpan: 2, rowSpan: 8, text: 'Clas. Riesgo', align: 'center' },
      { colSpan: 2, text: 'Foto', align: 'center' }],
    ],
  });




  doc.end();
  console.log(`PDF generado en: ${config.rutaSalida}`);
}

//generarPDF();


module.exports = generarPDF;





