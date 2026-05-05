import { OlvidoContrasenaComponent } from './Components/gestionarContraseña/olvido-contrasena/olvido-contrasena.component';
import { NgModule } from '@angular/core';
import { authGuard } from './auth.guard';
import { sistemasModuloAccessGuard } from './sistemas-modulo-access.guard';
import { RouterModule, Routes } from '@angular/router';
import { ReportceComponent } from './Components/Imaging/ReportCE/reportce/reportce.component';
import { ReportspediatricsComponent } from './Components/Servinte/Reports/reportspediatrics/reportspediatrics.component';
import { UsuariosServicioComponent } from './Components/News2/usuarios-servicio/usuarios-servicio.component';
import { AerolineaComponent } from './Components/Aerolinea/aerolinea/aerolinea.component';
import { LoginComponent } from './Components/login/login.component'
import { HomesuperadminComponent } from './Components/Homepage/homesuperadmin/homesuperadmin.component'
import { HomeadminsistemasComponent } from './Components/Homepage/homeadminsistemas/homeadminsistemas.component'
import { HomeadminbiomedicaComponent } from './Components/Homepage/homeadminbiomedica/homeadminbiomedica.component';
import { HomeadminmantenimientoComponent } from './Components/Homepage/homeadminmantenimiento/homeadminmantenimiento.component';
import { RegistroComponent } from './Components/registro/registro.component';
import { GestionUsuariosComponent } from './Components/gestion-usuarios/gestion-usuarios.component';
import { HomeusermantenimientoComponent } from './Components/Homepage/homeusermantenimiento/homeusermantenimiento.component';
import { HomeusersistemasComponent } from './Components/Homepage/homeusersistemas/homeusersistemas.component';
import { HomeuserbiomedicaComponent } from './Components/Homepage/homeuserbiomedica/homeuserbiomedica.component';
import { HomeadminmesaserviciosComponent } from './Components/Homepage/homeadminmesaservicios/homeadminmesaservicios.component';
import { HomeuserMesaComponent } from './Components/Homepage/homeuser-mesa/homeuser-mesa.component';
import { ClasificacionInventarioComponent } from './Components/userBiomedica/clasificacion-inventario/clasificacion-inventario.component';
import { ManteniminetoComponent } from './Components/userBiomedica/mantenimineto/mantenimineto.component';
import { SemaforizacionComponent } from './Components/userBiomedica/semaforizacion/semaforizacion.component';
import { IndicadoresComponent } from './Components/userBiomedica/indicadores/indicadores.component';
import { CalendarioComponent } from './Components/userBiomedica/calendario/calendario.component';
import { ClasificacionTipoEquipoComponent } from './Components/userBiomedica/clasificacion-tipo-equipo/clasificacion-tipo-equipo.component';
import { ClasificacionServicioComponent } from './Components/userBiomedica/clasificacion-servicio/clasificacion-servicio.component';
import { ClasificacionComodatosComponent } from './Components/userBiomedica/clasificacion-comodatos/clasificacion-comodatos.component';
import { EquiposServicioComponent } from './Components/userBiomedica/vista-Equipos/equipos-servicio/equipos-servicio.component';
import { EquiposTipoComponent } from './Components/userBiomedica/vista-Equipos/equipos-tipo/equipos-tipo.component';
import { EquiposComodatosComponent } from './Components/userBiomedica/vista-Equipos/equipos-comodatos/equipos-comodatos.component';
import { EditarUsuarioComponent } from './Components/editar-usuario/editar-usuario.component';
import { CambiarContrasenaComponent } from './Components/gestionarContraseña/cambiar-contrasena/cambiar-contrasena.component';
import { CrearReporteComponent } from './Components/userBiomedica/Reportes/crear-reporte/crear-reporte.component';
import { HojavidaComponent } from './Components/userBiomedica/vista-Equipos/hojavida/hojavida.component';
import { MesaCategoriasComponent } from './Components/MesaServicios/Parametrization/mesa-categorias/mesa-categorias.component';
import { MesaRolesComponent } from './Components/MesaServicios/Parametrization/mesa-roles/mesa-roles.component';
import { MesaCasosListComponent } from './Components/MesaServicios/Cases/mesa-casos-list/mesa-casos-list.component';
import { MesaCasoCreateComponent } from './Components/MesaServicios/Cases/mesa-caso-create/mesa-caso-create.component';
import { MesaCasoDetailComponent } from './Components/MesaServicios/Cases/mesa-caso-detail/mesa-caso-detail.component';
import { VerReporteComponent } from './Components/userBiomedica/Reportes/ver-reporte/ver-reporte.component';
import { ActividadesMetrologicasComponent } from './Components/userBiomedica/actividades-metrologicas/actividades-metrologicas.component';
import { IntranetComponent } from './Components/intranet/intranet.component';
import { ValidadorQRComponent } from './Components/userBiomedica/Reportes/validador-qr/validador-qr.component';
import { CrearEquipoComponent } from './Components/userBiomedica/vista-Equipos/crear-equipo/crear-equipo.component';
import { CirugiaComponent } from './Components/cirugia/cirugia.component';
import { AdmtiposequipoComponent } from './Components/administracion/admtiposequipo/admtiposequipo.component';
import { AdmserviciosComponent } from './Components/administracion/admservicios/admservicios.component';
import { ListaEquiposComponent } from './Components/userBiomedica/vista-Equipos/lista-equipos/lista-equipos.component';

import { ListaEquiposTecnicoComponent } from './Components/userBiomedica/vista-Equipos/lista-equipos-tecnico/lista-equipos-tecnico.component';
import { MantenimientoTecnicoComponent } from './Components/userBiomedica/mantenimiento-tecnico/mantenimiento-tecnico.component';
import { PendientesTecnicoComponent } from './Components/userBiomedica/pendientes-tecnico/pendientes-tecnico.component';


import { AdmFabricantesComponent } from './Components/administracion/admfabricantes/admfabricantes.component';
import { AdmtiposdocumentoComponent } from './Components/administracion/admtiposdocumento/admtiposdocumento.component';
import { AdmProveedoresComponent } from './Components/administracion/admproveedores/admproveedores.component';
import { AdmCargosComponent } from './Components/administracion/admcargos/adm-cargos.component';


import { AdmResponsablesComponent } from './Components/administracion/admresponsables/admresponsables.component';
import { AmdSistemasInformacionComponent } from './Components/administracion/admsistemasinformacion/admsistemasinformacion.component';
import { CalendarioBackupsComponent } from './Components/administracion/calendario-backups/calendario-backups.component';
import { AccessDeniedComponent } from './Components/access-denied/access-denied.component';
import { ClasificacionResponsablesComponent } from './Components/userBiomedica/clasificacion-responsables/clasificacion-responsables.component';
import { EquiposResponsableComponent } from './Components/userBiomedica/vista-Equipos/equipos-responsable/equipos-responsable.component';
import { ClasificacionSedesComponent } from './Components/userBiomedica/clasificacion-sedes/clasificacion-sedes.component';
import { EquiposSedeComponent } from './Components/userBiomedica/vista-Equipos/equipos-sede/equipos-sede.component';
import { ClasificacionServiciosSedeComponent } from './Components/userBiomedica/clasificacion-servicios-sede/clasificacion-servicios-sede.component';
import { GestionOperativaComponent } from './Components/Homepage/gestion-operativa/gestion-operativa.component';
import { ParametrizacionBiomedicaComponent } from './Components/Homepage/parametrizacion-biomedica/parametrizacion-biomedica.component';

import { HomeInvitadoComponent } from './Components/userBiomedica/home-invitado/home-invitado.component';
import { ClasificacionRiesgosComponent } from './Components/userBiomedica/clasificacion-riesgos/clasificacion-riesgos.component';
import { EquiposRiesgoComponent } from './Components/userBiomedica/vista-Equipos/equipos-riesgo/equipos-riesgo.component';
import { ThemeCustomizerComponent } from './Components/administracion/personalizacion/theme-customizer.component';

import { RedireccionInicialComponent } from './Components/redireccion-inicial/redireccion-inicial.component';
import { SemaforizacionGarantiasComponent } from './Components/userBiomedica/semaforizacion/semaforizacion-garantias/semaforizacion-garantias.component';

// Módulo Sistemas
import { SisEquiposComponent } from './Components/Sistemas/equipos/equipos.component';
import { SisMantenimientosComponent } from './Components/Sistemas/mantenimientos/mantenimientos.component';
import { SysHojaVidaComponent } from './Components/Sistemas/hoja-vida/hoja-vida.component';
import { ClasificacionTipoEquipoSisComponent } from './Components/Sistemas/clasificacion-tipo-equipo/clasificacion-tipo-equipo-sis.component';
import { EquiposTipoSisComponent } from './Components/Sistemas/equipos-tipo/equipos-tipo-sis.component';
import { SysTrazabilidadGlobalComponent } from './Components/Sistemas/trazabilidad-global/trazabilidad-global.component';
import { SysProtocolosComponent } from './Components/Sistemas/protocolos/protocolos.component';
import { ParametrizacionSistemasComponent } from './Components/Homepage/parametrizacion-sistemas/parametrizacion-sistemas.component';
import { AdmTiposEquipoSisComponent } from './Components/Sistemas/adm-tiposequipo-sis/adm-tiposequipo-sis.component';
import { ClasificacionServicioSisComponent } from './Components/Sistemas/clasificacion-servicio-sis/clasificacion-servicio-sis.component';
import { EquiposServicioSisComponent } from './Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component';
import { ClasificacionSedesSisComponent } from './Components/Sistemas/clasificacion-sedes-sis/clasificacion-sedes-sis.component';
import { EquiposSedesSisComponent } from './Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component';
import { SysReporteFormComponent } from './Components/Sistemas/sys-reporte-form/sys-reporte-form.component';
import { CrearMantenimientoComponent } from './Components/Sistemas/reporteMantenimiento/reporte-mantenimiento.component';
import { ProgramarMantenimientoComponent } from './Components/Sistemas/programar-mantenimiento/programar-mantenimiento.component';
import { SisRepuestosComponent } from './Components/Sistemas/repuestos/repuestos.component';
import { HistoricoMantenimientosEquipoComponent } from './Components/Sistemas/historico-mantenimientos-equipo/historico-mantenimientos-equipo.component';
import { SysindicadoresComponent } from './Components/Sistemas/sysindicadores/sysindicadores.component';

export const routes: Routes = [

  {
    path: '',
    component: RedireccionInicialComponent,
    pathMatch: 'full'
  },
  { path: 'biomedica/home', redirectTo: 'biomedica/home-invitado', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'updateprofil', component: EditarUsuarioComponent, canActivate: [authGuard] },
  { path: 'superadmin', component: HomesuperadminComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN'] } },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'registro', component: RegistroComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'ADMINISTRADOR', 'ADM'] } },
  { path: 'adminsistemas', component: HomeadminsistemasComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminbiomedica', component: HomeadminbiomedicaComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'SUPERADMIN'] } },
  { path: 'adminmantenimiento', component: HomeadminmantenimientoComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'AG'] } },
  { path: 'adminmesaservicios', component: HomeadminmesaserviciosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'ADM', 'AG', 'ADMINISTRADOR', 'MESAADMIN', 'SYSTEMADMIN'] } },
  // Mesa de Servicios Children
  { path: 'adminmesaservicios/config/categorias', component: MesaCategoriasComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'ADM', 'ADMINISTRADOR', 'MESAADMIN'] } },
  { path: 'adminmesaservicios/config/roles', component: MesaRolesComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'ADM', 'ADMINISTRADOR', 'MESAADMIN'] } },
  { path: 'adminmesaservicios/casos', component: MesaCasosListComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'ADM', 'AG', 'ADMINISTRADOR', 'MESAUSER', 'SOL', 'OBS', 'MESAADMIN', 'SYSTEMADMIN'] } },
  { path: 'adminmesaservicios/casos/novo', component: MesaCasoCreateComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'ADM', 'AG', 'ADMINISTRADOR', 'MESAUSER', 'SOL', 'OBS', 'MESAADMIN', 'SYSTEMADMIN'] } },
  { path: 'adminmesaservicios/casos/:id', component: MesaCasoDetailComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'ADM', 'AG', 'ADMINISTRADOR', 'MESAUSER', 'SOL', 'OBS', 'MESAADMIN', 'SYSTEMADMIN'] } },
  { path: 'usermantenimiento', component: HomeusermantenimientoComponent, canActivate: [authGuard] },
  { path: 'usersistemas', component: HomeusersistemasComponent, canActivate: [authGuard] },
  { path: 'adminsistemas/gestion', component: HomeusersistemasComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'userbiomedica', component: HomeuserbiomedicaComponent, canActivate: [authGuard] },
  { path: 'mesauser/home', component: HomeuserMesaComponent, canActivate: [authGuard], data: { roles: ['MESAUSER', 'SUPERADMIN', 'ADM', 'AG', 'SOL', 'OBS', 'ADMINISTRADOR'] } },
  { path: 'imagenologia/citasCE', component: ReportceComponent },
  { path: 'servinte/reportepediatria', component: ReportspediatricsComponent },
  { path: 'servinte/news2', component: UsuariosServicioComponent },
  { path: 'servinte/cirugia', component: CirugiaComponent },
  { path: 'acreditacion/aerolinea', component: AerolineaComponent },
  { path: 'admusuarios', component: GestionUsuariosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] } },

  { path: 'olvidocontraseña', component: OlvidoContrasenaComponent },
  { path: 'recuperarcontraseña', component: CambiarContrasenaComponent },

  // UsuarioBiomedica
  { path: 'biomedica/home-invitado', component: HomeInvitadoComponent, canActivate: [authGuard], data: { roles: ['INVITADO', 'SUPERADMIN'] } },
  { path: 'biomedica/nuevoequipo', component: CrearEquipoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN'] } },
  { path: 'biomedica/inventario', component: ClasificacionInventarioComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/mantenimiento', component: ManteniminetoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN'] } },
  { path: 'biomedica/semaforizacion', component: SemaforizacionComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/semaforizacion-garantias', component: SemaforizacionGarantiasComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/indicadores', component: IndicadoresComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/calendario', component: CalendarioComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/actividadesmetrologicas', component: ActividadesMetrologicasComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/tiposequipo', component: ClasificacionTipoEquipoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/servicios', component: ClasificacionServicioComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/empComodatos', component: ClasificacionComodatosComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/equiposservicio', component: EquiposServicioComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/sedes', component: ClasificacionSedesComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/serviciossede', component: ClasificacionServiciosSedeComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/equipossede', component: EquiposSedeComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/equipostipo', component: EquiposTipoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/equiposcomodatos', component: EquiposComodatosComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/riesgos', component: ClasificacionRiesgosComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/equiposriesgo', component: EquiposRiesgoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/nuevoreporte/:id', component: CrearReporteComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/reportesequipo/:id', component: VerReporteComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'biomedica/hojavidaequipo/:id', component: HojavidaComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'INVITADO'] } },
  { path: 'personalizacion', component: ThemeCustomizerComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN'] } },
  { path: 'biomedica/validarqr', component: ValidadorQRComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN'] } },
  { path: 'biomedica/responsables', component: ClasificacionResponsablesComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'biomedica/equiposresponsable', component: EquiposResponsableComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'INVITADO', 'BIOMEDICATECNICO'] } },
  { path: 'admin/tiposequipo', component: AdmtiposequipoComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN'] } },
  { path: 'admin/servicios', component: AdmserviciosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN'] } },
  { path: 'admin/fabricantes', component: AdmFabricantesComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN'] } },
  { path: 'admin/proveedores', component: AdmProveedoresComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN'] } },
  { path: 'admin/responsables', component: AdmResponsablesComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN'] } },
  { path: 'admin/cargos', component: AdmCargosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN'] } },
  { path: 'admin/sistemasinformacion', component: AmdSistemasInformacionComponent, canActivate: [authGuard, sistemasModuloAccessGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'admin/sistemasinformacion/backups', component: CalendarioBackupsComponent, canActivate: [authGuard, sistemasModuloAccessGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },

  // Equipos List - Unified
  { path: 'biomedica/adminequipos', component: ListaEquiposComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN', 'BIOMEDICATECNICO'] } },

  // Create/Edit - Restricted
  { path: 'biomedica/adminequipos/edit/:id', component: CrearEquipoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'SUPERADMIN'] } },

  // Technician Routes (Point to unified list now)
  { path: 'biomedica/tecnico/equipos', component: ListaEquiposComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICATECNICO', 'BIOMEDICAADMIN', 'SUPERADMIN'] } },


  { path: 'biomedica/tecnico/mantenimiento', component: MantenimientoTecnicoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICATECNICO', 'BIOMEDICAADMIN', 'SUPERADMIN'] } },
  { path: 'biomedica/tecnico/pendientes', component: PendientesTecnicoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICATECNICO', 'BIOMEDICAADMIN', 'SUPERADMIN'] } },
  { path: 'admin/tiposdocumento', component: AdmtiposdocumentoComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'BIOMEDICAADMIN'] } },


  { path: 'gestion-operativa', component: GestionOperativaComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'SUPERADMIN'] } },
  { path: 'parametrizacion', component: ParametrizacionBiomedicaComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'SUPERADMIN'] } },

  // Módulo Sistemas
  { path: 'adminsistemas/parametrizacion', component: ParametrizacionSistemasComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN'] } },
  { path: 'adminsistemas/tiposequipo', component: ClasificacionTipoEquipoSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/protocolos', component: SysProtocolosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN'] } },
  { path: 'adminsistemas/equipostipo', component: EquiposTipoSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/equipos', component: SisEquiposComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/mantenimientos', component: SisMantenimientosComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/reporteMantenimiento/:id', component: CrearMantenimientoComponent, canActivate: [authGuard], data: { roles: ['BIOMEDICAADMIN', 'BIOMEDICAUSER', 'BIOMEDICATECNICO', 'SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/hojavida/:equipoId', component: SysHojaVidaComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/trazabilidad', component: SysTrazabilidadGlobalComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },
  { path: 'adminsistemas/admin/tiposequipo', component: AdmTiposEquipoSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN'] } },
  { path: 'adminsistemas/servicios', component: ClasificacionServicioSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/equiposservicio', component: EquiposServicioSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/sedes', component: ClasificacionSedesSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/equipossede', component: EquiposSedesSisComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/reporte-entrega', component: SysReporteFormComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  {
    path: 'adminsistemas/nuevoreporte/:id',
    loadComponent: () => import('./Components/Sistemas/sys-crear-reporte/sys-crear-reporte.component').then(m => m.SysCrearReporteComponent),
    canActivate: [authGuard],
    data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] }
  },
  {
    path: 'adminsistemas/reportesequipo/:id',
    loadComponent: () => import('./Components/Sistemas/sys-ver-reporte/sys-ver-reporte.component').then(m => m.SysVerReporteComponent),
    canActivate: [authGuard],
    data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] }
  },
  { path: 'adminsistemas/planMantenimiento', component: ProgramarMantenimientoComponent, canActivate: [authGuard], data: { roles: ['SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER', 'SUPERADMIN'] } },
  { path: 'adminsistemas/repuestos', component: SisRepuestosComponent, canActivate: [authGuard], data: { roles: ['SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER', 'SUPERADMIN'] } },
  { path: 'adminsistemas/historico-mantenimiento/:equipoId', component: HistoricoMantenimientosEquipoComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER'] } },
  { path: 'adminsistemas/indicadores', component: SysindicadoresComponent, canActivate: [authGuard], data: { roles: ['SUPERADMIN', 'SYSTEMADMIN', 'SYSTEMUSER', 'SISTEMASADMIN', 'SISTEMASUSER'] } },

  { path: 'intranet', component: IntranetComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
