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
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estadisticas.stock_total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Stock Total
                    </Typography>
                  </Box>
                  <StoreIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ${estadisticas.precio_promedio ? estadisticas.precio_promedio.toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Precio Promedio
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {estadisticas.total_categorias || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Categorías
                    </Typography>
                  </Box>
                  <CategoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y búsqueda */}
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              Filtros de Búsqueda
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar por nombre"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Todas las categorías</em>
                    </MenuItem>
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Precio mínimo"
                  type="number"
                  value={filtroPrecioMin}
                  onChange={(e) => setFiltroPrecioMin(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Precio máximo"
                  type="number"
                  value={filtroPrecioMax}
                  onChange={(e) => setFiltroPrecioMax(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={aplicarFiltros}
                    startIcon={<SearchIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      }
                    }}
                  >
                    Buscar
                  </Button>
                  {hayFiltrosActivos() && (
                    <Button
                      variant="outlined"
                      onClick={limpiarFiltros}
                      startIcon={<ClearIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Limpiar
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            {hayFiltrosActivos() && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Filtros activos: ${obtenerResumenFiltros()}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabla de productos */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                Productos ({productos.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={() => setOpenCategoryDialog(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Gestionar Categorías
                </Button>
                <Button
                  component={Link}
                  to="/nuevo-producto"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    }
                  }}
                >
                  Nuevo Producto
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Categoría</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Precio</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stock</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Proveedor</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay productos registrados
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {hayFiltrosActivos() ? 'No se encontraron productos con los filtros aplicados' : 'Comienza agregando tu primer producto'}
                          </Typography>
                          {!hayFiltrosActivos() && (
                            <Button
                              component={Link}
                              to="/nuevo-producto"
                              variant="contained"
                              startIcon={<AddIcon />}
                              sx={{
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                borderRadius: 2,
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                }
                              }}
                            >
                              Agregar Primer Producto
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productos.map((producto, idx) => (
                      <TableRow key={producto.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {producto.image_url && (
                              <Avatar
                                src={producto.image_url}
                                alt={producto.name}
                                sx={{ width: 40, height: 40, borderRadius: 1 }}
                                variant="rounded"
                              />
                            )}
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {producto.name}
                              </Typography>
                              {producto.description && (
                                <Typography variant="body2" color="text.secondary" sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200
                                }}>
                                  {producto.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={producto.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            ${parseFloat(producto.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={producto.stock}
                            size="small"
                            color={producto.stock > 10 ? 'success' : producto.stock > 0 ? 'warning' : 'error'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {producto.supplier || 'Sin proveedor'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar producto">
                              <IconButton
                                component={Link}
                                to={`/editar-producto/${producto.id}`}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar producto">
                              <IconButton
                                color="error"
                                onClick={() => eliminarProducto(idx)}
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
          </CardContent>
        </Card>
      </Container>

      {/* Diálogo de gestión de categorías */}
      <CategoryManager
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        onCategoryChange={handleCategoryChange}
      />

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

      {/* Botón flotante para agregar producto */}
      <Fab
        component={Link}
        to="/nuevo-producto"
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Home;
```

### 5.8 Crear el Formulario de Producto
Crea `src/pages/ProductForm.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    description: '',
    supplier: '',
    newCategory: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await productsAPI.getById(id);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        description: product.description || '',
        supplier: product.supplier || ''
      });
    } catch (error) {
      setError('Error al cargar el producto');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.stock === '' || parseInt(formData.stock) < 0) {
      errors.stock = 'El stock debe ser mayor o igual a 0';
    }

    if (!formData.category_id) {
      errors.category_id = 'Debe seleccionar una categoría';
    } else if (formData.category_id === 'new' && !formData.newCategory?.trim()) {
      errors.category_id = 'Debe ingresar el nombre de la nueva categoría';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let categoryId = formData.category_id;

      // Si se seleccionó "Agregar nueva categoría", crearla primero
      if (formData.category_id === 'new' && formData.newCategory.trim()) {
        try {
          const newCategory = await categoriesAPI.create({ name: formData.newCategory.trim() });
          categoryId = newCategory.id;
          // Recargar categorías para incluir la nueva
          loadCategories();
        } catch (categoryError) {
          setError('Error al crear la nueva categoría');
          console.error('Error creando categoría:', categoryError);
          return;
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoria_id: parseInt(categoryId)
      };

      if (isEdit) {
        await productsAPI.update(id, productData);
      } else {
        await productsAPI.create(productData);
      }

      navigate('/');
    } catch (error) {
      setError('Error al guardar el producto');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="product-form">
      <div className="form-header">
        <h1>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h1>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Volver
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Producto *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={validationErrors.name ? 'error' : ''}
            placeholder="Ej: iPhone 15 Pro"
          />
          {validationErrors.name && (
            <span className="error-text">{validationErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="price">Precio *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={validationErrors.price ? 'error' : ''}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {validationErrors.price && (
            <span className="error-text">{validationErrors.price}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={validationErrors.stock ? 'error' : ''}
            placeholder="0"
            min="0"
          />
          {validationErrors.stock && (
            <span className="error-text">{validationErrors.stock}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Categoría *</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={validationErrors.category_id ? 'error' : ''}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value="new">Agregar nueva categoría</option>
          </select>
          {validationErrors.category_id && (
            <span className="error-text">{validationErrors.category_id}</span>
          )}
          {formData.category_id === 'new' && (
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Nueva categoría"
                value={formData.newCategory || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, newCategory: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image_url">URL de Imagen</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="supplier">Proveedor</label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Nombre del proveedor"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del producto..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
```

### 5.9 Crear el Archivo de Rutas
Crea `src/App.jsx`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductForm from './pages/ProductForm';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuevo-producto" element={<ProductForm />} />
        <Route path="/editar-producto/:id" element={<ProductForm />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 5.10 Crear el Archivo de Configuración
Crea `src/config.js`:

```javascript
const config = {
  API_BASE_URL: 'http://localhost:5000'
};

export default config;
```

### 5.11 Crear los Estilos
Crea `src/App.css`:

```css
/* Estilos generales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

/* Formulario de producto */
.product-form {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.error-message {
  background-color: #ffeaea;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #f5c6cb;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
}

/* Botones */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea 30%, #764ba2 90%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .product-form {
    margin: 1rem;
    padding: 1.5rem;
  }

  .form-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
```

---

## 6. PROBAR LA APLICACIÓN

### 6.1 Iniciar el Servidor
En una terminal, navega a la carpeta `server` e inicia el backend:

```bash
cd server
npm run dev
```

Deberías ver:
```
Servidor del backend corriendo desde el puerto 5000
Sistema de Gestión de Productos - Backend
```

### 6.2 Iniciar el Cliente
En otra terminal, navega a la carpeta `client` e inicia el frontend:

```bash
cd client
npm run dev
```

Deberías ver algo como:
```
Vite dev server running at:
  > Local: http://localhost:5173/
```

### 6.3 Probar las Funcionalidades

1. **Crear categoría**: En el gestor de categorías, crea algunas categorías
2. **Crear producto**: Llena el formulario y selecciona una categoría existente
3. **Crear nueva categoría desde producto**: Selecciona "Agregar nueva categoría" en el formulario
4. **Ver productos**: Los productos aparecen en la tabla con filtros
5. **Editar categoría**: Modifica el nombre de una categoría
6. **Eliminar categoría**: Solo se puede eliminar si no tiene productos asociados
7. **Eliminar producto**: Elimina productos de la lista
8. **Filtros**: Prueba los filtros por nombre, categoría y precio

### 6.4 Acceder al Código Fuente
Si quieres descargar el código completo para estudiarlo o modificarlo:

**Opción 1: Clonar desde GitHub**
```bash
git clone https://github.com/GabrielSanchez73/Act-6-Desarrollemos-el-backend-y-conexi-n-a-la-base-de-datos.git
cd Act-6-Desarrollemos-el-backend-y-conexi-n-a-la-base-de-datos
```

**Opción 2: Descargar ZIP**
- Ve al repositorio: https://github.com/GabrielSanchez73/Act-6-Desarrollemos-el-backend-y-conexi-n-a-la-base-de-datos
- Haz clic en "Code" > "Download ZIP"
- Extrae el archivo ZIP en tu computadora
- Abre la carpeta extraída en tu editor de código

**Opción 3: Archivo Local**
- El archivo `TUTORIAL_SISTEMA_PRODUCTOS.md` está disponible en la ruta: `D:\proyectos personales\A_S_act\el anterior\crud-nodejs-mysql-reactjs\TUTORIAL_SISTEMA_PRODUCTOS.md`

---

## 7. SOLUCIÓN DE PROBLEMAS COMUNES

### 7.1 Error de Conexión a MySQL
**Problema**: `Error al conectar la base de datos`
**Solución**:
- Verifica que MySQL esté corriendo
- Revisa que la contraseña en `.env` sea correcta
- Asegúrate de que la base de datos `sistema_productos` existe

### 7.2 Error de Puerto Ocupado
**Problema**: `EADDRINUSE: address already in use`
**Solución**:
```bash
# En Windows, encuentra el proceso usando el puerto
netstat -ano | findstr :5000
# Mata el proceso con taskkill /PID <PID> /F
```

### 7.3 Error de Dependencias
**Problema**: `Cannot find module 'express'`
**Solución**:
```bash
# Instala las dependencias
npm install
```

### 7.4 Error de CORS
**Problema**: El frontend no puede conectarse al backend
**Solución**: Asegúrate de que el backend tenga `cors()` habilitado

### 7.5 Error al Crear Categoría
**Problema**: "Error al crear la categoría"
**Solución**: Verifica que el nombre no esté vacío y no sea duplicado

### 7.6 Error al Eliminar Categoría
**Problema**: "No se puede eliminar la categoría porque tiene productos asociados"
**Solución**: Elimina primero todos los productos de esa categoría

---

¡Felicitaciones! Has completado exitosamente el tutorial del Sistema de Gestión de Productos. Ahora tienes una aplicación completa con:

- ✅ Backend en Node.js con Express
- ✅ Base de datos MySQL
- ✅ Frontend en React con Material-UI
- ✅ API REST completa
- ✅ Gestión de productos y categorías
- ✅ Filtros y búsqueda
- ✅ Interfaz moderna y responsive

¡Sigue practicando y mejorando tu aplicación!