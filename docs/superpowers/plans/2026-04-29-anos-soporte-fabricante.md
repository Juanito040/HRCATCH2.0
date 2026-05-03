# Años de Soporte del Fabricante — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar los campos `fecha_inicio_soporte` y `anos_soporte_fabricante` a la hoja de vida de equipos de sistemas, calcular automáticamente el estado de obsolescencia en el frontend y mostrarlo en la hoja de vida y en las listas de equipos.

**Architecture:** Se agregan 2 columnas nuevas al modelo Sequelize `SysHojaVida` (backend). La fecha de fin de soporte se calcula en el frontend con una función utilitaria compartida. La hoja de vida muestra formulario y vista de lectura con badge de estado. Las tres listas de equipos (por sede, por servicio, por tipo) agregan una columna "Soporte" con el badge.

**Tech Stack:** Node.js/Express + Sequelize (backend), Angular 17+ standalone components + ngModel (frontend)

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `NodeBackendProyectHusrt-biomedica-general/models/Sistemas/SysHojaVida.js` | Modificar | +2 columnas al modelo Sequelize |
| `FrontAppHusrt-biomedica-general/src/app/Services/appServices/sistemasServices/syshojavida/syshojavida.service.ts` | Modificar | +2 campos a la interfaz TypeScript |
| `FrontAppHusrt-biomedica-general/src/app/utils/soporte-utils.ts` | Crear | Función `getEstadoSoporte` y tipos compartidos |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.ts` | Modificar | `emptyForm()` + getters `estadoSoporte` y `fechaFinSoporte` |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.html` | Modificar | Sección "Soporte del Fabricante" en form y en vista |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.css` | Modificar | Estilos badge-red y badge-gray |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.ts` | Modificar | Importar y exponer `getEstadoSoporte` |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.html` | Modificar | Columna "Soporte" + badge |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.css` | Modificar | Estilos badge-red y badge-gray |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.ts` | Modificar | Importar y exponer `getEstadoSoporte` |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.html` | Modificar | Columna "Soporte" + badge |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.css` | Modificar | Estilos badge-red y badge-gray |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.ts` | Modificar | Importar y exponer `getEstadoSoporte` |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.html` | Modificar | Columna "Soporte" + badge |
| `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.css` | Modificar | Estilos badge-red y badge-gray |

---

## Task 1: Backend — agregar campos al modelo SysHojaVida

**Files:**
- Modify: `NodeBackendProyectHusrt-biomedica-general/models/Sistemas/SysHojaVida.js`

- [ ] **Step 1: Agregar los 2 campos al modelo Sequelize**

Abrir `NodeBackendProyectHusrt-biomedica-general/models/Sistemas/SysHojaVida.js`.

Después de la línea `comodato: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },` agregar:

```js
fecha_inicio_soporte: { type: DataTypes.DATEONLY, allowNull: true },
anos_soporte_fabricante: { type: DataTypes.INTEGER, allowNull: true },
```

El archivo debe quedar así en esa sección:

```js
  comodato: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  fecha_inicio_soporte: { type: DataTypes.DATEONLY, allowNull: true },
  anos_soporte_fabricante: { type: DataTypes.INTEGER, allowNull: true },
  id_sysequipo_fk: {
```

- [ ] **Step 2: Verificar que el servidor de Node levanta sin errores**

Sequelize con `sync({ alter: true })` o con `force: false` detectará las columnas nuevas. Levantar el servidor y confirmar que no hay errores de arranque en la consola.

Si el proyecto usa `sequelize.sync({ alter: true })` en `app.js` o `server.js`, las columnas se crean automáticamente. Si no, ejecutar en la BD:

```sql
ALTER TABLE SysHojaVida
  ADD COLUMN fecha_inicio_soporte DATE NULL,
  ADD COLUMN anos_soporte_fabricante INT NULL;
```

- [ ] **Step 3: Probar que la API acepta y devuelve los nuevos campos**

Con Postman o Thunder Client, hacer un `PUT /syshojavida/equipo/:id` enviando:

```json
{
  "fecha_inicio_soporte": "2022-01-01",
  "anos_soporte_fabricante": 5
}
```

Esperar respuesta 200 con los campos presentes en el objeto retornado.

---

## Task 2: Frontend — actualizar interfaz TypeScript SysHojaVida

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Services/appServices/sistemasServices/syshojavida/syshojavida.service.ts`

- [ ] **Step 1: Agregar los 2 campos a la interfaz `SysHojaVida`**

Abrir el archivo. Después de `comodato?: boolean;` agregar:

```typescript
  fecha_inicio_soporte?: string;
  anos_soporte_fabricante?: number;
```

La interfaz completa queda:

```typescript
export interface SysHojaVida {
  id_syshoja_vida?: number;
  ip?: string;
  mac?: string;
  procesador?: string;
  ram?: string;
  disco_duro?: string;
  sistema_operativo?: string;
  office?: string;
  tonner?: string;
  nombre_usuario?: string;
  vendedor?: string;
  tipo_uso?: string;
  fecha_compra?: string;
  fecha_instalacion?: string;
  costo_compra?: string;
  contrato?: string;
  observaciones?: string;
  foto?: string;
  compraddirecta?: boolean;
  convenio?: boolean;
  donado?: boolean;
  comodato?: boolean;
  fecha_inicio_soporte?: string;
  anos_soporte_fabricante?: number;
  id_sysequipo_fk?: number;
  equipo?: any;
}
```

---

## Task 3: Crear función utilitaria soporte-utils.ts

**Files:**
- Create: `FrontAppHusrt-biomedica-general/src/app/utils/soporte-utils.ts`

- [ ] **Step 1: Crear el archivo con la función `getEstadoSoporte`**

```typescript
export type EstadoSoporte = 'en-soporte' | 'obsoleto' | 'sin-datos';

export function getEstadoSoporte(
  fechaInicio: string | null | undefined,
  anos: number | null | undefined
): EstadoSoporte {
  if (!fechaInicio || anos == null || anos === undefined) return 'sin-datos';
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
```

---

## Task 4: Actualizar hoja-vida.component.ts

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.ts`

- [ ] **Step 1: Importar las utilidades en la parte superior del archivo**

Después de la línea `import { extractError } from '../../../utils/error-utils';` agregar:

```typescript
import { getEstadoSoporte, calcularFechaFinSoporte, EstadoSoporte, LABELS_SOPORTE } from '../../../utils/soporte-utils';
```

- [ ] **Step 2: Actualizar el método `emptyForm()`**

Reemplazar el método `emptyForm()` existente por:

```typescript
  private emptyForm(): SysHojaVida {
    return {
      ip: '', mac: '', procesador: '', ram: '', disco_duro: '',
      sistema_operativo: '', office: '', tonner: '', nombre_usuario: '',
      vendedor: '', tipo_uso: '', fecha_compra: '', fecha_instalacion: '',
      costo_compra: '', contrato: '', observaciones: '',
      compraddirecta: false, convenio: false, donado: false, comodato: false,
      fecha_inicio_soporte: '', anos_soporte_fabricante: undefined
    };
  }
```

- [ ] **Step 3: Agregar los getters `estadoSoporte` y `fechaFinSoporte`**

Después del getter `get campos()` existente (después del cierre `};`), agregar:

```typescript
  get estadoSoporte(): EstadoSoporte {
    const hv = this.isEditing ? this.formData : this.hojaVida;
    return getEstadoSoporte(hv?.fecha_inicio_soporte, hv?.anos_soporte_fabricante);
  }

  get fechaFinSoporte(): string | null {
    const hv = this.isEditing ? this.formData : this.hojaVida;
    return calcularFechaFinSoporte(hv?.fecha_inicio_soporte, hv?.anos_soporte_fabricante);
  }

  get labelSoporte(): string {
    return LABELS_SOPORTE[this.estadoSoporte];
  }
```

---

## Task 5: Actualizar hoja-vida.component.html

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.html`

- [ ] **Step 1: Agregar sección "Soporte del Fabricante" en el formulario (modo edición)**

Buscar el bloque de "Observaciones" en el formulario (modo edición):

```html
      <!-- Observaciones -->
      @if (campos.observaciones) {
```

Insertar el siguiente bloque **antes** de ese bloque:

```html
      <!-- Soporte del Fabricante -->
      <div class="form-section">
        <div class="form-section-title">Soporte del Fabricante</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Fecha de Inicio de Soporte</label>
            <input type="date" class="form-control" [(ngModel)]="formData.fecha_inicio_soporte" />
          </div>
          <div class="form-group">
            <label>Años de Soporte del Fabricante</label>
            <input type="number" class="form-control" [(ngModel)]="formData.anos_soporte_fabricante"
              min="0" placeholder="Ej. 5" />
          </div>
        </div>
        @if (fechaFinSoporte) {
          <div class="soporte-preview">
            <span>Fin de soporte calculado: <strong>{{ fechaFinSoporte }}</strong></span>
            <span class="badge"
              [class.badge-green]="estadoSoporte === 'en-soporte'"
              [class.badge-red]="estadoSoporte === 'obsoleto'"
              [class.badge-gray]="estadoSoporte === 'sin-datos'">
              {{ labelSoporte }}
            </span>
          </div>
        }
      </div>

```

- [ ] **Step 2: Agregar sección "Soporte del Fabricante" en la vista de lectura (modo acordeón)**

Buscar el bloque de observaciones en la vista de lectura:

```html
    @if (campos.observaciones && hojaVida.observaciones) {
```

Insertar el siguiente bloque **antes** de ese bloque:

```html
    <details class="accordion-section" open>
      <summary class="accordion-title">Soporte del Fabricante</summary>
      <div class="accordion-body">
        <div class="field-grid">
          <div class="field-row">
            <strong>Inicio de Soporte:</strong>
            <span>{{ hojaVida.fecha_inicio_soporte || '—' }}</span>
          </div>
          <div class="field-row">
            <strong>Años de Soporte:</strong>
            <span>{{ hojaVida.anos_soporte_fabricante != null ? hojaVida.anos_soporte_fabricante + ' años' : '—' }}</span>
          </div>
          <div class="field-row">
            <strong>Fin de Soporte:</strong>
            <span>{{ fechaFinSoporte || '—' }}</span>
          </div>
        </div>
        <div class="badges-row mt-sm">
          <strong class="badges-label">Estado:</strong>
          <span class="badge"
            [class.badge-green]="estadoSoporte === 'en-soporte'"
            [class.badge-red]="estadoSoporte === 'obsoleto'"
            [class.badge-gray]="estadoSoporte === 'sin-datos'">
            {{ labelSoporte }}
          </span>
        </div>
      </div>
    </details>

```

---

## Task 6: Agregar estilos badge-red y badge-gray en hoja-vida

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/hoja-vida/hoja-vida.component.css`

- [ ] **Step 1: Agregar las clases de badge y el preview de soporte**

Buscar la línea `.badge-orange { ... }` y después de ella agregar:

```css
.badge-red  { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-gray { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }

.soporte-preview {
  display: flex; align-items: center; gap: 0.75rem;
  margin-top: 0.75rem; padding: 0.625rem 0.875rem;
  background: #f9fafb; border-radius: 0.5rem;
  font-size: 0.9rem; color: #374151;
}
```

---

## Task 7: Columna "Soporte" en equipos-sede-sis

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.ts`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.html`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-sede-sis/equipos-sede-sis.component.css`

- [ ] **Step 1: Importar y exponer `getEstadoSoporte` y `LABELS_SOPORTE` en el componente TS**

Abrir `equipos-sede-sis.component.ts`.

Después de `import { extractError } from '../../../utils/error-utils';` agregar:

```typescript
import { getEstadoSoporte, LABELS_SOPORTE, EstadoSoporte } from '../../../utils/soporte-utils';
```

Dentro de la clase `EquiposSedesSisComponent`, agregar las dos propiedades públicas:

```typescript
  getEstadoSoporte = getEstadoSoporte;
  labelsSoporte = LABELS_SOPORTE;
```

- [ ] **Step 2: Agregar columna "Soporte" al `<thead>` de la tabla**

Abrir `equipos-sede-sis.component.html`.

Buscar:
```html
            <th class="col-opciones">Opciones</th>
```

Insertar antes:
```html
            <th>Soporte</th>
```

- [ ] **Step 3: Agregar celda de badge en cada fila**

Buscar la celda de opciones en el `@for`:
```html
              <td class="col-opciones">
```

Insertar antes:
```html
              <td>
                <span class="badge"
                  [class.badge-green]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'en-soporte'"
                  [class.badge-red]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'obsoleto'"
                  [class.badge-gray]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'sin-datos'">
                  {{ labelsSoporte[getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante)] }}
                </span>
              </td>
```

- [ ] **Step 4: Agregar estilos badge al CSS**

Abrir `equipos-sede-sis.component.css` y al final agregar:

```css
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
.badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-red   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-gray  { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
```

- [ ] **Step 5: Actualizar `colspan` del estado vacío**

En el HTML, buscar el `<td colspan="9"` del estado vacío y cambiar a `colspan="10"` para que abarque la nueva columna:

```html
              <td colspan="10" class="empty-state">
```

---

## Task 8: Columna "Soporte" en equipos-servicio-sis

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.ts`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.html`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-servicio-sis/equipos-servicio-sis.component.css`

- [ ] **Step 1: Importar y exponer utilidades en el componente TS**

Abrir `equipos-servicio-sis.component.ts`.

Después de `import { extractError } from '../../../utils/error-utils';` agregar:

```typescript
import { getEstadoSoporte, LABELS_SOPORTE, EstadoSoporte } from '../../../utils/soporte-utils';
```

Dentro de la clase `EquiposServicioSisComponent`, agregar:

```typescript
  getEstadoSoporte = getEstadoSoporte;
  labelsSoporte = LABELS_SOPORTE;
```

- [ ] **Step 2: Agregar `<th>Soporte</th>` antes de la columna Opciones**

Abrir `equipos-servicio-sis.component.html`.

Buscar:
```html
            <th class="col-opciones">Opciones</th>
```

Insertar antes:
```html
            <th>Soporte</th>
```

- [ ] **Step 3: Agregar celda badge en cada fila**

Buscar:
```html
              <td class="col-opciones">
```

Insertar antes:
```html
              <td>
                <span class="badge"
                  [class.badge-green]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'en-soporte'"
                  [class.badge-red]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'obsoleto'"
                  [class.badge-gray]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'sin-datos'">
                  {{ labelsSoporte[getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante)] }}
                </span>
              </td>
```

- [ ] **Step 4: Agregar estilos badge al CSS**

Abrir `equipos-servicio-sis.component.css` y al final agregar:

```css
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
.badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-red   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-gray  { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
```

- [ ] **Step 5: Actualizar `colspan` del estado vacío**

Buscar el `colspan` del estado vacío en `equipos-servicio-sis.component.html` y aumentar en 1.

---

## Task 9: Columna "Soporte" en equipos-tipo-sis

**Files:**
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.ts`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.html`
- Modify: `FrontAppHusrt-biomedica-general/src/app/Components/Sistemas/equipos-tipo/equipos-tipo-sis.component.css`

- [ ] **Step 1: Importar y exponer utilidades en el componente TS**

Abrir `equipos-tipo-sis.component.ts`.

Después de `import { extractError } from '../../../utils/error-utils';` agregar:

```typescript
import { getEstadoSoporte, LABELS_SOPORTE, EstadoSoporte } from '../../../utils/soporte-utils';
```

Dentro de la clase `EquiposTipoSisComponent`, agregar:

```typescript
  getEstadoSoporte = getEstadoSoporte;
  labelsSoporte = LABELS_SOPORTE;
```

- [ ] **Step 2: Agregar `<th>Soporte</th>` antes de la columna Opciones**

Abrir `equipos-tipo-sis.component.html`.

Buscar:
```html
            <th class="col-opciones">Opciones</th>
```

Insertar antes:
```html
            <th>Soporte</th>
```

- [ ] **Step 3: Agregar celda badge en cada fila**

Buscar:
```html
              <td class="col-opciones">
```

Insertar antes:
```html
              <td>
                <span class="badge"
                  [class.badge-green]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'en-soporte'"
                  [class.badge-red]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'obsoleto'"
                  [class.badge-gray]="getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante) === 'sin-datos'">
                  {{ labelsSoporte[getEstadoSoporte(equipo.hojaVida?.fecha_inicio_soporte, equipo.hojaVida?.anos_soporte_fabricante)] }}
                </span>
              </td>
```

- [ ] **Step 4: Agregar estilos badge al CSS**

Abrir `equipos-tipo-sis.component.css` y al final agregar:

```css
.badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
.badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-red   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-gray  { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
```

- [ ] **Step 5: Actualizar `colspan` del estado vacío**

Buscar el `colspan` del estado vacío en `equipos-tipo-sis.component.html` y aumentar en 1.

---

## Verificación final

- [ ] Levantar el servidor backend y verificar que no hay errores de arranque.
- [ ] Levantar el frontend Angular (`ng serve`) y verificar que compila sin errores.
- [ ] Abrir la hoja de vida de un equipo y verificar:
  - Sección "Soporte del Fabricante" aparece en el formulario de edición.
  - Al ingresar fecha y años, el badge preview aparece correctamente.
  - Al guardar, los valores persisten y se muestran en la vista de lectura.
  - El badge muestra "En soporte", "Obsoleto" o "Sin datos" correctamente.
- [ ] Abrir la lista de equipos (por sede, por servicio, por tipo) y verificar:
  - Columna "Soporte" aparece en la tabla.
  - Los badges reflejan el estado correcto para cada equipo.
  - Los equipos sin hoja de vida o sin los campos completos muestran "Sin datos".
