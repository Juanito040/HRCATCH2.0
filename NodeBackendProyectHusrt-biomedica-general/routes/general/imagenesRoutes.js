

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/imagenequipohv', (req, res) => {
  const rutaRelativa = req.body.ruta;

  if (!rutaRelativa) {
    rutaRelativa = 'C:/AppHusrt/Biomedica/imageneshv/NULL.jpg';
  }

  // Normalizar y resolver ruta (en caso de rutas absolutas o con otras unidades)
  const ruta = path.normalize(rutaRelativa);

  fs.access(ruta, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    res.sendFile(ruta);
  });
});


router.post('/imagenequipohvtest', (req, res) => {
  const rutaRelativa = req.body.ruta;

  if (!rutaRelativa) {
    console.warn('[API] No se recibió ruta');
    return res.status(400).json({ error: 'Debe enviar una ruta en el campo "ruta"' });
  }

  const ruta = path.normalize(rutaRelativa);
  const carpeta = path.dirname(ruta);
  const rutaNull = path.join(carpeta, 'NULL.jpg');

  console.log('[API] Buscando imagen en:', ruta);

  fs.access(ruta, fs.constants.F_OK, (err) => {
    if (!err) {
      console.log('[API] Imagen encontrada:', ruta);
      return res.sendFile(ruta, { headers: { 'Content-Type': 'image/jpeg' } }, (err) => {
        if (err) {
          console.error('[API] Error al enviar imagen principal:', err);
          return res.status(500).json({ error: 'Error al enviar imagen' });
        }
      });
    }

    console.warn('[API] Imagen principal no encontrada. Buscando NULL.jpg en:', carpeta);

    fs.access(rutaNull, fs.constants.F_OK, (errNull) => {
      if (!errNull) {
        console.log('[API] Usando NULL.jpg:', rutaNull);
        return res.sendFile(rutaNull, { headers: { 'Content-Type': 'image/jpeg' } }, (err) => {
          if (err) {
            console.error('[API] Error al enviar NULL.jpg:', err);
            return res.status(500).json({ error: 'Error al enviar NULL.jpg' });
          }
        });
      }

      console.error('[API] NULL.jpg tampoco se encontró en:', carpeta);
      return res.status(404).json({ error: 'Imagen y NULL.jpg no encontradas' });
    });
  });
});

module.exports = router;