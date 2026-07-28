import { BookOpen, ClipboardList, Star, MessageSquare, TrendingUp } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import { useApi } from '../../hooks/useApi';
import { statsService } from '../../services/api';

export default function AdminDashboard() {
  const { data: stats, loading: loadingStats } = useApi(statsService.getResumen, []);
  const { data: recursos, loading: loadingRecursos } = useApi(statsService.getRecursos, []);
  
  // Calcular datos del gráfico dinámicamente con los datos de Oracle
  const realChartData = stats?.chartData || [];
  const maxPrestamos = Math.max(...realChartData.map(d => d.prestamos), 1);
  
  const chartData = realChartData.length > 0 ? realChartData.map(data => {
    // Calculamos el porcentaje, asegurando un mínimo para que se vea la barra si es > 0
    const percentage = Math.max(Math.round((data.prestamos / maxPrestamos) * 100), data.prestamos > 0 ? 5 : 0);
    return {
      etiqueta: `Sem ${data.semana}`,
      prestamos: data.prestamos,
      altura: `${percentage}%`
    };
  }) : [
    { etiqueta: 'S1', prestamos: 0, altura: '0%' },
    { etiqueta: 'S2', prestamos: 0, altura: '0%' },
    { etiqueta: 'S3', prestamos: 0, altura: '0%' },
    { etiqueta: 'S4', prestamos: 0, altura: '0%' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Resumen general</h1>
        <p className="text-muted text-sm mt-1">Vista general de la biblioteca digital</p>
      </div>

      {loadingStats ? (
        <div className="text-muted text-sm">Cargando estadísticas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Libros totales" value={stats?.totalLibros || 0} icon={BookOpen} />
          <StatCard label="Préstamos activos" value={stats?.prestamosActivos || 0} icon={ClipboardList} />
          <StatCard label="Reseñas totales" value={stats?.totalResenas || 0} icon={MessageSquare} />
          <StatCard label="Calificación promedio" value={`${stats?.calificacionPromedio || 0}/10`} icon={Star} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* SECCIÓN 1: RECURSOS MÁS PRESTADOS */}
        <section>
          <h2 className="text-xl font-serif font-bold text-white mb-4">Recursos más prestados</h2>
          {loadingRecursos ? (
            <div className="text-muted text-sm">Cargando recursos...</div>
          ) : (
            <DataTable 
              columns={["Título", "Formato", "Préstamos"]}
              data={recursos || []}
              renderRow={(row, i) => (
                <>
                  <td className="px-5 py-3 text-white">{row.TITULO || row.titulo || 'N/A'}</td>
                  <td className="px-5 py-3 text-muted">{row.FORMATO || row.formato || 'N/A'}</td>
                  <td className="px-5 py-3 text-muted">{row.TOTAL_PRESTAMOS || row.total_prestamos || 0}</td>
                </>
              )}
            />
          )}
        </section>

        {/* SECCIÓN 2: GRÁFICO REAL DE ACTIVIDAD */}
        <section className="bg-bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Actividad de Préstamos</h2>
              <p className="text-xs text-muted mt-1">Préstamos por semana (mes actual)</p>
            </div>
            <div className="p-2 bg-purple/10 rounded-lg">
              <TrendingUp className="text-purple" size={20} />
            </div>
          </div>
          
          {/* Contenedor del Gráfico de Barras */}
          <div className="flex-1 flex items-end justify-between gap-2 h-56 mt-4 border-b border-border pb-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                {/* Tooltip dinámico */}
                <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {data.prestamos}
                </span>
                {/* Barra dinámica usando inline styles para evitar problemas con Tailwind JIT */}
                <div 
                  className="w-full max-w-[2.5rem] bg-brand-gradient rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:brightness-125"
                  style={{ height: data.altura }}
                ></div>
                {/* Etiqueta Semanal */}
                <span className="text-xs text-muted font-medium">{data.etiqueta}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}