// backend/config/db.js
const oracledb = require('oracledb');

// Forzar el formato de salida como objetos JS (no arrays)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Habilitar autoCommit por defecto para operaciones simples
oracledb.autoCommit = true;

// 🟢 SOLUCIÓN AL ERROR CIRCULAR: Forzar a Oracle a devolver los CLOB como texto normal (Strings)
oracledb.fetchAsString = [oracledb.CLOB];

/**
 * Inicializa el pool de conexiones a Oracle.
 * Se invoca una sola vez al arrancar el servidor.
 */
async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('✅ Pool de conexiones a Oracle creado exitosamente');
  } catch (err) {
    console.error('❌ Error al crear el pool de conexiones:', err.message);
    throw err;
  }
}

/**
 * Cierra el pool de conexiones de forma ordenada.
 * Se invoca al apagar el servidor.
 */
async function close() {
  try {
    await oracledb.getPool().close(2); // 2 segundos de drain
    console.log('🔌 Pool de conexiones cerrado');
  } catch (err) {
    console.error('Error al cerrar el pool:', err.message);
  }
}

/**
 * Obtiene una conexión del pool.
 * IMPORTANTE: siempre liberar la conexión con connection.close() en un bloque finally.
 */
async function getConnection() {
  return oracledb.getPool().getConnection();
}

module.exports = { initialize, close, getConnection };