const express = require('express');
const router = express.Router();
const Equipo = require('../../models/Biomedica/Equipo');
const TipoEquipo = require('../../models/generales/TipoEquipo');
const Servicio = require('../../models/generales/Servicio');
const Sede = require('../../models/generales/Sede');
const Responsable = require('../../models/Biomedica/Responsable');
const PlanMantenimiento = require('../../models/Biomedica/PlanMantenimiento');
const Usuario = require('../../models/generales/Usuario');
const Traslado = require('../../models/Biomedica/Traslado');
const Trazabilidad = require('../../models/Biomedica/Trazabilidad');
const Reporte = require('../../models/Biomedica/Reporte');
const { Op } = require('sequelize');

// Obtener todos los equipos
router.get('/equipos', async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            where: { estadoBaja: false },
            include: [
                { model: TipoEquipo, as: 'tipoEquipos' },
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' }
            ],
            order: [['serie', 'ASC']]
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos dados de baja
router.get('/equipos/bajas', async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            where: { estadoBaja: true },
            include: [
                { model: TipoEquipo, as: 'tipoEquipos' },
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' }
            ]
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos de un tipo especifico
router.get('/equipos/tipo/:idtipo', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const equipos = await Equipo.findAll({
            where: { tipoEquipoIdFk: req.params.idtipo, estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' },
                { model: PlanMantenimiento, as: 'planesMantenimiento' },
                {
                    model: Reporte,
                    as: 'reporte',
                    where: {
                        tipoMantenimiento: 'Preventivo',
                        añoProgramado: currentYear
                    },
                    required: false
                }
            ],
            order: [['nombres', 'ASC']]
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos de una sede especifica
router.get('/equipos/sede/:idsede', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const equipos = await Equipo.findAll({
            where: { estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    where: { sedeIdFk: req.params.idsede },
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' },
                { model: PlanMantenimiento, as: 'planesMantenimiento' },
                {
                    model: Reporte,
                    as: 'reporte',
                    where: {
                        tipoMantenimiento: 'Preventivo',
                        añoProgramado: currentYear
                    },
                    required: false
                }
            ],
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos de un servicio especifico
router.get('/equipos/servicio/:idserv', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const equipos = await Equipo.findAll({
            where: { servicioIdFk: req.params.idserv, estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' },
                { model: PlanMantenimiento, as: 'planesMantenimiento' },
                {
                    model: Reporte,
                    as: 'reporte',
                    where: {
                        tipoMantenimiento: 'Preventivo',
                        añoProgramado: currentYear
                    },
                    required: false
                }
            ],
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos de un responsable especifico
router.get('/equipos/responsable/:idresp', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const equipos = await Equipo.findAll({
            where: { responsableIdFk: req.params.idresp, estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' },
                { model: PlanMantenimiento, as: 'planesMantenimiento' },
                {
                    model: Reporte,
                    as: 'reporte',
                    where: {
                        tipoMantenimiento: 'Preventivo',
                        añoProgramado: currentYear
                    },
                    required: false
                }
            ],
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
});

// Obtener todos los equipos por riesgo
router.get('/equipos/riesgo/:riesgo', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const equipos = await Equipo.findAll({
            where: { riesgo: req.params.riesgo, estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' },
                { model: PlanMantenimiento, as: 'planesMantenimiento' },
                {
                    model: Reporte,
                    as: 'reporte',
                    where: {
                        tipoMantenimiento: 'Preventivo',
                        añoProgramado: currentYear
                    },
                    required: false
                }
            ],
            order: [['nombres', 'ASC']]
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos por riesgo', detalle: error.message });
    }
});

// Obtener la cantidad de equipos por riesgo
router.get('/cantidadequiposriesgo/:riesgo', async (req, res) => {
    try {
        const cantidad = await Equipo.count({
            where: { riesgo: req.params.riesgo, estadoBaja: false }
        });
        res.json(cantidad);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la cantidad de equipos por riesgo', detalle: error.message });
    }
});

// Obtener un equipo por ID
router.get('/equipo/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findByPk(req.params.id, {
            include: [
                { model: TipoEquipo, as: 'tipoEquipos' },
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' }
            ]
        });

        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        res.json(equipo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el equipo', detalle: error.message });
    }
});

// Crear un nuevo equipo
router.post('/addequipo', async (req, res) => {
    try {
        const { serie, placa, tipoEquipoIdFk } = req.body;

        // Sanitize body to only include Equipo fields
        const equipoFields = [
            'nombres', 'marca', 'modelo', 'serie', 'placa', 'registroInvima',
            'riesgo', 'ubicacion', 'ubicacionEspecifica', 'activo',
            'periodicidadM', 'periodicidadC', 'estadoBaja', 'calificacion',
            'tipoEquipoIdFk', 'servicioIdFk', 'responsableIdFk'
        ];
        const sanitizedBody = {};
        equipoFields.forEach(field => {
            if (req.body[field] !== undefined) sanitizedBody[field] = req.body[field];
        });

        const equipo = await Equipo.create(sanitizedBody);

        // Create Maintenance Plan
        if (req.body.planesMantenimiento && Array.isArray(req.body.planesMantenimiento)) {
            const currentYear = new Date().getFullYear();
            const planesM = req.body.planesMantenimiento.map(p => ({
                equipoIdFk: equipo.id,
                mes: p.mes,
                ano: p.ano || currentYear,
                rangoInicio: 1,
                rangoFin: 30
            }));
            if (planesM.length > 0) {
                await PlanMantenimiento.bulkCreate(planesM);
            }
        } else {
            // Auto-calculate Preventive Maintenance Plan (Legacy Fallback)
            const periodicidadM = parseInt(equipo.periodicidadM) || 0;
            if (periodicidadM > 0) {
                const currentYear = new Date().getFullYear();
                const planesM = [];
                const intervalM = 12 / periodicidadM;

                for (let i = 1; i <= periodicidadM; i++) {
                    let mes = Math.round(i * intervalM);
                    if (mes > 12) mes = 12;

                    planesM.push({
                        equipoIdFk: equipo.id,
                        mes: mes,
                        ano: currentYear,
                        rangoInicio: 1,
                        rangoFin: 30
                    });
                }

                if (planesM.length > 0) {
                    await PlanMantenimiento.bulkCreate(planesM);
                }
            }
        }

        // Create Metrology Plan
        if (req.body.planesActividadMetrologica && Array.isArray(req.body.planesActividadMetrologica)) {
            const PlanActividadMetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
            const currentYear = new Date().getFullYear();
            const planesAM = req.body.planesActividadMetrologica.map(p => ({
                equipoIdFk: equipo.id,
                mes: p.mes,
                ano: p.ano || currentYear,
                tipoActividad: p.tipoActividad
            }));
            if (planesAM.length > 0) {
                await PlanActividadMetrologica.bulkCreate(planesAM);
            }
        } else {
            // Check if TipoEquipo requires Metrology (Legacy Fallback)
            const tipoEquipo = await TipoEquipo.findByPk(equipo.tipoEquipoIdFk);

            if (tipoEquipo && tipoEquipo.requiereMetrologia) {
                const PlanActividadMetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
                const periodicidad = parseInt(equipo.periodicidadC) || 0;

                if (periodicidad > 0) {
                    const currentYear = new Date().getFullYear();
                    const planes = [];
                    const interval = 12 / periodicidad;

                    for (let i = 1; i <= periodicidad; i++) {
                        let mes = Math.round(i * interval);
                        if (mes > 12) mes = 12;

                        planes.push({
                            equipoIdFk: equipo.id,
                            mes: mes,
                            ano: currentYear,
                            tipoActividad: 'Calibración'
                        });
                    }

                    if (planes.length > 0) {
                        await PlanActividadMetrologica.bulkCreate(planes);
                    }
                }
            }
        }

        res.status(201).json(equipo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el equipo', detalle: error.message });
    }
});

// Actualizar un equipo
router.put('/Actequipo/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findByPk(req.params.id);
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        const equipoFields = [
            'nombres', 'marca', 'modelo', 'serie', 'placa', 'registroInvima',
            'riesgo', 'ubicacion', 'ubicacionEspecifica', 'activo',
            'periodicidadM', 'periodicidadC', 'estadoBaja', 'calificacion',
            'tipoEquipoIdFk', 'servicioIdFk', 'responsableIdFk'
        ];
        const sanitizedBody = {};
        const DetallesCambios = {};
        const oldData = equipo.toJSON();

        equipoFields.forEach(field => {
            if (req.body[field] !== undefined) {
                sanitizedBody[field] = req.body[field];
                if (req.body[field] !== oldData[field]) {
                    DetallesCambios[field] = { anterior: oldData[field], nuevo: req.body[field] };
                }
            }
        });

        await equipo.update(sanitizedBody);

        // Registrar trazabilidad
        if (req.user && req.user.id) {
            if (Object.keys(DetallesCambios).length > 0) {
                await Trazabilidad.create({
                    accion: 'EDICIÓN',
                    detalles: JSON.stringify(DetallesCambios),
                    equipoIdFk: req.params.id,
                    usuarioIdFk: req.user.id
                });
            }
        }

        // Actualizar planes de mantenimiento si vienen en el body
        if (req.body.planesMantenimiento && Array.isArray(req.body.planesMantenimiento)) {
            // Eliminar planes existentes
            await PlanMantenimiento.destroy({ where: { equipoIdFk: req.params.id } });

            // Crear nuevos planes
            const currentYear = new Date().getFullYear();
            const newPlanes = req.body.planesMantenimiento.map(p => ({
                equipoIdFk: req.params.id,
                mes: p.mes,
                ano: p.ano || currentYear,
                rangoInicio: 1,
                rangoFin: 30 // Valor por defecto
            }));

            if (newPlanes.length > 0) {
                await PlanMantenimiento.bulkCreate(newPlanes);
            }
            // Log maintenance plan change
            if (req.user && req.user.id) {
                await Trazabilidad.create({
                    accion: 'ACTUALIZACIÓN PLAN MANTENIMIENTO',
                    detalles: 'Se actualizaron los planes de mantenimiento.',
                    equipoIdFk: req.params.id,
                    usuarioIdFk: req.user.id
                });
            }
        }

        // Actualizar planes de actividad metrologica si vienen en el body
        if (req.body.planesActividadMetrologica && Array.isArray(req.body.planesActividadMetrologica)) {
            const PlanActividadMetrologica = require('../../models/Biomedica/PlanActividadMetrologica');
            // Eliminar planes existentes
            await PlanActividadMetrologica.destroy({ where: { equipoIdFk: req.params.id } });

            // Crear nuevos planes
            const currentYear = new Date().getFullYear();
            const newPlanesAM = req.body.planesActividadMetrologica.map(p => ({
                equipoIdFk: req.params.id,
                mes: p.mes,
                ano: p.ano || currentYear,
                tipoActividad: p.tipoActividad
            }));

            if (newPlanesAM.length > 0) {
                await PlanActividadMetrologica.bulkCreate(newPlanesAM);
            }
        }

        res.json(equipo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el equipo', detalle: error.message });
    }
});

// Eliminar un equipo
router.delete('/remequipo/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findByPk(req.params.id);
        if (!equipo) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }

        await equipo.destroy();
        res.json({ mensaje: 'Equipo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el equipo', detalle: error.message });
    }
});

router.get('/seriesequipos', async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            where: { estadoBaja: false },
            attributes: ['id', 'serie']
        });

        if (!equipos) {
            return res.status(404).json({ error: 'Equipos no encontrados' });
        }

        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos de los equipos', detalle: error.message });
    }
});

router.get('/historial/equipo/:id', async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching history for equipo ID: ${req.params.id}`);

        // Fetch Traslados
        const traslados = await Traslado.findAll({
            where: { equipoIdFk: req.params.id },
            include: [
                { model: Servicio, as: 'servicioOrigen' },
                { model: Servicio, as: 'servicioDestino' },
                { model: Usuario, as: 'usuario' }
            ]
        });
        console.log(`[DEBUG] Found ${traslados.length} traslados.`);

        // Fetch Trazabilidad
        const trazabilidad = await Trazabilidad.findAll({
            where: { equipoIdFk: req.params.id },
            include: [
                { model: Usuario, as: 'usuario' }
            ]
        });
        console.log(`[DEBUG] Found ${trazabilidad.length} trazabilidad records.`);

        // Map and Merge
        const historialTraslados = traslados.map(t => ({
            fecha: t.createdAt,
            tipo: 'TRASLADO',
            usuario: t.usuario ? `${t.usuario.nombres} ${t.usuario.apellidos}` : 'Desconocido',
            detalles: `Origen: ${t.servicioOrigen?.nombres || 'N/A'} -> Destino: ${t.servicioDestino?.nombres || 'N/A'}. Receptor: ${t.nombreReceptor}. Obs: ${t.observaciones || ''}`,
            id: `traslado-${t.id}`
        }));

        const historialTrazabilidad = trazabilidad.map(t => ({
            fecha: t.fecha,
            tipo: t.accion,
            usuario: t.usuario ? `${t.usuario.nombres} ${t.usuario.apellidos}` : 'Desconocido',
            detalles: t.detalles,
            id: `trazabilidad-${t.id}`
        }));

        const historialCompleto = [...historialTraslados, ...historialTrazabilidad];

        // Sort descending by date
        historialCompleto.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        console.log(`[DEBUG] Returning ${historialCompleto.length} total records.`);
        res.json(historialCompleto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial unificado', detalle: error.message });
    }
});

// Exportar inventario a Excel
// Exportar inventario a Excel
router.get('/exportarInventario', async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        const TiposEquipo = require('../../models/generales/TipoEquipo');
        const HojaVida = require('../../models/Biomedica/HojaVida');
        const DatosTecnicos = require('../../models/Biomedica/DatosTecnicos');
        const PlanMantenimiento = require('../../models/Biomedica/PlanMantenimiento');

        // Fetch all active equipos with relations
        const equipos = await Equipo.findAll({
            where: { estadoBaja: false },
            include: [
                { model: TiposEquipo, as: 'tipoEquipos' },
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                {
                    model: HojaVida,
                    as: 'hojaVida',
                    include: [
                        { model: require('../../models/Biomedica/Fabricante'), as: 'fabricante' },
                        { model: require('../../models/Biomedica/Proveedor'), as: 'proveedor' },
                        { model: DatosTecnicos, as: 'datosTecnicos' }
                    ]
                },
                { model: PlanMantenimiento, as: 'planesMantenimiento' }
            ],
            order: [['nombres', 'ASC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventario');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'nombres', width: 30 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Modelo', key: 'modelo', width: 20 },
            { header: 'Serie', key: 'serie', width: 20 },
            { header: 'Placa', key: 'placa', width: 15 },
            { header: 'Tipo Equipo', key: 'tipoEquipo', width: 25 },
            { header: 'Sede', key: 'sede', width: 20 },
            { header: 'Servicio', key: 'servicio', width: 25 },
            { header: 'Ubicación', key: 'ubicacion', width: 20 },
            { header: 'Activo', key: 'activo', width: 10 },
            { header: 'Periodicidad Mant.', key: 'periodicidadM', width: 15 },
            { header: 'Meses Mantenimiento', key: 'mesesMantenimiento', width: 30 }, // New Column
            { header: 'Periodicidad Metro.', key: 'periodicidadC', width: 15 },
            { header: 'Riesgo', key: 'riesgo', width: 15 }, // New Column
            // Hoja Vida fields
            { header: 'Cod. Internacional', key: 'codigoInternacional', width: 20 },
            { header: 'Año Ingreso', key: 'anoIngreso', width: 15 },
            { header: 'Contrato', key: 'contrato', width: 20 },
            { header: 'Tipo Adquisición', key: 'tipoAdquisicion', width: 20 },
            { header: 'Fecha Compra', key: 'fechaCompra', width: 15 },
            { header: 'Fecha Instalación', key: 'fechaInstalacion', width: 15 },
            { header: 'Fecha Incorporación', key: 'fechaIncorporacion', width: 15 },
            { header: 'Fecha Venc. Garantía', key: 'fechaVencimientoGarantia', width: 15 },
            { header: 'Costo Compra', key: 'costoCompra', width: 15 },
            { header: 'Fuente', key: 'fuente', width: 15 },
            { header: 'Tipo Uso', key: 'tipoUso', width: 20 },
            { header: 'Clase', key: 'clase', width: 15 },
            { header: 'Mantenimiento', key: 'mantenimiento', width: 15 },
            { header: 'Propiedad', key: 'propiedad', width: 15 },
            { header: 'Equipo Portátil', key: 'equipoPortatil', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 30 },
            // Relations
            { header: 'Fabricante', key: 'fabricante', width: 20 },
            { header: 'Proveedor', key: 'proveedor', width: 20 },
            // Datos Tecnicos
            { header: 'V Max Operación', key: 'vMaxOperacion', width: 15 },
            { header: 'V Min Operación', key: 'vMinOperacion', width: 15 },
            { header: 'I Max Operación', key: 'iMaxOperacion', width: 15 },
            { header: 'I Min Operación', key: 'iMinOperacion', width: 15 },
            { header: 'W Consumida', key: 'wConsumida', width: 15 },
            { header: 'Frecuencia', key: 'frecuencia', width: 15 },
            { header: 'Presión', key: 'presion', width: 15 },
            { header: 'Velocidad', key: 'velocidad', width: 15 },
            { header: 'Temperatura', key: 'temperatura', width: 15 },
            { header: 'Peso', key: 'peso', width: 15 },
            { header: 'Capacidad', key: 'capacidad', width: 15 },
            // Extra
            { header: 'Registro Invima', key: 'registroInvima', width: 20 }
        ];

        const monthNames = [
            '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        equipos.forEach(eq => {
            const hv = eq.hojaVida || {};
            const dt = hv.datosTecnicos || {};

            // Format maintenance months
            const planes = eq.planesMantenimiento || [];
            const mesesStr = planes
                .map(p => p.mes)
                .sort((a, b) => a - b)
                .map(m => monthNames[m])
                .filter(Boolean)
                .join(', ');

            worksheet.addRow({
                id: eq.id,
                nombres: eq.nombres,
                marca: eq.marca,
                modelo: eq.modelo,
                serie: eq.serie,
                placa: eq.placa,
                tipoEquipo: eq.tipoEquipos?.nombres || '',
                sede: eq.servicios?.sede?.nombres || '',
                servicio: eq.servicios?.nombres || '',
                ubicacion: eq.ubicacion,
                activo: eq.activo ? 'Sí' : 'No',
                periodicidadM: eq.periodicidadM,
                mesesMantenimiento: mesesStr, // Populated
                periodicidadC: eq.periodicidadC,
                riesgo: eq.riesgo, // Populated


                codigoInternacional: hv.codigoInternacional,
                anoIngreso: hv.anoIngreso,
                contrato: hv.contrato,
                tipoAdquisicion: hv.tipoAdquisicion,
                fechaCompra: hv.fechaCompra,
                fechaInstalacion: hv.fechaInstalacion,
                fechaIncorporacion: hv.fechaIncorporacion,
                fechaVencimientoGarantia: hv.fechaVencimientoGarantia,
                costoCompra: hv.costoCompra,
                fuente: hv.fuente,
                tipoUso: hv.tipoUso,
                clase: hv.clase,
                mantenimiento: hv.mantenimiento,
                propiedad: hv.propiedad,
                equipoPortatil: hv.equipoPortatil ? 'Sí' : 'No',
                observaciones: hv.observaciones,

                fabricante: hv.fabricante?.nombres || '',
                proveedor: hv.proveedor?.nombres || '',

                vMaxOperacion: dt.vMaxOperacion,
                vMinOperacion: dt.vMinOperacion,
                iMaxOperacion: dt.iMaxOperacion,
                iMinOperacion: dt.iMinOperacion,
                wConsumida: dt.wConsumida,
                frecuencia: dt.frecuencia,
                presion: dt.presion,
                velocidad: dt.velocidad,
                temperatura: dt.temperatura,
                peso: dt.peso,
                capacidad: dt.capacidad,

                registroInvima: eq.registroInvima
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventario_equipos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exportando inventario:', error);
        res.status(500).json({ error: 'Error al exportar inventario', detalle: error.message });
    }
});

// Obtener equipos patron (Tipo 1316)
router.get('/equipos/patron', async (req, res) => {
    try {
        const equipos = await Equipo.findAll({
            where: { tipoEquipoIdFk: 1316, estadoBaja: false },
            include: [
                {
                    model: Servicio,
                    as: 'servicios',
                    include: [{ model: Sede, as: 'sede' }]
                },
                { model: Responsable, as: 'responsables' }
            ],
            order: [['nombres', 'ASC']]
        });
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos patron', detalle: error.message });
    }
});

module.exports = router;
