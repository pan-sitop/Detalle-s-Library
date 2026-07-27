import { Outlet, Link } from 'react-router-dom';
import { Search, BookOpen, Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const { isAuthenticated, user, rol, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
            <BookOpen className="w-8 h-8" />
            <span className="font-serif text-2xl font-bold tracking-wide text-white">Detalle's Library</span>
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center px-12">
            <div className="relative w-full max-w-md group">
              <input 
                type="text" 
                placeholder="Buscar libros, autores, géneros..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500 text-white"
              />
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
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
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-serif text-xl font-bold text-slate-300">Detalle's Library</span>
          </p>
          <p>© {new Date().getFullYear()} Detalle's Library. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
