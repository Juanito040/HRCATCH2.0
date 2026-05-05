const { Sequelize } = require('sequelize');
const TipoEquipo = require('./models/generales/TipoEquipo');

async function simulate() {
    try {
        const testData = {
            nombres: "TEST EQUIPO",
            materialConsumible: "TEST MATERIAL",
            herramienta: "TEST HERRAMIENTA",
            tiempoMinutos: "30",
            repuestosMinimos: "TEST REPUESTOS",
            tipoR: 1,
            actividad: "TEST ACTIVIDAD",
            activo: true,
            requiereMetrologia: false
        };

        console.log("Attempting to create TipoEquipo with:", JSON.stringify(testData, null, 2));
        const created = await TipoEquipo.create(testData);
        console.log("Successfully created with ID:", created.id);
        // Cleanup
        await created.destroy();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            console.error("Validation Errors:", error.errors.map(e => `${e.path}: ${e.message}`));
        } else {
            console.error("Database Error:", error.message);
            if (error.parent) console.error("Parent Error:", error.parent.message);
        }
    } finally {
        const sequelize = require('./config/configDb');
        await sequelize.close();
    }
}

simulate();
