const TIPO_MANTENIMIENTO = { CORRECTIVO: 1, PREVENTIVO: 2, PREDICTIVO: 3, OTRO: 4 };

const TIPO_MANTENIMIENTO_LABELS = { 1: 'Correctivo', 2: 'Preventivo', 3: 'Predictivo', 4: 'Otro' };

const TIPO_FALLA = {
  DESGASTE: 1, OPERACION_INDEBIDA: 2, CAUSA_EXTERNA: 3,
  ACCESORIOS: 4, DESCONOCIDO: 5, SIN_FALLA: 6, OTROS: 7, NO_REGISTRA: 8
};

const TIPO_FALLA_LABELS = {
  1: 'Desgaste', 2: 'Operación Indebida', 3: 'Causa Externa',
  4: 'Accesorios', 5: 'Desconocido', 6: 'Sin Falla', 7: 'Otros', 8: 'No Registra'
};

const getAllTiposMantenimiento = () =>
  Object.entries(TIPO_MANTENIMIENTO_LABELS).map(([value, label]) => ({ value: parseInt(value), label }));

const getAllTiposFalla = () =>
  Object.entries(TIPO_FALLA_LABELS).map(([value, label]) => ({ value: parseInt(value), label }));

const isValidTipoMantenimiento = (value) => Object.values(TIPO_MANTENIMIENTO).includes(value);
const isValidTipoFalla = (value) => Object.values(TIPO_FALLA).includes(value);

module.exports = {
  TIPO_MANTENIMIENTO, TIPO_MANTENIMIENTO_LABELS,
  TIPO_FALLA, TIPO_FALLA_LABELS,
  getAllTiposMantenimiento, getAllTiposFalla,
  isValidTipoMantenimiento, isValidTipoFalla
};
