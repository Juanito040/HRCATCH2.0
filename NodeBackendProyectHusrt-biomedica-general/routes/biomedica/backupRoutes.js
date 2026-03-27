const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { BackupSistema, SistemaInformacion } = require('../../models/Biomedica');
const { checkToken } = require('../../utilities/middleware');

// GET /backups/alertas — evalúa estado de backups según frecuencia_backup individual
router.get('/backups/alertas', checkToken, async (req, res) => {
    try {
        const sistemas = await SistemaInformacion.findAll({
            where: { estado: true },
            include: [{
                model: BackupSistema,
                as: 'backups',
                where: { estado: 'Completado' },
                required: false,
                order: [['fecha', 'DESC']],
                limit: 1
            }]
        });

        const limitePorFrecuencia = {
            'Diario':  1,
            'Semanal': 7,
            'Mensual': 30,
            'Anual':   365
        };

        const alertas = [];

        for (const sistema of sistemas) {
            const ultimoBackup = sistema.backups && sistema.backups.length > 0 ? sistema.backups[0] : null;
            const ultimaFecha = ultimoBackup ? new Date(ultimoBackup.fecha) : null;
            const diasDesdeUltimo = ultimaFecha ? Math.floor((Date.now() - ultimaFecha) / 86400000) : null;
            const frecuencia = ultimoBackup ? ultimoBackup.frecuencia_backup : null;
            const limite = frecuencia ? limitePorFrecuencia[frecuencia] : null;

            let necesitaAlerta = false;
            let mensaje = '';

            if (!ultimoBackup) {
                necesitaAlerta = true;
                mensaje = 'Sin backup completado. Se requiere realizar un backup.';
            } else if (limite !== null && diasDesdeUltimo > limite) {
                necesitaAlerta = true;
                mensaje = `Último backup hace ${diasDesdeUltimo} día(s). Se requiere backup ${frecuencia.toLowerCase()}.`;
            }

            if (necesitaAlerta) {
                alertas.push({
                    sistemaId: sistema.id,
                    nombre: sistema.nombre,
                    frecuencia_backup: frecuencia,
                    ultimoBackup: ultimaFecha ? ultimoBackup.fecha : null,
                    diasDesdeUltimo,
                    mensaje
                });
            }
        }

        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas de backups', detalle: error.message });
    }
});

// GET /backups/todos/mes — lista todos los backups de todos los sistemas en un mes/año
router.get('/backups/todos/mes', checkToken, async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const diasEnMes = new Date(anio, mes, 0).getDate();
        const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const ultimoDia = `${anio}-${String(mes).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`;

        const backups = await BackupSistema.findAll({
            where: { fecha: { [Op.between]: [primerDia, ultimoDia] } },
            include: [{ model: SistemaInformacion, as: 'sistema', attributes: ['id', 'nombre'] }],
            order: [['fecha', 'ASC']]
        });

        const resultado = backups.map(b => ({
            id: b.id,
            fecha: b.fecha,
            tipo: b.tipo,
            estado: b.estado,
            observacion: b.observacion,
            sistemaId: b.sistemaInformacionId,
            sistemaNombre: b.sistema ? b.sistema.nombre : null
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener backups del mes', detalle: error.message });
    }
});

// GET /backups/:sistemaId — lista todos los backups del sistema
router.get('/backups/:sistemaId', async (req, res) => {
    try {
        const sistemaId = parseInt(req.params.sistemaId, 10);
        const backups = await BackupSistema.findAll({
            where: { sistemaInformacionId: sistemaId },
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
        const sistemaId = parseInt(req.params.sistemaId, 10);
        const diasEnMes = new Date(anio, mes, 0).getDate();
        const backups = await BackupSistema.findAll({
            where: {
                sistemaInformacionId: sistemaId,
                fecha: {
                    [Op.between]: [
                        `${anio}-${String(mes).padStart(2, '0')}-01`,
                        `${anio}-${String(mes).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`,
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
        const valoresFrecuencia = ['Anual', 'Mensual', 'Semanal', 'Diario'];
        if (!req.body.frecuencia_backup || !valoresFrecuencia.includes(req.body.frecuencia_backup)) {
            return res.status(400).json({ error: 'frecuencia_backup es obligatorio y debe ser: Anual, Mensual, Semanal o Diario' });
        }
        const nuevoBackup = await BackupSistema.create(req.body);
        res.status(201).json(nuevoBackup);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el backup', detalle: error.message });
    }
});

// PUT /backups/:id — actualiza estado del backup
router.put('/backups/:id', async (req, res) => {
    try {
        const valoresFrecuencia = ['Anual', 'Mensual', 'Semanal', 'Diario'];
        if (req.body.frecuencia_backup !== undefined && !valoresFrecuencia.includes(req.body.frecuencia_backup)) {
            return res.status(400).json({ error: 'frecuencia_backup debe ser: Anual, Mensual, Semanal o Diario' });
        }
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
