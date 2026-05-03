# Diseño: Años de Soporte del Fabricante (Módulo Sistemas)

**Fecha:** 2026-04-29  
**Módulo:** Sistemas — Hoja de Vida de Equipos  
**Objetivo:** Registrar la fecha de inicio y los años de soporte del fabricante para cada equipo, calculando automáticamente su estado de obsolescencia y mostrándolo en la hoja de vida y en la lista de equipos.

---

## 1. Cambios en Base de Datos (Backend)

### Modelo: `SysHojaVida`
**Archivo:** `NodeBackendProyectHusrt-biomedica-general/models/Sistemas/SysHojaVida.js`

Agregar dos columnas nuevas con `allowNull: true` para no romper registros existentes:

| Campo | Tipo Sequelize | Tipo BD | Descripción |
|---|---|---|---|
| `fecha_inicio_soporte` | `DataTypes.DATEONLY` | DATE | Fecha desde la que el fabricante otorga soporte |
| `anos_soporte_fabricante` | `DataTypes.INTEGER` | INT | Años de soporte prometidos por el fabricante |

La fecha de fin de soporte **no se almacena** — se calcula en el frontend como:
```
fecha_fin_soporte = fecha_inicio_soporte + anos_soporte_fabricante años
```

No se requieren cambios en rutas ni controladores del backend; los endpoints existentes de `SysHojaVida` ya aceptan y retornan cualquier campo del modelo.

---

## 2. Interfaz TypeScript (Frontend)

### Archivo: `syshojavida.service.ts`
Agregar los dos campos opcionales a la interfaz `SysHojaVida`:
```typescript
fecha_inicio_soporte?: string;
anos_soporte_fabricante?: number;
```

---

## 3. Función Utilitaria Compartida

### Archivo nuevo: `FrontAppHusrt-biomedica-general/src/app/utils/soporte-utils.ts`

Exporta una función que calcula el estado de soporte a partir de los dos campos:

```typescript
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
```

Esta función es importada por la hoja de vida y por los tres componentes de lista.

---

## 4. Hoja de Vida del Equipo

### Archivos:
- `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.ts`
- `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.html`

### TypeScript
- Agregar `fecha_inicio_soporte` y `anos_soporte_fabricante` al método `emptyForm()`.
- Agregar getter `estadoSoporte` que retorna el resultado de `getEstadoSoporte(...)`.
- Agregar getter `fechaFinSoporte` que retorna la fecha calculada formateada (o `null`).

### HTML — Formulario (modo edición)
Nueva sección **"Soporte del Fabricante"** antes de "Observaciones":
```
[ Fecha de Inicio de Soporte (date) ] [ Años de Soporte (number, min=0) ]
```
Sin flag `campo_*` — visible siempre para todos los tipos de equipo.

### HTML — Vista de lectura (modo acordeón)
Nueva sección acordeón **"Soporte del Fabricante"** con:
- Fecha de inicio de soporte
- Años de soporte  
- Fecha de fin calculada
- Badge de estado:
  - `En soporte` (verde) — fecha fin ≥ hoy
  - `Obsoleto` (rojo) — fecha fin < hoy
  - `Sin datos` (gris) — campos vacíos

---

## 5. Listas de Equipos

### Componentes afectados:
- `equipos-sede-sis` — equipos por sede
- `equipos-servicio-sis` — equipos por servicio
- `equipos-tipo` — equipos por tipo

### Cambio en cada componente
La API de lista ya incluye `hojaVida` en su respuesta (`required: false`). No se requieren cambios en el backend.

**En el HTML de cada componente:** Agregar columna `<th>Soporte</th>` y en cada fila:
```html
<td>
  <!-- badge calculado con getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) -->
</td>
```

**En el TypeScript de cada componente:** Importar `getEstadoSoporte` desde `soporte-utils.ts` y asignarla como propiedad pública de la clase (`getEstadoSoporte = getEstadoSoporte`) para que la plantilla Angular pueda accederla directamente.

---

## 6. Estados del Badge

| Estado | Texto | Color |
|---|---|---|
| `en-soporte` | En soporte | Verde (`#16a34a`) |
| `obsoleto` | Obsoleto | Rojo (`#dc2626`) |
| `sin-datos` | Sin datos | Gris (`#6b7280`) |

Los estilos CSS se agregan en los archivos `.css` correspondientes de cada componente.

---

## 7. Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `models/Sistemas/SysHojaVida.js` | +2 campos al modelo Sequelize |
| `syshojavida.service.ts` | +2 campos a la interfaz TypeScript |
| `utils/soporte-utils.ts` | **Archivo nuevo** — función `getEstadoSoporte` |
| `hoja-vida.component.ts` | `emptyForm()` + 2 getters |
| `hoja-vida.component.html` | Sección "Soporte del Fabricante" en form y en vista |
| `equipos-sede-sis.component.html` | Columna "Soporte" + badge |
| `equipos-sede-sis.component.ts` | Importar y exponer `getEstadoSoporte` |
| `equipos-servicio-sis.component.html` | Columna "Soporte" + badge |
| `equipos-servicio-sis.component.ts` | Importar y exponer `getEstadoSoporte` |
| `equipos-tipo-sis.component.html` | Columna "Soporte" + badge |
| `equipos-tipo-sis.component.ts` | Importar y exponer `getEstadoSoporte` |

**Total: 11 archivos** (1 nuevo, 10 modificados).

---

## 8. Fuera de Alcance

- No se almacena la fecha de fin de soporte en la BD (se calcula en frontend).
- No se implementan filtros por estado de obsolescencia en el backend.
- No se implementan notificaciones o alertas automáticas por email.
- No se modifica el PDF de hoja de vida (se puede hacer en iteración futura).
