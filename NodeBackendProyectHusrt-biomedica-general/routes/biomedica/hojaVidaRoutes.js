const express = require('express');
const router = express.Router();
const HojaVida = require('../../models/Biomedica/HojaVida');
const Equipo = require('../../models/Biomedica/Equipo');
const DatosTecnicos = require('../../models/Biomedica/DatosTecnicos');
const Servicio = require('../../models/generales/Servicio');
const Sede = require('../../models/generales/Sede');
const Proveedor = require('../../models/Biomedica/Proveedor');
const Fabricante = require('../../models/Biomedica/Fabricante');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Accesorios = require('../../models/Biomedica/Accesorios');

const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'C:/AppHusrt/Biomedica/imageneshv';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Obtener todas las hojas de vida
router.get('/hojasvida', async (req, res) => {
    try {
        const hojasVida = await HojaVida.findAll({
            include: {
                model: Equipo,
                as: 'equipo',
                include: [
                    {
                        model: Servicio,
                        as: 'servicios',
                        include: [{ model: Sede, as: 'sede' }]
                    },
                    { model: TipoEquipo, as: 'tipoEquipos' }
                ]
            }
        });
        res.json(hojasVida);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las hojas de vida', detalle: error.message });
    }
});

// Obtener una hoja de vida por ID
router.get('/hojasvida/:id', async (req, res) => {
    try {
        const hojaVida = await HojaVida.findByPk(req.params.id, {
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                    include: [
                        {
                            model: Servicio,
                            as: 'servicios',
                            include: [{ model: Sede, as: 'sede' }]
                        },
                        { model: TipoEquipo, as: 'tipoEquipos' }
                    ]
                },
                { model: Proveedor, as: 'proveedor' },
                { model: Fabricante, as: 'fabricante' },
                { model: Accesorios, as: 'accesorios' }
            ]
        });
        if (!hojaVida) {
            return res.status(404).json({ error: 'Hoja de vida no encontrada' });
        }
        res.json(hojaVida);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la hoja de vida', detalle: error.message });
    }
});

// Crear una nueva hoja de vida
router.post('/addhojasvida', upload.single('foto'), async (req, res) => {
    try {
        const hojaVidaData = req.body;
        if (req.file) {
            hojaVidaData.foto = req.file.path;
        }
        const nuevaHojaVida = await HojaVida.create(hojaVidaData);

        // Crear accesorios si vienen en la petición
        if (req.body.accesorios) {
            let accesoriosList = [];
            // Si viene como string (por FormData)
            if (typeof req.body.accesorios === 'string') {
                try {
                    accesoriosList = JSON.parse(req.body.accesorios);
                } catch (e) {
                    console.error('Error parseando accesorios:', e);
                }
            } else {
                accesoriosList = req.body.accesorios;
            }

            if (Array.isArray(accesoriosList) && accesoriosList.length > 0) {
                const accesoriosConId = accesoriosList.map(acc => ({
                    ...acc,
                    hojaVidaIdFk: nuevaHojaVida.id
                }));
                await Accesorios.bulkCreate(accesoriosConId);
            }
        }

        res.status(201).json(nuevaHojaVida);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la hoja de vida', detalle: error.message });
    }
});

// Actualizar una hoja de vida
router.put('/hojasvida/:id', upload.single('foto'), async (req, res) => {
    try {
        const hojaVida = await HojaVida.findByPk(req.params.id);
        if (!hojaVida) {
            return res.status(404).json({ error: 'Hoja de vida no encontrada' });
        }

        const changes = { ...req.body };
        if (req.file) {
            changes.foto = req.file.path;
        }

        const oldData = hojaVida.toJSON();

        await hojaVida.update(changes);

        // Manejo de accesorios en update
        if (req.body.accesorios) {
            let accesoriosList = [];
            if (typeof req.body.accesorios === 'string') {
                try {
                    accesoriosList = JSON.parse(req.body.accesorios);
                } catch (e) {
                    console.error('Error parseando accesorios update:', e);
                }
            } else {
                accesoriosList = req.body.accesorios;
            }

            if (Array.isArray(accesoriosList)) {
                // Obtener accesorios actuales
                const currentAccesorios = await Accesorios.findAll({ where: { hojaVidaIdFk: hojaVida.id } });
                const currentIds = currentAccesorios.map(a => a.id);
                const incomingIds = accesoriosList.filter(a => a.id).map(a => a.id);

                // Eliminar los que no vienen
                const toDelete = currentIds.filter(id => !incomingIds.includes(id));
                if (toDelete.length > 0) {
                    await Accesorios.destroy({ where: { id: toDelete } });
                }

                // Crear o actualizar
                for (const acc of accesoriosList) {
                    if (acc.id) {
                        // Update
                        await Accesorios.update(acc, { where: { id: acc.id } });
                    } else {
                        // Create
                        await Accesorios.create({ ...acc, hojaVidaIdFk: hojaVida.id });
                    }
                }
            }
        }

        // Registrar trazabilidad
        if (req.user && req.user.id) {
            const DetallesCambios = {};
            for (const key in changes) {
                // Ignore timestamps and internal keys if needed
                if (changes[key] !== oldData[key] && key !== 'updatedAt') {
                    DetallesCambios[key] = { anterior: oldData[key], nuevo: changes[key] };
                }
            }

            if (Object.keys(DetallesCambios).length > 0) {
                const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
                await Trazabilidad.create({
                    accion: 'ACTUALIZACIÓN HOJA DE VIDA',
                    detalles: JSON.stringify(DetallesCambios),
                    equipoIdFk: hojaVida.equipoIdFk, // Ensure this field exists in model
                    usuarioIdFk: req.user.id
                });
            }
        }

        res.json(hojaVida);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la hoja de vida', detalle: error.message });
    }
});

// Eliminar una hoja de vida
router.delete('/hojasvida/:id', async (req, res) => {
    try {
        const hojaVida = await HojaVida.findByPk(req.params.id);
        if (!hojaVida) {
            return res.status(404).json({ error: 'Hoja de vida no encontrada' });
        }

        await hojaVida.destroy();
        res.json({ mensaje: 'Hoja de vida eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la hoja de vida', detalle: error.message });
    }
});

router.get('/hojavidaequipo/:id', async (req, res) => {
    const equipoId = parseInt(req.params.id, 10);

    if (isNaN(equipoId)) {
        return res.status(400).json({ error: 'ID de equipo inválido' });
    }

    try {
        const hojaVida = await HojaVida.findOne({
            where: { equipoIdFk: equipoId },
            include: [
                {
                    model: Equipo,
                    as: 'equipo',
                    include: [
                        {
                            model: Servicio,
                            as: 'servicios',
                            include: [
                                {
                                    model: Sede,
                                    as: 'sede'
                                }
                            ]
                        },
                        {
                            model: TipoEquipo,
                            as: 'tipoEquipos'
                        }
                    ]
                },
                {
                    model: DatosTecnicos,
                    as: 'datosTecnicos'
                },
                {
                    model: Proveedor,
                    as: 'proveedor'
                },
                {
                    model: Fabricante,
                    as: 'fabricante'
                },
                {
                    model: Accesorios,
                    as: 'accesorios'
                }
            ]
        });

        if (!hojaVida) {
            return res.status(404).json({ error: 'Hoja de vida no encontrada para este equipo' });
        }

        res.json(hojaVida);
    } catch (error) {
        console.error('Error al obtener hoja de vida por ID de equipo:', error);
        res.status(500).json({ error: 'Error del servidor', detalle: error.message });
    }
});



module.exports = router;
