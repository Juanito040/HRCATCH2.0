const { MesaCaso, MesaCasoHistorial, MesaCasoAsignado, MesaCategoria, MesaSubcategoria } = require('../../models/MesaServicios');
const Usuario = require('../../models/generales/Usuario');
const Servicio = require('../../models/generales/Servicio');
const SysEquipo = require('../../models/Sistemas/SysEquipo');
const { Op } = require('sequelize');

exports.createCaso = async (req, res) => {
    try {
        const { titulo, descripcion, tipo, sumerce, prioridad, servicioId, sedeId, categoriaId, subcategoriaId, creadorId, equipoId } = req.body;

        const equipoIdNormalizado = equipoId ? Number(equipoId) : null;
        if (equipoIdNormalizado != null) {
            const equipo = await SysEquipo.findByPk(equipoIdNormalizado);
            if (!equipo) {
                return res.status(400).json({ error: 'El equipo indicado no existe' });
            }
        }

        // Fetch creator to get their service
        const creador = await Usuario.findByPk(creadorId);
        const servicioSolicitanteId = creador ? creador.servicioId : null;

        const caso = await MesaCaso.create({
            titulo, descripcion, tipo, sumerce, prioridad,
            servicioId, sedeId, categoriaId, subcategoriaId, creadorId,
            servicioSolicitanteId, // Auto-populated
            equipoId: equipoIdNormalizado,
            estado: 'NUEVO'
        });

        // Handle Attachments
        if (req.files && req.files.length > 0) {
            const MesaCasoMensaje = require('../../models/MesaServicios').MesaCasoMensaje;
            const MesaCasoAdjunto = require('../../models/MesaServicios').MesaCasoAdjunto;

            // Create initial message for attachments
            const mensaje = await MesaCasoMensaje.create({
                casoId: caso.id,
                usuarioId: creadorId,
                mensaje: 'Adjuntos iniciales del caso',
                tipo: 'NORMAL'
            });

            // Create attachments linked to message
            const adjuntosData = req.files.map(file => ({
                nombreOriginal: file.originalname,
                rutaAlmacenamiento: file.path,
                tipoMime: file.mimetype,
                tamano: file.size,
                mensajeId: mensaje.id
            }));

            await MesaCasoAdjunto.bulkCreate(adjuntosData);
        }

        // Log History
        await MesaCasoHistorial.create({
            casoId: caso.id,
            evento: 'CASO_CREADO',
            usuarioId: creadorId,
            valorNuevo: 'NUEVO'
        });

        res.json(caso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCasos = async (req, res) => {
    try {
        const { servicioId, estado, tipo, sumerce, id } = req.query;
        let where = {};

        // Base filters
        if (id) where.id = id;
        if (servicioId) where.servicioId = servicioId;

        // Filter by state
        if (estado) {
            if (estado === 'ABIERTOS') {
                where.estado = { [Op.ne]: 'CERRADO' };
            } else {
                where.estado = estado;
            }
        }
        if (tipo) where.tipo = tipo;
        if (sumerce) where.sumerce = sumerce;

        // Role-Based Access Control
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.rol : null;

        const Usuario = require('../../models/generales/Usuario');
        const MesaServicioRol = require('../../models/MesaServicios').MesaServicioRol;

        const user = await Usuario.findByPk(userId, { include: [{ model: MesaServicioRol, as: 'mesaServicioRol' }] });

        let isSuperAdmin = false;
        // Check req.user.rol (Token) or DB user.rolId (1 = SUPERADMIN)
        if (userRole === 'SUPERADMIN' || (user && user.rolId === 1)) {
            isSuperAdmin = true;
        }

        if (!isSuperAdmin) {
            // 1=ADMINISTRADOR, 3=AGENTE
            if (user && (user.mesaServicioRolId === 1 || user.mesaServicioRolId === 3)) {
                // Can see:
                // 1. Cases they created (My Cases)
                // 2. Cases in their Service (Service Management)
                // 3. Cases assigned to them (Assigned)
                const { Op } = require('sequelize');

                const orConditions = [
                    { creadorId: userId },
                    { '$asignaciones.usuarioId$': userId }
                ];

                if (user.servicioId) {
                    orConditions.push({ servicioId: user.servicioId });
                }

                where[Op.or] = orConditions;
            } else {
                // SOLICITANTE (4) or OTHERS (2): Only see their own cases
                where.creadorId = userId;
            }
        }

        const casos = await MesaCaso.findAll({
            where,
            include: [
                { model: MesaCategoria, as: 'categoria' },
                { model: Servicio, as: 'servicio' },
                { model: Servicio, as: 'servicioSolicitante' },
                { model: Usuario, as: 'creador', attributes: ['nombres', 'apellidos'], include: [{ model: Servicio, as: 'servicio', attributes: ['nombres'] }] },
                { model: MesaCasoAsignado, as: 'asignaciones', where: { activo: true }, required: false, include: [{ model: Usuario, as: 'usuario' }] },
                { model: SysEquipo, as: 'equipo', attributes: ['id_sysequipo', 'nombre_equipo'], required: false }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        res.json(casos);
    } catch (error) {
        console.error("Error in getCasos:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getCasoById = async (req, res) => {
    try {
        const { id } = req.params;
        const caso = await MesaCaso.findByPk(id, {
            include: [
                { model: MesaCategoria, as: 'categoria' },
                { model: MesaSubcategoria, as: 'subcategoria' },
                { model: Usuario, as: 'creador', attributes: ['nombres', 'apellidos'], include: [{ model: Servicio, as: 'servicio', attributes: ['nombres'] }] },
                { model: Servicio, as: 'servicio' },
                { model: Servicio, as: 'servicioSolicitante' },
                { model: MesaCasoAsignado, as: 'asignaciones', where: { activo: true }, required: false, include: [{ model: Usuario, as: 'usuario' }] },
                { model: SysEquipo, as: 'equipo', attributes: ['id_sysequipo', 'nombre_equipo', 'marca', 'modelo', 'placa_inventario'], required: false },
                {
                    model: require('../../models/MesaServicios').MesaCasoMensaje, as: 'mensajes',
                    include: [
                        { model: Usuario, as: 'usuario', attributes: ['nombres', 'apellidos'] },
                        { model: require('../../models/MesaServicios').MesaCasoAdjunto, as: 'adjuntos' }
                    ]
                }
            ]
        });
        if (!caso) return res.status(404).json({ error: 'Caso no encontrado' });
        res.json(caso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.changeState = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado, usuarioId } = req.body;

        const caso = await MesaCaso.findByPk(id);
        if (!caso) return res.status(404).json({ error: 'Caso no encontrado' });

        const anterior = caso.estado;

        // Check Permissions for Cross-Service Administration
        const Usuario = require('../../models/generales/Usuario');
        const MesaServicioRol = require('../../models/MesaServicios').MesaServicioRol;
        const user = await Usuario.findByPk(usuarioId);

        // 1 = SUPERADMIN (General), 1 = ADMINISTRADOR (Mesa Role)
        if (user && user.rolId !== 1 && user.mesaServicioRolId === 1) {
            if (user.servicioId !== caso.servicioId) {
                return res.status(403).json({ error: 'No tienes permiso para administrar casos de otros servicios.' });
            }
        }

        caso.estado = nuevoEstado;
        caso.fechaUltimaAccion = new Date();

        if (nuevoEstado === 'RESUELTO') {
            // Lógica adicional si se requiere
        }

        await caso.save();

        await MesaCasoHistorial.create({
            casoId: caso.id,
            evento: 'CAMBIO_ESTADO',
            usuarioId,
            valorAnterior: anterior,
            valorNuevo: nuevoEstado
        });

        res.json(caso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCasoDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { prioridad, sumerce, servicioId, usuarioId } = req.body;
        const equipoIdRaw = req.body.equipoId;
        const equipoIdProvided = Object.prototype.hasOwnProperty.call(req.body, 'equipoId');

        const caso = await MesaCaso.findByPk(id);
        if (!caso) return res.status(404).json({ error: 'Caso no encontrado' });

        // Check Permissions
        const Usuario = require('../../models/generales/Usuario');
        // No need to include MesaServicioRol if we use the ID directly from user
        const user = await Usuario.findByPk(usuarioId);

        let isSuperAdmin = false;
        if (user && user.rolId === 1) isSuperAdmin = true; // 1 = SUPERADMIN

        if (!isSuperAdmin) {
            // Must be ADMINISTRADOR (1) of the SAME service
            const userMesaRoleId = user ? user.mesaServicioRolId : null;
            const userServiceId = user ? user.servicioId : null;

            if (userMesaRoleId !== 1 || userServiceId !== caso.servicioId) {
                return res.status(403).json({ error: 'No tienes permiso para administrar casos de otros servicios.' });
            }
        }

        let nuevoEquipoId = caso.equipoId;
        if (equipoIdProvided) {
            nuevoEquipoId = equipoIdRaw ? Number(equipoIdRaw) : null;
            if (nuevoEquipoId != null) {
                const equipo = await SysEquipo.findByPk(nuevoEquipoId);
                if (!equipo) {
                    return res.status(400).json({ error: 'El equipo indicado no existe' });
                }
            }
        }

        const cambios = [];
        if (prioridad && caso.prioridad !== prioridad) cambios.push(`Prioridad: ${caso.prioridad} -> ${prioridad}`);
        if (sumerce && caso.sumerce !== sumerce) cambios.push(`SUMERCE: ${caso.sumerce} -> ${sumerce}`);
        if (servicioId && caso.servicioId !== servicioId) {
            const nuevoServicio = await Servicio.findByPk(servicioId);
            cambios.push(`Servicio: ${caso.servicioId} -> ${nuevoServicio ? nuevoServicio.nombres : servicioId}`);
        }
        if (equipoIdProvided && caso.equipoId !== nuevoEquipoId) {
            cambios.push(`Equipo: ${caso.equipoId ?? 'ninguno'} -> ${nuevoEquipoId ?? 'ninguno'}`);
        }

        caso.prioridad = prioridad || caso.prioridad;
        caso.sumerce = sumerce || caso.sumerce;
        caso.servicioId = servicioId || caso.servicioId;
        if (equipoIdProvided) caso.equipoId = nuevoEquipoId;

        await caso.save();

        if (cambios.length > 0) {
            await MesaCasoHistorial.create({
                casoId: caso.id,
                evento: 'EDICION_ADMIN',
                usuarioId,
                valorNuevo: cambios.join(', ')
            });
        }

        res.json(caso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
