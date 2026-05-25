/**
 * TEST/sistemas/sysProgramacionPreventivo.test.js
 */

// ─── Mocks con factory function ───────────────────────────────────────────────
// Al pasar el segundo argumento (() => {...}), Jest NUNCA carga el módulo real,
// así se evita que Sequelize ejecute las asociaciones (belongsTo, hasMany, etc.)

jest.mock('../../models/Sistemas/SysReporte', () => ({
  create:  jest.fn(),
  findAll: jest.fn(),
  count:   jest.fn(),
}));

jest.mock('../../models/Sistemas/SysEquipo', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../../models/Sistemas/Sysprogramacionpreventivomes', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create:  jest.fn(),
}));

jest.mock('../../models/Sistemas/SysPlanMantenimiento', () => ({
  findAll: jest.fn(),
}));

jest.mock('../../models/generales/Usuario', () => ({
  findAll: jest.fn(),
}));

// ─── Importar modelos mockeados y el service ──────────────────────────────────
const SysReporte           = require('../../models/Sistemas/SysReporte');
const SysProgramacionMes   = require('../../models/Sistemas/Sysprogramacionpreventivomes');
const SysPlanMantenimiento = require('../../models/Sistemas/SysPlanMantenimiento');
const Usuario              = require('../../models/generales/Usuario');

const service = require('../../services/sistemas/SysProgramacionPreventivosService');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const crearPlanMock = (idEquipo = 1) => ({
  equipo: {
    id_sysequipo:   idEquipo,
    id_servicio_fk: 99,
  },
});

const crearReporteMock = (id = 1) => ({
  id,
  usuarioIdFk: null,
  save: jest.fn().mockResolvedValue(true),
});

beforeEach(() => jest.clearAllMocks());

// =============================================================================
// BLOQUE 1: existeProgramacion
// =============================================================================
describe('existeProgramacion', () => {
  test('retorna true si ya existe registro para ese mes/año', async () => {
    SysProgramacionMes.findOne.mockResolvedValue({ id: 1, mes: 5, anio: 2025 });

    const resultado = await service.existeProgramacion(5, 2025);

    expect(resultado).toBe(true);
    expect(SysProgramacionMes.findOne).toHaveBeenCalledWith({
      where: { mes: 5, anio: 2025 },
    });
  });

  test('retorna false si NO existe registro para ese mes/año', async () => {
    SysProgramacionMes.findOne.mockResolvedValue(null);

    const resultado = await service.existeProgramacion(6, 2025);

    expect(resultado).toBe(false);
  });
});

// =============================================================================
// BLOQUE 2: programarPreventivos — sin planes
// =============================================================================
describe('programarPreventivos — sin planes disponibles', () => {
  test('retorna arreglo vacío y mensaje si no hay planes para ese mes/año', async () => {
    SysPlanMantenimiento.findAll.mockResolvedValue([]);

    const { reportes, mensaje } = await service.programarPreventivos(5, 2025);

    expect(reportes).toHaveLength(0);
    expect(mensaje).toMatch(/no hay equipos/i);
    expect(SysReporte.create).not.toHaveBeenCalled();
    expect(SysProgramacionMes.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// BLOQUE 3: programarPreventivos — flujo exitoso con técnicos
// =============================================================================
describe('programarPreventivos — flujo exitoso', () => {
  test('crea reportes, asigna técnicos y registra el mes', async () => {
    SysPlanMantenimiento.findAll.mockResolvedValue([
      crearPlanMock(1),
      crearPlanMock(2),
    ]);

    const reporte1 = crearReporteMock(101);
    const reporte2 = crearReporteMock(102);
    SysReporte.create
      .mockResolvedValueOnce(reporte1)
      .mockResolvedValueOnce(reporte2);

    Usuario.findAll.mockResolvedValue([{ id: 10 }, { id: 11 }]);
    SysReporte.count.mockResolvedValue(0);
    SysReporte.findAll.mockResolvedValue([reporte1, reporte2]);
    SysProgramacionMes.create.mockResolvedValue({ id: 1, mes: 5, anio: 2025 });

    const { reportes, mensaje } = await service.programarPreventivos(5, 2025);

    expect(SysReporte.create).toHaveBeenCalledTimes(2);
    expect(reportes).toHaveLength(2);
    expect(SysProgramacionMes.create).toHaveBeenCalledWith({ mes: 5, anio: 2025 });
    expect(mensaje).toContain('2');
    expect(reporte1.save).toHaveBeenCalled();
    expect(reporte2.save).toHaveBeenCalled();
  });

  test('igual termina y registra el mes si no hay técnicos disponibles', async () => {
    SysPlanMantenimiento.findAll.mockResolvedValue([crearPlanMock(1)]);
    SysReporte.create.mockResolvedValue(crearReporteMock(101));
    Usuario.findAll.mockResolvedValue([]);
    SysReporte.findAll.mockResolvedValue([]);
    SysProgramacionMes.create.mockResolvedValue({});

    const { reportes } = await service.programarPreventivos(5, 2025);

    expect(SysProgramacionMes.create).toHaveBeenCalled();
    expect(reportes).toHaveLength(1);
  });
});

// =============================================================================
// BLOQUE 4: getProgramaciones y getProgramacionMeses
// =============================================================================
describe('getProgramaciones', () => {
  test('consulta con orden DESC por año y mes', async () => {
    const mockData = [{ mes: 5, anio: 2025 }, { mes: 3, anio: 2025 }];
    SysProgramacionMes.findAll.mockResolvedValue(mockData);

    const resultado = await service.getProgramaciones();

    expect(resultado).toEqual(mockData);
    expect(SysProgramacionMes.findAll).toHaveBeenCalledWith({
      order: [['anio', 'DESC'], ['mes', 'DESC']],
    });
  });
});

describe('getProgramacionMeses', () => {
  test('retorna todos los meses sin orden específico', async () => {
    const mockData = [{ mes: 1, anio: 2025 }];
    SysProgramacionMes.findAll.mockResolvedValue(mockData);

    const resultado = await service.getProgramacionMeses();

    expect(resultado).toEqual(mockData);
    expect(SysProgramacionMes.findAll).toHaveBeenCalledWith();
  });
});