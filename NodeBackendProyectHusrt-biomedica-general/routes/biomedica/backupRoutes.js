const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { BackupSistema, SistemaInformacion } = require('../../models/Biomedica');
const { checkToken } = require('../../utilities/middleware');

// GET /backups/alertas — evalúa estado de backups según periodicidad
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

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const alertas = [];

        for (const sistema of sistemas) {
            const { periodicidad } = sistema;
            if (periodicidad === 'Anual') continue;

            const ultimoBackup = sistema.backups && sistema.backups.length > 0 ? sistema.backups[0] : null;
            const ultimaFecha = ultimoBackup ? new Date(ultimoBackup.fecha) : null;
            const diasDesdeUltimo = ultimaFecha ? Math.floor((Date.now() - ultimaFecha) / 86400000) : null;

            let necesitaAlerta = false;
            let mensaje = '';

            if (periodicidad === 'Diario') {
                if (!ultimaFecha || diasDesdeUltimo >= 1) {
                    necesitaAlerta = true;
                    mensaje = ultimaFecha
                        ? `Último backup hace ${diasDesdeUltimo} día(s). Se requiere backup diario.`
                        : 'Sin backup completado. Se requiere backup diario.';
                }
            } else if (periodicidad === 'Semanal') {
                if (!ultimaFecha || diasDesdeUltimo > 7) {
                    necesitaAlerta = true;
                    mensaje = ultimaFecha
                        ? `Último backup hace ${diasDesdeUltimo} día(s). Se requiere backup semanal.`
                        : 'Sin backup completado. Se requiere backup semanal.';
                }
            } else if (periodicidad === 'Mensual') {
                const mesActual = hoy.getMonth();
                const anioActual = hoy.getFullYear();
                const mismoMes = ultimaFecha &&
                    ultimaFecha.getMonth() === mesActual &&
                    ultimaFecha.getFullYear() === anioActual;
                if (!mismoMes) {
                    necesitaAlerta = true;
                    mensaje = ultimaFecha
                        ? `Último backup: ${ultimoBackup.fecha}. Se requiere backup mensual.`
                        : 'Sin backup completado. Se requiere backup mensual.';
                }
            }

            if (necesitaAlerta) {
                alertas.push({
                    sistemaId: sistema.id,
                    nombre: sistema.nombre,
                    periodicidad,
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
