const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

router.get('/stats', admin.getStats);
router.get('/libros', admin.getLibros);
router.get('/libros/search', admin.searchLibros);
router.post('/libros', admin.createLibro);
router.put('/libros/:id', admin.updateLibro);
router.delete('/libros/:id', admin.deleteLibro);
router.get('/editoriales', admin.getEditoriales);
router.get('/prestamos', admin.getPrestamos);
router.put('/prestamos/:id/estado', admin.updatePrestamo);
router.get('/reservas', admin.getReservas);
router.put('/reservas/:id/estado', admin.updateReserva);
router.delete('/reservas/:id', admin.deleteReserva);
router.get('/resenas', admin.getResenas);
router.delete('/resenas/:id', admin.deleteResena);
router.get('/auditoria', admin.getAuditoria);
router.get('/recursos', admin.getRecursosMasPrestados);
router.get('/usuarios', admin.getUsuariosMorosos);
router.post('/usuarios/:id/suspender', admin.suspenderUsuario);
router.post('/usuarios/:id/levantar', admin.levantarSuspension);

// RUTAS DE LISTAS DE LECTURA (Incluida la cruz de eliminar)
router.get('/listas/:userId', admin.getListasByUser);
router.post('/listas', admin.createLista);
router.get('/listas/:listaId/libros', admin.getLibrosEnLista);
router.post('/listas/:listaId/libros', admin.addLibroToLista);
router.delete('/listas/:listaId/libros/:recursoId', admin.removeLibroFromLista);

// RUTAS PÚBLICAS Y DE PRÉSTAMOS
router.get('/libros/:id', admin.getLibroById);
router.get('/libros/:id/resenas', admin.getResenasPublicas);
router.post('/resenas/public', admin.crearResenaPublica);
router.post('/prestamos/solicitar', admin.solicitarPrestamoPublico);
router.put('/prestamos/devolver', admin.devolverPrestamoPublico);

// --- RUTAS DE "PRÓXIMAMENTE" Y RESERVAS ---
router.get('/libros/proximamente/lista', admin.getProximamente);
router.post('/reservas/public', admin.crearReservaPublica);

// --- RUTAS DE CONSOLA SQL ---
// Corregido: Usamos 'admin.ejecutarSQL' en lugar de 'adminController.ejecutarSQL'
router.post('/sql-runner', admin.ejecutarSQL);

module.exports = router;