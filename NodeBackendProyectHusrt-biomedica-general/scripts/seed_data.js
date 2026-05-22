require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/configDb');

const Rol = require('../models/generales/Rol');
const Cargo = require('../models/generales/Cargo');
const Sede = require('../models/generales/Sede');
const Servicio = require('../models/generales/Servicio');
const TipoEquipo = require('../models/generales/TipoEquipo');
const Usuario = require('../models/generales/Usuario');
const MesaServicioRol = require('../models/MesaServicios/MesaServicioRol');
const Fabricante = require('../models/Biomedica/Fabricante');
const Proveedor = require('../models/Biomedica/Proveedor');
const Responsable = require('../models/Biomedica/Responsable');
const DatosTecnicos = require('../models/Biomedica/DatosTecnicos');
const Equipo = require('../models/Biomedica/Equipo');
const HojaVida = require('../models/Biomedica/HojaVida');

async function findOrCreate(Model, where, defaults = {}) {
  const [record] = await Model.findOrCreate({ where, defaults: { ...where, ...defaults } });
  return record;
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.\n');

    // ── 1. Roles ────────────────────────────────────────────────────────────
    console.log('Creando roles...');
    const roles = {};
    for (const nombre of [
      'SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO',
      'ADMINISTRADOR', 'AG', 'ADM', 'MESAADMIN', 'MESAUSER', 'SOL', 'OBS', 'INVITADO',
    ]) {
      roles[nombre] = await findOrCreate(Rol, { nombre });
    }
    console.log(`  ${Object.keys(roles).length} roles OK`);

    // ── 2. Mesa de servicios roles ──────────────────────────────────────────
    console.log('Creando roles mesa de servicios...');
    const mesaRolNone = await findOrCreate(MesaServicioRol, { codigo: 'NONE' }, { nombre: 'Sin rol' });
    await findOrCreate(MesaServicioRol, { codigo: 'ADMIN' }, { nombre: 'Administrador Mesa' });
    await findOrCreate(MesaServicioRol, { codigo: 'AGENT' }, { nombre: 'Agente' });
    await findOrCreate(MesaServicioRol, { codigo: 'USER' }, { nombre: 'Usuario' });
    console.log('  Mesa roles OK');

    // ── 3. Cargos ───────────────────────────────────────────────────────────
    console.log('Creando cargos...');
    const cargoAdmin = await findOrCreate(Cargo, { nombre: 'Administrador' });
    const cargoBiomed = await findOrCreate(Cargo, { nombre: 'Ingeniero Biomédico' });
    const cargoTec = await findOrCreate(Cargo, { nombre: 'Técnico Biomédico' });
    const cargoEnf = await findOrCreate(Cargo, { nombre: 'Enfermero/a' });
    const cargoMedico = await findOrCreate(Cargo, { nombre: 'Médico' });
    console.log('  Cargos OK');

    // ── 4. Sedes ────────────────────────────────────────────────────────────
    console.log('Creando sedes...');
    const sedePrincipal = await findOrCreate(Sede, { nombres: 'Sede Principal HUSRT' }, {
      direccion: 'Carrera 11 # 69-80',
      nit: '891800394-4',
      ciudad: 'Tunja',
      departamento: 'Boyacá',
      estado: true,
      nivel: 3,
    });
    const sedeNorte = await findOrCreate(Sede, { nombres: 'Sede Norte' }, {
      direccion: 'Av. Norte # 12-45',
      nit: '891800394-4',
      ciudad: 'Tunja',
      departamento: 'Boyacá',
      estado: true,
      nivel: 2,
    });
    console.log('  Sedes OK');

    // ── 5. Servicios ────────────────────────────────────────────────────────
    console.log('Creando servicios...');
    const servicios = {};
    const serviciosDef = [
      { nombres: 'Urgencias', ubicacion: 'Piso 1', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'UCI', ubicacion: 'Piso 3', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'Cirugía', ubicacion: 'Piso 2', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'Laboratorio Clínico', ubicacion: 'Piso 1', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'Radiología e Imágenes', ubicacion: 'Piso 1', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'Consulta Externa', ubicacion: 'Piso 4', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'Neonatología', ubicacion: 'Piso 3', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
      { nombres: 'General', ubicacion: 'Principal', sedeIdFk: sedePrincipal.id, requiereMesaServicios: true },
    ];
    for (const s of serviciosDef) {
      servicios[s.nombres] = await findOrCreate(Servicio, { nombres: s.nombres }, { ubicacion: s.ubicacion, sedeIdFk: s.sedeIdFk, requiereMesaServicios: s.requiereMesaServicios });
    }
    console.log(`  ${Object.keys(servicios).length} servicios OK`);

    // ── 6. Tipos de equipo ──────────────────────────────────────────────────
    console.log('Creando tipos de equipo...');
    const tiposEquipo = {};
    const tiposDefBio = [
      { nombres: 'Monitor de Signos Vitales', materialConsumible: 'Sensores, electrodos', herramienta: 'Destornilladores, multímetro', tiempoMinutos: '90', repuestosMinimos: 'Batería, sensores SpO2', tipoR: 1, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: true },
      { nombres: 'Ventilador Mecánico', materialConsumible: 'Filtros, circuitos de paciente', herramienta: 'Medidor de flujo, destornilladores', tiempoMinutos: '120', repuestosMinimos: 'Válvulas, filtros HEPA', tipoR: 1, actividad: 'Mantenimiento preventivo trimestral', activo: true, requiereMetrologia: true },
      { nombres: 'Desfibrilador', materialConsumible: 'Electrodos, gel conductor', herramienta: 'Analizador de desfibriladores', tiempoMinutos: '60', repuestosMinimos: 'Batería, paletas', tipoR: 1, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: true },
      { nombres: 'Bomba de Infusión', materialConsumible: 'Equipos de infusión', herramienta: 'Analizador de bombas, multímetro', tiempoMinutos: '60', repuestosMinimos: 'Batería', tipoR: 1, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: true },
      { nombres: 'Equipo de Rayos X', materialConsumible: 'Placas, revelador', herramienta: 'Dosímetro, multímetro', tiempoMinutos: '180', repuestosMinimos: 'Fusibles, colimador', tipoR: 1, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: true },
      { nombres: 'Autoclave', materialConsumible: 'Agua destilada, indicadores biológicos', herramienta: 'Termómetro, manómetro', tiempoMinutos: '90', repuestosMinimos: 'Juntas, válvulas de seguridad', tipoR: 1, actividad: 'Mantenimiento preventivo trimestral', activo: true, requiereMetrologia: false },
      { nombres: 'Electrocardiógrafo', materialConsumible: 'Papel térmico, electrodos', herramienta: 'Simulador ECG', tiempoMinutos: '60', repuestosMinimos: 'Cable de paciente, electrodos', tipoR: 1, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Incubadora Neonatal', materialConsumible: 'Filtros, agua destilada', herramienta: 'Termómetro calibrado, higrómetro', tiempoMinutos: '120', repuestosMinimos: 'Resistencia calefactora, sondas de temperatura', tipoR: 1, actividad: 'Mantenimiento preventivo trimestral', activo: true, requiereMetrologia: true },
      { nombres: 'Centrífuga', materialConsumible: 'Tubos, adaptadores', herramienta: 'Tacómetro, balanza', tiempoMinutos: '60', repuestosMinimos: 'Brushes, rotor', tipoR: 1, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: false },
      { nombres: 'Equipo de Ultrasonido', materialConsumible: 'Gel conductor', herramienta: 'Fantoma de prueba', tiempoMinutos: '90', repuestosMinimos: 'Transductores', tipoR: 1, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
    ];
    for (const t of tiposDefBio) {
      tiposEquipo[t.nombres] = await findOrCreate(TipoEquipo, { nombres: t.nombres }, t);
    }

    const tiposDefSis = [
      { nombres: 'Computador de Escritorio', materialConsumible: 'Pasta térmica, alcohol isopropílico', herramienta: 'Destornilladores, soplador de aire', tiempoMinutos: '60', repuestosMinimos: 'Memoria RAM, disco duro', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Portátil / Laptop', materialConsumible: 'Pasta térmica, alcohol isopropílico', herramienta: 'Destornilladores de precisión', tiempoMinutos: '60', repuestosMinimos: 'Batería, cargador', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Impresora', materialConsumible: 'Tóner, papel', herramienta: 'Destornilladores, pinzas', tiempoMinutos: '45', repuestosMinimos: 'Tóner, drum', tipoR: 2, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: false },
      { nombres: 'Servidor', materialConsumible: 'Pasta térmica, alcohol isopropílico', herramienta: 'Destornilladores, multímetro', tiempoMinutos: '90', repuestosMinimos: 'RAM, disco duro, fuente de poder', tipoR: 2, actividad: 'Mantenimiento preventivo semestral', activo: true, requiereMetrologia: false },
      { nombres: 'UPS / Regulador', materialConsumible: 'N/A', herramienta: 'Multímetro', tiempoMinutos: '30', repuestosMinimos: 'Batería interna', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Tablet', materialConsumible: 'N/A', herramienta: 'Destornilladores de precisión', tiempoMinutos: '30', repuestosMinimos: 'Batería, cargador', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Switch de Red', materialConsumible: 'Alcohol isopropílico', herramienta: 'Soplador de aire', tiempoMinutos: '20', repuestosMinimos: 'Cables de red', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
      { nombres: 'Access Point', materialConsumible: 'Alcohol isopropílico', herramienta: 'Soplador de aire', tiempoMinutos: '20', repuestosMinimos: 'N/A', tipoR: 2, actividad: 'Mantenimiento preventivo anual', activo: true, requiereMetrologia: false },
    ];
    for (const t of tiposDefSis) {
      tiposEquipo[t.nombres] = await findOrCreate(TipoEquipo, { nombres: t.nombres }, t);
    }
    console.log(`  ${Object.keys(tiposEquipo).length} tipos de equipo OK`);

    // ── 7. Fabricantes ──────────────────────────────────────────────────────
    console.log('Creando fabricantes...');
    const fabricantes = {};
    for (const f of [
      { nombres: 'Philips Healthcare', pais: 'Países Bajos', estado: true },
      { nombres: 'GE Healthcare', pais: 'Estados Unidos', estado: true },
      { nombres: 'Siemens Healthineers', pais: 'Alemania', estado: true },
      { nombres: 'Mindray', pais: 'China', estado: true },
      { nombres: 'Drager', pais: 'Alemania', estado: true },
      { nombres: 'Medtronic', pais: 'Irlanda', estado: true },
      { nombres: 'Biomedical Systems', pais: 'Colombia', estado: true },
    ]) {
      fabricantes[f.nombres] = await findOrCreate(Fabricante, { nombres: f.nombres }, f);
    }
    console.log('  Fabricantes OK');

    // ── 8. Proveedores ──────────────────────────────────────────────────────
    console.log('Creando proveedores...');
    const proveedores = {};
    for (const p of [
      { nombres: 'Medisalud SAS', telefono: '6014567890', correo: 'contacto@medisalud.com.co', ciudad: 'Bogotá', representante: 'Carlos Pérez', telRepresentante: '3001234567', estado: true },
      { nombres: 'Equipos Hospitalarios del Norte', telefono: '6087654321', correo: 'ventas@ehno.com.co', ciudad: 'Bucaramanga', representante: 'María Torres', telRepresentante: '3109876543', estado: true },
      { nombres: 'Tecno Médica Ltda', telefono: '6044445555', correo: 'info@tecnomedica.com.co', ciudad: 'Medellín', representante: 'Andrés Gómez', telRepresentante: '3151122334', estado: true },
    ]) {
      proveedores[p.nombres] = await findOrCreate(Proveedor, { nombres: p.nombres }, p);
    }
    console.log('  Proveedores OK');

    // ── 9. Responsables ─────────────────────────────────────────────────────
    console.log('Creando responsables...');
    const responsables = {};
    for (const r of [
      { nombres: 'Ingeniería Biomédica HUSRT', garantia: false, externo: false, calificacion: 5, comodato: false, estado: true },
      { nombres: 'Garantía Philips', garantia: true, externo: true, calificacion: 5, comodato: false, estado: true },
      { nombres: 'Garantía GE Healthcare', garantia: true, externo: true, calificacion: 5, comodato: false, estado: true },
      { nombres: 'Contrato Medisalud SAS', garantia: false, externo: true, calificacion: 4, comodato: false, estado: true },
      { nombres: 'Comodato Drager', garantia: false, externo: true, calificacion: 4, comodato: true, estado: true },
    ]) {
      responsables[r.nombres] = await findOrCreate(Responsable, { nombres: r.nombres }, r);
    }
    console.log('  Responsables OK');

    // ── 10. Usuarios ────────────────────────────────────────────────────────
    console.log('Creando usuarios...');
    const pass = await bcrypt.hash('Husrt2025*', 10);
    const passAdmin = await bcrypt.hash('Admin2025*', 10);

    const usuariosDef = [
      { nombres: 'Super', apellidos: 'Admin', nombreUsuario: 'superadmin', tipoId: 'CC', numeroId: '0000000001', telefono: '3000000001', email: 'superadmin@husrt.local', contraseña: await bcrypt.hash('Super123*', 10), estado: true, rolId: roles['SUPERADMIN'].id, cargoId: cargoAdmin.id, servicioId: servicios['General'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Juan Carlos', apellidos: 'Rodríguez Mora', nombreUsuario: 'jrodriguez', tipoId: 'CC', numeroId: '7001234567', telefono: '3101234567', email: 'jrodriguez@husrt.gov.co', contraseña: passAdmin, estado: true, rolId: roles['BIOMEDICAADMIN'].id, cargoId: cargoBiomed.id, servicioId: servicios['General'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Laura Patricia', apellidos: 'Gómez Suárez', nombreUsuario: 'lgomez', tipoId: 'CC', numeroId: '4009876543', telefono: '3209876543', email: 'lgomez@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['BIOMEDICATECNICO'].id, cargoId: cargoTec.id, servicioId: servicios['General'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Felipe Andrés', apellidos: 'Castro Niño', nombreUsuario: 'fcastro', tipoId: 'CC', numeroId: '1001112222', telefono: '3111112222', email: 'fcastro@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['BIOMEDICAUSER'].id, cargoId: cargoBiomed.id, servicioId: servicios['Urgencias'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Sandra Milena', apellidos: 'Vargas López', nombreUsuario: 'svargas', tipoId: 'CC', numeroId: '3003334444', telefono: '3173334444', email: 'svargas@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['ADMINISTRADOR'].id, cargoId: cargoAdmin.id, servicioId: servicios['General'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Miguel Ángel', apellidos: 'Torres Rincón', nombreUsuario: 'mtorres', tipoId: 'CC', numeroId: '5005556666', telefono: '3145556666', email: 'mtorres@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['MESAADMIN'].id, cargoId: cargoAdmin.id, servicioId: servicios['General'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Claudia Helena', apellidos: 'Rojas Pineda', nombreUsuario: 'crojas', tipoId: 'CC', numeroId: '6006667777', telefono: '3006667777', email: 'crojas@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['MESAUSER'].id, cargoId: cargoEnf.id, servicioId: servicios['UCI'].id, mesaServicioRolId: mesaRolNone.id },
      { nombres: 'Alejandro', apellidos: 'Mora Bermúdez', nombreUsuario: 'amora', tipoId: 'CC', numeroId: '7007778888', telefono: '3007778888', email: 'amora@husrt.gov.co', contraseña: pass, estado: true, rolId: roles['SOL'].id, cargoId: cargoMedico.id, servicioId: servicios['Cirugía'].id, mesaServicioRolId: mesaRolNone.id },
    ];

    for (const u of usuariosDef) {
      const existing = await Usuario.findOne({ where: { nombreUsuario: u.nombreUsuario } });
      if (!existing) {
        await Usuario.create(u);
        console.log(`  Usuario "${u.nombreUsuario}" creado`);
      } else {
        console.log(`  Usuario "${u.nombreUsuario}" ya existe`);
      }
    }

    // ── 11. Datos técnicos + Equipos + Hojas de vida ────────────────────────
    console.log('\nCreando equipos biomédicos...');

    const equiposDef = [
      {
        equipo: { nombres: 'Monitor Multiparámetro UCI-01', marca: 'Philips', modelo: 'IntelliVue MX450', serie: 'PHI-MX450-2021-001', placa: 'HUS-MON-001', registroInvima: '2021M-000001', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 1', activo: true, periodicidadM: 6, periodicidadC: 12, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Monitor de Signos Vitales'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '2A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '18-25°C', peso: '6.5 kg', capacidad: 'N/A' },
        hojaVida: { codigoInternacional: 'MSV-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-03-15'), fechaInstalacion: new Date('2021-04-01'), fechaIncorporacion: new Date('2021-04-05'), fechaVencimientoGarantia: new Date('2023-04-01'), costoCompra: 45000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Monitor con módulos de SpO2, NIBP, ECG, temperatura y CO2.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Monitor Multiparámetro UCI-02', marca: 'Philips', modelo: 'IntelliVue MX450', serie: 'PHI-MX450-2021-002', placa: 'HUS-MON-002', registroInvima: '2021M-000001', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 2', activo: true, periodicidadM: 6, periodicidadC: 12, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Monitor de Signos Vitales'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '2A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '18-25°C', peso: '6.5 kg', capacidad: 'N/A' },
        hojaVida: { codigoInternacional: 'MSV-002', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-03-15'), fechaInstalacion: new Date('2021-04-01'), fechaIncorporacion: new Date('2021-04-05'), fechaVencimientoGarantia: new Date('2023-04-01'), costoCompra: 45000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Monitor con módulos de SpO2, NIBP, ECG, temperatura.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Ventilador Mecánico UCI-01', marca: 'Drager', modelo: 'Evita Infinity V500', serie: 'DRG-V500-2020-001', placa: 'HUS-VENT-001', registroInvima: '2020M-000055', riesgo: 'III', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 3', activo: true, periodicidadM: 3, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Ventilador Mecánico'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Comodato Drager'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '4A', iMinOperacion: '1A', wConsumida: '350W', frecuencia: '60Hz', presion: '2.7-6 bar', velocidad: 'N/A', temperatura: '15-40°C', peso: '33 kg', capacidad: 'FiO2 21-100%' },
        hojaVida: { codigoInternacional: 'VENT-001', contrato: 'CON-2020-DRG-001', tipoAdquisicion: 'Comodato', fechaCompra: null, fechaInstalacion: new Date('2020-08-10'), fechaIncorporacion: new Date('2020-08-15'), fechaVencimientoGarantia: new Date('2022-08-10'), costoCompra: null, fuente: 'Electricidad', tipoUso: 'Soporte Vital', clase: 'Electromecanico', mantenimiento: 'Comodato', propiedad: 'Proveedor', equipoPortatil: false, observaciones: 'Ventilador de alta gama. Incluye módulo de monitoreo gráfico.', fabricanteIdFk: fabricantes['Drager'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Desfibrilador Urgencias-01', marca: 'Philips', modelo: 'HeartStart XL+', serie: 'PHI-XL-2022-001', placa: 'HUS-DES-001', registroInvima: '2022M-000088', riesgo: 'III', ubicacion: 'Urgencias', ubicacionEspecifica: 'Sala de Reanimación', activo: true, periodicidadM: 6, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Desfibrilador'].id, servicioIdFk: servicios['Urgencias'].id, responsableIdFk: responsables['Garantía Philips'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '3A', iMinOperacion: '0.5A', wConsumida: '200W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '0-45°C', peso: '7.4 kg', capacidad: 'Hasta 360J' },
        hojaVida: { codigoInternacional: 'DES-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2022-01-20'), fechaInstalacion: new Date('2022-02-05'), fechaIncorporacion: new Date('2022-02-10'), fechaVencimientoGarantia: new Date('2024-02-05'), costoCompra: 35000000, fuente: 'Electricidad', tipoUso: 'Terapéutico', clase: 'Electronico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'Incluye paletas externas e internas. Con función de marcapaso.', fabricanteIdFk: fabricantes['Philips Healthcare'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Bomba de Infusión UCI-01', marca: 'Mindray', modelo: 'SK-600II', serie: 'MIN-SK600-2021-001', placa: 'HUS-BOM-001', registroInvima: '2021M-000112', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 1', activo: true, periodicidadM: 12, periodicidadC: 12, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Bomba de Infusión'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '1A', iMinOperacion: '0.3A', wConsumida: '30W', frecuencia: '60Hz', presion: 'N/A', velocidad: '0.1-1200 ml/h', temperatura: '10-40°C', peso: '1.8 kg', capacidad: 'Flujo 0.1-1200 ml/h' },
        hojaVida: { codigoInternacional: 'BOMINF-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-06-10'), fechaInstalacion: new Date('2021-07-01'), fechaIncorporacion: new Date('2021-07-05'), fechaVencimientoGarantia: new Date('2023-07-01'), costoCompra: 5500000, fuente: 'Electricidad', tipoUso: 'Terapéutico', clase: 'Electromecanico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'Bomba de jeringa. Batería interna con autonomía de 8 horas.', fabricanteIdFk: fabricantes['Mindray'].id, proveedorIdFk: proveedores['Equipos Hospitalarios del Norte'].id },
      },
      {
        equipo: { nombres: 'Bomba de Infusión UCI-02', marca: 'Mindray', modelo: 'SK-600II', serie: 'MIN-SK600-2021-002', placa: 'HUS-BOM-002', registroInvima: '2021M-000112', riesgo: 'IIB', ubicacion: 'UCI', ubicacionEspecifica: 'Cama 2', activo: true, periodicidadM: 12, periodicidadC: 12, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Bomba de Infusión'].id, servicioIdFk: servicios['UCI'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '1A', iMinOperacion: '0.3A', wConsumida: '30W', frecuencia: '60Hz', presion: 'N/A', velocidad: '0.1-1200 ml/h', temperatura: '10-40°C', peso: '1.8 kg', capacidad: 'Flujo 0.1-1200 ml/h' },
        hojaVida: { codigoInternacional: 'BOMINF-002', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2021-06-10'), fechaInstalacion: new Date('2021-07-01'), fechaIncorporacion: new Date('2021-07-05'), fechaVencimientoGarantia: new Date('2023-07-01'), costoCompra: 5500000, fuente: 'Electricidad', tipoUso: 'Terapéutico', clase: 'Electromecanico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'Bomba de jeringa.', fabricanteIdFk: fabricantes['Mindray'].id, proveedorIdFk: proveedores['Equipos Hospitalarios del Norte'].id },
      },
      {
        equipo: { nombres: 'Electrocardiógrafo Consulta-01', marca: 'GE Healthcare', modelo: 'MAC 800', serie: 'GEH-MAC800-2020-001', placa: 'HUS-ECG-001', registroInvima: '2020M-000200', riesgo: 'IIA', ubicacion: 'Consulta Externa', ubicacionEspecifica: 'Consultorio 5', activo: true, periodicidadM: 12, periodicidadC: 0, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Electrocardiógrafo'].id, servicioIdFk: servicios['Consulta Externa'].id, responsableIdFk: responsables['Ingeniería Biomédica HUSRT'].id },
        tecnico: { vMaxOperacion: '120V', vMinOperacion: '100V', iMaxOperacion: '1A', iMinOperacion: '0.2A', wConsumida: '50W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '15-40°C', peso: '2.5 kg', capacidad: '12 derivaciones' },
        hojaVida: { codigoInternacional: 'ECG-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2020-05-20'), fechaInstalacion: new Date('2020-06-01'), fechaIncorporacion: new Date('2020-06-03'), fechaVencimientoGarantia: new Date('2022-06-01'), costoCompra: 18000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Propio', propiedad: 'Hospital', equipoPortatil: true, observaciones: 'ECG de 12 derivaciones con impresión automática.', fabricanteIdFk: fabricantes['GE Healthcare'].id, proveedorIdFk: proveedores['Tecno Médica Ltda'].id },
      },
      {
        equipo: { nombres: 'Incubadora Neonatal NEO-01', marca: 'Drager', modelo: 'Isolette C2000', serie: 'DRG-ISO-2022-001', placa: 'HUS-INC-001', registroInvima: '2022M-000300', riesgo: 'IIB', ubicacion: 'Neonatología', ubicacionEspecifica: 'Sala Neonatal', activo: true, periodicidadM: 3, periodicidadC: 6, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Incubadora Neonatal'].id, servicioIdFk: servicios['Neonatología'].id, responsableIdFk: responsables['Garantía Philips'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '6A', iMinOperacion: '1A', wConsumida: '600W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '20-39°C', peso: '60 kg', capacidad: 'Temp. hasta 39°C, HR hasta 95%' },
        hojaVida: { codigoInternacional: 'INC-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2022-09-01'), fechaInstalacion: new Date('2022-09-20'), fechaIncorporacion: new Date('2022-09-25'), fechaVencimientoGarantia: new Date('2024-09-20'), costoCompra: 55000000, fuente: 'Electricidad', tipoUso: 'Soporte Vital', clase: 'Electromecanico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Incubadora de doble pared con control de temperatura y humedad.', fabricanteIdFk: fabricantes['Drager'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Autoclave Esterilización-01', marca: 'Biomedical Systems', modelo: 'STURDY-SA-232', serie: 'BMS-SA232-2019-001', placa: 'HUS-AUT-001', registroInvima: '2019M-000410', riesgo: 'IIA', ubicacion: 'Esterilización', ubicacionEspecifica: 'Sala Autoclave', activo: true, periodicidadM: 3, periodicidadC: 0, estadoBaja: false, calificacion: 4, tipoEquipoIdFk: tiposEquipo['Autoclave'].id, servicioIdFk: servicios['Cirugía'].id, responsableIdFk: responsables['Contrato Medisalud SAS'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '220V', iMaxOperacion: '20A', iMinOperacion: '15A', wConsumida: '4000W', frecuencia: '60Hz', presion: '2.1 kg/cm²', velocidad: 'N/A', temperatura: '121-134°C', peso: '95 kg', capacidad: '23 litros' },
        hojaVida: { codigoInternacional: 'AUT-001', contrato: 'CON-2023-MED-002', tipoAdquisicion: 'Compra', fechaCompra: new Date('2019-11-10'), fechaInstalacion: new Date('2019-12-01'), fechaIncorporacion: new Date('2019-12-05'), fechaVencimientoGarantia: new Date('2021-12-01'), costoCompra: 28000000, fuente: 'Electricidad', tipoUso: 'Gestión y Soporte Hospitalario', clase: 'Electromecanico', mantenimiento: 'Contratado', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Autoclave de vapor saturado con ciclos pre-vacío y gravitacional.', fabricanteIdFk: fabricantes['Biomedical Systems'].id, proveedorIdFk: proveedores['Medisalud SAS'].id },
      },
      {
        equipo: { nombres: 'Equipo de Ultrasonido RAD-01', marca: 'GE Healthcare', modelo: 'LOGIQ E10', serie: 'GEH-LE10-2023-001', placa: 'HUS-ECO-001', registroInvima: '2023M-000500', riesgo: 'IIA', ubicacion: 'Radiología e Imágenes', ubicacionEspecifica: 'Sala Ecografía', activo: true, periodicidadM: 12, periodicidadC: 0, estadoBaja: false, calificacion: 5, tipoEquipoIdFk: tiposEquipo['Equipo de Ultrasonido'].id, servicioIdFk: servicios['Radiología e Imágenes'].id, responsableIdFk: responsables['Garantía GE Healthcare'].id },
        tecnico: { vMaxOperacion: '240V', vMinOperacion: '100V', iMaxOperacion: '4A', iMinOperacion: '1A', wConsumida: '350W', frecuencia: '60Hz', presion: 'N/A', velocidad: 'N/A', temperatura: '15-35°C', peso: '70 kg', capacidad: 'Frecuencias 1-22 MHz' },
        hojaVida: { codigoInternacional: 'USG-001', contrato: 'N/A', tipoAdquisicion: 'Compra', fechaCompra: new Date('2023-01-15'), fechaInstalacion: new Date('2023-02-10'), fechaIncorporacion: new Date('2023-02-15'), fechaVencimientoGarantia: new Date('2025-02-10'), costoCompra: 280000000, fuente: 'Electricidad', tipoUso: 'Diagnóstico', clase: 'Electronico', mantenimiento: 'Garantia', propiedad: 'Hospital', equipoPortatil: false, observaciones: 'Ecógrafo de alta gama con doppler color. Incluye 3 transductores.', fabricanteIdFk: fabricantes['GE Healthcare'].id, proveedorIdFk: proveedores['Tecno Médica Ltda'].id },
      },
    ];

    let equiposCreados = 0;
    for (const def of equiposDef) {
      const existente = await Equipo.findOne({ where: { serie: def.equipo.serie } });
      if (existente) {
        console.log(`  Equipo "${def.equipo.nombres}" ya existe`);
        continue;
      }

      const datosTec = await DatosTecnicos.create(def.tecnico);
      const equipo = await Equipo.create(def.equipo);

      // Resolver tipoUso con tilde para el ENUM
      const tipoUsoMap = {
        'Diagnóstico': 'Diagnóstico',
        'Terapéutico': 'Terapéutico',
        'Soporte Vital': 'Soporte Vital',
        'Quirúrgico': 'Quirúrgico',
        'Equipo de laboratorio': 'Equipo de laboratorio',
        'Rehabilitación': 'Rehabilitación',
        'Gestión y Soporte Hospitalario': 'Gestión y Soporte Hospitalario',
      };

      await HojaVida.create({
        ...def.hojaVida,
        tipoUso: tipoUsoMap[def.hojaVida.tipoUso] || def.hojaVida.tipoUso,
        equipoIdFk: equipo.id,
        datosTecnicosIdFk: datosTec.id,
      });

      console.log(`  Equipo "${equipo.nombres}" creado (id=${equipo.id})`);
      equiposCreados++;
    }

    // ── Resumen ─────────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log('  SEED COMPLETADO');
    console.log('========================================');
    console.log(`  Roles:          ${Object.keys(roles).length}`);
    console.log(`  Cargos:         5`);
    console.log(`  Sedes:          2`);
    console.log(`  Servicios:      ${Object.keys(servicios).length}`);
    console.log(`  Tipos equipo:   ${Object.keys(tiposEquipo).length}`);
    console.log(`  Fabricantes:    ${Object.keys(fabricantes).length}`);
    console.log(`  Proveedores:    ${Object.keys(proveedores).length}`);
    console.log(`  Responsables:   ${Object.keys(responsables).length}`);
    console.log(`  Equipos nuevos: ${equiposCreados}`);
    console.log('========================================');
    console.log('\nCredenciales de acceso:');
    console.log('  superadmin    / Super123*   (SUPERADMIN)');
    console.log('  jrodriguez    / Admin2025*  (BIOMEDICAADMIN)');
    console.log('  lgomez        / Husrt2025*  (BIOMEDICATECNICO)');
    console.log('  fcastro       / Husrt2025*  (BIOMEDICAUSER)');
    console.log('  svargas       / Husrt2025*  (ADMINISTRADOR)');
    console.log('  mtorres       / Husrt2025*  (MESAADMIN)');
    console.log('  crojas        / Husrt2025*  (MESAUSER)');
    console.log('  amora         / Husrt2025*  (SOL)');
    console.log('========================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('\nError en seed:', err.message);
    if (err.errors) err.errors.forEach(e => console.error(' -', e.message));
    await sequelize.close();
    process.exit(1);
  }
})();
