import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Book, Send, CheckCircle2, Loader2, Info } from 'lucide-react';
import { libroService, prestamoService, resenaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LibroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [libro, setLibro] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [solicitando, setSolicitando] = useState(false);
  const [enviandoResena, setEnviandoResena] = useState(false);
  
  const [calificacion, setCalificacion] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); 
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const libroDb = await libroService.getById(id);
      setLibro(libroDb);

      try {
        const resenasDb = await resenaService.getByLibro(id);
        setResenas(Array.isArray(resenasDb) ? resenasDb : []);
      } catch (e) {
        // AHORA EL TOAST MOSTRARÁ EL ERROR REAL ("Error 404" o "Error DB: ORA-...")
        showToast(e.message, 'error'); 
        setResenas([]);
      }
    } catch (error) {
      setLibro(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarPrestamo = async () => {
    if (!isAuthenticated) {
      showToast('Inicia sesión para solicitar un préstamo', 'info');
      navigate('/login');
      return;
    }

    setSolicitando(true);
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      await prestamoService.solicitar({ recurso_id: id, persona_id: uid });
      showToast('Préstamo solicitado exitosamente', 'success');
      cargarDatos(); 
    } catch (error) {
      showToast(error.message || 'Error al solicitar préstamo', 'error');
    } finally {
      setSolicitando(false);
    }
  };

  const handleEnviarResena = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Inicia sesión para dejar una reseña', 'info');
      navigate('/login');
      return;
    }

    setEnviandoResena(true);
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      await resenaService.create({ recurso_id: id, persona_id: uid, calificacion, comentario });
      showToast('¡Gracias por tu reseña!');
      setComentario('');
      setCalificacion(5);
      cargarDatos(); 
    } catch (error) {
      showToast(error.message || 'Error al enviar la reseña', 'error');
    } finally {
      setEnviandoResena(false);
    }
  };

  const getCoverUrl = () => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600&h=900';

  if (loading) return <div className="min-h-screen bg-background flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 text-purple-500 animate-spin" /></div>;
  if (!libro) return <div className="min-h-screen bg-background flex flex-col items-center justify-center"><h2 className="text-xl text-slate-400 mb-4">Libro no encontrado</h2><button onClick={() => navigate('/explorar')} className="text-purple-400 hover:underline">Volver a explorar</button></div>;

  const titulo = libro.TITULO || libro.titulo;
  const editorial = libro.EDITORIAL_NOMBRE || libro.editorial_nombre || 'Ed. Desconocida';
  const sinopsis = libro.SINOPSIS || libro.sinopsis || "Sin sinopsis disponible.";
  const copias = libro.COPIAS_DISPONIBLES || libro.copias_disponibles || 0;
  const formato = libro.TIPO || libro.tipo || libro.FORMATO || libro.formato || 'Libro Físico';
  const anio = libro.ANIO_PUBLICACION || libro.anio_publicacion || '-';

  return (
    <section className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10"><ArrowLeft className="w-4 h-4" /> Volver a Explorar</button>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-10 mb-12">
          <div className="w-40 md:w-44 lg:w-48 flex-shrink-0 flex justify-center md:justify-start">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
              <img src={getCoverUrl()} alt={titulo} className="w-full h-full object-cover" />
              {copias === 0 && <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">AGOTADO</div>}
            </motion.div>
          </div>
          <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-semibold tracking-wider uppercase mb-3 border border-purple-500/20">{formato}</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{titulo}</h1>
              <p className="text-lg text-slate-300 mb-5 flex items-center justify-center md:justify-start gap-2">Editorial: <span className="text-white font-medium">{editorial}</span></p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 pb-5 border-b border-white/10 mb-5 w-full">
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Clock className="w-4 h-4 text-purple-400" /><span>Publicado en {anio}</span></div>
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Book className="w-4 h-4 text-purple-400" /><span>Español</span></div>
                <div className="flex items-center gap-2 text-sm"><Info className="w-4 h-4 text-purple-400" /><span className={`font-bold ${copias > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{copias > 0 ? `${copias} disponibles` : 'Sin stock'}</span></div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Sinopsis</h3>
              <p className="text-slate-400 leading-relaxed text-base md:text-lg mb-6 max-w-3xl mx-auto md:mx-0">{sinopsis}</p>
              <div className="flex w-full md:w-auto justify-center md:justify-start">
                <button onClick={handleSolicitarPrestamo} disabled={copias === 0 || solicitando} className={`w-full md:w-auto px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${copias > 0 ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                  {solicitando ? <Loader2 className="w-5 h-5 animate-spin" /> : copias > 0 ? <><CheckCircle2 className="w-5 h-5" /> Solicitar Préstamo</> : 'Agotado'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">Reseñas de la comunidad</h3>
              {resenas.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center"><Star className="w-12 h-12 text-slate-600 mx-auto mb-4" /><p className="text-slate-300 text-lg font-medium mb-1">Aún no hay reseñas.</p></div>
              ) : (
                <div className="space-y-4">
                  {resenas.map((resena, idx) => {
                    const califVisual = resena.CALIFICACION || resena.calificacion;
                    const nombreUsr = resena.USUARIO_NOMBRE || resena.usuario_nombre || 'Usuario';
                    const apellidoUsr = resena.USUARIO_APELLIDO || resena.usuario_apellido || '';
                    const nombreCompleto = `${nombreUsr} ${apellidoUsr}`.trim();
                    return (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04]">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">{nombreCompleto.charAt(0).toUpperCase()}</div>
                            <div><p className="text-white font-medium text-sm">{nombreCompleto}</p><p className="text-slate-500 text-xs">Lector de la biblioteca</p></div>
                          </div>
                          <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-3.5 h-3.5 ${star <= califVisual ? 'fill-purple-500 text-purple-500' : 'text-slate-600 fill-transparent'}`} />))}</div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{resena.COMENTARIO || resena.comentario}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="w-full">
              <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 sticky top-28 shadow-xl">
                <h4 className="text-xl font-bold text-white mb-6 text-center tracking-tight">Escribe tu reseña</h4>
                <form onSubmit={handleEnviarResena} className="space-y-6">
                  <div className="text-center bg-white/5 py-4 rounded-xl border border-white/5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Tu calificación</label>
                    <div className="flex gap-2 items-center justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setCalificacion(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none transition-transform hover:scale-110 p-1">
                          <Star className={`w-7 h-7 transition-colors duration-200 ${star <= (hoverRating || calificacion) ? 'fill-purple-500 text-purple-500' : 'text-slate-600 fill-transparent'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tu comentario</label>
                    <textarea required rows="3" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="¿Qué te pareció este libro?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500 resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={enviandoResena} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {enviandoResena ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Publicar Reseña</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}