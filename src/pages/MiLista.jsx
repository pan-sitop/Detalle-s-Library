// src/pages/MiLista.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, BookOpen, ArrowLeft, FolderOpen, User, X, Loader2, BarChart2, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listaService, prestamoService } from '../services/api';

export default function MiLista() {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  // Vista detalle de una lista
  const [selectedLista, setSelectedLista] = useState(null);
  const [librosEnLista, setLibrosEnLista] = useState([]);
  const [loadingLibros, setLoadingLibros] = useState(false);
  
  // Procesamiento por libro individual
  const [procesandoPrestamoId, setProcesandoPrestamoId] = useState(null);

  const cargarListas = () => {
    if (isAuthenticated && user?.id) {
      setLoading(true);
      listaService.getByUser(user.id)
        .then((data) => setListas(data || []))
        .catch(() => showToast('Error al cargar tus listas', 'error'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    cargarListas();
  }, [isAuthenticated, user?.id]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      await listaService.create({
        nombre_lista: newListName.trim(),
        persona_id: uid, 
      });
      showToast('Lista creada exitosamente');
      setNewListName('');
      setModalOpen(false);
      cargarListas(); 
    } catch (err) {
      showToast(err.message || 'Error al crear lista', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenLista = async (lista) => {
    setSelectedLista(lista);
    setLoadingLibros(true);
    try {
      const libros = await listaService.getLibros(lista.LISTA_ID || lista.lista_id);
      setLibrosEnLista(libros || []);
    } catch {
      showToast('Error al cargar libros de la lista', 'error');
    } finally {
      setLoadingLibros(false);
    }
  };

  const handleSolicitarEnLista = async (libroId) => {
    if (!isAuthenticated) return;
    setProcesandoPrestamoId(libroId);
    
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      await prestamoService.solicitar({ recurso_id: libroId, persona_id: uid });
      showToast('Préstamo solicitado exitosamente', 'success');
      
      // Recargar los libros de esta lista para actualizar el stock (copias_disponibles)
      const librosActualizados = await listaService.getLibros(selectedLista.LISTA_ID || selectedLista.lista_id);
      setLibrosEnLista(librosActualizados || []);

    } catch (error) {
      showToast(error.message || 'Error al solicitar el préstamo.', 'error');
    } finally {
      setProcesandoPrestamoId(null);
    }
  };

  const handleLeerPDF = (formato) => {
    showToast(`Abriendo visor de ${formato}...`, 'success');
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  };

  // ─── Estado No Logueado ───
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-8"><Library className="w-10 h-10 text-purple-500" /></div>
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Crea tu propia biblioteca</h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">Inicia sesión para guardar y organizar tus recursos</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40"><User className="w-4 h-4" />Iniciar sesión</Link>
        </motion.div>
      </section>
    );
  }

  // ─── Vista Detalle de una Lista ───
  if (selectedLista) {
    const totalLibros = selectedLista.TOTAL_LIBROS || selectedLista.total_libros || 0;
    const nombreLista = selectedLista.NOMBRE_LISTA || selectedLista.nombre_lista;
    const fechaCreacion = selectedLista.FECHA_CREACION || selectedLista.fecha_creacion;

    return (
      <section className="min-h-screen bg-background pt-8 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <button onClick={() => { setSelectedLista(null); setLibrosEnLista([]); }} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"><ArrowLeft className="w-4 h-4" />Volver a mis listas</button>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{nombreLista}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5"><FolderOpen className="w-4 h-4" /><span>Creada el {fechaCreacion}</span></div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4" /><span>{librosEnLista.length} {librosEnLista.length === 1 ? 'recurso guardado' : 'recursos guardados'}</span></div>
                </div>
              </div>
              <button onClick={() => navigate('/explorar')} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20"><Plus className="w-4 h-4" />Agregar Recursos</button>
            </div>
            
            <div className="w-full h-px bg-white/10 mb-8" />

            {loadingLibros ? (
              <div className="flex items-center gap-3 text-slate-400 py-16 justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" />Cargando contenido...</div>
            ) : librosEnLista.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 font-medium mb-1">Esta carpeta está vacía</p>
                <p className="text-slate-500 text-sm">Explora la biblioteca y guarda recursos aquí.</p>
                <button onClick={() => navigate('/explorar')} className="mt-6 text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors">Ir al catálogo &rarr;</button>
              </div>
            ) : (
              <div className="space-y-4">
                {librosEnLista.map((libro, idx) => {
                  const idLibro = libro.LIBRO_ID || libro.libro_id || libro.RECURSO_ID || libro.recurso_id;
                  const copias = libro.COPIAS_DISPONIBLES || libro.copias_disponibles || 0;
                  const isProcessing = procesandoPrestamoId === idLibro;
                  const formato = libro.FORMATO || libro.formato || 'PDF';
                  
                  return (
                    <div key={idx} className="w-full bg-white/[0.02] border border-white/5 hover:border-purple-500/30 rounded-xl p-5 flex flex-col xl:flex-row xl:items-center gap-5 text-left transition-all duration-300">
                      
                      {/* Lado izquierdo: Info del libro clickable */}
                      <button onClick={() => navigate(`/libro/${idLibro}`)} className="flex items-center gap-5 flex-1 group text-left">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-purple-300 transition-colors">
                            {libro.TITULO || libro.titulo}
                          </h3>
                          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                            <span>ISBN: {libro.ISBN || libro.isbn}</span>
                            <span>•</span>
                            <span className={copias > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                              {copias > 0 ? `${copias} disponibles` : 'Agotado'}
                            </span>
                          </p>
                        </div>
                      </button>
                      
                      {/* Lado derecho: Acciones */}
                      <div className="flex flex-wrap items-center gap-3 mt-4 xl:mt-0 w-full xl:w-auto border-t xl:border-t-0 border-white/5 pt-4 xl:pt-0">
                        
                        <button
                          onClick={() => handleLeerPDF(formato)}
                          className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-white/10 hover:bg-white/20 text-white border border-white/5"
                        >
                          <FileText className="w-4 h-4" /> Leer
                        </button>

                        <button
                          onClick={() => handleSolicitarEnLista(idLibro)}
                          disabled={copias === 0 || isProcessing}
                          className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            copias > 0
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Solicitar
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
                              await prestamoService.devolver({ recurso_id: idLibro, persona_id: uid });
                              showToast('Libro devuelto. El inventario ha subido.', 'success');
                              handleOpenLista(selectedLista);
                            } catch (e) {
                              showToast(e.message, 'error');
                            }
                          }}
                          className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        >
                          Devolver
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const listId = selectedLista.LISTA_ID || selectedLista.lista_id;
                              if (!listId) throw new Error("No se pudo identificar la carpeta");
                              
                              await listaService.removeLibro(listId, idLibro);
                              showToast('Eliminado de tu carpeta', 'success');
                              handleOpenLista(selectedLista);
                            } catch (e) {
                              showToast(e.message || 'Error al eliminar', 'error');
                            }
                          }}
                          className="p-2.5 rounded-lg transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          title="Quitar de mi lista"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // ─── Vista Principal: Grid de Listas ───
  return (
    <section className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3"><Library className="w-8 h-8 text-purple-500" /><h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Mis Listas</h1></div>
            <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20"><Plus className="w-4 h-4" />Nueva Carpeta</button>
          </div>
          <p className="text-slate-400">Organiza tus lecturas en carpetas personalizadas.</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" /><p className="text-slate-400">Cargando tus listas...</p></div>
        ) : listas.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
            <FolderOpen className="w-16 h-16 text-slate-700 mb-5" />
            <p className="text-white text-xl font-bold mb-2">Aún no tienes listas</p>
            <p className="text-slate-500 text-base mb-6">Crea tu primera lista para organizar tus lecturas</p>
            <button onClick={() => setModalOpen(true)} className="text-purple-400 hover:text-purple-300 font-medium transition-colors border border-purple-500/30 px-6 py-2 rounded-lg bg-purple-500/10">Crear mi primera lista</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {listas.map((lista, idx) => {
                const totalLibros = lista.TOTAL_LIBROS || lista.total_libros || 0;
                const nombreLista = lista.NOMBRE_LISTA || lista.nombre_lista;
                const fechaCreacion = lista.FECHA_CREACION || lista.fecha_creacion;
                return (
                  <motion.button key={lista.LISTA_ID || lista.lista_id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.05 }} onClick={() => handleOpenLista(lista)} className="group bg-white/[0.02] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 flex flex-col">
                    <div className="flex items-start justify-between mb-5">
                      <div className="p-3.5 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform"><FolderOpen className="w-6 h-6 text-purple-400" /></div>
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full">{fechaCreacion}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors truncate">{nombreLista}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-auto pt-4 border-t border-white/5"><BookOpen className="w-4 h-4" />{totalLibros} {totalLibros === 1 ? 'recurso guardado' : 'recursos guardados'}</div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Lista */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#14141F] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h3 className="font-bold text-lg text-white">Nueva Carpeta</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateList} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nombre de la lista</label>
                <input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Ej: Lecturas de Programación III" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"/>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancelar</button>
                <button type="submit" disabled={creating || !newListName.trim()} className="px-6 py-2.5 rounded-xl text-sm bg-purple-600 text-white hover:bg-purple-500 font-bold transition-all disabled:opacity-50 flex items-center gap-2">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Lista'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}