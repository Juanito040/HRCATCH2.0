/**
 * Utilidades para sanear valores de fecha antes de guardarlos en columnas DATEONLY.
 * Evita el error "Incorrect date value: 'Invalid date'" que ocurre cuando Sequelize
 * recibe un string vacío ('') o inválido para una columna de tipo fecha.
 */

/**
 * Devuelve una fecha válida 'YYYY-MM-DD' o null.
 * Convierte '', 'Invalid date' o cualquier valor no parseable a null.
 */
function toDateOnlyOrNull(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === '' || s.toLowerCase() === 'invalid date') return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : s;
}

/**
 * Normaliza el año de ingreso para una columna DATEONLY.
 * - Un año de 4 dígitos ('2026' o 2026) → '2026-01-01'
 * - Una fecha completa válida ('2024-02-10') → se conserva
 * - Vacío / inválido → null
 */
function yearToDateOnly(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === '' || s.toLowerCase() === 'invalid date') return null;
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : s;
}

module.exports = { toDateOnlyOrNull, yearToDateOnly };
