// src/services/api.js
const API = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export const libroService = {
  getAll: () => request('/admin/libros'),
  getById: (id) => request(`/admin/libros/${id}`),
  search: (q) => request(`/admin/libros/search?q=${encodeURIComponent(q)}`),
  create: (data) => request('/admin/libros', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/admin/libros/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (queryParam) => request(`/admin/libros/${queryParam}`, { method: 'DELETE' }),
  getProximamente: () => request('/admin/libros/proximamente/lista'),
};

export const editorialService = {
  getAll: () => request('/admin/editoriales'),
};

export const prestamoService = {
  getAll: () => request('/admin/prestamos'),
  updateEstado: (id, estado, params = {}) => request(`/admin/prestamos/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado, ...params }) }),
  solicitar: (data) => request('/admin/prestamos/solicitar', { method: 'POST', body: JSON.stringify(data) }),
  devolver: (data) => request('/admin/prestamos/devolver', { method: 'PUT', body: JSON.stringify(data) }),
};

export const reservaService = {
  getAll: () => request('/admin/reservas'),
  updateEstado: (id, estado, params = {}) => request(`/admin/reservas/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado, ...params }) }),
  remove: (queryParam) => request(`/admin/reservas/${queryParam}`, { method: 'DELETE' }),
  crear: (data) => request('/admin/reservas/public', { method: 'POST', body: JSON.stringify(data) }), // NUEVO
};

export const resenaService = {
  getAll: () => request('/admin/resenas'),
  getByLibro: (libroId) => request(`/admin/libros/${libroId}/resenas`),
  create: (data) => request('/admin/resenas/public', { method: 'POST', body: JSON.stringify(data) }),
  remove: (queryParam) => request(`/admin/resenas/${queryParam}`, { method: 'DELETE' }),
};

export const auditoriaService = {
  getAll: () => request('/admin/auditoria'),
};

export const statsService = {
  getResumen: () => request('/admin/stats'),
  getRecursos: () => request('/admin/recursos'),
};

export const morososService = {
  getAll: () => request('/admin/usuarios'),
  suspender: (id, dias, motivo) => request(`/admin/usuarios/${id}/suspender`, { method: 'POST', body: JSON.stringify({ dias, motivo }) }),
  levantar: (id) => request(`/admin/usuarios/${id}/levantar`, { method: 'POST' }),
};

export const listaService = {
  getByUser: (userId) => request(`/admin/listas/${userId}`),
  create: (data) => request('/admin/listas', { method: 'POST', body: JSON.stringify(data) }),
  getLibros: (listaId) => request(`/admin/listas/${listaId}/libros`),
  addLibro: (listaId, data) => request(`/admin/listas/${listaId}/libros`, { method: 'POST', body: JSON.stringify(data) }),
  // 👇 AQUÍ ESTÁ LA FUNCIÓN PARA QUE LA CRUZ FUNCIONE 👇
  removeLibro: (listaId, recursoId) => request(`/admin/listas/${listaId}/libros/${recursoId}`, { method: 'DELETE' }),
};

export const chatService = {
  sendMessage: (message) => request('/public/chat', { method: 'POST', body: JSON.stringify({ message }) })
};

export const authService = {
  getCurrentAdmin: async () => {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
    return null;
  },
  logout: async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    return true;
  },
};