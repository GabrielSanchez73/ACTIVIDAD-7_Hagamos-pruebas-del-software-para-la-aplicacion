# TechSalle - Sistema de Gestión de Productos Tecnológicos

## Descripción
TechSalle es una aplicación web full-stack moderna para gestionar un almacén de productos tecnológicos. Incluye operaciones CRUD completas, filtros avanzados, estadísticas en tiempo real y una interfaz de usuario moderna sin emojis.

## Características del Frontend (Versión 2.0)

### 🎨 Diseño Moderno
- **Interfaz limpia**: Sin emojis, diseño profesional y minimalista
- **Glassmorphism**: Efectos de vidrio esmerilado para un look moderno
- **Gradientes**: Colores vibrantes y profesionales
- **Animaciones suaves**: Transiciones elegantes en todos los elementos
- **Responsive**: Adaptable a todos los dispositivos

### 🚀 Funcionalidades
- **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- **Filtros Avanzados**: Por nombre, categoría y rango de precios
- **Búsqueda en Tiempo Real**: Resultados instantáneos
- **Estadísticas Dashboard**: Métricas importantes en tarjetas visuales
- **Gestión de Categorías**: Crear nuevas categorías dinámicamente
- **Notificaciones**: Feedback visual para todas las acciones
- **Estados de Carga**: Indicadores de progreso durante operaciones

### 🛠️ Tecnologías Frontend
- **React 18**: Framework moderno con hooks
- **Material-UI 5**: Componentes profesionales
- **CSS Moderno**: Gradientes, glassmorphism, animaciones
- **Responsive Design**: Mobile-first approach

## Estructura del Proyecto

```
crud-nodejs-mysql-reactjs/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── App.js         # Componente principal (NUEVO)
│   │   ├── App.css        # Estilos modernos (NUEVO)
│   │   ├── config.js      # Configuración actualizada
│   │   └── index.js       # Punto de entrada
│   ├── package.json       # Dependencias
│   └── public/            # Archivos estáticos
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor Express
│   ├── db.js              # Conexión MySQL
│   └── package.json       # Dependencias
└── README.md              # Este archivo
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL (v8 o superior)
- npm o yarn

### 1. Configurar Base de Datos
```sql
CREATE DATABASE techsalle;
USE techsalle;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    proveedor VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Instalar Dependencias Backend
```bash
cd server
npm install
```

### 3. Instalar Dependencias Frontend
```bash
cd client
npm install
```

### 4. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `server/`:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=techsalle
PORT=5000
```

## Ejecución

### Iniciar Backend
```bash
cd server
npm start
```
El servidor estará disponible en: http://localhost:5000

### Iniciar Frontend
```bash
cd client
npm start
```
La aplicación estará disponible en: http://localhost:4000

## API Endpoints

### Productos
- `GET /productos` - Listar productos (con filtros opcionales)
- `GET /productos/:id` - Obtener producto específico
- `POST /productos` - Crear nuevo producto
- `PUT /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto

### Categorías
- `GET /categorias` - Listar categorías únicas

### Estadísticas
- `GET /estadisticas` - Obtener métricas del sistema

## Filtros Disponibles

### Parámetros de Consulta
- `nombre`: Búsqueda por nombre (LIKE)
- `categoria`: Filtro por categoría exacta
- `precio_min`: Precio mínimo
- `precio_max`: Precio máximo

### Ejemplo de Uso
```
GET /productos?nombre=laptop&categoria=Computadoras&precio_min=500&precio_max=2000
```

## Características del Nuevo Frontend

### 🎨 Mejoras Visuales
1. **Sin Emojis**: Interfaz completamente profesional
2. **Gradientes Modernos**: Colores vibrantes y atractivos
3. **Glassmorphism**: Efectos de vidrio esmerilado
4. **Animaciones Suaves**: Transiciones elegantes
5. **Sombras Profesionales**: Efectos de profundidad

### 🚀 Mejoras Funcionales
1. **Loading States**: Indicadores de carga en todas las operaciones
2. **Tooltips**: Información contextual en botones
3. **Mejor UX**: Feedback visual mejorado
4. **Responsive**: Adaptable a móviles y tablets
5. **Accesibilidad**: Mejor soporte para lectores de pantalla

### 📱 Diseño Responsivo
- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: Adaptación automática a diferentes pantallas
- **Touch Friendly**: Botones y elementos táctiles optimizados

## Estructura de Datos

### Producto
```json
{
  "id": 1,
  "nombre": "Laptop Dell XPS 13",
  "descripcion": "Laptop ultrabook con pantalla 13 pulgadas",
  "precio": 1299.99,
  "categoria": "Computadoras",
  "stock": 15,
  "proveedor": "Dell Technologies",
  "fecha_creacion": "2024-01-15T10:30:00Z",
  "fecha_actualizacion": "2024-01-15T10:30:00Z"
}
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o sugerencias sobre el proyecto, por favor contacta al equipo de desarrollo.

---

**TechSalle v2.0** - Sistema de Gestión de Productos Tecnológicos
*Desarrollado con React, Node.js, Express y MySQL*
