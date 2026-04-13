const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/Sistemas/sysHojaVidaController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'C:/AppHusrt/Sistemas/imageneshv';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/equipo/:equipoId/pdf', ctrl.exportarPdfByEquipo);
router.put('/equipo/:equipoId/foto', upload.single('foto'), ctrl.uploadFotoByEquipo);
router.get('/equipo/:equipoId', ctrl.getSysHojaVidaByEquipo);
router.put('/equipo/:equipoId', ctrl.upsertByEquipo);

router.get('/:id', ctrl.getSysHojaVidaById);
router.get('/', ctrl.getAllSysHojasVida);
router.post('/', ctrl.createSysHojaVida);
router.put('/:id', ctrl.updateSysHojaVida);
router.delete('/:id', ctrl.deleteSysHojaVida);

module.exports = router;
