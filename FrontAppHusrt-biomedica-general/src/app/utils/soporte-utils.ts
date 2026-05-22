export type EstadoSoporte = 'en-soporte' | 'obsoleto' | 'sin-datos';

export function getEstadoSoporte(
  fechaInicio: string | null | undefined,
  anos: number | null | undefined
): EstadoSoporte {
  if (!fechaInicio || anos == null) return 'sin-datos';
  const fin = new Date(fechaInicio);
  fin.setFullYear(fin.getFullYear() + anos);
  return fin >= new Date() ? 'en-soporte' : 'obsoleto';
}

export function calcularFechaFinSoporte(
  fechaInicio: string | null | undefined,
  anos: number | null | undefined
): string | null {
  if (!fechaInicio || anos == null) return null;
  const fin = new Date(fechaInicio);
  fin.setFullYear(fin.getFullYear() + anos);
  return fin.toISOString().split('T')[0];
}

export const LABELS_SOPORTE: Record<EstadoSoporte, string> = {
  'en-soporte': 'En soporte',
  'obsoleto': 'Obsoleto',
  'sin-datos': 'Sin datos',
};
