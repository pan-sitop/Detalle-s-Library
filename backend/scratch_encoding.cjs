const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    const result = await connection.execute("SELECT genero FROM VW_CATALOGO_COMPLETO WHERE genero IS NOT NULL FETCH FIRST 5 ROWS ONLY");
    for(let row of result.rows) {
      console.log(row[0], Buffer.from(row[0]).toString('hex'));
    }
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
