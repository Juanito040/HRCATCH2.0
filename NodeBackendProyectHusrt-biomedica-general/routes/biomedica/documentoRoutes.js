const express = require('express');
const router = express.Router();

const Documento = require('../../models/Biomedica/Documento');
const Equipo = require('../../models/Biomedica/Equipo');
const TipoDocumento = require('../../models/generales/TipoDocumento');

// Obtener todos los documentos
router.get('/documentos', async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            include: [
                { model: Equipo, as: 'equipo' },
                { model: TipoDocumento, as: 'tipoDocumento' }
            ],
            order: [['nombres', 'ASC']]
        });
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los documentos', detalle: error.message });
    }
});

// Obtener documentos por equipo
router.get('/documentos/equipo/:id', async (req, res) => {
    try {
        const documentos = await Documento.findAll({
            where: { equipoIdFk: req.params.id },
            include: [{ model: TipoDocumento, as: 'tipoDocumento' }]
        });
        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los documentos del equipo', detalle: error.message });
    }
});

// Obtener un documento por ID
router.get('/documento/:id', async (req, res) => {
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

// Crear nuevo documento
router.post('/adddocumento', async (req, res) => {
    try {
        const documento = await Documento.create(req.body);
        res.status(201).json(documento);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el documento', detalle: error.message });
    }
});

// Actualizar documento
router.put('/actdocumento/:id', async (req, res) => {
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

// Eliminar documento
router.delete('/remdocumento/:id', async (req, res) => {
    try {
        const documento = await Documento.findByPk(req.params.id);
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        await documento.destroy();
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el documento', detalle: error.message });
    }
});

module.exports = router;
