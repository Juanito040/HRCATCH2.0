const express = require('express');
const router = express.Router();
const Traslado = require('../../models/Biomedica/Traslado');
const Equipo = require('../../models/Biomedica/Equipo');
const Servicio = require('../../models/generales/Servicio');
const Usuario = require('../../models/generales/Usuario');
const sequelize = require('../../config/configDb');

// Crear un traslado
router.post('/traslados', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { equipoId, servicioDestinoId, nombreReceptor, cargoReceptor, observaciones, usuarioId } = req.body;

        if (!equipoId || !servicioDestinoId || !usuarioId) {
            await t.rollback();
            return res.status(400).json({ error: 'Faltan datos requeridos (equipoId, servicioDestinoId, usuarioId)' });
        }

        // Obtener equipo para saber servicio origen
        const equipo = await Equipo.findByPk(equipoId, { transaction: t });
        if (!equipo) {
            await t.rollback();
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        const servicioOrigenId = equipo.servicioIdFk;

        // Crear registro de traslado
        const nuevoTraslado = await Traslado.create({
            equipoIdFk: equipoId,
            servicioOrigenIdFk: servicioOrigenId,
            servicioDestinoIdFk: servicioDestinoId,
            usuarioIdFk: usuarioId,
            nombreReceptor,
            cargoReceptor,
            observaciones
        }, { transaction: t });

        // Actualizar servicio del equipo
        equipo.servicioIdFk = servicioDestinoId;
        await equipo.save({ transaction: t });

        await t.commit();
        res.status(201).json(nuevoTraslado);

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el traslado', detalle: error.message });
    }
});

// Obtener historial de traslados de un equipo
router.get('/traslados/equipo/:id', async (req, res) => {
    try {
        const traslados = await Traslado.findAll({
            where: { equipoIdFk: req.params.id },
            include: [
                { model: Servicio, as: 'servicioOrigen' },
                { model: Servicio, as: 'servicioDestino' },
                { model: Usuario, as: 'usuario' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(traslados);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial de traslados', detalle: error.message });
    }
});

module.exports = router;
