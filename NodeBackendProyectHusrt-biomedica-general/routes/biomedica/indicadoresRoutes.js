const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Reporte = require('../../models/Biomedica/Reporte');
const Equipo = require('../../models/Biomedica/Equipo');
const Servicio = require('../../models/generales/Servicio');

// Helper para calcular duración en minutos
const calcularDuracionMinutos = (horaTotal) => {
    if (!horaTotal) return 0;
    const [horas, minutos, segundos] = horaTotal.split(':').map(Number);
    return (horas * 60) + minutos + (segundos / 60);
};

// Helper para formatear duración promedio de vuelta a HH:MM:SS
const formatearDuracion = (minutosTotales) => {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = Math.floor(minutosTotales % 60);
    const segundos = Math.floor((minutosTotales * 60) % 60);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
};

router.post('/indicadores/cumplimiento', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.body;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin (YYYY-MM-DD)' });
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        // --- INDICADORES PREVENTIVOS ---
        // Se basan en mesProgramado y añoProgramado dentro del rango
        // Asumimos que fechaInicio y fechaFin cubren meses completos para ser precisos, 
        // pero filtraremos por la fecha de programación convertida a fecha aproximada o por mes/año si el input lo permite.
        // Para simplificar y ser robustos con el input de fecha:
        // Extraemos mes y año del rango para filtrar 'añoProgramado' y 'mesProgramado'

        // Nota: Si el rango cruza años, la lógica de mesProgramado >= X && mesProgramado <= Y puede fallar si no se considera el año.
        // Una mejor aproximación es construir una fecha a partir de año/mes programado y comparar.
        // Sin embargo, SQL directo o lógica en JS es necesaria. Haremos lógica en JS tras traer datos relevantes o usar Op.or para años.

        // Estrategia: Traer reportes preventivos que "caigan" en el periodo.
        // Como añoProgramado y mesProgramado son enteros, es complejo filtrar por rango exacto de fechas si no es mes completo.
        // Asumiremos que el usuario quiere ver el cumplimiento de los mantenimientos programados para los meses que toca el rango.

        const startMonth = inicio.getMonth() + 1;
        const startYear = inicio.getFullYear();
        const endMonth = fin.getMonth() + 1;
        const endYear = fin.getFullYear();

        // Construir filtro para preventivos
        // Esto es un poco truculento con Sequelize simple si no tenemos una columna de fecha programada completa.
        // Iteraremos por los meses del rango para construir una query OR.

        let orConditions = [];
        let currentY = startYear;
        let currentM = startMonth;

        while (currentY < endYear || (currentY === endYear && currentM <= endMonth)) {
            orConditions.push({
                añoProgramado: currentY,
                mesProgramado: currentM
            });
            currentM++;
            if (currentM > 12) {
                currentM = 1;
                currentY++;
            }
        }

        const preventivos = await Reporte.findAll({
            where: {
                tipoMantenimiento: 'Preventivo',
                [Op.or]: orConditions
            }
        });

        const totalPreventivosProgramados = preventivos.length;
        const preventivosRealizados = preventivos.filter(r => r.realizado === true);
        const totalPreventivosRealizados = preventivosRealizados.length;

        const cumplimientoPreventivo = totalPreventivosProgramados > 0
            ? (totalPreventivosRealizados / totalPreventivosProgramados) * 100
            : 0;

        // Duración promedio preventivos
        let sumaMinutosPreventivos = 0;
        let countDuracionPrev = 0;
        preventivosRealizados.forEach(r => {
            if (r.horaTotal) {
                sumaMinutosPreventivos += calcularDuracionMinutos(r.horaTotal);
                countDuracionPrev++;
            }
        });
        const promedioDuracionPreventivo = countDuracionPrev > 0
            ? formatearDuracion(sumaMinutosPreventivos / countDuracionPrev)
            : "00:00:00";


        // --- INDICADORES CORRECTIVOS ---
        // Se basan en fechaRealizado (o createdAt si se quiere ver solicitudes, pero el usuario pide cumplimiento).
        // "Cumplimiento" en correctivo suele ser (Atendidos / Solicitados).
        // Si Reporte se crea cuando se solicita, entonces total = count(Reporte Correctivo en rango).
        // Realizados = count(Reporte Correctivo en rango AND realizado=true).
        // Usaremos 'createdAt' para saber cuándo se solicitó/creó el reporte, o 'fechaRealizado' para cuándo se hizo.
        // El requerimiento dice "recibir parametro fecha inicio y fecha final".
        // Generalmente se evalúa lo que se reportó en ese periodo.

        const correctivos = await Reporte.findAll({
            where: {
                tipoMantenimiento: 'Correctivo',
                // CAMBIO: Filtrar por fecha de realización, no de creación
                fechaRealizado: {
                    [Op.between]: [fechaInicio, fechaFin]
                }
            }
        });

        const totalCorrectivosReportados = correctivos.length;
        const correctivosRealizados = correctivos.filter(r => r.realizado === true);
        const totalCorrectivosRealizados = correctivosRealizados.length;

        const cumplimientoCorrectivo = totalCorrectivosReportados > 0
            ? (totalCorrectivosRealizados / totalCorrectivosReportados) * 100
            : 0;

        // Duración promedio correctivos
        let sumaMinutosCorrectivos = 0;
        let countDuracionCorr = 0;
        correctivosRealizados.forEach(r => {
            if (r.horaTotal) {
                sumaMinutosCorrectivos += calcularDuracionMinutos(r.horaTotal);
                countDuracionCorr++;
            }
        });
        const promedioDuracionCorrectivo = countDuracionCorr > 0
            ? formatearDuracion(sumaMinutosCorrectivos / countDuracionCorr)
            : "00:00:00";

        res.json({
            rango: { fechaInicio, fechaFin },
            preventivo: {
                programados: totalPreventivosProgramados,
                realizados: totalPreventivosRealizados,
                cumplimiento: parseFloat(cumplimientoPreventivo.toFixed(2)),
                promedioDuracion: promedioDuracionPreventivo
            },
            correctivo: {
                reportados: totalCorrectivosReportados,
                realizados: totalCorrectivosRealizados,
                cumplimiento: parseFloat(cumplimientoCorrectivo.toFixed(2)),
                promedioDuracion: promedioDuracionCorrectivo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular indicadores', detalle: error.message });
    }
});

module.exports = router;
