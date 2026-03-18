const Rol = require('../../models/generales/Rol')
const { Router, request } = require('express');
const app = Router();
const {checkToken} =  require('../../utilities/middleware');


app.post('/addrole', async (req, res) => {
    try {
      const { nombre } = req.body;
      const newRol = await Rol.create({
        nombre
      });
      res.status(201).json(newRol);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/roles', checkToken, async (req, res) => {
    try {
      const roles = await Rol.findAll();
      res.status(200).json(roles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = app;
