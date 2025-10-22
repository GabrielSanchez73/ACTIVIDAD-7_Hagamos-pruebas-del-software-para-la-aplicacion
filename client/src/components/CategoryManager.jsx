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
  Chip,
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
import { getApiUrl } from '../config';

function CategoryManager({ open, onClose, onCategoryChange }) {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (open) {
      cargarCategorias();
    }
  }, [open]);

  const cargarCategorias = async () => {
    try {
      const response = await fetch(getApiUrl('CATEGORIAS'));
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      mostrarNotificacion('Error al cargar categorías', 'error');
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
    setDescripcion('');
    setEditIndex(null);
  };

  const abrirFormulario = () => {
    limpiarFormulario();
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      mostrarNotificacion('El nombre de la categoría es requerido', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editIndex !== null) {
        // Actualizar categoría existente
        const categoria = categorias[editIndex];
        const response = await fetch(`${getApiUrl('CATEGORIAS')}/${categoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() })
        });

        if (response.ok) {
          const nuevasCategorias = [...categorias];
          nuevasCategorias[editIndex] = { ...categoria, nombre: nombre.trim(), descripcion: descripcion.trim() };
          setCategorias(nuevasCategorias);
          setEditIndex(null);
          mostrarNotificacion('Categoría actualizada correctamente');
        } else {
          const errorData = await response.json();
          mostrarNotificacion(errorData.error || 'Error al actualizar la categoría', 'error');
        }
      } else {
        // Crear nueva categoría
        const response = await fetch(getApiUrl('CATEGORIAS'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() })
        });

        const data = await response.json();
        if (response.ok) {
          setCategorias([...categorias, data]);
          mostrarNotificacion('Categoría creada correctamente');
          onCategoryChange && onCategoryChange();
        } else {
          mostrarNotificacion(data.error || 'Error al crear la categoría', 'error');
        }
      }

      limpiarFormulario();
    } catch (error) {
      mostrarNotificacion('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCategoria = async (idx) => {
    const categoria = categorias[idx];
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl('CATEGORIAS')}/${categoria.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCategorias(categorias.filter((_, i) => i !== idx));
          if (editIndex === idx) {
            setEditIndex(null);
            limpiarFormulario();
          }
          mostrarNotificacion('Categoría eliminada correctamente');
          onCategoryChange && onCategoryChange();
        } else {
          mostrarNotificacion('Error al eliminar la categoría', 'error');
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al eliminar', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const editarCategoria = (idx) => {
    const categoria = categorias[idx];
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion || '');
    setEditIndex(idx);
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
                {editIndex !== null ? 'Editar Categoría' : 'Nueva Categoría'}
              </Typography>
              <form onSubmit={guardarCategoria}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
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
                        {editIndex !== null ? 'Actualizar' : 'Crear'}
                      </Button>
                      {editIndex !== null && (
                        <Button
                          variant="outlined"
                          onClick={limpiarFormulario}
                          startIcon={<CancelIcon />}
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
            Categorías Existentes ({categorias.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
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
                  categorias.map((categoria, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Chip
                          label={categoria.nombre}
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {categoria.descripcion || 'Sin descripción'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Editar categoría">
                            <IconButton
                              color="primary"
                              onClick={() => editarCategoria(idx)}
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
