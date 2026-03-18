const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Firma = require('../../models/Biomedica/Firma');

router.post('/firma', async (req, res) => {
    try {
        const { image, idUsuario } = req.body;

        if (!image || !idUsuario) {
            return res.status(400).json({ error: 'Faltan datos requeridos (image, idUsuario)' });
        }

        // Remover encabezado data:image/png;base64,
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const dirPath = 'C:\\AppHusrt\\Biomedica\\Firmas';

        // Crear directorio si no existe (aunque se supone que existe, es bueno asegurar)
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const fileName = `${idUsuario}_firma.png`;
        const filePath = path.join(dirPath, fileName);

        fs.writeFile(filePath, base64Data, 'base64', async (err) => {
            if (err) {
                console.error('Error guardando firma:', err);
                return res.status(500).json({ error: 'Error al guardar la imagen en el servidor' });
            }

            try {
                // Buscar si ya existe firma para el usuario
                const existingFirma = await Firma.findOne({ where: { usuarioIdFk: idUsuario } });

                if (existingFirma) {
                    await existingFirma.update({ ruta: filePath });
                    return res.json({ message: 'Firma actualizada correctamente', ruta: filePath });
                } else {
                    await Firma.create({
                        ruta: filePath,
                        usuarioIdFk: idUsuario
                    });
                    return res.json({ message: 'Firma registrada correctamente', ruta: filePath });
                }
            } catch (dbError) {
                console.error('Error guardando en BD:', dbError);
                return res.status(500).json({ error: 'Error al guardar registro en base de datos' });
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Error procesando la solicitud', detalle: error.message });
    }
});

// Obtener firma por usuario
router.get('/firma/:idUsuario', async (req, res) => {
    try {
        const firma = await Firma.findOne({ where: { usuarioIdFk: req.params.idUsuario } });
        if (!firma) return res.status(404).json({ error: 'Firma no encontrada' });
        res.json(firma);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo firma' });
    }
});

// Servir imagen de firma
router.post('/firma/ver', async (req, res) => {
    try {
        const { idUsuario } = req.body;
        if (!idUsuario) {
            return res.status(400).json({ error: 'Falta parametro idUsuario' });
        }

        const firma = await Firma.findOne({ where: { usuarioIdFk: idUsuario } });
        if (!firma || !firma.ruta) {
            return res.status(404).json({ error: 'Firma no encontrada o sin ruta' });
        }

        const ruta = path.normalize(firma.ruta);
        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ error: 'Archivo de firma no encontrado en disco' });
            }
            res.sendFile(ruta);
        });

    } catch (error) {
        console.error('Error sirviendo firma:', error);
        res.status(500).json({ error: 'Error sirviendo la firma' });
    }
});

module.exports = router;
