import { useState, useRef } from 'react';
import { 
  BarChart3, Users, BookOpen, AlertCircle, 
  Download, TrendingUp, Filter 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApi } from '../../hooks/useApi';
import { prestamoService, statsService, morososService } from '../../services/api';

export default function AdminReportes() {
  const [activeTab, setActiveTab] = useState('libros');
  const reportRef = useRef(null);

  // Llamadas reales a la API
  const { data: prestamos, loading: loadingPrestamos } = useApi(prestamoService.getAll, []);
  const { data: suspendidos, loading: loadingSuspendidos } = useApi(morososService.getAll, []); 
  const { data: stats, loading: loadingStats } = useApi(statsService.getResumen, []);
  
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: activeTab === 'estadisticas' ? 'landscape' : 'portrait' });
    
    // Configuración base de la fuente y estilos
    doc.setFont("helvetica");
    
    // Título del documento
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    const titulos = {
      libros: 'Reporte de Préstamos Activos e Históricos',
      usuarios: 'Reporte de Usuarios Suspendidos',
      estadisticas: 'Resumen Estadístico de la Biblioteca'
    };
    doc.text(titulos[activeTab], 14, 22);
    
    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

    if (activeTab === 'libros') {
      const tableData = prestamosLista.map(row => [
        row.ID_PRESTAMO || row.id_prestamo || 'N/A',
        row.USUARIO || row.usuario || row.CORREO || row.correo || 'Desconocido',
        row.LIBRO || row.libro || row.TITULO || row.titulo || 'Sin título',
        new Date(row.FECHA_PRESTAMO || row.fecha_prestamo).toLocaleDateString(),
        new Date(row.FECHA_VENCIMIENTO || row.fecha_vencimiento || row.FECHA_DEVOLUCION_PREVISTA || row.fecha_devolucion_prevista).toLocaleDateString(),
        row.ESTADO || row.estado || 'DESCONOCIDO'
      ]);

      autoTable(doc, {
        startY: 38,
        head: [['ID', 'Usuario', 'Libro', 'Fecha Préstamo', 'Vencimiento', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] }, // Color morado de tu theme
      });
    } else if (activeTab === 'usuarios') {
      const tableData = suspendidosLista.map(user => [
        user.NOMBRE || user.nombre || 'N/A',
        user.APELLIDO || user.apellido || '',
        user.EMAIL || user.email || 'N/A',
        user.ESTADO_CUENTA || user.estado_cuenta || 'N/A',
        user.MOTIVO || user.motivo || 'N/A'
      ]);

      autoTable(doc, {
        startY: 38,
        head: [['Nombre', 'Apellido', 'Email', 'Estado', 'Motivo']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [244, 63, 94] }, // Color coral/rojo
      });
    } else if (activeTab === 'estadisticas') {
      const statData = [
        ['Libros Registrados', stats?.totalLibros || 0],
        ['Préstamos Activos', stats?.prestamosActivos || 0],
        ['Total Reseñas', stats?.totalResenas || 0],
        ['Calificación Promedio', `${stats?.calificacionPromedio || 0}/10`]
      ];

      autoTable(doc, {
        startY: 38,
        head: [['Métrica', 'Valor']],
        body: statData,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] },
      });
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Detalle's Library`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`Reporte_Library_${activeTab}.pdf`);
  };

  const prestamosLista = prestamos || [];
  const suspendidosLista = (suspendidos || []).filter(u => {
    const estado = (u.ESTADO_CUENTA || u.estado_cuenta || '').toUpperCase();
    return estado === 'BLOQUEADO' || estado === 'SUSPENDIDO';
  });

  const tabs = [
    { id: 'libros', label: 'Libros Prestados', icon: BookOpen },
    { id: 'usuarios', label: 'Usuarios Suspendidos', icon: Users },
    { id: 'estadisticas', label: 'Estadísticas Generales', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink/10 rounded-lg">
              <BarChart3 className="text-pink" size={24} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Reportes</h1>
          </div>
          <p className="text-muted text-sm max-w-xl leading-relaxed">
            Genera, visualiza y exporta informes detallados y reales de la base de datos.
          </p>
        </div>
        
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all group backdrop-blur-sm cursor-pointer z-10"
        >
          <Download size={16} className="text-purple group-hover:-translate-y-0.5 transition-transform" />
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* Navegación de Pestañas (Tabs Glassmorphism) */}
      <div className="flex space-x-2 p-1.5 bg-bg-card/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-brand-gradient text-white shadow-lg shadow-purple/20' 
                : 'text-muted hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenedor Ref a Exportar */}
      <div ref={reportRef} className="relative bg-bg min-h-[500px] p-4 -mx-4 rounded-3xl overflow-hidden">
        
        {/* Pestaña: Libros Prestados */}
        {activeTab === 'libros' && (
          <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BookOpen size={18} className="text-purple" />
                Registro de Préstamos (Base de Datos Real)
              </h2>
            </div>
            
            {loadingPrestamos ? (
              <div className="p-12 text-center text-muted">Cargando préstamos...</div>
            ) : prestamosLista.length === 0 ? (
              <div className="p-12 text-center text-muted">No existen registros de préstamos en la base de datos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-xs uppercase tracking-wider text-muted font-semibold">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Recurso</th>
                      <th className="px-6 py-4">Fecha Préstamo</th>
                      <th className="px-6 py-4">Fecha Devolución</th>
                      <th className="px-6 py-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {prestamosLista.map((row) => (
                      <tr key={row.ID_PRESTAMO || row.id_prestamo} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-muted">#{row.ID_PRESTAMO || row.id_prestamo}</td>
                        <td className="px-6 py-4 text-white">{row.USUARIO || row.usuario || row.CORREO || row.correo || 'Desconocido'}</td>
                        <td className="px-6 py-4 font-medium text-white">{row.LIBRO || row.libro || row.TITULO || row.titulo || 'Sin título'}</td>
                        <td className="px-6 py-4 text-muted">{new Date(row.FECHA_PRESTAMO || row.fecha_prestamo).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-muted">{new Date(row.FECHA_VENCIMIENTO || row.fecha_vencimiento || row.FECHA_DEVOLUCION_PREVISTA || row.fecha_devolucion_prevista).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                            ${(row.ESTADO || row.estado) === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              (row.ESTADO || row.estado) === 'DEVUELTO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              'bg-coral/10 text-coral border-coral/20'}`}>
                            {row.ESTADO || row.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Usuarios Suspendidos / Morosos */}
        {activeTab === 'usuarios' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
               <AlertCircle className="text-coral" size={24} /> Usuarios Suspendidos y Morosos
            </h2>
            
            {loadingSuspendidos ? (
              <div className="p-12 text-center text-muted">Cargando usuarios...</div>
            ) : suspendidosLista.length === 0 ? (
              <div className="bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center text-muted">
                No hay usuarios con retrasos o suspensiones actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suspendidosLista.map((user, i) => (
                  <div key={user.ID_USUARIO || i} className="group relative bg-bg-card/40 backdrop-blur-xl border border-coral/10 rounded-3xl p-6 hover:border-coral/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4">
                       <AlertCircle className="text-coral opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral/20 to-pink/20 flex items-center justify-center mb-4 border border-coral/20">
                      <Users className="text-coral" size={20} />
                    </div>
                    <h3 className="text-white font-medium mb-1 truncate">{user.NOMBRE || user.nombre || 'Usuario'} {user.APELLIDO || user.apellido || ''}</h3>
                    <p className="text-sm text-muted mb-4">{user.EMAIL || user.email || 'correo@no-registrado.com'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-muted truncate pr-2" title={user.MOTIVO || user.motivo}>
                        Motivo: <span className="text-coral">{user.MOTIVO || user.motivo || 'N/A'}</span>
                      </span>
                      <span className="text-xs font-medium text-coral bg-coral/10 px-2 py-1 rounded-md shrink-0">
                        {user.ESTADO_CUENTA || user.estado_cuenta || 'Suspendido'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Estadísticas Reales */}
        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta Principal */}
            <div className="lg:col-span-2 bg-bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-medium text-white">Resumen General de la Biblioteca</h3>
                  <p className="text-sm text-muted mt-1">Extraído directamente de la base de datos MySQL</p>
                </div>
                <TrendingUp className="text-purple" size={20} />
              </div>
              
              {loadingStats ? (
                <div className="flex-1 flex items-center justify-center text-muted">Cargando métricas...</div>
              ) : (
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <p className="text-muted text-sm font-medium">Libros Totales Registrados</p>
                    <p className="text-5xl font-bold text-white mt-2 font-serif">{stats?.totalLibros || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <p className="text-muted text-sm font-medium">Préstamos Activos Actuales</p>
                    <p className="text-5xl font-bold text-white mt-2 font-serif">{stats?.prestamosActivos || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <p className="text-muted text-sm font-medium">Reseñas de Usuarios</p>
                    <p className="text-5xl font-bold text-white mt-2 font-serif">{stats?.totalResenas || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <p className="text-muted text-sm font-medium">Calificación Promedio</p>
                    <p className="text-5xl font-bold text-white mt-2 font-serif">{stats?.calificacionPromedio || 0}/10</p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              <div className="bg-brand-gradient rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-purple/20">
                <div className="relative z-10">
                  <h4 className="text-white/80 font-medium text-sm mb-1">Estado del Sistema</h4>
                  <p className="text-3xl font-bold text-white tracking-tight">En línea</p>
                  <p className="text-xs text-white/70 mt-4 flex items-center gap-1">
                    <TrendingUp size={12} /> API Conectada Exitosamente
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
