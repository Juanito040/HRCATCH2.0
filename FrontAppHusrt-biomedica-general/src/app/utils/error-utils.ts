export function extractError(err: any, contexto: string): string {
  const backendMsg =
    err?.error?.message ||
    err?.error?.detalle ||
    err?.error?.detail;
  if (backendMsg) return backendMsg;

  const status: number | undefined = err?.status;
  const httpMap: Record<number, string> = {
    0:   'Sin conexión al servidor. Verifica que el backend esté activo.',
    400: `Datos inválidos al ${contexto}. Revisa los campos ingresados.`,
    401: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    403: 'No tienes permisos para realizar esta acción.',
    404: `El registro no fue encontrado al intentar ${contexto}.`,
    409: 'Ya existe un registro con ese nombre o identificador.',
    422: `Los datos enviados para ${contexto} no pasaron validación.`,
    500: 'Error interno del servidor. Contacta al administrador de sistemas.',
    503: 'El servicio no está disponible en este momento. Intenta más tarde.',
  };
  if (status !== undefined && httpMap[status]) return httpMap[status];

  return `No se pudo completar: ${contexto}. Por favor, intenta nuevamente.`;
}
