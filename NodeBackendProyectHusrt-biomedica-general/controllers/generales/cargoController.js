const Cargo = require('../../models/generales/Cargo');

// Get all cargos
exports.getCargos = async (req, res) => {
    try {
        const cargos = await Cargo.findAll();
        res.json(cargos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cargos' });
    }
};

// Create a new cargo
exports.createCargo = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const newCargo = await Cargo.create({ nombre, descripcion });
        res.status(201).json(newCargo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear cargo' });
    }
};

// Update a cargo
exports.updateCargo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, estado } = req.body;
        const cargo = await Cargo.findByPk(id);
        if (!cargo) {
            return res.status(404).json({ error: 'Cargo no encontrado' });
        }
        await cargo.update({ nombre, descripcion, estado });
        res.json(cargo);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar cargo' });
    }
};

// Delete a cargo (logical delete usually, or physical if requested. Assuming logical delete via 'estado' or standard delete if not used)
// For now, let's implement standard delete but maybe check usage? The plan said "deleteCargo".
exports.deleteCargo = async (req, res) => {
    try {
        const { id } = req.params;
        const cargo = await Cargo.findByPk(id);
        if (!cargo) {
            return res.status(404).json({ error: 'Cargo no encontrado' });
        }
        await cargo.destroy();
        res.json({ message: 'Cargo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cargo' });
    }
};
