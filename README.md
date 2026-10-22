# Mi ruta a los finales · Medicina

Aplicación web funcional de estudio para **Yanina**, alumna de primer año de Medicina.
Conecta su cronograma de estudio oficial con una biblioteca de 75 PDFs en Google Drive, seguimiento de progreso, repasos espaciados basados en la dificultad («Me costó») y persistencia en **Neon PostgreSQL**, desplegable en **Vercel**.

---

## 🌟 Características Principales

1. **Pantalla «Hoy»:**
   - Sesiones del día ordenadas por bloques con duración, objetivo concreto, rango de páginas exacto y acceso directo al PDF en Google Drive.
   - Estados de sesión: *Pendiente*, *En curso*, *Completada*.
   - Interruptor independiente de dificultad: **«Me costó»**, que agenda repasos automáticos a **1, 3 y 7 días**.
   - Propuesta de reprogramación para bloques pendientes sin alterar fechas de exámenes.
   - Controles accesibles de frases motivacionales inspiradas en Escanor y espíritu médico, con soporte para `prefers-reduced-motion`.

2. **Pantalla «Calendario»:**
   - Navegación mensual (Octubre, Noviembre, Diciembre 2026).
   - Días de examen destacados con estrella dorada (★).
   - Tildes de día completado (✓) al finalizar todos los bloques.
   - Códigos y paleta oficial por materia:
     - **Anatomía:** Azul `#2776db`
     - **Histología y Embriología:** Violeta `#8651cf`
     - **Biología:** Verde `#169477`
     - **Biofísica:** Ámbar `#d18a13`
     - **Bioestadística:** Gris azulado `#64718a` (material UNE informativo)

3. **Pantalla «Biblioteca (PDF)»:**
   - Catálogo completo de **75 documentos PDF**.
   - **69 materiales principales** y **6 copias idénticas** (ocultas por defecto, con opción para verlas).
   - Búsqueda en vivo por título, materia o carpeta de Drive.
   - **Módulo para agregar nuevos resúmenes y PDFs:** formulario intuitivo para registrar nuevos apuntes creados en Drive, sincronizándolos al instante en la base de datos de Neon.

4. **Pantalla «Mi Avance»:**
   - Estadísticas reales de bloques completados vs pendientes.
   - Desglose por materia y comparativa de tiempo planificado vs tiempo real registrado.
   - Lista interactiva de los repasos espaciados activos (1, 3 y 7 días).

5. **Pantalla «Administración»:**
   - Gestión protegida para el administrador (Abel).
   - Incorporación de nuevos resúmenes y actualización del cronograma sin perder progreso.

---

## 🚀 Despliegue e Instalación Local

### Requisitos
- Node.js 18 o superior.
- Cuenta en [Neon.tech](https://neon.tech) para PostgreSQL serverless.
- Proyecto en [Vercel](https://vercel.com) para alojamiento.

### Pasos de Configuración:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   Rellena tu cadena de conexión de Neon (`DATABASE_URL`) y los correos autorizados en `ADMIN_EMAILS` y `ALLOWED_EMAILS`.

3. **Ejecutar la importación inicial de datos (Seed idempotente):**
   ```bash
   npm run db:seed
   ```
   Esto creará/actualizará en Neon las 5 materias, 8 exámenes, 75 documentos y 127 sesiones de estudio sin duplicar registros.

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔒 Privacidad y Acceso a Google Drive

- La carpeta de Drive es privada en la cuenta de Abel. Iniciar sesión en la app **no otorga permisos técnicos automáticos en Drive**.
- Para que Yanina pueda abrir los PDFs:
  1. Abre la carpeta principal en Google Drive (`1_0-8ExeG1iuGWf_UdTEhtTwD6JpTPxCa`).
  2. Haz clic en **Compartir** y añade el correo de Yanina con permiso de **Lector**.
  3. Los botones «Abrir en Drive» de la plataforma abrirán los documentos con el visor oficial de Google sin problemas de CORS ni límites de carga.

---

## ☁️ Despliegue en Vercel

1. Sube los cambios a tu repositorio de GitHub:
   ```bash
   git add .
   git commit -m "feat: plataforma web funcional de estudio para Yanina con Neon y Drive"
   git push origin main
   ```
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Añade las variables de entorno en la configuración del proyecto en Vercel:
   - `DATABASE_URL` (conexión de Neon con pooling)
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET`
   - `ADMIN_EMAILS` y `ALLOWED_EMAILS`
4. ¡Listo! Vercel desplegará la aplicación automáticamente con compilación serverless optimizada.
