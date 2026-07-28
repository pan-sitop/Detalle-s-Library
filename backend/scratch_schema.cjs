const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    
    let result = await connection.execute("SELECT column_name FROM user_tab_cols WHERE table_name = 'VW_CATALOGO_COMPLETO'");
    console.log("COLUMNS:", result.rows);
    
    result = await connection.execute("SELECT * FROM VW_CATALOGO_COMPLETO FETCH FIRST 5 ROWS ONLY");
    console.log("DATA:", result.rows);
    
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
