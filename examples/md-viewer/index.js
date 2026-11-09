import { importCss } from '../../components/utils/import-css.js';
import MDViewer from '../../components/md-viewer/md-viewer.js';
import { loadLanguage } from '../../components/locale/locale.js';
import { getPath } from '../../components/utils/path.js';
import { setBasePath } from '../../components/router/router.js';
import { mathMDViewerPlugin } from '../../components/math-viewer/math-viewer.js';

importCss('./style.css', import.meta.url);

setBasePath(getPath(import.meta.url));

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  init();
});

function init() {
  const mdViewer = new MDViewer({
    element: 'md-viewer',
    plugins: [
      mathMDViewerPlugin(),
    ],
  });

  mdViewer.md = `
---
title: "Manual Completo de Características: Markdown"
author: "Equipo de Ingeniería"
date: "2026-10-31"
abstract: |
  Este documento sirve como referencia y demostración exhaustiva 
  de todas las capacidades extendidas soportadas nativamente por Markdown.
lang: "es"
---

# 0. Líneas de Separación y Reglas Horizontales

Linea simple de separación
___

Doble línea de separación
===

Triple línea de separación
≡≡≡

Línea punteada de separación
...
. . . 
.  .  .
*** 
* * * 
*  *  *

Línea de separación con guiones
- - -
-  -  -
-   -   -
-- -
--- -

Línea de separación con guiones y puntos
-.
- .
-..
- . .
--.
-- .
--..
-- . .

---

# 1. Tipografía y Formato de Texto Básico

## Subtítulos y Encabezados

El texto plano permite estilos comunes como **negrita**, *cursiva*, ~~tachado~~, 
subíndice (H~2~O) y superíndice (X^2^). También podemos resaltar texto con ==marcador==.

\\sum

---

# 2. Listas Avanzadas y de Tareas

* Elemento de lista normal.
  * Sub-elemento anidado.
* Otro elemento con saltos.

* Segundo elemento con saltos.
* Tercero elemento con saltos.
  1. Primer sub-elemento numerado.
  2. Segundo sub-elemento numerado.
  1. Tercer sub-elemento numerado.

Listas ordenadas automáticas:
(@) Primer paso del proceso técnico.
(@) Segundo paso automático.
(@) Tercer paso final.

Listas de tareas interactivas:
- [x] Tarea completada con éxito.
- [ ] Tarea pendiente de revisión.

---

# 3. Notas al Pie y Citas Bibliográficas

Puedes insertar notas al pie en cualquier parte del texto[^1], así como referencias 
cruzadas a bibliografía externa usando la sintaxis estándar [@smith2024].

[^1]: Esta es la nota al pie detallada que se renderiza automáticamente al final.
De dos líneas para demostrar el soporte de Markdown en notas al pie extendidas **A ver**.

---

# 4. Fórmulas Matemáticas (Sintaxis LaTeX)

Procesa expresiones matemáticas de forma nativa. 
En línea: $f(x) = \\sum_{i=1}^{n} x_i^2$, $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$

En bloque independiente: $$f(x) = \\sum_{i=1}^{n} x_i^2$$

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

Solución de la ecuación cuadrática: $x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Matrices y límites:
$$\\begin{pmatrix}
  1 & 2 \\\\ 
  3 & 4
\\end{pmatrix}$$

$$ \\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1 $$

---

# 5. Tablas Estructuradas con Leyendas (*Captions*)

| Módulo | Estado | Cobertura | Prioridad |
|:---|:---|---:|:---:|
| Autenticación | Activo | 98% | Alta |
| Base de Datos | En pruebas | 85% | Media |
| Interfaz UI | Pendiente | 40% | Baja |

Table\\: Estado actual de módulos del sistema.

---

# 6. Listas de Definiciones

Término Uno
: Definición formal del primer concepto dentro del documento técnico.

Término Dos
: Primera definición del segundo término.
: Segunda alternativa o aclaración del ***mismo*** término.

---

# 7. Bloques de Código Enriquecidos y Atributos

Se puede colocar código en línea con resaltado de sintaxis, por ejemplo: \`resultado = procesar_datos([1, 2, 3])\`.

\`\`\`python {.line-numbers startFrom="1" caption="Función de cálculo principal"}
def procesar_datos(vector):
    # Retorna la suma acumulada
    return [sum(vector[:i+1]) for i in range(len(vector))]
\`\`\`

---

# 8. Citas y Bloques de Texto Especializados

> "La simplicidad es la máxima sofisticación." - Leonardo da Vinci

> Cita de dos líneas para demostrar el soporte de Markdown en bloques de texto extendidos.
> Esta es la segunda línea de la cita, mostrando cómo se puede mantener el formato y la indentación.

---

# 9. Bloques y Notas

:::
Bloque genérico: Este es un bloque genérico que puede contener múltiples líneas y formatos.

::: anidado
Este es un bloque anidado dentro del bloque genérico, demostrando la capacidad de Markdown para manejar estructuras jerárquicas.
:::

:::

::: info
Esta es una información general o nota informativa para el equipo.
:::

::: tip
**Consejo útil:** Puedes usar comandos rápidos escribiendo "/tip" directamente en el editor visual.
:::

::: warning
**Advertencia:** Esta acción no se puede deshacer una vez ejecutada.
:::

::: {.success}
¡El despliegue del módulo se ha completado con éxito!
:::

::: error
Nota de error: Se ha producido un fallo crítico en el sistema.
:::

***

# 10. Imágnes y Multimedia

![Boca Corazón](https://wallpaperbat.com/img/939147-boca-juniors-hd-wallpaper-and-background.jpg "CABJ")

`;
}
