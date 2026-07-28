const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Préstamos
router.post('/prestamos', publicController.solicitarPrestamo);
router.put('/prestamos/devolver', publicController.devolverPrestamo);

// Reseñas
router.post('/resenas', publicController.crearResena);
router.get('/libros/:id/resenas', publicController.getResenasByLibro);
router.post('/reservas', publicController.crearReserva);

// Chatbot
const chatController = require('../controllers/chatController');
router.post('/chat', chatController.chat);

module.exports = router;