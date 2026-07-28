const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    const result = await connection.execute("SELECT trigger_name, trigger_body FROM user_triggers WHERE table_name = 'RECURSO_DIGITAL'", [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    for (let row of result.rows) {
      console.log('---', row.TRIGGER_NAME, '---');
      console.log(row.TRIGGER_BODY);
    }
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
