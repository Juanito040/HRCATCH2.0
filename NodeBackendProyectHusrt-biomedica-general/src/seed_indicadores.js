const sequelize = require('./../config/configDb');
const SysEquipo = require('./../models/Sistemas/SysEquipo');
const Usuario = require('./../models/generales/Usuario');
const Servicio = require('./../models/generales/Servicio');
const SysReporte = require('./../models/Sistemas/SysReporte');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const equipos = await SysEquipo.findAll({ limit: 5 });
        const usuarios = await Usuario.findAll({ limit: 5 });
        const servicios = await Servicio.findAll({ limit: 5 });

        if (equipos.length === 0 || usuarios.length === 0 || servicios.length === 0) {
            console.log('Faltan equipos, usuarios o servicios para crear ejemplos.');
            process.exit(1);
        }

        console.log(`Encontrados ${equipos.length} equipos, ${usuarios.length} usuarios, ${servicios.length} servicios.`);

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const tiposFalla = ['Desgaste', 'Operación Indebida', 'Causa Externa', 'Accesorios', 'Desconocido', 'Sin Falla', 'Otros', 'No Registra'];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // 1-12

        const nuevosReportes = [];

        // Generar 15 reportes preventivos
        for (let i = 0; i < 15; i++) {
            const equipo = getRandom(equipos);
            const user = getRandom(usuarios);
            const serv = getRandom(servicios);
            const isRealizado = Math.random() > 0.3; // 70% realizados
            
            // Variar el mes
            const monthOffset = Math.floor(Math.random() * 3); // 0, 1, 2
            let mes = currentMonth - monthOffset;
            let ano = currentYear;
            if (mes <= 0) { mes += 12; ano -= 1; }

            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const fecha = `${ano}-${String(mes).padStart(2, '0')}-${day}`;
            
            const hrIni = Math.floor(Math.random() * 5) + 8; // 8 to 12
            const hrFin = hrIni + Math.floor(Math.random() * 3) + 1; // +1 to +3 hours

            nuevosReportes.push({
                añoProgramado: ano,
                mesProgramado: mes,
                fechaRealizado: isRealizado ? fecha : null,
                horaInicio: isRealizado ? `${String(hrIni).padStart(2, '0')}:00:00` : null,
                horaTerminacion: isRealizado ? `${String(hrFin).padStart(2, '0')}:30:00` : null,
                tipoMantenimiento: 'Preventivo',
                tipoFalla: 'Sin Falla',
                estadoOperativo: 'Operativo sin restricciones',
                motivo: 'Mantenimiento preventivo programado',
                trabajoRealizado: isRealizado ? 'Limpieza, revisión y ajuste' : null,
                realizado: isRealizado,
                servicioIdFk: serv.id,
                id_sysequipo_fk: equipo.id_sysequipo,
                usuarioIdFk: user.id
            });
        }

        // Generar 10 reportes correctivos
        for (let i = 0; i < 10; i++) {
            const equipo = getRandom(equipos);
            const user = getRandom(usuarios);
            const serv = getRandom(servicios);
            
            const monthOffset = Math.floor(Math.random() * 3);
            let mes = currentMonth - monthOffset;
            let ano = currentYear;
            if (mes <= 0) { mes += 12; ano -= 1; }

            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const fecha = `${ano}-${String(mes).padStart(2, '0')}-${day}`;
            
            const hrIni = Math.floor(Math.random() * 5) + 8;
            const hrFin = hrIni + Math.floor(Math.random() * 5) + 1; 

            nuevosReportes.push({
                añoProgramado: ano,
                mesProgramado: mes,
                fechaRealizado: fecha,
                horaInicio: `${String(hrIni).padStart(2, '0')}:00:00`,
                horaTerminacion: `${String(hrFin).padStart(2, '0')}:15:00`,
                tipoMantenimiento: 'Correctivo',
                tipoFalla: getRandom(tiposFalla.filter(f => f !== 'Sin Falla')),
                estadoOperativo: 'Operativo sin restricciones',
                motivo: 'Falla reportada por el usuario',
                trabajoRealizado: 'Reemplazo de componente defectuoso',
                realizado: true,
                servicioIdFk: serv.id,
                id_sysequipo_fk: equipo.id_sysequipo,
                usuarioIdFk: user.id
            });
        }

        await SysReporte.bulkCreate(nuevosReportes);
        console.log(`Se crearon ${nuevosReportes.length} reportes de ejemplo.`);

    } catch (e) {
        console.error('Error seeding data:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

seed();
