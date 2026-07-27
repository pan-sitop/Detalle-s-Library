// src/pages/Explorar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, BookmarkPlus, Eye, BookOpen, Loader2, FolderPlus, Check } from 'lucide-react';
import { libroService, listaService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = ['Todos', 'Ficción', 'Informática', 'Ciencia', 'Historia', 'Filosofía', 'Arte'];

export default function Explorar() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  
  const [catalogoDb, setCatalogoDb] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [listasModalOpen, setListasModalOpen] = useState(false);
  const [selectedLibro, setSelectedLibro] = useState(null);
  const [misListas, setMisListas] = useState([]);
  const [loadingListas, setLoadingListas] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        setLoading(true);
        const data = await libroService.getAll();
        setCatalogoDb(data || []);
      } catch (error) {
        showToast('Error al cargar los libros del servidor', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLibros();
  }, []);

  const getCoverUrl = (id) => {
    const covers = [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400&h=600'
    ];
    return covers[(id || 0) % covers.length];
  };

  // CORRECCIÓN: Todos los recursos base se fuerzan visualmente a Ficción
  const getCategoria = () => 'Ficción';

  const librosFiltrados = catalogoDb.filter((libro) => {
    const titulo = libro.TITULO || libro.titulo || '';
    const editorial = libro.EDITORIAL_NOMBRE || libro.editorial_nombre || '';
    const categoriaLibro = getCategoria();

    const coincideCategoria = categoriaActiva === 'Todos' || categoriaLibro === categoriaActiva;
    const coincideBusqueda = titulo.toLowerCase().includes(busqueda.toLowerCase()) || editorial.toLowerCase().includes(busqueda.toLowerCase());
      
    return coincideCategoria && coincideBusqueda;
  });

  const handleVerDetalles = (libro) => {
    const id = libro.RECURSO_ID || libro.recurso_id || libro.LIBRO_ID || libro.libro_id;
    navigate(`/libro/${id}`);
  };

  const handleAddToList = (libro) => {
    if (!isAuthenticated) {
      showToast('Debes iniciar sesión para guardar libros', 'info');
      navigate('/login');
      return;
    }
    setSelectedLibro(libro);
    setListasModalOpen(true);
    cargarMisListas();
  };

  const cargarMisListas = async () => {
    setLoadingListas(true);
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      const data = await listaService.getByUser(uid);
      setMisListas(data || []);
    } catch (e) {
      showToast('Error al cargar tus listas', 'error');
    } finally {
      setLoadingListas(false);
    }
  };

  const crearNuevaLista = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const uid = user?.id || user?.PERSONA_ID || user?.persona_id;
      await listaService.create({ nombre_lista: newListName, persona_id: uid });
      showToast('Lista creada exitosamente');
      setNewListName('');
      await cargarMisListas();
    } catch (err) {
      showToast('Error al crear la lista', 'error');
    } finally {
      setCreatingList(false);
    }
  };

  const confirmarAgregarALista = async (listaId) => {
    try {
      const recursoId = selectedLibro.RECURSO_ID || selectedLibro.recurso_id || selectedLibro.LIBRO_ID || selectedLibro.libro_id;
      await listaService.addLibro(listaId, { recurso_id: recursoId });
      showToast(`Libro agregado correctamente`);
      setListasModalOpen(false);
    } catch (e) {
      showToast(e.message || 'Error al agregar a la lista', 'error');
    }
  };

  return (
    <section className="min-h-screen bg-background pt-8 pb-24 relative">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Explorar</h1>
          <p className="text-slate-400 text-lg">Descubre tu próxima lectura entre nuestro catálogo completo.</p>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar título..."
                  className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Categorías</h3>
                <ul className="space-y-1">
                  {CATEGORIAS.map((cat) => (
                    <li key={cat}>
                      <button onClick={() => setCategoriaActiva(cat)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          categoriaActiva === cat ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-slate-500 pt-4 border-t border-white/5">{librosFiltrados.length} resultados</div>
            </div>
          </aside>

          {/* Grid Principal */}
          <div className="flex-1 min-w-0">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-32"><Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" /><p className="text-slate-400">Cargando biblioteca...</p></div>
            ) : librosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center"><BookOpen className="w-12 h-12 text-slate-600 mb-4" /><p className="text-slate-400 text-lg">No se encontraron resultados</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {librosFiltrados.map((libro, idx) => {
                  const id = libro.RECURSO_ID || libro.recurso_id || libro.LIBRO_ID || libro.libro_id;
                  const titulo = libro.TITULO || libro.titulo;
                  const editorial = libro.EDITORIAL_NOMBRE || libro.editorial_nombre || 'Ed. Desconocida';
                  const categoria = getCategoria();

                  return (
                    <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="group relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 shadow-lg flex flex-col hover:border-purple-500/30 transition-colors"
                    >
                      <div className="aspect-[2/3] w-full relative overflow-hidden bg-slate-800">
                        <img src={getCoverUrl(id)} alt={titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3 gap-2">
                          <button onClick={() => handleAddToList(libro)} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                            <BookmarkPlus className="w-4 h-4" /> Agregar
                          </button>
                          <button onClick={() => handleVerDetalles(libro)} className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                            <Eye className="w-4 h-4" /> Detalles
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white truncate text-sm mb-1 tracking-tight">{titulo}</h3>
                          <p className="text-xs text-purple-300/70 truncate">{editorial}</p>
                        </div>
                        <span className="inline-block mt-3 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full w-max">{categoria}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR A LISTA */}
      <AnimatePresence>
        {listasModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#14141F] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Agregar a lista</h3>
                <button onClick={() => setListasModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={crearNuevaLista} className="flex gap-2 mb-6">
                <input 
                  type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Nueva lista..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500 outline-none"
                />
                <button type="submit" disabled={creatingList || !newListName.trim()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                  {creatingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                </button>
              </form>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Mis Listas</div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {loadingListas ? (
                  <div className="text-center py-4 text-slate-400 text-sm flex justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div>
                ) : misListas.length === 0 ? (
                  <p className="text-center py-4 text-slate-500 text-sm">No tienes listas creadas aún.</p>
                ) : (
                  misListas.map((lista) => (
                    <div key={lista.LISTA_ID || lista.lista_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                      <span className="text-white text-sm font-medium">{lista.NOMBRE_LISTA || lista.nombre_lista}</span>
                      <button onClick={() => confirmarAgregarALista(lista.LISTA_ID || lista.lista_id)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors">
                        <Check className="w-3 h-3" /> Agregar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}