const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { BackupSistema, SistemaInformacion } = require('../../models/Biomedica');
const { checkToken } = require('../../utilities/middleware');

const ESTADOS_VALIDOS = ['Pendiente', 'Completado', 'Fallido', 'No realizado'];

// Marca como 'No realizado' los backups Pendiente cuya fecha ya pasó (anterior a hoy).
// Op.lt excluye hoy para que los Pendiente de hoy sigan generando alerta.
async function autoTransicionarVencidos() {
    const hoy = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    await BackupSistema.update(
        { estado: 'No realizado' },
        { where: { estado: 'Pendiente', fecha: { [Op.lt]: hoy } } }
    );
}

// GET /backups/alertas — retorna backups Pendiente (fecha <= hoy) y No realizados.
// Ejecuta la auto-transición antes de consultar para convertir Pendientes vencidos.
router.get('/backups/alertas', checkToken, async (req, res) => {
    try {
        await autoTransicionarVencidos();

        const hoy = new Date().toISOString().split('T')[0];
        const backupsAlerta = await BackupSistema.findAll({
            where: {
                [Op.or]: [
                    { estado: 'Pendiente',    fecha: { [Op.lte]: hoy } },
                    { estado: 'No realizado' }
                ]
            },
            include: [{
                model: SistemaInformacion,
                as: 'sistema',
                attributes: ['id', 'nombre']
            }],
            order: [['fecha', 'ASC']]
        });

        const alertas = backupsAlerta
            .filter(b => b.sistema !== null)
            .map(b => ({
                id: b.id,
                sistemaId: b.sistema.id,
                nombre: b.sistema.nombre,
                frecuencia_backup: b.frecuencia_backup,
                fecha: b.fecha,
                estado: b.estado,
                mensaje: b.estado === 'No realizado'
                    ? `Backup no realizado — programado para ${b.fecha}`
                    : `Backup pendiente programado para ${b.fecha}`
            }));

        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas de backups', detalle: error.message });
    }
});

// GET /backups/todos/mes — lista todos los backups de todos los sistemas en un mes/año
router.get('/backups/todos/mes', checkToken, async (req, res) => {
    try {
        await autoTransicionarVencidos();

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
            frecuencia_backup: b.frecuencia_backup,
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
        await autoTransicionarVencidos();

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
        if (req.body.estado !== undefined && !ESTADOS_VALIDOS.includes(req.body.estado)) {
            return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
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
        if (req.body.estado !== undefined && !ESTADOS_VALIDOS.includes(req.body.estado)) {
            return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
        }
        const backup = await BackupSistema.findByPk(req.params.id);
        if (!backup) {
            return res.status(404).json({ error: 'Backup no encontrado' });
        }
        await backup.update(req.body);

        if (req.body.estado === 'Completado' && backup.frecuencia_backup) {
            const diasPorFrecuencia = { 'Diario': 1, 'Semanal': 7, 'Mensual': 30, 'Anual': 365 };
            const dias = diasPorFrecuencia[backup.frecuencia_backup];
            if (dias) {
                // Base: fecha del backup completado (no hoy) para mantener la cadena
                // programada sin importar cuándo el usuario marque el backup
                const proximaFecha = new Date(String(backup.fecha) + 'T00:00:00');
                proximaFecha.setDate(proximaFecha.getDate() + dias);
                const anio = proximaFecha.getFullYear();
                const mes  = String(proximaFecha.getMonth() + 1).padStart(2, '0');
                const dia  = String(proximaFecha.getDate()).padStart(2, '0');
                await BackupSistema.create({
                    sistemaInformacionId: backup.sistemaInformacionId,
                    tipo: backup.tipo,
                    frecuencia_backup: backup.frecuencia_backup,
                    estado: 'Pendiente',
                    fecha: `${anio}-${mes}-${dia}`
                });
            }
        }

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
