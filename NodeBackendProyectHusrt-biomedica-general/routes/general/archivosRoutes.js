const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/obtenerarchivopdf', (req, res) => {
  try {
    console.log('Solicitud PDF recibida:', req.body);

    if (!req.body.ruta) {
      console.error('Error: Ruta no proporcionada en el cuerpo de la solicitud');
      return res.status(400).json({ error: 'Ruta es requerida' });
    }

    const ruta = path.resolve(req.body.ruta);
    console.log('Ruta resuelta:', ruta);

    fs.access(ruta, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Archivo no encontrado físicamente:', ruta);
        return res.status(404).json({ error: 'Archivo PDF no encontrado' });
      }
      res.sendFile(ruta, { headers: { 'Content-Type': 'application/pdf' } }, (err) => {
        if (err) {
          console.error('Error al enviar archivo PDF (res.sendFile):', err.message);
          if (!res.headersSent) {
            return res.status(500).json({ error: 'Error al enviar archivo PDF' });
          }
        }
      });
    });
  } catch (error) {
    console.error('Excepción en /obtenerarchivopdf:', error);
    res.status(500).json({ error: 'Error interno al procesar solicitud de PDF' });
  }
});

module.exports = router;