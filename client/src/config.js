// Configuración del sistema TechSalle
export const CONFIG = {
  // URLs de la API
  API_BASE_URL: 'http://localhost:5000',
  
  // Endpoints
  ENDPOINTS: {
    PRODUCTOS: '/productos',
    CATEGORIAS: '/categorias',
    ESTADISTICAS: '/estadisticas'
  },
  
  // Configuración de la aplicación
  APP: {
    NOMBRE: 'TechSalle',
    DESCRIPCION: 'Gestión de productos tecnológicos - CRUD completo',
    VERSION: '2.0.0',
    AUTHOR: 'Sistema de Inventario Tecnológico'
  },
  
  // Configuración de la base de datos
  DB: {
    NOMBRE: 'techsalle',
    TABLA: 'productos'
  },
  
  // Configuración de la interfaz
  UI: {
    THEME: 'modern',
    PRIMARY_COLOR: '#667eea',
    SECONDARY_COLOR: '#764ba2'
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  return `${CONFIG.API_BASE_URL}${endpoint}`;
};

// Función helper para obtener la URL completa de un endpoint
export const getApiUrl = (endpointName) => {
  return buildApiUrl(CONFIG.ENDPOINTS[endpointName]);
};

