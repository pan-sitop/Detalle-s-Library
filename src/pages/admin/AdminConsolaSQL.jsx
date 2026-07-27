import { useState } from 'react';
import { Terminal, Play, AlertCircle } from 'lucide-react';

export default function AdminConsolaSQL() {
  const [query, setQuery] = useState('SELECT * FROM RECURSO_DIGITAL');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ejecutarConsulta = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const response = await fetch('http://localhost:3000/api/admin/sql-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al ejecutar la consulta');
      }

      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-8 h-8 text-green-500" />
        <h1 className="font-serif text-3xl font-bold text-white">Consola SQL de Oracle</h1>
      </div>

      {/* Área de Entrada de SQL */}
      <div className="bg-slate-900 rounded-xl border border-white/10 p-4 mb-6">
        <label className="block text-slate-400 text-sm mb-2 font-medium">Ingresa tu consulta SQL:</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-32 bg-slate-950 text-green-400 font-mono p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-green-500 transition-colors resize-y"
          placeholder="SELECT * FROM USUARIO..."
          spellCheck="false"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={ejecutarConsulta}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Ejecutando...' : 'Ejecutar Consulta'}
          </button>
        </div>
      </div>

      {/* Manejo de Errores */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="text-red-400 font-mono text-sm break-all">{error}</div>
        </div>
      )}

      {/* Área de Resultados */}
      {resultado && (
        <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-white font-medium">Resultados</h3>
            {resultado.tipo === 'select' && (
              <span className="text-sm text-slate-400">{resultado.rows?.length || 0} filas devueltas</span>
            )}
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            {resultado.tipo === 'dml' ? (
              <div className="p-6 text-green-400 font-mono text-center">
                {resultado.message}
              </div>
            ) : resultado.rows?.length === 0 ? (
              <div className="p-6 text-slate-500 text-center">
                La consulta no devolvió resultados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 text-purple-400 border-b border-white/10">
                    {resultado.metaData?.map((colName, index) => (
                      <th key={index} className="p-3 font-medium uppercase tracking-wider whitespace-nowrap">
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-300 font-mono">
                  {resultado.rows?.map((fila, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      {/* Como usamos OUT_FORMAT_OBJECT, iteramos sobre las keys (que son las columnas) */}
                      {resultado.metaData?.map((colName, colIndex) => (
                        <td key={colIndex} className="p-3 whitespace-nowrap">
                          {fila[colName] !== null ? String(fila[colName]) : <span className="text-slate-600 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}