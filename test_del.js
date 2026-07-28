const { prestamoService, libroService } = require('./src/services/api.js');
// Wait, I am running this in node. I can just do a fetch.
async function run() {
  try {
     const res = await fetch('http://localhost:3000/api/admin/libros/107?admin_id=1', { method: 'DELETE' });
     const data = await res.json();
     console.log(data);
  } catch(e) { console.error(e); }
}
run();
