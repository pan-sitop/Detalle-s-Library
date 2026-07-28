const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    const result = await connection.execute("SELECT table_name FROM user_tables");
    console.log(result.rows);
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
