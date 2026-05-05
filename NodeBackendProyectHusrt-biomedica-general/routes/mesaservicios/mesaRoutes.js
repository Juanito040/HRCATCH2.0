const express = require('express');
const router = express.Router();
const MesaParametrizacionController = require('../../controllers/MesaServicios/MesaParametrizacionController');
const MesaUsuarioController = require('../../controllers/MesaServicios/MesaUsuarioController');
const MesaCasoController = require('../../controllers/MesaServicios/MesaCasoController');
const MesaInteraccionController = require('../../controllers/MesaServicios/MesaInteraccionController');
const { checkToken } = require('../../utilities/middleware');

const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'C:/AppHusrt/MesaServicios/Adjuntos';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Public Routes
router.get('/adjuntos/:id', MesaInteraccionController.getAdjunto);

// Middleware for Protected Routes
router.use(checkToken);

// Parametrizacion
router.get('/config/categorias/:servicioId', MesaParametrizacionController.getCategoriasByServicio);
router.post('/config/categorias', MesaParametrizacionController.createCategoria);
router.put('/config/categorias/:id/toggle', MesaParametrizacionController.toggleCategoria);
router.post('/config/subcategorias', MesaParametrizacionController.createSubcategoria);
router.put('/config/subcategorias/:id/toggle', MesaParametrizacionController.toggleSubcategoria);
router.get('/config/roles', MesaParametrizacionController.getRolesCatalogo);

// Usuarios & Roles
router.post('/config/usuarios/asignar', MesaUsuarioController.assignRole);
router.get('/config/usuarios/servicio/:servicioId', MesaUsuarioController.getUsersByServicio);
router.get('/config/usuarios/:usuarioId/servicios', MesaUsuarioController.getUserServices);

// Casos
router.post('/casos', upload.array('archivos', 5), MesaCasoController.createCaso);
router.get('/casos', MesaCasoController.getCasos);
router.get('/casos/equipo/:id_sysequipo', MesaCasoController.getCasosPorEquipo);
router.get('/casos/:id', MesaCasoController.getCasoById);
router.patch('/casos/:id/estado', MesaCasoController.changeState);
router.patch('/casos/:id/detalles', MesaCasoController.updateCasoDetails);

// Interaccion
router.post('/casos/:casoId/mensajes', upload.array('archivos', 5), MesaInteraccionController.addMensaje);
router.post('/casos/:casoId/asignar', MesaInteraccionController.assignResolutor);
router.post('/casos/:casoId/desasignar', MesaInteraccionController.removeResolutor);
router.post('/casos/:casoId/cerrar', upload.array('archivos', 5), MesaInteraccionController.closeCaso);
router.post('/casos/:casoId/calificar', MesaInteraccionController.rateCaso);

module.exports = router;
