const express = require('express')
const cors = require('cors')
const db = require('./db')
const app = express();

app.use(cors())//solicitudes desde otro origenes
app.use(express.json());

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
            'GET /estadisticas'
        ]
    });
});

// Ruta para obtener todos los productos con filtros opcionales
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

// Ruta para obtener categorías desde la tabla categorias
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

// Ruta para crear nueva categoría
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

// Ruta para actualizar categoría
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

// Ruta para eliminar categoría
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

// Ruta para agregar productos
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

// Ruta para actualizar productos
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

// Ruta para eliminar productos
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

// Ruta para obtener estadísticas básicas
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

app.listen(5000, () => {
    console.log('Servidor del backend corriendo desde el puerto 5000');
    console.log('Sistema de Gestión de Productos - Backend');
})

