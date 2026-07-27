import { useState, useEffect } from 'react';
import { CalendarClock, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Proximamente() {
  const [proximosLibros, setProximosLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/libros/proximamente/lista')
      .then(res => res.json())
      .then(data => {
        setProximosLibros(data);
        setLoading(false);
      })
      .catch(err => console.error("Error al cargar próximos lanzamientos:", err));
  }, []);

  const handleReservar = async (recursoId) => {
    if (!isAuthenticated) {
      showToast('Debes iniciar sesión para reservar', 'error');
      return;
    }

    if (!recursoId || isNaN(recursoId)) {
      showToast('Error: No se pudo identificar el recurso (ID inválido)', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/public/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: user.id, // Corregido para que coincida con el backend
          recurso_id: recursoId
        })
      });

      if (response.ok) {
        showToast('¡Reserva confirmada! Te notificaremos cuando haya stock.', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Error al realizar la reserva', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) return <p className="text-center py-10 text-slate-400">Buscando futuros lanzamientos...</p>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <CalendarClock className="w-8 h-8 text-purple-500" />
        <h1 className="font-serif text-3xl font-bold text-white">Próximamente en la Biblioteca</h1>
      </div>
      
      <p className="text-slate-400 mb-8 max-w-2xl">
        Estos títulos actualmente no tienen copias disponibles o están en fase de adquisición. 
        Añádelos a tu fila de reserva para tener prioridad en cuanto ingresen al inventario.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {proximosLibros.map((libro) => {
          // Extraemos el ID correcto buscando primero LIBRO_ID que es el alias que retorna tu SQL
          const idRecurso = libro.LIBRO_ID || libro.libro_id || libro.RECURSO_ID || libro.recurso_id;

          return (
            <div key={idRecurso} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col group hover:bg-white/10 transition-all">
              
              <div className="h-48 bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center p-4 text-center relative overflow-hidden">
                <span className="absolute top-2 right-2 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-md border border-red-500/30">
                  0 COPIAS
                </span>
                <h3 className="text-lg font-bold text-slate-200 line-clamp-3 group-hover:text-purple-300 transition-colors">
                  {libro.TITULO || libro.titulo}
                </h3>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-purple-400 font-medium uppercase tracking-wider">
                    {libro.TIPO || libro.tipo} • {libro.ANIO_PUBLICACION || libro.anio_publicacion}
                  </p>
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {libro.SINOPSIS || libro.sinopsis || "Sinopsis no disponible por el momento."}
                  </p>
                </div>

                <button 
                  onClick={() => handleReservar(idRecurso)}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 py-2.5 rounded-lg hover:bg-purple-600 hover:text-white transition-all font-medium text-sm"
                >
                  <BellRing className="w-4 h-4" />
                  Reservar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}