import React, { useState, useEffect } from 'react';
import { CONFIG, getApiUrl } from './config';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Clear as ClearIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import './App.css';
import CategoryManager from './components/CategoryManager';

function App() {
  // Estados para el formulario de productos
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [stock, setStock] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  // Estados para la gestión de datos
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para filtros y búsqueda
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatosIniciales();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para cargar todos los datos iniciales
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

  // Función para cargar productos con filtros
  const cargarProductos = async () => {
    try {
      let url = getApiUrl('PRODUCTOS');
      const params = new URLSearchParams();

      if (filtroNombre) params.append('nombre', filtroNombre);
      if (filtroCategoria) {
        // Buscar el nombre de la categoría por ID
        const catEncontrada = categorias.find(cat => (cat.id || cat) === filtroCategoria);
        const catName = catEncontrada ? (catEncontrada.name || catEncontrada) : filtroCategoria;
        params.append('categoria', catName);
      }
      if (filtroPrecioMin && filtroPrecioMin.trim() !== '') params.append('precio_min', filtroPrecioMin);
      if (filtroPrecioMax && filtroPrecioMax.trim() !== '') params.append('precio_max', filtroPrecioMax);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      // Normalizar los datos de productos
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

  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch(getApiUrl('CATEGORIAS'));
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      // Error silencioso para categorías
    }
  };

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(getApiUrl('ESTADISTICAS'));
      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      // Error silencioso para estadísticas
    }
  };

  // Función para mostrar notificaciones
  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Función para cerrar notificaciones
  const cerrarNotificacion = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Función para abrir/cerrar el diálogo
  const toggleDialog = () => {
    setOpenDialog(!openDialog);
    if (!openDialog) {
      limpiarFormulario();
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('');
    setNuevaCategoria('');
    setStock('');
    setProveedor('');
    setImagenUrl('');
    setEditIndex(null);
  };

  // Función para guardar o actualizar producto
  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!nombre || !precio || !stock) {
      mostrarNotificacion('Los campos nombre, precio y stock son requeridos', 'error');
      return;
    }

    // Determinar la categoría final
    let categoriaFinal = categoria;
    let categoriaId = categoria;
    if (!categoria) {
      mostrarNotificacion('Debe seleccionar una categoría', 'error');
      return;
    } else {
      // Si es un ID numérico, buscar el nombre de la categoría
      const catEncontrada = categorias.find(cat => (cat.id || cat) === categoria);
      if (catEncontrada) {
        categoriaFinal = catEncontrada.name || catEncontrada;
        categoriaId = catEncontrada.id || categoria;
      } else {
        // Si no se encuentra, usar el valor directamente (compatibilidad con strings)
        categoriaFinal = categoria;
        categoriaId = categoria;
      }
    }

    setLoading(true);
    try {
      if (editIndex !== null) {
        // Actualizar producto existente
        const producto = productos[editIndex];
        const response = await fetch(`${getApiUrl('PRODUCTOS')}/${producto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nombre,
            description: descripcion,
            price: precio,
            categoria_id: categoriaId,
            stock: stock,
            supplier: proveedor,
            image_url: imagenUrl
          })
        });

        if (response.ok) {
          const nuevosProductos = [...productos];
          nuevosProductos[editIndex] = {
            ...producto,
            name: nombre,
            description: descripcion,
            price: precio,
            category: categoriaFinal,
            stock: stock,
            supplier: proveedor,
            image_url: imagenUrl
          };
          setProductos(nuevosProductos);
          setEditIndex(null);
          mostrarNotificacion('Producto actualizado correctamente');
        } else {
          const errorData = await response.json();
          mostrarNotificacion(errorData.error || 'Error al actualizar el producto', 'error');
        }
      } else {
        // Crear nuevo producto
        const response = await fetch(getApiUrl('PRODUCTOS'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nombre,
            description: descripcion,
            price: precio,
            categoria_id: categoriaId,
            stock: stock,
            supplier: proveedor,
            image_url: imagenUrl
          })
        });

        const data = await response.json();
        if (response.ok) {
          // Asegurar que el producto tenga los campos correctos
          const nuevoProducto = {
            ...data,
            name: data.name || data.nombre,
            description: data.description || data.descripcion,
            price: data.price || data.precio,
            category: data.category || data.categoria,
            supplier: data.supplier || data.proveedor,
            image_url: data.image_url || data.imagenUrl
          };
          setProductos([...productos, nuevoProducto]);
          mostrarNotificacion('Producto guardado correctamente');
        } else {
          mostrarNotificacion(data.error || 'Error al guardar el producto', 'error');
        }
      }

      toggleDialog();
      cargarEstadisticas();
      cargarCategorias(); // Recargar categorías para incluir las nuevas
    } catch (error) {
      mostrarNotificacion('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar producto
  const eliminarProducto = async (idx) => {
    const producto = productos[idx];
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${producto.name || producto.nombre}"?`)) {
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl('PRODUCTOS')}/${producto.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProductos(productos.filter((_, i) => i !== idx));
          if (editIndex === idx) {
            setEditIndex(null);
            limpiarFormulario();
          }
          mostrarNotificacion('Producto eliminado correctamente');
          cargarEstadisticas();
        } else {
          mostrarNotificacion('Error al eliminar el producto', 'error');
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al eliminar', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para editar producto
  const editarProducto = (idx) => {
    const producto = productos[idx];
    setNombre(producto.name || producto.nombre);
    setDescripcion(producto.description || producto.descripcion || '');
    setPrecio(producto.price || producto.precio);
    // Buscar la categoría por nombre para obtener el ID
    const catEncontrada = categorias.find(cat => (cat.name || cat) === (producto.category || producto.categoria));
    setCategoria(catEncontrada ? (catEncontrada.id || catEncontrada) : (producto.category || producto.categoria));
    setNuevaCategoria('');
    setStock(producto.stock);
    setProveedor(producto.supplier || producto.proveedor || '');
    setImagenUrl(producto.image_url || producto.imagenUrl || '');
    setEditIndex(idx);
    setOpenDialog(true);
  };

  // Función para aplicar filtros (ahora automática)
  const aplicarFiltros = () => {
    cargarProductos();
  };

  // Función para manejar cambios en filtros de texto
  const handleFiltroNombreChange = (e) => {
    setFiltroNombre(e.target.value);
    // Aplicar filtro automáticamente después de un pequeño delay
    setTimeout(() => {
      cargarProductos();
    }, 300);
  };

  // Función para manejar cambios en filtros de precio
  const handleFiltroPrecioChange = (name, value) => {
    if (name === 'min') {
      setFiltroPrecioMin(value);
    } else {
      setFiltroPrecioMax(value);
    }
    // Aplicar filtro automáticamente después de un pequeño delay
    setTimeout(() => {
      cargarProductos();
    }, 300);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroCategoria('');
    setFiltroPrecioMin('');
    setFiltroPrecioMax('');
    // Recargar productos sin filtros
    setTimeout(() => {
      cargarProductos();
    }, 100);
  };

  // Función para verificar si hay filtros activos
  const hayFiltrosActivos = () => {
    return filtroNombre || filtroCategoria || 
           (filtroPrecioMin && filtroPrecioMin.trim() !== '') || 
           (filtroPrecioMax && filtroPrecioMax.trim() !== '');
  };

  // Función para obtener el resumen de filtros activos
  const obtenerResumenFiltros = () => {
    const filtros = [];
    if (filtroNombre) filtros.push(`Nombre: "${filtroNombre}"`);
    if (filtroCategoria) filtros.push(`Categoría: "${filtroCategoria}"`);
    if (filtroPrecioMin && filtroPrecioMin.trim() !== '') filtros.push(`Precio ≥ $${filtroPrecioMin}`);
    if (filtroPrecioMax && filtroPrecioMax.trim() !== '') filtros.push(`Precio ≤ $${filtroPrecioMax}`);
    return filtros.join(', ');
  };

  // Función para manejar cambios en categorías
  const handleCategoryChange = () => {
    cargarCategorias();
    cargarProductos(); // Recargar productos para reflejar cambios en categorías
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
              {CONFIG.APP.NOMBRE}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {CONFIG.APP.DESCRIPCION}
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
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      ${Number(estadisticas.precio_promedio || 0).toFixed(2)}
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

        {/* Panel de filtros */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: '#2c3e50',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <FilterIcon sx={{ color: '#667eea' }} />
              Filtros de Búsqueda
            </Typography>
            {hayFiltrosActivos() && (
              <Chip
                label={`Filtros activos: ${obtenerResumenFiltros()}`}
                color="primary"
                variant="outlined"
                onDelete={limpiarFiltros}
                deleteIcon={<ClearIcon />}
                sx={{ 
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderColor: '#667eea',
                  color: '#2c3e50',
                  fontWeight: 500
                }}
              />
            )}
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar por nombre"
                value={filtroNombre}
                onChange={handleFiltroNombreChange}
                placeholder="Escribe para buscar productos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoría"
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setTimeout(() => aplicarFiltros(), 100);
                  }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categorias.map((cat) => (
                    <MenuItem key={cat.id || cat} value={cat.id || cat}>{cat.name || cat}</MenuItem>
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
                onChange={(e) => handleFiltroPrecioChange('min', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Precio máximo"
                type="number"
                value={filtroPrecioMax}
                onChange={(e) => handleFiltroPrecioChange('max', e.target.value)}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                <Button
                  variant="outlined"
                  onClick={limpiarFiltros}
                  sx={{
                    flex: 1,
                    minHeight: '56px',
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  startIcon={<ClearIcon />}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Indicador de resultados filtrados */}
          {hayFiltrosActivos() && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <SearchIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Mostrando {productos.length} producto(s) con los filtros aplicados
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Botones de acción */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => setOpenCategoryDialog(true)}
            size="large"
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Gestionar Categorías
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={toggleDialog}
            size="large"
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              borderRadius: 3,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Agregar Producto
          </Button>
        </Box>

        {/* Tabla de productos */}
        <TableContainer component={Paper} sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                  Productos {hayFiltrosActivos() && `(${productos.length} encontrados)`}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Precio</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Categoría</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Stock</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Proveedor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Imagen</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    {hayFiltrosActivos() ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No se encontraron productos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No hay productos que coincidan con los filtros aplicados
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={limpiarFiltros}
                          startIcon={<ClearIcon />}
                        >
                          Limpiar filtros
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No hay productos registrados
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Comienza agregando tu primer producto
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={toggleDialog}
                          startIcon={<AddIcon />}
                        >
                          Agregar Producto
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto, idx) => (
                  <TableRow 
                    key={idx} 
                    hover
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2c3e50' }}>
                        {producto.name || producto.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        {producto.description || producto.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={`$${parseFloat(producto.price || producto.precio || 0).toFixed(2)}`}
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={producto.category || producto.categoria}
                        color="primary"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={producto.stock}
                        color={producto.stock > 10 ? 'success' : producto.stock > 5 ? 'warning' : 'error'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {producto.supplier || producto.proveedor || 'No especificado'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {producto.image_url || producto.imagenUrl ? (
                        <Box
                          component="img"
                          src={producto.image_url || producto.imagenUrl}
                          alt={producto.name || producto.nombre}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              zIndex: 1,
                              position: 'relative'
                            }
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          onClick={() => {
                            window.open(producto.image_url || producto.imagenUrl, '_blank');
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Sin imagen
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar producto">
                          <IconButton
                            color="primary"
                            onClick={() => editarProducto(idx)}
                            size="small"
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar producto">
                          <IconButton
                            color="error"
                            onClick={() => eliminarProducto(idx)}
                            size="small"
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
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

        {/* Botón flotante para agregar producto */}
        <Fab
          color="primary"
          aria-label="Agregar producto"
          onClick={toggleDialog}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <AddIcon />
        </Fab>

        {/* Diálogo para agregar/editar producto */}
        <Dialog 
          open={openDialog} 
          onClose={toggleDialog} 
          maxWidth="md" 
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
            fontWeight: 600
          }}>
            {editIndex !== null ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </DialogTitle>
          <form onSubmit={guardarProducto}>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del producto"
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={categoria}
                      label="Categoría"
                      onChange={(e) => setCategoria(e.target.value)}
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="">
                        <em>Seleccionar categoría</em>
                      </MenuItem>
                      {categorias.map((cat, index) => (
                        <MenuItem key={cat.id || index} value={cat.id || cat}>
                          {cat.name || cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio"
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Proveedor"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="URL de Imagen"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  {imagenUrl && imagenUrl.trim() !== '' && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Vista previa:
                      </Typography>
                      <Box
                        component="img"
                        src={imagenUrl}
                        alt="Vista previa"
                        sx={{
                          maxWidth: 150,
                          maxHeight: 150,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 2,
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e0e0e0',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Imagen no válida
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={toggleDialog}
                startIcon={<CancelIcon />}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  }
                }}
              >
                {editIndex !== null ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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

        {/* Gestor de Categorías */}
        <CategoryManager
          open={openCategoryDialog}
          onClose={() => setOpenCategoryDialog(false)}
          onCategoryChange={handleCategoryChange}
        />
      </Container>
    </Box>
  );
}

export default App;