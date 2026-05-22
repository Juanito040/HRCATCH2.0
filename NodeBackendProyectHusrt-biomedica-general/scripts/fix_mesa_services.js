require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../config/configDb');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const [results] = await sequelize.query(
      'UPDATE Servicio SET requiereMesaServicios = 1 WHERE activo = 1'
    );
    console.log('Servicios marcados como requiereMesaServicios=true. Resultado:', results);

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
