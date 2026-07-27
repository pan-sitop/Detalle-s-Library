import { useState, useMemo } from 'react';
import DataTable from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';
import { useApi } from '../../hooks/useApi';
import { auditoriaService } from '../../services/api';

const filtros = ['Todos', 'CREAR', 'MODIFICAR', 'ELIMINAR', 'APROBAR'];

export default function AdminAuditoria() {
  const { data: registros, loading } = useApi(auditoriaService.getAll, []);
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const registrosFiltrados = useMemo(() => {
    if (!registros) return [];
    if (filtroActivo === 'Todos') return registros;
    
    // Filtramos directamente por la columna TIPO que nos reveló el JSON
    return registros.filter((r) => (r.TIPO || r.tipo) === filtroActivo);
  }, [registros, filtroActivo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Historial de auditoría</h1>
        <p className="text-muted text-sm mt-1">CONTROLA — acciones de administradores sobre libros</p>
      </div>

      <div className="flex gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltroActivo(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
            ${filtroActivo === f
              ? 'bg-brand-gradient text-white border-transparent'
              : 'text-muted border-border hover:text-white hover:bg-bg-hover'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Cargando historial...</div>
      ) : (
        <DataTable
        columns={['Acción', 'Fecha', 'Administrador', 'Libro afectado']}
        data={registrosFiltrados}
        renderRow={(a) => {
          const tipoAccion = a.TIPO || a.tipo || '';
          
          return (
            <>
              <td className="px-5 py-3 text-white font-medium">
                <div className="flex items-center gap-2">
                  {tipoAccion || '—'}
                </div>
              </td>
              <td className="px-5 py-3 text-slate-400">{a.FECHA_CONTROL || a.fecha_control || '—'}</td>
              <td className="px-5 py-3 text-slate-400">{a.ADMIN || a.admin || '—'}</td>
              <td className="px-5 py-3 text-slate-400 text-sm italic">
                {a.LIBRO || a.libro || '—'}
              </td>
            </>
          );
        }}
      />
      )}
    </div>
  );
}