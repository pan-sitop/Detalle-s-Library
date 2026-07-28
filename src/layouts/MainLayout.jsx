import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Menu, User, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { libroService } from '../services/api';

export default function MainLayout() {
  const { isAuthenticated, user, rol, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Estados de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await libroService.search(searchQuery);
        setSearchResults(results.slice(0, 5)); // Mostrar máximo 5
      } catch (err) {
        console.error('Error buscando libros', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada correctamente');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200">
      <header className="sticky top-0 z-50 bg-[#0B0A10]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-purple-500 hover:text-purple-400 transition-colors">
            <img src="/images/logo_biblioteca.png" alt="Logo" className="w-11 h-11 object-contain" />
            <span className="font-serif text-2xl font-bold tracking-wide text-white">Detalle's Library</span>
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center px-12">
            <div className="relative w-full max-w-md group" ref={searchRef}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar libros, autores, géneros..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500 text-white"
              />
              {isSearching ? (
                <Loader2 className="absolute left-4 top-3 w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              )}

              {/* Menú Desplegable */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1825] border border-white/10 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <ul className="py-2">
                      {searchResults.map((libro) => (
                        <li key={libro.LIBRO_ID || libro.recurso_id || libro.isbn}>
                          <button
                            onClick={() => {
                              navigate(`/libro/${libro.LIBRO_ID || libro.recurso_id || libro.libro_id}`);
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex flex-col gap-1 transition-colors"
                          >
                            <span className="text-sm font-medium text-white truncate">{libro.TITULO || libro.titulo}</span>
                            <span className="text-xs text-slate-400 truncate">ISBN: {libro.ISBN || libro.isbn}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : !isSearching ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                      No se encontraron libros para "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/explorar" className="text-sm font-medium hover:text-purple-400 transition-colors">Explorar</Link>
            <Link to="/mi-lista" className="text-sm font-medium hover:text-purple-400 transition-colors">Mi Lista</Link>
            <Link to="/proximamente" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Próximamente</Link>

            {isAuthenticated ? (
              <>
                {rol === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                  <span className="text-sm text-slate-300">{user?.nombre}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
              >
                <User className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </Link>
            )}
          </nav>

          <button className="md:hidden p-2 text-slate-300 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#0B0A10] border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-2 mb-4">
            <img src="/images/logo_biblioteca.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-serif text-xl font-bold text-slate-300">Detalle's Library</span>
          </p>
          <p>© {new Date().getFullYear()} Detalle's Library. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
