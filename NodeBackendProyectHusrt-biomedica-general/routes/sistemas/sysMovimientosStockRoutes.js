const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysMovimientosStockController');
const requireRoles = require('../../utilities/requireRoles');
const ROLES = ['SUPERADMIN', 'ADMINISTRADOR', 'AG', 'SISTEMASADMIN', 'SISTEMASUSER'];
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'C:/AppHusrt/Sistemas/facturas_repuestos';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Rutas de consulta (accesibles para todos los roles autenticados)
router.get('/', ctrl.getAll);
router.get('/alertas', ctrl.getAlertas);
router.get('/exportar', ctrl.exportarCSV);

// Registrar movimiento (solo roles con permiso)
router.get('/descargar-factura/:id', ctrl.descargarFactura);
router.post('/', requireRoles(...ROLES), upload.single('factura_pdf'), ctrl.registrarMovimiento);

module.exports = router;
