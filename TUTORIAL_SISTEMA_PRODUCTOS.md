# Tutorial Completo: Sistema de Gestión de Productos
## React.js + Node.js + MySQL
---

## ÍNDICE
1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Crear Estructura del Proyecto](#2-crear-estructura-del-proyecto)
3. [Configurar Base de Datos MySQL](#3-configurar-base-de-datos-mysql)
4. [Crear el Backend (Servidor)](#4-crear-el-backend-servidor)
5. [Crear el Frontend (Cliente)](#5-crear-el-frontend-cliente)
6. [Probar la Aplicación](#6-probar-la-aplicación)
7. [Solución de Problemas Comunes](#7-solución-de-problemas-comunes)

---

## 1. PREPARACIÓN DEL ENTORNO

### 1.1 Instalar Node.js
- Ve a [nodejs.org](https://nodejs.org)
- Descarga la versión LTS (Long Term Support)
- Instala Node.js en tu computadora
- Verifica la instalación abriendo una terminal y escribiendo:
```bash
node --version
npm --version
```

### 1.2 Instalar MySQL
- Ve a [mysql.com](https://mysql.com)
- Descarga MySQL Community Server
- Instala MySQL con contraseña root
- Anota tu contraseña de MySQL (la necesitarás después)

### 1.3 Instalar un Editor de Código
- Recomiendo Visual Studio Code
- Descárgalo de [code.visualstudio.com](https://code.visualstudio.com)

---

## 2. CREAR ESTRUCTURA DEL PROYECTO

### 2.1 Crear la Carpeta Principal
Abre una terminal (Command Prompt en Windows) y ejecuta:

```bash
# Crear la carpeta principal del proyecto
mkdir sistema-gestion-productos

# Entrar a la carpeta
cd sistema-gestion-productos

# Crear las carpetas para backend y frontend
mkdir server
mkdir client
```

**Explicación**:
- `mkdir` significa "make directory" (crear directorio)
- `cd` significa "change directory" (cambiar directorio)
- Estamos creando una estructura separada para el servidor (backend) y el cliente (frontend)

### 2.2 Verificar la Estructura
Tu proyecto debería verse así:
```
sistema-gestion-productos/
├── server/
└── client/
```

---

## 3. CONFIGURAR BASE DE DATOS MYSQL

### 3.1 Abrir MySQL
- Abre MySQL Workbench (si lo instalaste)
- O abre Command Prompt y escribe: `mysql -u root -p`
- Ingresa tu contraseña cuando te la pida

### 3.2 Crear la Base de Datos
En MySQL, ejecuta estos comandos uno por uno:

```sql
-- Crear la base de datos
CREATE DATABASE sistema_productos;

-- Usar la base de datos
USE sistema_productos;

-- Crear la tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    categoria VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    proveedor VARCHAR(100),
    imagen_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear la tabla de categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Explicación de las tablas**:

**Tabla productos**:
- `id`: Identificador único que se genera automáticamente
- `nombre`: Nombre del producto (texto, máximo 100 caracteres)
- `descripcion`: Descripción detallada del producto
- `precio`: Precio del producto (decimal con 2 decimales)
- `categoria_id`: ID de la categoría (relación con tabla categorias)
- `categoria`: Nombre de la categoría (para búsquedas rápidas)
- `stock`: Cantidad disponible en inventario
- `proveedor`: Nombre del proveedor
- `imagen_url`: URL de la imagen del producto
- `fecha_creacion`: Fecha de creación automática
- `fecha_actualizacion`: Fecha de última modificación automática

**Tabla categorias**:
- `id`: Identificador único que se genera automáticamente
- `nombre`: Nombre de la categoría (único)
- `descripcion`: Descripción de la categoría
- `fecha_creacion`: Fecha de creación automática

### 3.3 Verificar que se Creó
```sql
-- Ver todas las bases de datos
SHOW DATABASES;

-- Ver la estructura de las tablas
DESCRIBE productos;
DESCRIBE categorias;
```

---

## 4. CREAR EL BACKEND (SERVIDOR)

### 4.1 Configurar el Servidor
En la terminal, navega a la carpeta server:

```bash
cd server
```

### 4.2 Inicializar el Proyecto Node.js
```bash
npm init -y
```

**Explicación**:
- `npm init` crea un archivo `package.json`
- `-y` significa "yes to all" (aceptar todas las opciones por defecto)
- Este archivo guarda la información del proyecto y las dependencias

### 4.3 Instalar las Dependencias del Servidor
```bash
npm install express mysql2 cors dotenv
npm install nodemon --save-dev
```

**Explicación de las dependencias**:
- `express`: Framework para crear APIs web
- `mysql2`: Conector para MySQL
- `cors`: Permite que el frontend se comunique con el backend
- `dotenv`: Para manejar variables de entorno (contraseñas, etc.)
- `nodemon`: Reinicia automáticamente el servidor cuando cambias el código

### 4.4 Crear el Archivo de Variables de Entorno
Crea un archivo llamado `.env` en la carpeta `server`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_de_mysql
DB_NAME=sistema_productos
```

**IMPORTANTE**:
- Reemplaza `tu_contraseña_de_mysql` con tu contraseña real de MySQL
- Este archivo NO se sube a GitHub (contiene información sensible)

### 4.5 Crear el Archivo de Conexión a la Base de Datos
Crea un archivo llamado `db.js` en la carpeta `server`:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a MySQL');
});

module.exports = connection;
```

**Explicación**:
- `require('mysql2')`: Importa el conector de MySQL
- `require('dotenv').config()`: Carga las variables del archivo .env
- `process.env.DB_HOST`: Obtiene el valor de DB_HOST del archivo .env
- `connection.connect()`: Intenta conectar a MySQL
- `module.exports`: Hace que este archivo se pueda importar en otros

### 4.6 Crear el Servidor Principal
Crea un archivo llamado `index.js` en la carpeta `server`:

```javascript
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite recibir datos en formato JSON

// RUTA 1: Obtener todos los productos con filtros opcionales
app.get('/productos', (req, res) => {
    const { categoria, precio_min, precio_max, nombre } = req.query;
    let sql = 'SELECT id, nombre as name, descripcion as description, precio as price, categoria_id, categoria as category, stock, proveedor as supplier, imagen_url as image_url FROM productos WHERE 1=1';
    let params = [];

    // Filtro por nombre (búsqueda)
    if (nombre) {
        sql += ' AND nombre LIKE ?';
        params.push(`%${nombre}%`);
    }

    // Filtro por categoría
    if (categoria) {
        sql += ' AND (categoria = ? OR categoria_id = ?)';
        params.push(categoria, categoria);
    }

    // Filtro por precio mínimo
    if (precio_min) {
        sql += ' AND precio >= ?';
        params.push(parseFloat(precio_min));
    }

    // Filtro por precio máximo
    if (precio_max) {
        sql += ' AND precio <= ?';
        params.push(parseFloat(precio_max));
    }

    sql += ' ORDER BY nombre ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.json(results);
    });
});

// RUTA 2: Obtener categorías
app.get('/categorias', (req, res) => {
    const sql = 'SELECT id, nombre as name FROM categorias ORDER BY nombre';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener categorías:', err);
            return res.status(500).json({ error: 'Error al obtener las categorías' });
        }
        res.json(results);
    });
});

// RUTA 3: Crear nueva categoría
app.post('/categorias', (req, res) => {
    const { name } = req.body;
    console.log('Datos recibidos para crear categoría:', { name });

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const sql = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';

    db.query(sql, [name.trim(), ''], (err, result) => {
        if (err) {
            console.error('Error al crear categoría:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
            }
            return res.status(500).json({ error: 'Error al crear la categoría' });
        }

        console.log('Categoría creada exitosamente:', result);
        res.json({
            id: result.insertId,
            name: name.trim()
        });
    });
});

// RUTA 4: Actualizar categoría
app.put('/categorias/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    console.log('Datos recibidos para actualizar categoría:', { id, name });

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const sql = 'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?';

    db.query(sql, [name.trim(), '', id], (err, result) => {
        if (err) {
            console.error('Error al actualizar categoría:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
            }
            return res.status(500).json({ error: 'Error al actualizar la categoría' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        console.log('Categoría actualizada exitosamente:', result);

        // Actualizar también los productos que usan esta categoría
        const updateProductsSql = 'UPDATE productos SET categoria = ? WHERE categoria_id = ?';
        db.query(updateProductsSql, [name.trim(), id], (updateErr) => {
            if (updateErr) {
                console.error('Error al actualizar productos:', updateErr);
            }
        });

        res.json({ message: 'Categoría actualizada correctamente' });
    });
});

// RUTA 5: Eliminar categoría
app.delete('/categorias/:id', (req, res) => {
    const { id } = req.params;

    // Verificar si hay productos usando esta categoría
    const checkSql = 'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ? OR categoria = (SELECT nombre FROM categorias WHERE id = ?)';

    db.query(checkSql, [id, id], (err, results) => {
        if (err) {
            console.error('Error en consulta de verificación:', err);
            return res.status(500).json({ error: 'Error al verificar productos' });
        }

        if (results[0].count > 0) {
            return res.status(400).json({ error: 'No se puede eliminar la categoría porque tiene productos asociados' });
        }

        const sql = 'DELETE FROM categorias WHERE id = ?';

        db.query(sql, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar la categoría' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            res.json({ message: 'Categoría eliminada correctamente' });
        });
    });
});

// RUTA 6: Obtener un producto por ID
app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, nombre as name, descripcion as description, precio as price, categoria_id, categoria as category, stock, proveedor as supplier, imagen_url as image_url FROM productos WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el producto' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    });
});

// RUTA 7: Crear un nuevo producto
app.post('/productos', (req, res) => {
    const { name, description, price, categoria_id, stock, supplier, image_url } = req.body;

    // Validar que todos los campos obligatorios estén presentes
    if (!name || !price || !categoria_id || stock === undefined) {
        return res.status(400).json({ error: 'Los campos nombre, precio, categoría y stock son requeridos' });
    }

    // Validar que el precio sea un número positivo
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    // Validar que el stock sea un número entero positivo
    if (!Number.isInteger(Number(stock)) || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
    }

    // Obtener el nombre de la categoría
    const getCategorySql = 'SELECT nombre FROM categorias WHERE id = ?';
    db.query(getCategorySql, [categoria_id], (err, categoryResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la categoría' });
        }

        if (categoryResult.length === 0) {
            return res.status(400).json({ error: 'Categoría no encontrada' });
        }

        const categoria = categoryResult[0].nombre;
        const sql = 'INSERT INTO productos (nombre, descripcion, precio, categoria_id, categoria, stock, proveedor, imagen_url, fecha_creacion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())';

        db.query(sql, [name, description || '', price, categoria_id, categoria, stock, supplier || '', image_url || ''], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el producto' });
            }

            res.json({
                message: 'Producto guardado correctamente',
                id: result.insertId,
                name,
                description: description || '',
                price,
                categoria_id,
                category: categoria,
                stock,
                supplier: supplier || '',
                image_url: image_url || ''
            });
        });
    });
});

// RUTA 8: Actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoria_id, stock, supplier, image_url } = req.body;

    // Validaciones similares a la creación
    if (!name || !price || !categoria_id || stock === undefined) {
        return res.status(400).json({ error: 'Los campos nombre, precio, categoría y stock son requeridos' });
    }

    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    if (!Number.isInteger(Number(stock)) || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
    }

    // Obtener el nombre de la categoría
    const getCategorySql = 'SELECT nombre FROM categorias WHERE id = ?';
    db.query(getCategorySql, [categoria_id], (err, categoryResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la categoría' });
        }

        if (categoryResult.length === 0) {
            return res.status(400).json({ error: 'Categoría no encontrada' });
        }

        const categoria = categoryResult[0].nombre;
        const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, categoria = ?, stock = ?, proveedor = ?, imagen_url = ?, fecha_actualizacion = NOW() WHERE id = ?';

        db.query(sql, [name, description || '', price, categoria_id, categoria, stock, supplier || '', image_url || '', id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el producto' });
            }
            return res.json({ message: 'Producto actualizado correctamente' });
        });
    });
});

// RUTA 9: Eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM productos WHERE id = ?';

    db.query(sql, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }
        return res.json({ message: 'Producto eliminado correctamente' });
    });
});

// RUTA 10: Obtener estadísticas básicas
app.get('/estadisticas', (req, res) => {
    const sql = `
        SELECT
            COUNT(*) as total_productos,
            SUM(stock) as stock_total,
            AVG(precio) as precio_promedio,
            COUNT(DISTINCT categoria) as total_categorias
        FROM productos
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        res.json(results[0]);
    });
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.json({
        message: '¡Backend funcionando correctamente!',
        status: 'OK',
        puerto: 5000,
        rutas_disponibles: [
            'GET /productos',
            'POST /productos',
            'PUT /productos/:id',
            'DELETE /productos/:id',
            'GET /categorias',
            'POST /categorias',
            'PUT /categorias/:id',
            'DELETE /categorias/:id',
            'GET /estadisticas'
        ]
    });
});

// Iniciar el servidor en el puerto 5000
app.listen(5000, () => {
    console.log('Servidor del backend corriendo desde el puerto 5000');
    console.log('Sistema de Gestión de Productos - Backend');
});
```

**Explicación de las rutas**:
- `GET /productos`: Obtiene todos los productos con filtros opcionales
- `GET /categorias`: Obtiene todas las categorías
- `POST /categorias`: Crea una nueva categoría
- `PUT /categorias/:id`: Actualiza una categoría existente
- `DELETE /categorias/:id`: Elimina una categoría por su ID
- `GET /productos/:id`: Obtiene un producto específico por ID
- `POST /productos`: Crea un nuevo producto
- `PUT /productos/:id`: Actualiza un producto existente
- `DELETE /productos/:id`: Elimina un producto por su ID
- `GET /estadisticas`: Obtiene estadísticas del sistema

### 4.7 Modificar el package.json
Abre el archivo `package.json` y modifica la sección "scripts":

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mysql2": "^3.2.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

**Explicación de los scripts**:
- `npm start`: Ejecuta `node index.js` (para producción)
- `npm run dev`: Ejecuta `nodemon index.js` (para desarrollo, se reinicia automáticamente)

---

## 5. CREAR EL FRONTEND (CLIENTE)

### 5.1 Navegar a la Carpeta del Cliente
En una nueva terminal:

```bash
cd client
```

### 5.2 Crear la Aplicación React con Vite
```bash
npm create vite@latest . -- --template react
```

**Explicación**:
- `npm create vite@latest` crea una aplicación React moderna
- `.` significa "crear en la carpeta actual"
- `--template react` especifica que queremos React

### 5.3 Instalar Dependencias Adicionales
```bash
npm install axios @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/lab
```

**Explicación**:
- `axios`: Para hacer peticiones HTTP al backend
- `@mui/material`: Componentes de Material-UI
- `@mui/icons-material`: Iconos de Material-UI
- `@emotion/react` y `@emotion/styled`: Para los estilos de Material-UI

### 5.4 Crear la Estructura de Carpetas
```bash
mkdir -p src/api src/components src/pages
```

### 5.5 Crear las APIs
Crea `src/api/products.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productsAPI = {
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.precio_min) params.append('precio_min', filters.precio_min);
      if (filters.precio_max) params.append('precio_max', filters.precio_max);

      const url = params.toString() ? `/productos?${params.toString()}` : '/productos';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/productos', productData);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(`/productos/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }
};
```

Crea `src/api/categories.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post('/categorias', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/categorias/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
};
```

### 5.6 Crear los Componentes
Crea `src/components/CategoryManager.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Snackbar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { categoriesAPI } from '../api/categories';

function CategoryManager({ open, onClose, onCategoryChange }) {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (open) {
      cargarCategorias();
    }
  }, [open]);

  const cargarCategorias = async () => {
    try {
      const data = await categoriesAPI.getAll();
      console.log('Categorías cargadas:', data);
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarNotificacion = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const limpiarFormulario = () => {
    setNombre('');
    setEditandoId(null);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      mostrarNotificacion('El nombre de la categoría es requerido', 'error');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (editandoId) {
        // Actualizar categoría existente
        data = await categoriesAPI.update(editandoId, { name: nombre.trim() });
        // Actualizar categoría en la lista
        setCategorias(categorias.map(cat =>
          cat.id === editandoId
            ? { ...cat, name: nombre.trim() }
            : cat
        ));
        mostrarNotificacion('Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        data = await categoriesAPI.create({ name: nombre.trim() });
        setCategorias([...categorias, data]);
        mostrarNotificacion('Categoría creada correctamente');
      }
      onCategoryChange && onCategoryChange();
      limpiarFormulario();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al guardar la categoría';
      mostrarNotificacion(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const editarCategoria = (categoria) => {
    setNombre(categoria.name || categoria.nombre);
    setEditandoId(categoria.id);
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
  };

  const eliminarCategoria = async (idx) => {
    const categoria = categorias[idx];
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.name || categoria.nombre}"?`)) {
      setLoading(true);
      try {
        await categoriesAPI.delete(categoria.id);
        setCategorias(categorias.filter((_, i) => i !== idx));
        mostrarNotificacion('Categoría eliminada correctamente');
        onCategoryChange && onCategoryChange();
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Error al eliminar la categoría';
        mostrarNotificacion(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <CategoryIcon />
        Gestión de Categorías
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Formulario */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                {editandoId ? 'Editar Categoría' : 'Nueva Categoría'}
              </Typography>
              <form onSubmit={guardarCategoria}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre de la categoría"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          borderRadius: 2,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                          }
                        }}
                      >
                        {editandoId ? 'Actualizar' : 'Crear'}
                      </Button>
                      {editandoId && (
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={cancelarEdicion}
                          disabled={loading}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Lista de categorías */}
          <Typography variant="h6" gutterBottom>
            Categorías Existentes ({Array.isArray(categorias) ? categorias.length : 0})
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!Array.isArray(categorias) || categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No hay categorías registradas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Crea tu primera categoría usando el formulario de arriba
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(categorias) && categorias.map((categoria, idx) => (
                    <TableRow key={categoria.id || idx} hover>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {categoria.name || categoria.nombre || 'Sin nombre'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar categoría">
                            <IconButton
                              color="primary"
                              onClick={() => editarCategoria(categoria)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar categoría">
                            <IconButton
                              color="error"
                              onClick={() => eliminarCategoria(idx)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cerrar
        </Button>
      </DialogActions>

      {/* Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={cerrarNotificacion}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default CategoryManager;
```

### 5.7 Crear las Páginas
Crea `src/pages/Home.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  AppBar,
  Toolbar,
  Fab,
  Tooltip,
  Divider,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import CategoryManager from '../components/CategoryManager';

function Home() {
  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({});

  // Estados para gestión de categorías
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarProductos(),
        cargarCategorias(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      mostrarNotificacion('Error al cargar los datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const filtros = {};
      if (filtroNombre) filtros.nombre = filtroNombre;
      if (filtroCategoria) filtros.categoria = filtroCategoria;
      if (filtroPrecioMin) filtros.precio_min = filtroPrecioMin;
      if (filtroPrecioMax) filtros.precio_max = filtroPrecioMax;

      const data = await productsAPI.getAll(filtros);
      const productosNormalizados = data.map(producto => ({
        ...producto,
        name: producto.name || producto.nombre,
        description: producto.description || producto.descripcion,
        price: producto.price || producto.precio,
        category: producto.category || producto.categoria,
        supplier: producto.supplier || producto.proveedor,
        image_url: producto.image_url || producto.imagenUrl
      }));
      setProductos(productosNormalizados);
    } catch (error) {
      mostrarNotificacion('Error al cargar los productos', 'error');
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategorias(data);
    } catch (error) {
      // Error silencioso para categorías
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:5000/estadisticas');
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      // Error silencioso para estadísticas
    }
  };

  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarNotificacion = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const aplicarFiltros = () => {
    cargarProductos();
  };

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroCategoria('');
    setFiltroPrecioMin('');
    setFiltroPrecioMax('');
    cargarProductos();
  };

  const hayFiltrosActivos = () => {
    return filtroNombre || filtroCategoria ||
           (filtroPrecioMin && filtroPrecioMin.trim() !== '') ||
           (filtroPrecioMax && filtroPrecioMax.trim() !== '');
  };

  const obtenerResumenFiltros = () => {
    const filtros = [];
    if (filtroNombre) filtros.push(`Nombre: "${filtroNombre}"`);
    if (filtroCategoria) {
      if (typeof filtroCategoria === 'string' && !isNaN(filtroCategoria)) {
        const catEncontrada = categorias.find(cat => (cat.id || cat) === filtroCategoria);
        if (catEncontrada) {
          filtros.push(`Categoría: "${catEncontrada.name || catEncontrada}"`);
        } else {
          filtros.push(`Categoría: "${filtroCategoria}"`);
        }
      } else {
        filtros.push(`Categoría: "${filtroCategoria}"`);
      }
    }
    if (filtroPrecioMin && filtroPrecioMin.trim() !== '') filtros.push(`Precio ≥ $${filtroPrecioMin}`);
    if (filtroPrecioMax && filtroPrecioMax.trim() !== '') filtros.push(`Precio ≤ $${filtroPrecioMax}`);
    return filtros.join(', ');
  };

  const eliminarProducto = async (idx) => {
    const producto = productos[idx];
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${producto.name || producto.nombre}"?`)) {
      setLoading(true);
      try {
        await productsAPI.delete(producto.id);
        setProductos(productos.filter((_, i) => i !== idx));
        mostrarNotificacion('Producto eliminado correctamente');
        cargarEstadisticas();
      } catch (error) {
        mostrarNotificacion('Error al eliminar el producto', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCategoryChange = () => {
    cargarCategorias();
    cargarProductos();
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <StoreIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Sistema de Gestión de Productos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Gestión completa de inventario y categorías
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tarjetas de estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estadisticas.total_productos || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Productos
                    </Typography>
                  </Box>
                  <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-