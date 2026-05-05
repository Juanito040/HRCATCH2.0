require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const usuarioRoutes = require('./../routes/general/usuarioRoutes');
const rolRoutes = require('./../routes/general/rolRoutes');
const servicios = require('./../routes/general/servicioRoutes');
const tipoDocumento = require('./../routes/general/tipoDocumentoRoutes');
const documentoRoutes = require('./../routes/general/documentoRoutes');
const equipo = require('./../routes/biomedica/equipoRoutes');
const hojaVida = require('./../routes/biomedica/hojaVidaRoutes');
const sede = require('./../routes/general/sedeRoutes');
const responsable = require('./../routes/biomedica/responsableRoutes');
const planMantenimiento = require('./../routes/biomedica/planMantenimientoRoutes');
const Proveedor = require('./../routes/biomedica/proveedorRoutes');
const Fabricante = require('./../routes/biomedica/fabricanteRoutes');
const DatosTecnicos = require('./../routes/biomedica/datosTecnicosRoutes');
const PlanActividadMetrologica = require('./../routes/biomedica/planMetrologiaRoutes');
const ActividadMetrologica = require('./../routes/biomedica/actividadMetrologicaRoutes');
const Reporte = require('./../routes/biomedica/reporteRoutes');
const ProtocoloPreventivo = require('./../routes/biomedica/protocoloPreventivoRoutes');
const ProgramacionMantenimiento = require('./../routes/biomedica/programacionMantenimientoRoutes');
const ProgramacionAmetrologicas = require('./../routes/biomedica/programacionAMetrologicasRoutes');
const CumplimientoProtocoloPreventivoRoutes = require('./../routes/biomedica/cumplimiento.ProtocoloPreventivoRoutes');
const IndicadoresRoutes = require('./../routes/biomedica/indicadoresRoutes');
const TrazabilidadRoutes = require('./../routes/biomedica/trazabilidadRoutes');
const TrasladoRoutes = require('./../routes/biomedica/trasladoRoutes');
const firmaRoutes = require('./../routes/biomedica/firmaRoutes');
const SistemaInformacion = require('./../routes/biomedica/sistemaInformacionRoutes');
const BackupRoutes = require('./../routes/biomedica/backupRoutes');
const { checkToken } = require('./../utilities/middleware');
const sequelize = require('./../config/configDb');
const imagenesRoutes = require('./../routes/general/imagenesRoutes');
const archivosRoutes = require('./../routes/general/archivosRoutes');
const tipoEquipo = require('../routes/general/tipoEquipoRouter');

// Importar modelos nuevos para asegurar su creación en DB
require('../models/Biomedica/MedicionPreventivo');
require('../models/Biomedica/ValorMedicionPreventivo');
require('../models/Biomedica/RepuestoReporte');
require('../models/Biomedica/Firma');
require('../models/MesaServicios'); // Import associations
require('../models/Biomedica'); // Import Biomedica associations


app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());

// Mesa de Servicios (Mounted first to avoid interaction with legacy route structure)
const mesaRoutes = require('./../routes/mesaservicios/mesaRoutes');
app.use('/api/mesa', mesaRoutes);

app.use(rolRoutes);
app.use(usuarioRoutes);
app.use(imagenesRoutes);
app.use(archivosRoutes);
app.use(servicios, checkToken);
app.use(tipoDocumento, checkToken);
app.use(documentoRoutes, checkToken);
app.use(hojaVida, checkToken);
app.use(equipo, checkToken);
app.use(sede, checkToken);
app.use(servicios, checkToken);
app.use(tipoEquipo, checkToken);
app.use(responsable, checkToken);
app.use(planMantenimiento, checkToken);
app.use(Proveedor, checkToken);
app.use(Fabricante, checkToken);
app.use(DatosTecnicos, checkToken);
app.use(Reporte, checkToken);
app.use(ProtocoloPreventivo, checkToken);
app.use(CumplimientoProtocoloPreventivoRoutes, checkToken);
app.use(ProgramacionMantenimiento, checkToken);
app.use(ProgramacionAmetrologicas, checkToken);
app.use(PlanActividadMetrologica, checkToken);
app.use(ActividadMetrologica, checkToken);
app.use(IndicadoresRoutes, checkToken);
app.use(TrazabilidadRoutes, checkToken);
app.use(TrasladoRoutes, checkToken);
app.use(firmaRoutes, checkToken);
app.use(SistemaInformacion, checkToken);
app.use(BackupRoutes, checkToken);

const CondicionInicialRoutes = require('./../routes/biomedica/condicionInicialRoutes');
app.use(CondicionInicialRoutes, checkToken);


// ===== MÓDULO SISTEMAS =====
require('../models/Sistemas/SysEquipo');
require('../models/Sistemas/SysHojaVida');
require('../models/Sistemas/SysBaja');
require('../models/Sistemas/SysBodega');
require('../models/Sistemas/SysTipoRepuesto');
require('../models/Sistemas/SysRepuesto');
require('../models/Sistemas/SysTrazabilidad');
require('../models/Sistemas/SysProtocoloPreventivo');
require('../models/Sistemas/SysPlanMantenimiento');
require('../models/Sistemas/SysReporte');
require('../models/Sistemas/SysReporteEntrega');
require('../models/Sistemas/SysTipoUso');
require('../models/Sistemas/Sysprogramacionpreventivomes');
require('../models/Sistemas/SysCumplimientoProtocoloPreventivo');
require('../models/Sistemas/SysAuditoriaRepuesto');
require('../models/Sistemas/SysMovimientosStockRepuestos');
const sysEquipoRoutes = require('./../routes/sistemas/sysEquipoRoutes');
const sysHojaVidaRoutes = require('./../routes/sistemas/sysHojaVidaRoutes');
const sysTrazabilidadRoutes = require('./../routes/sistemas/sysTrazabilidadRoutes');
const sysProtocoloPreventivoRoutes = require('./../routes/sistemas/sysProtocoloPreventivoRoutes');
const sysPlanMantenimientoRoutes = require('./../routes/sistemas/sysPlanMantenimientoRoutes');
const sysReporteRoutes = require('./../routes/sistemas/sysReporteRoutes');
const sysReporteEntregaRoutes = require('./../routes/sistemas/sysReporteEntregaRoutes');
const sysTipoUsoRoutes = require('./../routes/sistemas/sysTipoUsoRoutes');
const sysProgramacionRoutes = require('./../routes/sistemas/sysProgramacionPreventivoRoutes');
const sysCumplimientoProtocoloPreventivoRoutes = require('./../routes/sistemas/sysCumplimientoProtocoloPreventivo');
const sysTipoRepuestoRoutes = require('./../routes/sistemas/sysTipoRepuestoRoutes');
const sysRepuestoRoutes = require('./../routes/sistemas/sysRepuestoRoutes');
const sysAuditoriaRepuestoRoutes = require('./../routes/sistemas/sysAuditoriaRepuestoRoutes');
const sysMovimientosStockRoutes = require('./../routes/sistemas/sysMovimientosStockRoutes');
const sysMantenimientoRoutes = require('./../routes/sistemas/sysMantenimientoRoutes');
app.use('/syscumplimiento', checkToken, sysCumplimientoProtocoloPreventivoRoutes);
app.use('/sysprogramacion', checkToken, sysProgramacionRoutes);
app.use('/sysequipo', checkToken, sysEquipoRoutes);
app.use('/syshojavida', checkToken, sysHojaVidaRoutes);
app.use('/systiporepuesto', checkToken, sysTipoRepuestoRoutes);
app.use('/sysrepuesto', checkToken, sysRepuestoRoutes);
app.use('/sysauditoria-repuesto', checkToken, sysAuditoriaRepuestoRoutes);
app.use('/sysmovimientosstock', checkToken, sysMovimientosStockRoutes);
app.use('/systrazabilidad', checkToken, sysTrazabilidadRoutes);
app.use('/sysprotocolo', checkToken, sysProtocoloPreventivoRoutes);
app.use('/sysplanmantenimiento', checkToken, sysPlanMantenimientoRoutes);
app.use('/sysreporte', checkToken, sysReporteRoutes);
app.use('/sysreporteentrega', checkToken, sysReporteEntregaRoutes);
app.use('/systipouso', checkToken, sysTipoUsoRoutes);
app.use('/sysmantenimiento', checkToken, sysMantenimientoRoutes);


const cargoRoutes = require('./../routes/generales/cargoRoutes');
app.use('/cargos', checkToken, cargoRoutes);

// Mesa de Servicios is now at the top
// Moved up


const { fixMovimientosStockFK } = require('../migrations/runMigrations');

sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  .then(() => sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`SysReporteEntrega\` (
      id_sysreporte INTEGER AUTO_INCREMENT PRIMARY KEY,
      fecha DATE NULL,
      hora_llamado VARCHAR(10) NULL,
      hora_inicio VARCHAR(10) NULL,
      hora_terminacion VARCHAR(10) NULL,
      servicio_anterior VARCHAR(255) NULL,
      ubicacion_anterior VARCHAR(255) NULL,
      servicio_nuevo VARCHAR(255) NULL,
      ubicacion_nueva VARCHAR(255) NULL,
      ubicacion_especifica VARCHAR(255) NULL,
      realizado_por VARCHAR(255) NULL,
      recibido_por VARCHAR(255) NULL,
      observaciones TEXT NULL,
      id_sysequipo_fk INTEGER NULL,
      id_sysusuario_fk INTEGER NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `))
  .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1'))
  .then(() => fixMovimientosStockFK())
  .then(() => sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`SysBodega\` (
      id_sysbodega INTEGER AUTO_INCREMENT PRIMARY KEY,
      fecha_ingreso DATE NULL,
      motivo TEXT NULL,
      id_sysequipo_fk INTEGER NULL,
      id_sysusuario_fk INTEGER NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_sysbodega_equipo FOREIGN KEY (id_sysequipo_fk) REFERENCES SysEquipo(id_sysequipo) ON DELETE SET NULL,
      CONSTRAINT fk_sysbodega_usuario FOREIGN KEY (id_sysusuario_fk) REFERENCES Usuario(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `))
  .then(() => {})
  .then(() => sequelize.sync({ alter: false }))
  .then(() => {
    app.listen(3005, '0.0.0.0', () => {
      console.log('Server is running on http://localhost:3005');
    });
  })
  .catch(err => {
    console.log('[DB ERROR]', err.message || err);
  });
