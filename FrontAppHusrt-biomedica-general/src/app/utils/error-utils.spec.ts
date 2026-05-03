import { extractError } from './error-utils';

describe('extractError', () => {
  const ctx = 'guardar el tipo de equipo';

  it('retorna el mensaje del backend (error.message) con prioridad máxima', () => {
    const err = { status: 500, error: { message: 'Nombre duplicado en base de datos' } };
    expect(extractError(err, ctx)).toBe('Nombre duplicado en base de datos');
  });

  it('retorna el mensaje del backend (error.detalle) cuando no hay error.message', () => {
    const err = { status: 400, error: { detalle: 'El campo nombre es requerido' } };
    expect(extractError(err, ctx)).toBe('El campo nombre es requerido');
  });

  it('retorna mensaje de sin conexión para status 0', () => {
    const err = { status: 0 };
    expect(extractError(err, ctx)).toBe('Sin conexión al servidor. Verifica que el backend esté activo.');
  });

  it('retorna mensaje de permisos para status 403', () => {
    const err = { status: 403 };
    expect(extractError(err, ctx)).toBe('No tienes permisos para realizar esta acción.');
  });

  it('retorna mensaje de conflicto para status 409', () => {
    const err = { status: 409 };
    expect(extractError(err, ctx)).toBe('Ya existe un registro con ese nombre o identificador.');
  });

  it('retorna mensaje de servidor para status 500', () => {
    const err = { status: 500 };
    expect(extractError(err, ctx)).toBe('Error interno del servidor. Contacta al administrador de sistemas.');
  });

  it('incluye el contexto en el mensaje para status 400', () => {
    const err = { status: 400 };
    expect(extractError(err, ctx)).toContain(ctx);
  });

  it('incluye el contexto en el mensaje para status 404', () => {
    const err = { status: 404 };
    expect(extractError(err, ctx)).toContain(ctx);
  });

  it('retorna fallback contextual para status desconocido', () => {
    const err = { status: 418 };
    expect(extractError(err, ctx)).toBe(`No se pudo completar: ${ctx}. Por favor, intenta nuevamente.`);
  });

  it('retorna fallback contextual cuando err es null', () => {
    expect(extractError(null, ctx)).toBe(`No se pudo completar: ${ctx}. Por favor, intenta nuevamente.`);
  });

  it('retorna fallback contextual cuando err es undefined', () => {
    expect(extractError(undefined, ctx)).toBe(`No se pudo completar: ${ctx}. Por favor, intenta nuevamente.`);
  });
});
