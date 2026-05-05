const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { BackupSistema, SistemaInformacion } = require('../../models/Biomedica');
const { checkToken } = require('../../utilities/middleware');

const ESTADOS_VALIDOS = ['Pendiente', 'Completado', 'Fallido', 'No realizado'];
const ROLES_ADMIN = ['SUPERADMIN', 'SYSTEMADMIN'];
const ROLES_MODULO_SISTEMAS = ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'];

function requireAdminRole(req, res, next) {
    if (!ROLES_ADMIN.includes(req.user?.rol)) {
        return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }
    next();
}

// Bloquea el acceso al módulo cuando el usuario no tiene un rol habilitado
// (SUPERADMIN/SYSTEMADMIN/SYSTEMUSER) o, salvo SUPERADMIN, no tiene al menos
// un sistema de información asignado como responsable.
async function requireSistemasModuloAccess(req, res, next) {
    try {
        const rol = req.user?.rol ?? null;

        if (!ROLES_MODULO_SISTEMAS.includes(rol)) {
            return res.status(403).json({ error: 'Rol no autorizado para el módulo de sistemas' });
        }

        if (rol === 'SUPERADMIN') return next();

        const tieneSistemas = await SistemaInformacion.count({
            where: { responsableId: req.user.id }
        });

        if (tieneSistemas === 0) {
            return res.status(403).json({ error: 'No tiene sistemas de información asignados' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            error: 'Error verificando acceso al módulo',
            detalle: error.message
        });
    }
}

async function getSistemaIdsDelUsuario(usuarioId) {
    const sistemas = await SistemaInformacion.findAll({
        where: { responsableId: usuarioId },
        attributes: ['id']
    });
    return sistemas.map(s => s.id);
}

// Genera todas las ocurrencias Pendiente del resto del año en curso a partir del
// backup recién creado. El registro inicial (con los datos del usuario) ya existe;
// esta función sólo crea los siguientes, evitando entradas retroactivas o del año próximo.
function generarOcurrenciasAnio(backup) {
    const frecuencia = backup.frecuencia_backup;
    const fechaInicio = new Date(String(backup.fecha) + 'T00:00:00');
    const anio = fechaInicio.getFullYear();
    const finAnio = new Date(anio, 11, 31); // 31 de diciembre del año en curso

    const base = {
        sistemaInformacionId: backup.sistemaInformacionId,
        tipo: backup.tipo,
        frecuencia_backup: frecuencia,
        estado: 'Pendiente'
    };

    const toFechaStr = d => {
        const a = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${a}-${m}-${dd}`;
    };

    if (frecuencia === 'Diario') {
        const ocurrencias = [];
        const cursor = new Date(fechaInicio);
        cursor.setDate(cursor.getDate() + 1);
        while (cursor <= finAnio) {
            ocurrencias.push({ ...base, fecha: toFechaStr(cursor) });
            cursor.setDate(cursor.getDate() + 1);
        }
        return ocurrencias;
    }

    if (frecuencia === 'Semanal') {
        const ocurrencias = [];
        const cursor = new Date(fechaInicio);
        cursor.setDate(cursor.getDate() + 7);
        while (cursor <= finAnio) {
            ocurrencias.push({ ...base, fecha: toFechaStr(cursor) });
            cursor.setDate(cursor.getDate() + 7);
        }
        return ocurrencias;
    }

    if (frecuencia === 'Mensual') {
        const ocurrencias = [];
        const diaOriginal = fechaInicio.getDate();
        for (let mes = fechaInicio.getMonth() + 1; mes <= 11; mes++) {
            // Clamp al último día del mes para meses más cortos (e.g., 31 → 28 en feb)
            const maxDia = new Date(anio, mes + 1, 0).getDate();
            const diaFinal = Math.min(diaOriginal, maxDia);
            ocurrencias.push({
                ...base,
                fecha: `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`
            });
        }
        return ocurrencias;
    }

    // Anual: el POST inicial ya es la única ocurrencia del año en curso
    return [];
}

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
// Admins ven todos los backups; usuarios sin rol admin ven solo los de sus sistemas.
router.get('/backups/alertas', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        await autoTransicionarVencidos();

        const hoy = new Date().toISOString().split('T')[0];
        const esAdmin = ROLES_ADMIN.includes(req.user?.rol);

        const where = {
            [Op.or]: [
                { estado: 'Pendiente', fecha: { [Op.lte]: hoy } },
                { estado: 'No realizado' }
            ]
        };

        if (!esAdmin) {
            const sistemaIds = await getSistemaIdsDelUsuario(req.user.id);
            if (sistemaIds.length === 0) return res.json([]);
            where.sistemaInformacionId = { [Op.in]: sistemaIds };
        }

        const backupsAlerta = await BackupSistema.findAll({
            where,
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

// GET /backups/todos/mes — lista los backups de un mes/año.
// Admins ven todos los sistemas; usuarios sin rol admin ven solo los de sus sistemas.
router.get('/backups/todos/mes', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        await autoTransicionarVencidos();

        const { mes, anio } = req.query;
        const diasEnMes = new Date(anio, mes, 0).getDate();
        const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
        const ultimoDia = `${anio}-${String(mes).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`;

        const esAdmin = ROLES_ADMIN.includes(req.user?.rol);
        const where = { fecha: { [Op.between]: [primerDia, ultimoDia] } };

        if (!esAdmin) {
            const sistemaIds = await getSistemaIdsDelUsuario(req.user.id);
            if (sistemaIds.length === 0) return res.json([]);
            where.sistemaInformacionId = { [Op.in]: sistemaIds };
        }

        const backups = await BackupSistema.findAll({
            where,
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

// GET /backups/:sistemaId — lista todos los backups del sistema.
// Requiere token; usuarios sin rol admin solo pueden acceder a sus propios sistemas.
router.get('/backups/:sistemaId', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        await autoTransicionarVencidos();

        const sistemaId = parseInt(req.params.sistemaId, 10);
        const esAdmin = ROLES_ADMIN.includes(req.user?.rol);

        if (!esAdmin) {
            const sistema = await SistemaInformacion.findByPk(sistemaId, { attributes: ['id', 'responsableId'] });
            if (!sistema || sistema.responsableId !== req.user.id) {
                return res.status(403).json({ error: 'No tiene acceso a los backups de este sistema' });
            }
        }

        const backups = await BackupSistema.findAll({
            where: { sistemaInformacionId: sistemaId },
            order: [['fecha', 'DESC']],
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los backups', detalle: error.message });
    }
});

// GET /backups/:sistemaId/mes — lista backups filtrados por ?mes=&anio=.
// Misma protección por rol que GET /backups/:sistemaId.
router.get('/backups/:sistemaId/mes', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const sistemaId = parseInt(req.params.sistemaId, 10);
        const esAdmin = ROLES_ADMIN.includes(req.user?.rol);

        if (!esAdmin) {
            const sistema = await SistemaInformacion.findByPk(sistemaId, { attributes: ['id', 'responsableId'] });
            if (!sistema || sistema.responsableId !== req.user.id) {
                return res.status(403).json({ error: 'No tiene acceso a los backups de este sistema' });
            }
        }

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

// POST /backups — crea un backup programado y genera todas las ocurrencias
// Pendiente del resto del año en curso según la frecuencia indicada.
router.post('/backups', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
    try {
        const valoresFrecuencia = ['Anual', 'Mensual', 'Semanal', 'Diario'];
        if (!req.body.frecuencia_backup || !valoresFrecuencia.includes(req.body.frecuencia_backup)) {
            return res.status(400).json({ error: 'frecuencia_backup es obligatorio y debe ser: Anual, Mensual, Semanal o Diario' });
        }
        if (req.body.estado !== undefined && !ESTADOS_VALIDOS.includes(req.body.estado)) {
            return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
        }
        const nuevoBackup = await BackupSistema.create(req.body);
        const ocurrencias = generarOcurrenciasAnio(nuevoBackup);
        if (ocurrencias.length > 0) {
            await BackupSistema.bulkCreate(ocurrencias);
        }
        res.status(201).json(nuevoBackup);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el backup', detalle: error.message });
    }
});

// PUT /backups/:id — actualiza un backup.
// Admins pueden modificar cualquier campo. Usuarios sin rol admin solo pueden
// actualizar estado=Completado y observacion (acción "Marcar como Completado").
router.put('/backups/:id', checkToken, requireSistemasModuloAccess, async (req, res) => {
    try {
        const esAdmin = ROLES_ADMIN.includes(req.user?.rol);

        if (!esAdmin) {
            const CAMPOS_PERMITIDOS_NO_ADMIN = ['estado', 'observacion'];
            const camposExtra = Object.keys(req.body).filter(c => !CAMPOS_PERMITIDOS_NO_ADMIN.includes(c));
            if (camposExtra.length > 0) {
                return res.status(403).json({ error: 'No tiene permisos para modificar estos campos del backup' });
            }
            if (req.body.estado !== undefined && req.body.estado !== 'Completado') {
                return res.status(403).json({ error: 'Solo puede marcar backups como Completado' });
            }
        }

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
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el backup', detalle: error.message });
    }
});

// DELETE /backups/sistema/:sistemaId — elimina todos los backups de un sistema
router.delete('/backups/sistema/:sistemaId', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
    try {
        const sistemaId = parseInt(req.params.sistemaId, 10);
        const { count } = await BackupSistema.destroy({
            where: { sistemaInformacionId: sistemaId }
        });
        res.json({ mensaje: `${count} backup(s) eliminados correctamente` });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar los backups del sistema', detalle: error.message });
    }
});

// DELETE /backups/:id — elimina un backup
router.delete('/backups/:id', checkToken, requireSistemasModuloAccess, requireAdminRole, async (req, res) => {
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
