const Usuario = require('../../models/generales/Usuario');
const Servicio = require('../../models/generales/Servicio');
const { Router } = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkToken } = require('../../utilities/middleware');
const app = Router();
const transporter = require('../../utilities/mailer');
const generarPDF = require('../../utilities/crearPDF');

const SECRET_KEY = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

app.post('/adduser', async (req, res) => {
  try {
    const { nombres, apellidos, nombreUsuario, tipoId, numeroId, telefono, email, contrasena, registroInvima, estado, rolId, cargoId, servicioId, mesaServicioRolId } = req.body;
    const contraseña = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = await Usuario.create({
      nombres,
      apellidos,
      nombreUsuario,
      tipoId,
      numeroId,
      telefono,
      email,
      contraseña,
      registroInvima,
      estado,
      rolId,
      cargoId,
      servicioId,
      mesaServicioRolId
    });

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/login', async (req, res) => {
  const { usuarion, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({
      where: {
        nombreUsuario: usuarion
      },
      include: ['rol', 'mesaServicioRol']
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña Incorrecta' });
    }

    if (usuario.estado) {
      // Include Mesa Role Code in Token
      const mesaRol = usuario.mesaServicioRol ? usuario.mesaServicioRol.codigo : null;
      const token = jwt.sign({
        id: usuario.id,
        rol: usuario.rol.nombre,
        mesaRol: mesaRol
      }, SECRET_KEY, { expiresIn: '4h' });
      res.json({
        token: token,
        idUser: usuario.id
      });

    } else {
      return res.status(404).json({ error: 'Usuario Inactivo' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login como Invitado
app.post('/login/invitado', async (req, res) => {
  try {
    const token = jwt.sign({
      id: 0,
      rol: 'INVITADO',
      nombre: 'Invitado'
    }, SECRET_KEY, { expiresIn: '2h' });

    res.json({
      token: token,
      idUser: 0,
      rol: 'INVITADO'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar acceso de invitado' });
  }
});


app.get('/users', checkToken, async (req, res) => {
  try {
    const users = await Usuario.findAll({ include: ['rol', 'servicio', 'mesaServicioRol', 'cargo'] });
    console.log('Users fetched successfully:', users.length);
    if (users.length > 0) console.log('Sample user cargo in route:', JSON.stringify(users[0].cargo));
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/user/:id', checkToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id, { include: 'rol' });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/userprofil/:id', checkToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id, { include: ['rol', 'cargo', 'mesaServicioRol'] });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/desactivarusuario/:id', checkToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (user) {
      await user.update({ estado: false })
      res.status(200).json({ estado: 'Realizado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/activarusuario/:id', checkToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.params.id);
    if (user) {
      await user.update({ estado: true })
      res.status(200).json({ estado: 'Realizado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/users/todos', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { estado: true },
      attributes: ['id', 'nombres', 'apellidos']
    });
    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/servicio/sistemas', async (req, res) => {
  try {
    const { Op } = require('sequelize');
    let usuarios = await Usuario.findAll({
      where: { estado: true },
      include: [{ model: Servicio, as: 'servicio', where: { nombres: { [Op.like]: '%Sistemas%' } } }],
      attributes: ['id', 'nombres', 'apellidos']
    });
    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/username/:nombreUsuario', async (req, res) => {
  try {
    const user = await Usuario.findOne({
      where: { nombreUsuario: req.params.nombreUsuario },
      include: 'rol'
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Usuario No Encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/update/:id', checkToken, async (req, res) => {
  const { nombres, apellidos, nombreUsuario, tipoId, numeroId, telefono, email, contraseña, registroInvima, estado, rolId, cargoId, servicioId, mesaServicioRolId } = req.body;
  const hashedPassword = contraseña ? await bcrypt.hash(contraseña, 10) : undefined;

  try {
    const user = await Usuario.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no Encontrado' });
    }

    await user.update({
      nombres: nombres || user.nombres,
      apellidos: apellidos || user.apellidos,
      nombreUsuario: nombreUsuario || user.nombreUsuario,
      tipoId: tipoId || user.tipoId,
      numeroId: numeroId || user.numeroId,
      telefono: telefono || user.telefono,
      email: email || user.email,
      contraseña: hashedPassword || user.contraseña,
      registroInvima: registroInvima || user.registroInvima,
      estado: estado !== undefined ? estado : user.estado,
      rolId: rolId || user.rolId,
      cargoId: cargoId || user.cargoId,
      servicioId: servicioId || user.servicioId,
      mesaServicioRolId: mesaServicioRolId || user.mesaServicioRolId
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/olvidocontrasena', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '15m' });


    const link = `${CLIENT_URL}?token=${token}`;

    await transporter.sendMail({
      from: 'sistemas6@hospitalsanrafaeltunja.gov.co',
      to: email,
      subject: 'Recuperación de contraseña AppHusrt',
      html: `<p>Hola ${user.nombres},</p>
             <p>Solicitaste el cambio de contraseña de tu usuario de AppHusrt, Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
             <a href="${link}">${link}</a>
             <p>Este enlace expirará en 15 minutos.</p>`
    });

    res.json({ mensaje: 'Correo de recuperación enviado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la solicitud', detalle: err.message });
  }
});


app.put('/cambiarcontrasena', checkToken, async (req, res) => {
  const { nuevaContrasena } = req.body;

  if (!req.headers['authorization']) {
    return res.json({ err: 'token no incluido' });
  }
  const token = req.headers['authorization'];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await Usuario.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const contraseña = await bcrypt.hash(nuevaContrasena, 10);
    user.contraseña = contraseña;
    await user.update({ contraseña: user.contraseña });
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'Token inválido o expirado', detalle: err.message });
  }
});

app.get('/nombreusuario/:id', checkToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['nombres', 'apellidos', 'tipoId', 'numeroId']
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      nombreCompleto: `${usuario.nombres} ${usuario.apellidos}`,
      numeroId: `${usuario.numeroId}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el nombre del usuario', detalle: error.message });
  }
});


module.exports = app;