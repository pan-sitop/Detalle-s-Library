// backend/controllers/publicController.js
const oracledb = require('oracledb');

exports.getResenasByLibro = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { id } = req.params;
        const result = await connection.execute(
            `SELECT r.resena_id, p.nombre AS usuario_nombre, p.apellido AS usuario_apellido,
                    r.calificacion, r.comentario 
             FROM RESENA r LEFT JOIN PERSONA p ON r.persona_id = p.persona_id 
             WHERE r.recurso_id = :id ORDER BY r.resena_id DESC`,
            { id: Number(id) }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error DB: ' + error.message });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

exports.crearResena = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id, calificacion, comentario } = req.body;

        // Inyectamos Admin genérico (1) para evitar que FK_CONTROLA_ADMINISTRADOR explote
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(1); END;`);
        await connection.execute(
            `INSERT INTO RESENA (recurso_id, persona_id, calificacion, comentario) 
             VALUES (:recurso_id, :persona_id, :calificacion, :comentario)`,
            { recurso_id: Number(recurso_id), persona_id: Number(persona_id), calificacion: Number(calificacion), comentario: comentario || 'Sin comentario' },
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Reseña creada' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error de base de datos' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/public/prestamos
exports.solicitarPrestamo = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id } = req.body;

        // EL TRUCO: Engañamos al TRG_REGISTRAR_ACCION_ADMIN pasándole un ID de administrador (1)
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(1); END;`);

        // Hacemos el insert. El TRG_DISMINUIR_COPIAS se encargará de restar automáticamente.
        await connection.execute(
            `INSERT INTO PRESTAMO (recurso_id, persona_id, fecha_prestamo, fecha_vencimiento, estado) 
             VALUES (:recurso_id, :persona_id, SYSDATE, SYSDATE + 7, 'ACTIVO')`,
            { recurso_id: Number(recurso_id), persona_id: Number(persona_id) },
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Préstamo solicitado exitosamente' });
    } catch (error) {
        console.error("🔴 ERROR SOLICITAR:", error.message);
        res.status(500).json({ message: error.message || 'Error al solicitar préstamo' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// PUT /api/public/prestamos/devolver
exports.devolverPrestamo = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id } = req.body;

        // Inyectamos Admin genérico para el trigger
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(1); END;`);

        const updatePrestamo = await connection.execute(
            `UPDATE PRESTAMO SET estado = 'Devuelto', fecha_vencimiento = SYSDATE 
             WHERE recurso_id = :recurso_id AND persona_id = :persona_id AND estado = 'ACTIVO'`,
            { recurso_id: Number(recurso_id), persona_id: Number(persona_id) },
            { autoCommit: true }
        );

        if (updatePrestamo.rowsAffected === 0) {
            return res.status(400).json({ message: 'No tienes un préstamo activo de este libro' });
        }

        res.status(200).json({ success: true, message: 'Libro devuelto. ¡Gracias!' });
    } catch (error) {
        console.error("🔴 ERROR DEVOLVER:", error.message);
        res.status(500).json({ message: error.message || 'Error al devolver el libro' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};
// POST /api/public/reservas
exports.crearReserva = async (req, res) => {
    let connection;
    try {
        const recurso_id = Number(req.body.recurso_id);
        const persona_id = Number(req.body.persona_id);

        if (!recurso_id || isNaN(recurso_id) || !persona_id || isNaN(persona_id)) {
            return res.status(400).json({ message: 'Datos incompletos o ID inválido (NaN)' });
        }

        connection = await oracledb.getConnection();

        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(1); END;`);

        await connection.execute(
            `BEGIN sp_crear_reserva(:p_persona_id, :p_recurso_id); END;`,
            { p_persona_id: persona_id, p_recurso_id: recurso_id },
            { autoCommit: true }
        );

        res.status(201).json({ success: true, message: '¡Reserva exitosa! Estás en la fila de espera.' });
    } catch (error) {
        console.error("🔴 ERROR RESERVAR:", error.message);
        res.status(500).json({ message: error.message || 'Error al intentar reservar en DB' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};