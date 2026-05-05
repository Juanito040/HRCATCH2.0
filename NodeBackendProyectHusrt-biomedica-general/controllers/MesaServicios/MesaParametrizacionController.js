const { MesaCategoria, MesaSubcategoria, MesaServicioRol } = require('../../models/MesaServicios');

exports.getCategoriasByServicio = async (req, res) => {
    try {
        const { servicioId } = req.params;
        const { activo } = req.query; // Check for query param

        const whereCategoria = { servicioId };
        const whereSubcategoria = {};

        if (activo === 'true') {
            whereCategoria.activo = true;
            whereSubcategoria.activo = true;
        }

        const categorias = await MesaCategoria.findAll({
            where: whereCategoria,
            include: [{
                model: MesaSubcategoria,
                as: 'subcategorias',
                where: Object.keys(whereSubcategoria).length > 0 ? whereSubcategoria : undefined,
                required: false
            }]
        });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, servicioId } = req.body;
        const categoria = await MesaCategoria.create({ nombre, descripcion, servicioId });
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await MesaCategoria.findByPk(id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });

        categoria.activo = !categoria.activo;
        await categoria.save();
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSubcategoria = async (req, res) => {
    try {
        const { nombre, descripcion, categoriaId } = req.body;
        const subcategoria = await MesaSubcategoria.create({ nombre, descripcion, categoriaId });
        res.json(subcategoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleSubcategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategoria = await MesaSubcategoria.findByPk(id);
        if (!subcategoria) return res.status(404).json({ error: 'Subcategoría no encontrada' });

        subcategoria.activo = !subcategoria.activo;
        await subcategoria.save();
        res.json(subcategoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRolesCatalogo = async (req, res) => {
    try {
        const roles = await MesaServicioRol.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
