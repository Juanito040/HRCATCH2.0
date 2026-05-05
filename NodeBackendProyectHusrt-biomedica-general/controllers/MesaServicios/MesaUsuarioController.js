const { MesaServicioRol } = require('../../models/MesaServicios');
const Usuario = require('../../models/generales/Usuario');
const Cargo = require('../../models/generales/Cargo');
const Servicio = require('../../models/generales/Servicio');

exports.assignRole = async (req, res) => {
    try {
        const { servicioId, usuarioId, rolCodigo } = req.body;

        const rol = await MesaServicioRol.findOne({ where: { codigo: rolCodigo } });
        if (!rol) return res.status(404).json({ error: 'Rol no válido' });

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Direct update on User
        usuario.servicioId = servicioId;
        usuario.mesaServicioRolId = rol.id;
        await usuario.save();

        res.json({ message: 'Rol y Servicio asignados correctamente', usuario });
    } catch (error) {
        console.error('Assign Role Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUsersByServicio = async (req, res) => {
    try {
        const { servicioId } = req.params;
        const usuarios = await Usuario.findAll({
            where: { servicioId, estado: true },
            attributes: ['id', 'nombres', 'apellidos', 'email', 'numeroId', 'nombreUsuario', 'servicioId', 'mesaServicioRolId', 'cargoId', 'estado'],
            include: [
                { model: Cargo, as: 'cargo', attributes: ['nombre'] },
                { model: MesaServicioRol, as: 'mesaServicioRol' } // Ensure association exists in Usuario.js or index.js
            ]
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserServices = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const usuario = await Usuario.findByPk(usuarioId, {
            include: [{ model: Servicio, as: 'servicio' }]
        });

        // Return array format to maintain compatibility or simplify frontend
        const servicios = usuario && usuario.servicio ? [usuario.servicio] : [];
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
