---
name: cronograma-materiales-sync
description: >-
  Agrega, sincroniza y vincula nuevos PDFs o resúmenes de Google Drive al cronograma
  de Medicina de Yanina en Neon y Vercel en segundos. Úsalo siempre que el usuario
  mencione "agregar PDF", "nuevo resumen", "subir apunte", "vincular a sesión",
  "actualizar material", "subí este Drive" o agregar cualquier archivo de estudio.
---

# 📚 Sincronización Ultrarrápida de Materiales — Cronograma de Medicina

Habilidad especializada para registrar nuevos resúmenes, guías y PDFs de Google Drive en el sistema de estudio de Yanina (**Mi ruta a los finales · Medicina**), guardarlos en la base de datos Neon, vincularlos con rangos de páginas exactos a las sesiones del calendario y desplegarlos en Vercel de forma automática e instantánea.

---

## Cuándo Activar Esta Skill
Úsala inmediatamente cuando el usuario:
- Proporcione un enlace o ID de Google Drive y pida añadirlo al cronograma o biblioteca.
- Diga: *"hice un nuevo resumen de Anatomía / Histología / Biofísica"*.
- Pida vincular un apunte a una fecha, bloque o examen específico.
- Solicite actualizar páginas o Drive IDs de un material existente.

---

## Procedimiento de Ejecución Rápida (1 Comando)

Dentro del directorio del proyecto (`C:\Users\abelk\Desktop\cronograma-medicina`), ejecuta el script optimizado `sync-material.ts`:

### 1. Agregar Material a la Biblioteca General (sin fecha fija)
```powershell
npx tsx src/scripts/sync-material.ts --title "<NOMBRE_DEL_PDF>" --drive "<ENLACE_O_ID_DRIVE>" --subject "<MATERIA>" --pages <CANTIDAD_PAGINAS> --deploy
```

### 2. Agregar y Vincular Directamente a una Sesión del Calendario
```powershell
npx tsx src/scripts/sync-material.ts --title "<NOMBRE_DEL_PDF>" --drive "<ENLACE_O_ID_DRIVE>" --subject "<MATERIA>" --pages <PAGINAS> --date "YYYY-MM-DD" --block <1|2|3> --range "<PAGINA_INICIO-PAGINA_FIN>" --deploy
```

*Ejemplo real:*
```powershell
npx tsx src/scripts/sync-material.ts --title "Resumen_Pelvis_Abel" --drive "https://drive.google.com/file/d/1ZpP5u2mVk-kVaYYi4I0qLNxbIALghkUn/view" --subject anatomia --pages 12 --date "2026-10-24" --block 1 --range "1-8" --deploy
```

---

## Parámetros Soportados

Parámetro | Requerido | Descripción | Ejemplo
:--- | :--- | :--- | :---
`--title` | **Sí** | Título del apunte o PDF (agrega `.pdf` automáticamente si falta). | `--title "Guia_Cardiovascular"`
`--drive` | **Sí** | URL completa de Drive o ID alfanumérico del archivo. | `--drive "16FAAo3qNQN8hyFIhHovl5veRrFuQPpEZ"`
`--subject` | No | Materia: `anatomia`, `histologia`, `biologia`, `biofisica`, `bioestadistica`. | `--subject histologia` (def: `anatomia`)
`--pages` | No | Total de páginas físicas del PDF. | `--pages 36` (def: `1`)
`--date` | No | Fecha de la sesión a vincular (`YYYY-MM-DD`). | `--date "2026-10-25"`
`--block` | No | Bloque de estudio del día (`1`, `2` o `3`). | `--block 2`
`--session` | No | ID directo de sesión (alternativa a `--date` y `--block`). | `--session "session_2026-10-25_2"`
`--range` | No | Rango de lectura o páginas asignadas para la sesión. | `--range "25-28"` o `--range "34"`
`--instructions` | No | Texto que actualiza o complementa la instrucción de la sesión. | `--instructions "Estudio de preparados..."`
`--category` | No | Carpeta interna en Drive. | `--category "01 Anatomía/Resúmenes de Abel"`
`--notes` | No | Anotaciones pedagógicas para Yanina. | `--notes "Repasar esquemas clave"`
`--deploy` | No | Ejecuta `git add`, `git commit` y `git push origin main` automáticamente. | Flag sin valor

---

## Flujo Interno Automatizado (Qué hace en segundos)

1. **Extracción Limpia de ID:** Parsea URLs como `https://drive.google.com/file/d/<ID>/view?usp=sharing` u `open?id=<ID>` y extrae el identificador canónico.
2. **Persistencia en Neon (`documents`):** Ejecuta un `INSERT ... ON CONFLICT DO UPDATE` en la tabla `documents` asegurando disponibilidad inmediata.
3. **Mapeo Curricular (`session_documents` & `sessions`):** Si se indica fecha/bloque o sesión, asocia el documento con su rango de páginas, desactiva `needs_material_mapping` y actualiza las instrucciones pedagógicas.
4. **Sincronización Local de Manifiestos:** Actualiza `materiales.drive.json` (conteos totales y canónicos) y `cronograma.seed.json` para mantener el repositorio 100% alineado con la base de datos.
5. **Despliegue Continuo (si se usa `--deploy`):** Realiza el push a GitHub `main` para que Vercel actualice la versión en vivo sin intervención manual.

---

## Alternativa desde la Web (/admin)
Abel también puede ingresar a `https://cronograma-medicina-wheat.vercel.app/admin` desde su celular o computadora, pegar el enlace de Drive, marcar la casilla **"Vincular automáticamente a una sesión del cronograma"**, elegir la fecha y bloque, y guardar con un solo clic.
