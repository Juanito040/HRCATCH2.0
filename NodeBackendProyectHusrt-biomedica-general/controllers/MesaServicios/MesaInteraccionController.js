const { MesaCaso, MesaCasoMensaje, MesaCasoAdjunto, MesaCasoHistorial, MesaCasoAsignado, MesaCasoCalificacion } = require('../../models/MesaServicios');
const transporter = require('../../utilities/mailer');
const Usuario = require('../../models/generales/Usuario'); // Promoted to top level for reuse

exports.addMensaje = async (req, res) => {
    try {
        const { casoId } = req.params;
        const { usuarioId, mensaje, tipo } = req.body;

        const nuevoMensaje = await MesaCasoMensaje.create({
            casoId, usuarioId, mensaje, tipo
        });

        // Handle Attachments
        if (req.files && req.files.length > 0) {
            const adjuntos = req.files.map(file => ({
                mensajeId: nuevoMensaje.id,
                nombreOriginal: file.originalname,
                rutaAlmacenamiento: file.path,
                tipoMime: file.mimetype,
                tamano: file.size
            }));
            await MesaCasoAdjunto.bulkCreate(adjuntos);
        }

        // Update Case timestamp
        await MesaCaso.update({ fechaUltimaAccion: new Date() }, { where: { id: casoId } });

        // --- EMAIL NOTIFICATION START ---
        try {
            const caso = await MesaCaso.findByPk(casoId, {
                include: [
                    { model: Usuario, as: 'creador' },
                    { model: MesaCasoAsignado, as: 'asignaciones', where: { activo: true }, required: false, include: [{ model: Usuario, as: 'usuario' }] }
                ]
            });

            if (caso) {
                const recipients = new Set();

                // If sender is NOT the creator, notify the creator
                if (caso.creadorId !== parseInt(usuarioId) && caso.creador?.email) {
                    recipients.add(caso.creador.email);
                }

                // If sender is NOT an assignee, notify active assignees
                // Also if sender IS the creator, notify assignees
                if (caso.asignaciones) {
                    caso.asignaciones.forEach(assign => {
                        if (assign.usuarioId !== parseInt(usuarioId) && assign.usuario?.email) {
                            recipients.add(assign.usuario.email);
                        }
                    });
                }

                if (recipients.size > 0) {
                    const mailOptions = {
                        from: '"Mesa de Servicios HUSRT" <sistemas6@hospitalsanrafaeltunja.gov.co>',
                        to: Array.from(recipients).join(', '),
                        subject: `Nueva Actividad en Caso #${caso.id}: ${caso.titulo}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h2>Nueva Actividad en Caso #${caso.id}</h2>
                                <p><strong>Título:</strong> ${caso.titulo}</p>
                                <p><strong>Mensaje:</strong></p>
                                <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
                                    ${mensaje || '(Archivo adjunto)'}
                                </blockquote>
                                <p>Por favor ingrese a la plataforma para responder.</p>
                            </div>
                        `
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) console.error('Error sending email (addMensaje):', error);
                    });
                }
            }
        } catch (mailError) {
            console.error('Error in email logic (addMensaje):', mailError);
        }
        // --- EMAIL NOTIFICATION END ---

        res.json(nuevoMensaje);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.assignResolutor = async (req, res) => {
    try {
        const { casoId } = req.params;
        const { usuarioId, asignadoPor } = req.body;

        // Check Permissions
        // Usuario model is now imported at top
        const user = await Usuario.findByPk(asignadoPor);
        const caso = await MesaCaso.findByPk(casoId);

        if (!caso) return res.status(404).json({ error: 'Caso no encontrado' });

        let canAssign = false;
        if (user && user.rolId === 1) canAssign = true; // SUPERADMIN
        if (!canAssign && user && user.mesaServicioRolId === 1 && user.servicioId === caso.servicioId) canAssign = true; // MESA ADMIN SAME SERVICE

        if (!canAssign) {
            return res.status(403).json({ error: 'No tienes permiso para asignar responsables en este caso.' });
        }

        // Check if already assigned and active
        const existingAssignment = await MesaCasoAsignado.findOne({
            where: {
                casoId,
                usuarioId,
                activo: true
            }
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'El usuario ya está asignado a este caso.' });
        }

        await MesaCasoAsignado.create({
            casoId, usuarioId, asignadoPor, activo: true
        });

        // Update State Automatically if Active
        if (['NUEVO', 'EN_ESPERA'].includes(caso.estado)) {
            const estadoAnterior = caso.estado;
            caso.estado = 'EN_CURSO';
            await caso.save();

            // Log Status Change
            await MesaCasoHistorial.create({
                casoId,
                evento: 'CAMBIO_ESTADO',
                usuarioId: asignadoPor,
                valorAnterior: estadoAnterior,
                valorNuevo: 'EN_CURSO'
            });
        }

        await MesaCasoHistorial.create({
            casoId, evento: 'ASIGNACION', usuarioId: asignadoPor, valorNuevo: `Usuario ${usuarioId}`
        });

        // --- EMAIL NOTIFICATION START ---
        try {
            const assignedUser = await Usuario.findByPk(usuarioId);
            if (assignedUser && assignedUser.email) {
                const mailOptions = {
                    from: '"Mesa de Servicios HUSRT" <sistemas6@hospitalsanrafaeltunja.gov.co>',
                    to: assignedUser.email,
                    subject: `Nuevo Caso Asignado - #${caso.id}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <h2>Se le ha asignado un nuevo caso</h2>
                            <p><strong>ID:</strong> #${caso.id}</p>
                            <p><strong>Título:</strong> ${caso.titulo}</p>
                            <p><strong>Prioridad:</strong> ${caso.prioridad}</p>
                            <p><strong>Estado:</strong> ${caso.estado}</p>
                            <p>Por favor ingrese a la plataforma para gestionarlo.</p>
                        </div>
                    `
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.error('Error sending email (assignResolutor):', error);
                });
            }
        } catch (mailError) {
            console.error('Error in email logic (assignResolutor):', mailError);
        }
        // --- EMAIL NOTIFICATION END ---

        res.json({ message: 'Asignado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeResolutor = async (req, res) => {
    try {
        const { casoId } = req.params;
        const { usuarioId, desasignadoPor } = req.body;

        const assignment = await MesaCasoAsignado.findOne({
            where: {
                casoId,
                usuarioId,
                activo: true
            }
        });

        if (!assignment) {
            return res.status(404).json({ error: 'El usuario no tiene una asignación activa en este caso.' });
        }

        assignment.activo = false;
        await assignment.save();

        await MesaCasoHistorial.create({
            casoId,
            evento: 'DESASIGNACION',
            usuarioId: desasignadoPor || usuarioId,
            valorAnterior: `Usuario ${usuarioId}`,
            valorNuevo: 'Desasignado'
        });

        res.json({ message: 'Usuario desasignado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.closeCaso = async (req, res) => {
    try {
        const { casoId } = req.params;
        const { usuarioId, mensajeFinal } = req.body;

        const caso = await MesaCaso.findByPk(casoId);
        if (!caso) return res.status(404).json({ error: 'Caso no encontrado' });

        const mensajeCierre = await MesaCasoMensaje.create({
            casoId, usuarioId, mensaje: mensajeFinal, tipo: 'CIERRE'
        });

        // Handle Attachments
        if (req.files && req.files.length > 0) {
            const adjuntos = req.files.map(file => ({
                mensajeId: mensajeCierre.id,
                nombreOriginal: file.originalname,
                rutaAlmacenamiento: file.path,
                tipoMime: file.mimetype,
                tamano: file.size
            }));
            await MesaCasoAdjunto.bulkCreate(adjuntos);
        }

        const estadoAnterior = caso.estado;
        caso.estado = 'CERRADO';
        caso.fechaCierre = new Date();
        caso.fechaUltimaAccion = new Date();
        await caso.save();

        await MesaCasoHistorial.create({
            casoId, evento: 'CIERRE', usuarioId, valorAnterior: estadoAnterior, valorNuevo: 'CERRADO'
        });

        res.json({ message: 'Caso cerrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rateCaso = async (req, res) => {
    try {
        const { casoId } = req.params;
        const { usuarioId, calificacion, comentario } = req.body;

        const exists = await MesaCasoCalificacion.findOne({ where: { casoId } });
        if (exists) return res.status(400).json({ error: 'El caso ya fue calificado' });

        const rating = await MesaCasoCalificacion.create({
            casoId, usuarioId, calificacion, comentario
        });

        res.json(rating);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdjunto = async (req, res) => {
    try {
        const { id } = req.params;
        const adjunto = await MesaCasoAdjunto.findByPk(id);

        if (!adjunto) {
            return res.status(404).json({ error: 'Adjunto no encontrado' });
        }

        const fs = require('fs');
        const path = require('path');
        const ruta = path.resolve(adjunto.rutaAlmacenamiento);

        fs.access(ruta, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ error: 'Archivo físico no encontrado' });
            }
            res.sendFile(ruta);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
