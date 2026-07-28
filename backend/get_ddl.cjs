const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    const result = await connection.execute("SELECT dbms_metadata.get_ddl('TABLE', 'CONTROLA') as ddl FROM dual");
    console.log(result.rows[0].DDL);
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
