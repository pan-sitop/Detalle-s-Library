const oracledb = require('oracledb');
async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'biblioteca',
      password: 'biblioteca123',
      connectString: 'localhost:1521/XE'
    });
    const res1 = await connection.execute("SELECT dbms_metadata.get_ddl('TABLE', 'USUARIO') as ddl FROM dual");
    console.log(await res1.rows[0][0].getData());
    const res2 = await connection.execute("SELECT dbms_metadata.get_ddl('TABLE', 'BLOQUEO') as ddl FROM dual");
    console.log(await res2.rows[0][0].getData());
  } catch(e) { console.error(e); }
  finally { if(connection) await connection.close(); }
}
run();
