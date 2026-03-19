const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { BackupSistema } = require('../../models/Biomedica');

// GET /backups/:sistemaId — lista todos los backups del sistema
router.get('/backups/:sistemaId', async (req, res) => {
    try {
        const backups = await BackupSistema.findAll({
            where: { sistemaInformacionId: req.params.sistemaId },
            order: [['fecha', 'DESC']],
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los backups', detalle: error.message });
    }
});

// GET /backups/:sistemaId/mes — lista backups filtrados por ?mes=&anio=
router.get('/backups/:sistemaId/mes', async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const backups = await BackupSistema.findAll({
            where: {
                sistemaInformacionId: req.params.sistemaId,
                fecha: {
                    [Op.between]: [
                        `${anio}-${String(mes).padStart(2, '0')}-01`,
                        `${anio}-${String(mes).padStart(2, '0')}-31`,
                    ],
                },
            },
            order: [['fecha', 'ASC']],
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los backups por mes', detalle: error.message });
    }
});

// POST /backups — crea un backup programado
router.post('/backups', async (req, res) => {
    try {
        const nuevoBackup = await BackupSistema.create(req.body);
        res.status(201).json(nuevoBackup);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el backup', detalle: error.message });
    }
});

// PUT /backups/:id — actualiza estado del backup
router.put('/backups/:id', async (req, res) => {
    try {
        const backup = await BackupSistema.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup no encontrado' });
        }
        await backup.update(req.body);
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el backup', detalle: error.message });
    }
});

// DELETE /backups/:id — elimina un backup
router.delete('/backups/:id', async (req, res) => {
    try {
        const backup = await BackupSistema.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup no encontrado' });
        }
        await backup.destroy();
        res.json({ mensaje: 'Backup eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el backup', detalle: error.message });
    }
});

module.exports = router;
