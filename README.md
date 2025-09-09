# Sistema de Gestión de Productos

Sistema web completo para la gestión de inventario, productos y categorías desarrollado como actividad académica.

## Características principales

- **Gestión completa de productos** (CRUD)
- **Sistema de categorías inteligente**
- **Filtros de búsqueda avanzados**
- **Dashboard con estadísticas**
- **Interfaz moderna y responsive**
- **Accesibilidad básica (WCAG 2.1)**
- **Prototipado documentado**
- **Adaptabilidad multi-dispositivo**

## Tecnologías utilizadas

- **Frontend**: React.js + Material-UI
- **Backend**: Node.js + Express.js
- **Base de Datos**: MySQL
- **Lenguaje**: JavaScript

## Instalación

### Requisitos
- Node.js 18+
- MySQL 8.0+

### Pasos
1. **Clonar repositorio**
   ```bash
   git clone https://github.com/GabrielSanchez73/ACTIVIDAD-1.-Analicemos-y-dise-emos-un-software-para-a-gesti-n-gerencial-de-organizaciones.git
   cd ACTIVIDAD-1.-Analicemos-y-dise-emos-un-software-para-a-gesti-n-gerencial-de-organizaciones
   ```

2. **Instalar dependencias del servidor**
   ```bash
   cd server
   npm install
   ```

3. **Instalar dependencias del cliente**
   ```bash
   cd ../client
   npm install
   ```

4. **Configurar base de datos**
   - Crear base de datos MySQL: `sistema_productos`
   - Ejecutar script: `database.sql`

5. **Iniciar sistema**
   ```bash
   # Terminal 1 - Servidor
   cd server && npm start
   
   # Terminal 2 - Cliente
   cd client && npm start
   ```

## Acceso

- **Frontend**: http://localhost:4000
- **Backend**: http://localhost:5000

## Funcionalidades

### Gestión de Productos
- Agregar, editar, eliminar productos
- Campos: nombre, descripción, precio, categoría, stock, proveedor
- Validaciones de formulario
- **Accesibilidad**: aria-labels, navegación por teclado

### Sistema de Categorías
- Selector desplegable de categorías existentes
- Creación de nuevas categorías en tiempo real
- Sincronización automática
- **UX mejorada**: Indicadores visuales y validación

### Filtros de Búsqueda
- Filtro por nombre
- Filtro por categoría
- Filtros de precio (mínimo y máximo)
- Filtros combinados
- **Indicadores visuales**: Chips de filtros activos

### Panel de estadísticas
- Contador de productos totales
- Stock disponible
- Precio promedio
- Número de categorías
- **Diseño responsive**: Se adapta a todos los dispositivos

### Prototipado y Diseño
- **Wireframes**: Diseño de baja fidelidad
- **Mockups**: Diseño de alta fidelidad
- **User flows**: Flujos de usuario documentados
- **Decisiones de diseño**: Justificación de elecciones técnicas

## Estructura del proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.js         # Componente principal
│   │   ├── config.js      # Configuración
│   │   └── ProductTable.js
│   └── package.json
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor Express
│   ├── db.js              # Conexión MySQL
│   └── database.sql       # Script de base de datos
├── docs/                   # Documentación adicional
│   ├── wireframes/        # Wireframes de baja fidelidad
│   ├── mockups/           # Mockups de alta fidelidad
│   ├── flujos/            # User flows
│   └── ADAPTABILIDAD_MULTIDISPOSITIVO.md
├── README.md
├── README_PROTOTIPO.md     # Documentación de prototipado
├── GUIA_VIDEO_YOUTUBE.md  # Guía para video de demostración
└── iniciar-sistema.bat    # Script de inicio para Windows
```

## Pruebas

```bash
# Pruebas generales del sistema
node test-system.js

# Pruebas específicas de filtros
node test-filtros-precio.js
```

## Documentación adicional

- `README_MEJORAS.md` - Detalles de implementación
- `SISTEMA_FILTROS.md` - Guía de filtros
- `README_PROTOTIPO.md` - **NUEVO** - Documentación de prototipado y diseño
- `docs/ADAPTABILIDAD_MULTIDISPOSITIVO.md` - **NUEVO** - Evidencias responsive
- `GUIA_VIDEO_YOUTUBE.md` - **NUEVO** - Guía para video de demostración
- `iniciar-sistema.bat` - Script de inicio automático

## Autor

**Gabriel Sánchez** - Estudiante de Ingeniería de Software

## Fecha

31/08/2025

Act 3
9/09/2025

## Licencia

Proyecto académico - Universidad

---

Desarrollado para el aprendizaje y desarrollo profesional
