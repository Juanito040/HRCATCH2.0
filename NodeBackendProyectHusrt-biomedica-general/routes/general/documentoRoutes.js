const express = require('express');
const router = express.Router();
const Documento = require('../../models/Biomedica/Documento');
const Equipo = require('../../models/Biomedica/Equipo');
const TipoDocumento = require('../../models/generales/TipoDocumento');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para guardar archivos en C:\AppHusrt\Biomedica\documentos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'C:/AppHusrt/Biomedica/documentos';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Obtener todos los documentos
router.get('/documentos', async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            include: [
                { model: Equipo, as: 'equipo' },
                { model: TipoDocumento, as: 'tipoDocumento' }
            ]
        });
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los documentos', detalle: error.message });
    }
});

// Obtener documentos por ID de Equipo
router.get('/documentos/equipo/:id', async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            where: { equipoIdFk: req.params.id },
            include: [
                { model: TipoDocumento, as: 'tipoDocumento' }
            ]
        });
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los documentos del equipo', detalle: error.message });
    }
});

// Obtener un documento por ID
router.get('/documentos/:id', async (req, res) => {
    try {
        const documento = await Documento.findByPk(req.params.id, {
            include: [
                { model: Equipo, as: 'equipo' },
                { model: TipoDocumento, as: 'tipoDocumento' }
            ]
        });

        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        res.json(documento);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el documento', detalle: error.message });
    }
});

// Crear un nuevo documento
router.post('/adddocumento', upload.single('ruta'), async (req, res) => {
    try {
        const datosDocumento = req.body;

        if (req.file) {
            // Obtener el nombre del TipoDocumento para crear la carpeta
            if (datosDocumento.tipoDocumntoIdFk) {
                const tipoDoc = await TipoDocumento.findByPk(datosDocumento.tipoDocumntoIdFk);
                if (tipoDoc) {
                    const nombreCarpeta = tipoDoc.nombres.trim().replace(/[^a-zA-Z0-9 _-]/g, ''); // Sanitize
                    const baseDir = 'C:/AppHusrt/Biomedica/documentos';
                    const targetDir = path.join(baseDir, nombreCarpeta);

                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }

                    const oldPath = req.file.path;
                    const newFilename = req.file.filename;
                    const newPath = path.join(targetDir, newFilename);

                    // Mover el archivo
                    fs.renameSync(oldPath, newPath);
                    datosDocumento.ruta = newPath;
                } else {
                    datosDocumento.ruta = req.file.path; // Si no encuentra el tipo, lo deja en raiz
                }
            } else {
                datosDocumento.ruta = req.file.path;
            }
        }

        const nuevoDocumento = await Documento.create(datosDocumento);
        res.status(201).json(nuevoDocumento);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el documento', detalle: error.message });
    }
});

// Descargar documento
router.get('/downloadDocumento/:id', async (req, res) => {
    try {
        const documento = await Documento.findByPk(req.params.id);
        if (!documento || !documento.ruta) {
            return res.status(404).json({ error: 'Documento no encontrado o sin archivo' });
        }

        const filePath = documento.ruta;

        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'El archivo físico no existe en el servidor' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar el documento' });
    }
});

// Actualizar un documento por ID
router.put('/documentos/:id', async (req, res) => {
    try {
        const documento = await Documento.findByPk(req.params.id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        await documento.update(req.body);
        res.json(documento);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el documento', detalle: error.message });
    }
});

// Eliminar un documento por ID
router.delete('/documentos/:id', async (req, res) => {
    try {
        const documento = await Documento.findByPk(req.params.id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Opcional: Eliminar el archivo físico si se desea
        // if (documento.ruta && fs.existsSync(documento.ruta)) {
        //     fs.unlinkSync(documento.ruta);
        // }

        await documento.destroy();
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el documento', detalle: error.message });
    }
});

module.exports = router;
