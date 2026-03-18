const express = require('express');
const router = express.Router();
const cargoController = require('../../controllers/generales/cargoController');

router.get('/', cargoController.getCargos);
router.post('/', cargoController.createCargo);
router.put('/:id', cargoController.updateCargo);
router.delete('/:id', cargoController.deleteCargo);

module.exports = router;
