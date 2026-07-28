// backend/controllers/adminController.js
const oracledb = require('oracledb');

// =======================================================
// ESTADÍSTICAS Y PANEL DE ADMINISTRADOR
// =======================================================

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const librosResult = await connection.execute('SELECT COUNT(*) AS total FROM RECURSO_DIGITAL');
        const prestamosResult = await connection.execute("SELECT COUNT(*) AS total FROM PRESTAMO WHERE estado = 'ACTIVO'");
        const resenasResult = await connection.execute('SELECT COUNT(*) AS total FROM RESENA');
        // Llamada a la FUNCIÓN DE ORACLE fn_promedio_calificacion para toda la biblioteca (adaptada)
        const promedioResult = await connection.execute('SELECT NVL(ROUND(AVG(calificacion), 1), 0) AS promedio FROM RESENA');
        
        // Gráfico de actividad: Préstamos por semana del mes actual
        const chartResult = await connection.execute(`
            SELECT TO_CHAR(fecha_prestamo, 'W') as semana, COUNT(*) as prestamos
            FROM PRESTAMO 
            WHERE EXTRACT(MONTH FROM fecha_prestamo) = EXTRACT(MONTH FROM SYSDATE)
              AND EXTRACT(YEAR FROM fecha_prestamo) = EXTRACT(YEAR FROM SYSDATE)
            GROUP BY TO_CHAR(fecha_prestamo, 'W')
            ORDER BY semana
        `);

        res.json({
            totalLibros: librosResult.rows[0]?.TOTAL || 0,
            prestamosActivos: prestamosResult.rows[0]?.TOTAL || 0,
            totalResenas: resenasResult.rows[0]?.TOTAL || 0,
            calificacionPromedio: promedioResult.rows[0]?.PROMEDIO || 0,
            chartData: chartResult.rows.map(row => ({
                semana: row.SEMANA || row.semana,
                prestamos: row.PRESTAMOS || row.prestamos
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/libros
exports.getLibros = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT recurso_id AS libro_id, titulo, isbn, tipo AS formato, idioma, 
                    anio_publicacion, copias_disponibles, editorial_id
             FROM RECURSO_DIGITAL
             ORDER BY recurso_id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener libros' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/libros/search
exports.searchLibros = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const q = `%${(req.query.q || '').toLowerCase()}%`;
        const result = await connection.execute(
            `SELECT recurso_id AS libro_id, titulo, isbn FROM RECURSO_DIGITAL
             WHERE LOWER(titulo) LIKE :q OR LOWER(isbn) LIKE :q`,
            { q }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar libros' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/libros
exports.createLibro = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { titulo, isbn, formato, idioma, anio_publicacion, copias_disponibles, editorial_id, admin_id } = req.body;
        let tipoFormateado = (formato || 'LIBRO').toUpperCase();
        if (tipoFormateado === 'PDF' || tipoFormateado === 'EPUB') tipoFormateado = 'LIBRO'; 

        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id || 1 }, { autoCommit: false });

        const result = await connection.execute(
            `INSERT INTO RECURSO_DIGITAL 
             (titulo, isbn, tipo, idioma, anio_publicacion, copias_disponibles, editorial_id, num_paginas)
             VALUES (:titulo, :isbn, :formato, :idioma, :anio, :copias, :editorial_id, :num_paginas)
             RETURNING recurso_id INTO :id`,
            {
                titulo, isbn, formato: tipoFormateado, idioma: idioma || 'Español',
                anio: anio_publicacion, copias: copias_disponibles, editorial_id, num_paginas: 1, 
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );
        
        await connection.commit();
        res.status(201).json({ libro_id: result.outBinds.id[0], message: 'Recurso creado' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: error.message || 'Error al crear recurso' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// PUT /api/admin/libros/:id
exports.updateLibro = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { titulo, isbn, formato, idioma, anio_publicacion, copias_disponibles, editorial_id, admin_id } = req.body;
        let tipoFormateado = (formato || 'LIBRO').toUpperCase();
        if (tipoFormateado === 'PDF' || tipoFormateado === 'EPUB') tipoFormateado = 'LIBRO'; 

        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id || 1 }, { autoCommit: false });
        await connection.execute(
            `UPDATE RECURSO_DIGITAL SET titulo=:titulo, isbn=:isbn, tipo=:formato, idioma=:idioma,
             anio_publicacion=:anio, copias_disponibles=:copias, editorial_id=:editorial_id WHERE recurso_id=:id`,
            { titulo, isbn, formato: tipoFormateado, idioma: idioma || 'Español', anio: anio_publicacion, copias: copias_disponibles, editorial_id, id: Number(req.params.id) },
            { autoCommit: true }
        );
        res.json({ message: 'Recurso actualizado' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al actualizar' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// DELETE /api/admin/libros/:id
exports.deleteLibro = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const admin_id = req.body.admin_id || req.query.admin_id || 1;
        const id = Number(req.params.id);
        
        await connection.execute(`
            BEGIN 
                PKG_SESION.SET_ADMIN(:adminId);
                
                -- Limpiar dependencias con las tablas correctas
                DELETE FROM CLASIFICADO_EN WHERE recurso_id = :id;
                DELETE FROM ESCRIBE WHERE recurso_id = :id;
                DELETE FROM CONTIENE WHERE recurso_id = :id;
                DELETE FROM RESENA WHERE recurso_id = :id;
                DELETE FROM CONTROLA WHERE recurso_id = :id;
                
                -- Finalmente borrar el recurso
                DELETE FROM RECURSO_DIGITAL WHERE recurso_id = :id;
            END;
        `, { adminId: admin_id, id }, { autoCommit: true });
        res.json({ message: 'Recurso eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al eliminar' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/editoriales
exports.getEditoriales = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT editorial_id, nombre FROM EDITORIAL ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener editoriales' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/prestamos
exports.getPrestamos = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT p.prestamo_id, p.recurso_id, p.persona_id, rd.titulo AS libro, per.email AS usuario,
                    TO_CHAR(p.fecha_prestamo, 'YYYY-MM-DD') AS fecha_prestamo,
                    TO_CHAR(p.fecha_vencimiento, 'YYYY-MM-DD') AS fecha_vencimiento, p.estado
             FROM PRESTAMO p
             JOIN RECURSO_DIGITAL rd ON p.recurso_id = rd.recurso_id
             JOIN PERSONA per ON p.persona_id = per.persona_id ORDER BY p.fecha_prestamo DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener préstamos' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// PUT /api/admin/prestamos/:id/estado
exports.updatePrestamo = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const admin_id = req.body.admin_id || req.query.admin_id || 1;
        const estadoFinal = (req.body.estado || '').toUpperCase();
        
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id }, { autoCommit: false });
        await connection.execute('UPDATE PRESTAMO SET estado = :estado WHERE prestamo_id = :id', { estado: estadoFinal, id: Number(req.params.id) }, { autoCommit: false });
        await connection.commit();
        res.json({ message: 'Préstamo actualizado' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: 'Error al actualizar préstamo' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/reservas
exports.getReservas = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT r.reserva_id, rd.titulo AS libro, per.email AS usuario,
                    TO_CHAR(r.fecha_reserva, 'YYYY-MM-DD') AS fecha_reserva, r.estado
             FROM RESERVA r JOIN RECURSO_DIGITAL rd ON r.recurso_id = rd.recurso_id
             JOIN PERSONA per ON r.persona_id = per.persona_id ORDER BY r.fecha_reserva DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reservas' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// PUT /api/admin/reservas/:id/estado
exports.updateReserva = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const admin_id = req.body.admin_id || req.query.admin_id || 1;
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id }, { autoCommit: false });
        await connection.execute('UPDATE RESERVA SET estado = :estado WHERE reserva_id = :id', { estado: req.body.estado, id: Number(req.params.id) }, { autoCommit: false });
        await connection.commit();
        res.json({ message: 'Reserva actualizada' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: 'Error al actualizar reserva' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// DELETE /api/admin/reservas/:id
exports.deleteReserva = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const admin_id = req.body.admin_id || req.query.admin_id || 1;
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id }, { autoCommit: false });
        await connection.execute('DELETE FROM RESERVA WHERE reserva_id = :id', { id: Number(req.params.id) }, { autoCommit: false });
        await connection.commit();
        res.json({ message: 'Reserva cancelada' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: 'Error al cancelar reserva' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/resenas
exports.getResenas = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT r.resena_id, 
                    NVL(rd.titulo, 'Recurso Eliminado') AS libro, 
                    NVL(per.email, 'Usuario ' || r.persona_id) AS usuario,
                    r.calificacion, 
                    r.comentario
             FROM RESENA r
             LEFT JOIN RECURSO_DIGITAL rd ON r.recurso_id = rd.recurso_id
             LEFT JOIN PERSONA per ON r.persona_id = per.persona_id
             ORDER BY r.resena_id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno de DB: ' + error.message });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// DELETE /api/admin/resenas/:id
exports.deleteResena = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const admin_id = req.body.admin_id || req.query.admin_id || 1;
        await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:adminId); END;`, { adminId: admin_id }, { autoCommit: false });
        await connection.execute('DELETE FROM RESENA WHERE resena_id = :id', { id: Number(req.params.id) }, { autoCommit: false });
        await connection.commit();
        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: 'Error al eliminar reseña' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/auditoria
exports.getAuditoria = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT c.controla_id AS control_id, c.tipo,
                    TO_CHAR(c.fecha_control, 'YYYY-MM-DD HH24:MI') AS fecha_control,
                    per.nombre || ' ' || per.apellido AS admin, rd.titulo AS libro
             FROM CONTROLA c JOIN PERSONA per ON c.persona_id = per.persona_id
             LEFT JOIN RECURSO_DIGITAL rd ON c.recurso_id = rd.recurso_id ORDER BY c.fecha_control DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener auditoría' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/recursos (Llamando VISTA VW_RECURSOS_MAS_PRESTADOS)
exports.getRecursosMasPrestados = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT * FROM VW_RECURSOS_MAS_PRESTADOS');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recursos' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/usuarios (Llamando VISTA VW_USUARIOS_MOROSOS)
exports.getUsuariosMorosos = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const query = `
            SELECT p.persona_id, p.nombre, p.apellido, p.email, u.estado_cuenta,
                   b.motivo, b.fecha_fin
            FROM PERSONA p
            JOIN USUARIO u ON p.persona_id = u.persona_id
            LEFT JOIN (
                SELECT persona_id, motivo, fecha_fin 
                FROM BLOQUEO 
                WHERE fecha_fin > SYSDATE
            ) b ON b.persona_id = p.persona_id
            WHERE p.persona_id NOT IN (SELECT persona_id FROM ADMINISTRADOR)
        `;
        const result = await connection.execute(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/usuarios/:id/suspender
exports.suspenderUsuario = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { dias, motivo } = req.body;
        const personaId = Number(req.params.id);
        
        // 1. Conseguir el nuevo bloqueo_id
        const idResult = await connection.execute('SELECT NVL(MAX(bloqueo_id),0)+1 as new_id FROM BLOQUEO');
        const bloqueoId = idResult.rows[0]?.NEW_ID || idResult.rows[0]?.new_id || 1;
        
        // 2. Insertar el bloqueo (El trigger TRG_ESTADO_BLOQUEADO pondrá estado='BLOQUEADO')
        await connection.execute(`
            INSERT INTO BLOQUEO (persona_id, bloqueo_id, motivo, tipo_bloqueo, fecha_inicio, fecha_fin)
            VALUES (:personaId, :bloqueoId, :motivo, 'TEMPORAL', SYSDATE, SYSDATE + :dias)
        `, { personaId, bloqueoId, motivo, dias }, { autoCommit: true });
        
        // 3. Forzar el estado a SUSPENDIDO también por si acaso
        await connection.execute(`UPDATE USUARIO SET estado_cuenta = 'SUSPENDIDO' WHERE persona_id = :personaId`, { personaId }, { autoCommit: true });

        res.json({ message: 'Usuario suspendido' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al suspender' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/usuarios/:id/levantar
exports.levantarSuspension = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const personaId = Number(req.params.id);
        
        // Poner la fecha fin del bloqueo activo a ahora mismo
        await connection.execute(`UPDATE BLOQUEO SET fecha_fin = SYSDATE WHERE persona_id = :personaId AND fecha_fin > SYSDATE`, { personaId }, { autoCommit: true });
        // Cambiar estado a activo
        await connection.execute(`UPDATE USUARIO SET estado_cuenta = 'ACTIVO' WHERE persona_id = :personaId`, { personaId }, { autoCommit: true });

        res.json({ message: 'Suspensión levantada' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al levantar suspensión' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// =======================================================
// RUTAS DE LISTAS DE LECTURA (Implementadas con PROCEDIMIENTOS DE ORACLE)
// =======================================================

// GET /api/admin/listas/:userId
exports.getListasByUser = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT lista_id, nombre_lista, TO_CHAR(fecha_creacion, 'YYYY-MM-DD') AS fecha_creacion, total_recursos AS total_libros
             FROM VW_LISTAS_LECTURA_DETALLE WHERE persona_id = :userId ORDER BY fecha_creacion DESC`,
            { userId: Number(req.params.userId) }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener listas' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/listas (Llamando Procedimiento sp_crear_lista_lectura)
exports.createLista = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const uid = req.body.usuario_id || req.body.persona_id; 
        const { nombre_lista } = req.body;
        
        // Ejecución de SP de Oracle
        await connection.execute(
            `BEGIN sp_crear_lista_lectura(:p_persona_id, :p_nombre_lista); END;`, 
            { p_persona_id: uid, p_nombre_lista: nombre_lista }, 
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Lista creada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al crear lista' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/listas/:listaId/libros
exports.getLibrosEnLista = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT c.recurso_id AS libro_id, rd.titulo, rd.isbn, rd.tipo AS formato, 
                    rd.copias_disponibles, 
                    TO_CHAR(c.fecha_agregado, 'YYYY-MM-DD') AS fecha_agregado
             FROM CONTIENE c JOIN RECURSO_DIGITAL rd ON c.recurso_id = rd.recurso_id
             WHERE c.lista_id = :listaId ORDER BY c.fecha_agregado DESC`,
            { listaId: Number(req.params.listaId) }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener libros de la lista' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/listas/:listaId/libros (Llamando Procedimiento sp_agregar_recurso_lista)
exports.addLibroToLista = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const listaId = Number(req.params.listaId);
        const recursoId = Number(req.body.recurso_id);
        
        // Ejecución de SP de Oracle
        await connection.execute(
            `BEGIN sp_agregar_recurso_lista(:p_recurso_id, :p_lista_id); END;`, 
            { p_recurso_id: recursoId, p_lista_id: listaId }, 
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Recurso agregado a la lista' });
    } catch (error) {
        if (error.errorNum === 1) return res.status(400).json({ message: 'Este libro ya está en tu lista' });
        res.status(500).json({ message: error.message || 'Error al agregar a la lista' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// DELETE /api/admin/listas/:listaId/libros/:recursoId
exports.removeLibroFromLista = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const listaId = Number(req.params.listaId);
        const recursoId = Number(req.params.recursoId);

        await connection.execute(
            `DELETE FROM CONTIENE WHERE lista_id = :listaId AND recurso_id = :recursoId`,
            { listaId, recursoId },
            { autoCommit: true } 
        );
        res.json({ success: true, message: 'Libro eliminado de la lista' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error al eliminar de la lista' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// =======================================================
// RUTAS PÚBLICAS Y DE INTERACCIÓN DEL USUARIO 
// (Implementadas 100% con PROCEDIMIENTOS ALMACENADOS DE ORACLE)
// =======================================================

// Función auxiliar para el bypass de triggers de auditoría
async function getValidAdminId(connection) {
    const adminQuery = await connection.execute(`SELECT MIN(persona_id) AS admin_id FROM ADMINISTRADOR`);
    return adminQuery.rows[0]?.ADMIN_ID || null;
}

// GET /api/admin/libros/:id
exports.getLibroById = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT rd.recurso_id AS libro_id, rd.titulo, rd.isbn, rd.tipo AS formato, rd.idioma, 
                    rd.anio_publicacion, rd.copias_disponibles, rd.editorial_id, rd.sinopsis,
                    e.nombre AS editorial_nombre
             FROM RECURSO_DIGITAL rd
             LEFT JOIN EDITORIAL e ON rd.editorial_id = e.editorial_id
             WHERE rd.recurso_id = :id`,
            { id: Number(req.params.id) }
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Libro no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error interno de DB' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/libros/:id/resenas
exports.getResenasPublicas = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            `SELECT r.resena_id, p.nombre AS usuario_nombre, p.apellido AS usuario_apellido,
                    r.calificacion, r.comentario 
             FROM RESENA r 
             LEFT JOIN PERSONA p ON r.persona_id = p.persona_id 
             WHERE r.recurso_id = :id ORDER BY r.resena_id DESC`,
            { id: Number(req.params.id) }
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reseñas' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/resenas/public (Llamando Procedimiento sp_registrar_resena)
exports.crearResenaPublica = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id, calificacion, comentario } = req.body;

        // Ejecución de SP de Oracle (Maneja la inserción y valida duplicados con fn_existe_resena)
        await connection.execute(
            `BEGIN sp_registrar_resena(:p_persona_id, :p_recurso_id, :p_calificacion, :p_comentario); END;`,
            { 
                p_persona_id: Number(persona_id), 
                p_recurso_id: Number(recurso_id), 
                p_calificacion: Number(calificacion), 
                p_comentario: comentario || 'Sin comentario' 
            },
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Reseña procesada por la Base de Datos.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error de lógica en la base de datos.' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/prestamos/solicitar (Llamando Procedimiento sp_registrar_prestamo)
exports.solicitarPrestamoPublico = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id } = req.body;

        // Inyectamos Admin para evitar la restricción del trigger de auditoría al restar copias
        const validAdminId = await getValidAdminId(connection);
        if (validAdminId) {
            await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:id); END;`, { id: validAdminId }, { autoCommit: false });
        }
        
        // Ejecución de SP de Oracle (Establecemos 7 días como política de préstamo)
        // El SP verificará stock y trg_disminuir_copias hará la resta.
        await connection.execute(
            `BEGIN sp_registrar_prestamo(:p_persona_id, :p_recurso_id, 7); END;`,
            { p_persona_id: Number(persona_id), p_recurso_id: Number(recurso_id) },
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: 'Préstamo gestionado por Oracle DB.' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: error.message || 'Error al solicitar préstamo en DB' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// PUT /api/admin/prestamos/devolver (Llamando Procedimiento sp_registrar_devolucion)
exports.devolverPrestamoPublico = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id } = req.body;

        // 1. Buscamos el ID del préstamo ACTIVO de este usuario para este libro específico
        const prestamoActivo = await connection.execute(
            `SELECT prestamo_id FROM PRESTAMO 
             WHERE recurso_id = :recurso_id AND persona_id = :persona_id AND estado = 'ACTIVO'`,
            { recurso_id: Number(recurso_id), persona_id: Number(persona_id) }
        );

        if (prestamoActivo.rows.length === 0) {
            return res.status(400).json({ message: 'No tienes un préstamo activo de este libro' });
        }
        
        const prestamoId = prestamoActivo.rows[0].PRESTAMO_ID || prestamoActivo.rows[0].prestamo_id;

        // 2. Inyectamos Admin para la auditoría (ya que el trigger aumentará el stock)
        const validAdminId = await getValidAdminId(connection);
        if (validAdminId) {
            await connection.execute(`BEGIN PKG_SESION.SET_ADMIN(:id); END;`, { id: validAdminId }, { autoCommit: false });
        }

        // 3. Ejecución de SP de Oracle
        // El SP cambia el estado a DEVUELTO. trg_aumentar_copias hace el +1, y trg_bloquear_usuario_retraso evalúa la multa.
        await connection.execute(
            `BEGIN sp_registrar_devolucion(:p_prestamo_id); END;`,
            { p_prestamo_id: prestamoId },
            { autoCommit: true }
        );

        res.status(200).json({ success: true, message: 'Libro devuelto, procesado por Stored Procedure.' });
    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        res.status(500).json({ message: error.message || 'Error al devolver el libro en BD' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// GET /api/admin/libros/proximamente
exports.getProximamente = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        // Usamos los libros con 0 copias para simular la cartelera de "Próximamente"
        const result = await connection.execute(
            `SELECT rd.recurso_id AS libro_id, rd.titulo, rd.isbn, rd.tipo AS formato, 
                    e.nombre AS editorial_nombre
             FROM RECURSO_DIGITAL rd
             LEFT JOIN EDITORIAL e ON rd.editorial_id = e.editorial_id
             WHERE rd.copias_disponibles = 0`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener próximos lanzamientos' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/reservas/public (Llamando al SP de Oracle para Reservas)
exports.crearReservaPublica = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { recurso_id, persona_id } = req.body;

        // Ejecutamos tu Procedimiento Almacenado
        // Él se encargará de validar si el stock es 0 e insertará en RESERVA
        await connection.execute(
            `BEGIN sp_crear_reserva(:p_persona_id, :p_recurso_id); END;`,
            { p_persona_id: Number(persona_id), p_recurso_id: Number(recurso_id) },
            { autoCommit: true }
        );
        res.status(201).json({ success: true, message: '¡Reserva exitosa! Estás en la fila de espera.' });
    } catch (error) {
        // Capturamos el error si el trigger trg_reserva_duplicada salta
        res.status(500).json({ message: error.message || 'Error al intentar reservar' });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};

// POST /api/admin/sql-runner
exports.ejecutarSQL = async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'La consulta no puede estar vacía.' });
        }

        // Ejecutamos la consulta. Oracle devolverá metaData (nombre de columnas) y rows (datos)
        const result = await connection.execute(query);

        // Si es un INSERT, UPDATE o DELETE, hacemos commit y devolvemos filas afectadas
        const esModificacion = !query.trim().toUpperCase().startsWith('SELECT');
        if (esModificacion) {
            await connection.commit();
            return res.json({ 
                tipo: 'dml', 
                message: `Operación ejecutada. Filas afectadas: ${result.rowsAffected || 0}` 
            });
        }

        // Si es un SELECT, devolvemos las columnas y los datos
        res.json({ 
            tipo: 'select',
            metaData: result.metaData.map(col => col.name), // Extraemos solo los nombres de columna
            rows: result.rows 
        });

    } catch (error) {
        if (connection) try { await connection.rollback(); } catch(e) {}
        // Devolvemos el error exacto de Oracle para que se vea en la consola
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch(e) {}
    }
};