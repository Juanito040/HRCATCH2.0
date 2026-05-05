const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dbnewapphusrt', 'root', process.env.MYSQL_PASSWORD, {
    host: 'localhost',
    dialect: 'mariadb',
    logging: false
});

async function diagnostic() {
    try {
        const tableStructure = await sequelize.getQueryInterface().describeTable('TipoEquipo');
        console.log("ID column details:");
        console.log(JSON.stringify(tableStructure.id, null, 2));
    } catch (error) {
        console.error("Error diagnosing table:", error.message);
    } finally {
        await sequelize.close();
    }
}

diagnostic();
