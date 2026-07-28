const oracledb = require('oracledb');

exports.login = async (req, res) => {
    const { email, contrasena } = req.body;
    let connection;

    try {
        connection = await oracledb.getConnection();

        // 1. Buscar al usuario usando Bind Variables (:email) para prevenir SQL Injection
        // Nota: El driver de Oracle devuelve las llaves del JSON en MAYÚSCULAS por defecto
        const userQuery = `
            SELECT p.persona_id, p.nombre, p.apellido, p.contrasena, u.estado_cuenta 
            FROM PERSONA p
            JOIN USUARIO u ON p.persona_id = u.persona_id
            WHERE p.email = :email
        `;
        
        const result = await connection.execute(userQuery, { email: email.toLowerCase() });

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        // 2. Validar si la cuenta fue bloqueada por los triggers
        if (user.ESTADO_CUENTA === 'BLOQUEADO' || user.ESTADO_CUENTA === 'SUSPENDIDO') {
            const bloqueoQuery = `SELECT motivo FROM BLOQUEO WHERE persona_id = :id AND fecha_fin > SYSDATE ORDER BY fecha_inicio DESC FETCH FIRST 1 ROWS ONLY`;
            const bloqueoResult = await connection.execute(bloqueoQuery, { id: user.PERSONA_ID });
            const motivo = bloqueoResult.rows.length > 0 ? (bloqueoResult.rows[0].MOTIVO || bloqueoResult.rows[0].motivo) : 'Bloqueo administrativo.';
            
            return res.status(403).json({ 
                success: false, 
                message: 'Acceso denegado: La cuenta está suspendida.',
                suspendido: true,
                motivo: motivo
            });
        }

        // 3. Validación de contraseña en texto plano (por requisito académico)
        if (user.CONTRASENA !== contrasena) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        // 4. Verificar si la persona existe en la tabla ADMINISTRADOR
        const adminQuery = `SELECT cargo, nivel_acceso FROM ADMINISTRADOR WHERE persona_id = :id`;
        const adminResult = await connection.execute(adminQuery, { id: user.PERSONA_ID });

        const isAdmin = adminResult.rows.length > 0;

        // 5. Construir la respuesta
        const userData = {
            id: user.PERSONA_ID,
            nombre: user.NOMBRE,
            apellido: user.APELLIDO,
            email: email
        };

        if (isAdmin) {
            return res.json({
                success: true,
                rol: 'admin',
                user: { ...userData, cargo: adminResult.rows[0].CARGO }
            });
        } else {
            return res.json({
                success: true,
                rol: 'usuario',
                user: userData
            });
        }

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
};

exports.register = async (req, res) => {
    const { nombre, apellido, email, contrasena } = req.body;
    let connection;

    // Validación básica
    if (!nombre || !apellido || !email || !contrasena) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos (nombre, apellido, email, contrasena)'
        });
    }

    try {
        connection = await oracledb.getConnection();

        // Ejecutar el procedimiento almacenado sp_registrar_usuario
        // usando Bind Variables para prevenir SQL Injection
        const result = await connection.execute(
            `BEGIN sp_registrar_usuario(:nombre, :apellido, :email, :contrasena, :persona_id); END;`,
            {
                nombre: nombre,
                apellido: apellido,
                email: email.toLowerCase(),
                contrasena: contrasena,
                persona_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        const personaId = result.outBinds.persona_id;

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: personaId,
                nombre,
                apellido,
                email: email.toLowerCase()
            }
        });

    } catch (error) {
        console.error('Error en el registro:', error);

        // Manejar error de email duplicado (ORA-00001: unique constraint violated)
        if (error.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una cuenta con ese correo electrónico'
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
};