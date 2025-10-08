-- Datos de ejemplo para TechSalle
-- Ejecutar después de crear la base de datos

USE techsalle;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, stock, proveedor) VALUES
('MacBook Pro 16"', 'Laptop profesional de Apple con chip M2 Pro', 2499.99, 'Computadoras', 8, 'Apple Inc.'),
('iPhone 15 Pro', 'Smartphone premium con cámara de 48MP', 999.99, 'Smartphones', 25, 'Apple Inc.'),
('Samsung Galaxy S24', 'Android flagship con pantalla AMOLED', 799.99, 'Smartphones', 18, 'Samsung Electronics'),
('Dell XPS 13', 'Ultrabook Windows con pantalla 13 pulgadas', 1299.99, 'Computadoras', 12, 'Dell Technologies'),
('iPad Air', 'Tablet versátil con chip M1', 599.99, 'Tablets', 15, 'Apple Inc.'),
('Samsung Galaxy Tab S9', 'Tablet Android premium', 799.99, 'Tablets', 10, 'Samsung Electronics'),
('AirPods Pro', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 'Audio', 30, 'Apple Inc.'),
('Sony WH-1000XM5', 'Auriculares over-ear con cancelación de ruido', 399.99, 'Audio', 20, 'Sony Corporation'),
('Apple Watch Series 9', 'Smartwatch con GPS y monitor de salud', 399.99, 'Wearables', 22, 'Apple Inc.'),
('Samsung Galaxy Watch 6', 'Smartwatch Android con monitor de salud', 299.99, 'Wearables', 16, 'Samsung Electronics'),
('Nintendo Switch OLED', 'Consola de videojuegos portátil', 349.99, 'Gaming', 14, 'Nintendo Co.'),
('PlayStation 5', 'Consola de videojuegos de nueva generación', 499.99, 'Gaming', 6, 'Sony Interactive Entertainment'),
('Xbox Series X', 'Consola de videojuegos Microsoft', 499.99, 'Gaming', 8, 'Microsoft Corporation'),
('Logitech MX Master 3S', 'Mouse inalámbrico profesional', 99.99, 'Periféricos', 35, 'Logitech International'),
('Keychron K8 Pro', 'Teclado mecánico inalámbrico', 129.99, 'Periféricos', 28, 'Keychron'),
('LG OLED C3 55"', 'TV OLED 4K con tecnología OLED', 1299.99, 'Televisores', 5, 'LG Electronics'),
('Samsung QLED Q80C 65"', 'TV QLED 4K con tecnología Quantum Dot', 999.99, 'Televisores', 7, 'Samsung Electronics'),
('Canon EOS R6 Mark II', 'Cámara mirrorless profesional', 2499.99, 'Cámaras', 4, 'Canon Inc.'),
('Sony A7 IV', 'Cámara mirrorless full-frame', 2499.99, 'Cámaras', 6, 'Sony Corporation'),
('DJI Mini 4 Pro', 'Drone compacto con cámara 4K', 759.99, 'Drones', 12, 'DJI Technology');

-- Verificar los datos insertados
SELECT 
    COUNT(*) as total_productos,
    COUNT(DISTINCT categoria) as total_categorias,
    SUM(stock) as stock_total,
    AVG(precio) as precio_promedio
FROM productos;

-- Mostrar productos por categoría
SELECT 
    categoria,
    COUNT(*) as cantidad_productos,
    AVG(precio) as precio_promedio,
    SUM(stock) as stock_total
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;
