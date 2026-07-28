import { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, ShieldCheck,
  MessageSquare, Sparkles, AlertTriangle, Terminal,
  FileText, Menu, X
} from 'lucide-react';
import ProfileMenu from '../components/admin/ProfileMenu';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { to: 'libros', label: 'Catálogo', icon: BookOpen },
  { to: 'prestamos', label: 'Operaciones', icon: ClipboardList },
  { to: 'reportes', label: 'Reportes', icon: FileText },
  { to: 'auditoria', label: 'Auditoría', icon: ShieldCheck },
  { to: 'resenas', label: 'Reseñas', icon: MessageSquare },
  { to: 'morosos', label: 'Morosos', icon: AlertTriangle },
  { to: 'sql', label: 'Dev SQL', icon: Terminal },
];

export default function AdminLayout() {
  const { isAuthenticated, rol } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Efecto glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isAuthenticated || rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      
      {/* Background Decorativo Abstracto */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-dark/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Navegación Flotante Superior (Glassmorphism) */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 
        ${isScrolled ? 'pt-2' : 'pt-6'}`}
      >
        <div className={`max-w-7xl mx-auto rounded-2xl border transition-all duration-300
          ${isScrolled 
            ? 'bg-bg-card/70 backdrop-blur-xl border-border shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-3' 
            : 'bg-bg-card/40 backdrop-blur-md border-white/5 py-4'}
        `}>
          <div className="flex items-center justify-between px-4 lg:px-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/images/logo_biblioteca.png" alt="Detalle's Library Logo" className="w-11 h-11 object-contain" />
              <div className="hidden sm:block leading-tight">
                <span className="font-display italic text-lg text-white font-semibold tracking-wide">
                  Detalle's
                </span>
                <span className="text-muted text-sm ml-1">Admin</span>
              </div>
            </div>

            {/* Navegación Desktop (Centrada al flex-1) */}
            <nav className="hidden xl:flex items-center justify-center gap-1 flex-1 mx-4">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'text-muted hover:text-white hover:bg-white/5'}`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Acciones Right (Solo Perfil) */}
            <div className="flex items-center justify-end gap-4 shrink-0">
              <ProfileMenu />
              
              {/* Mobile Menu Toggle */}
              <button 
                className="xl:hidden p-2 text-muted hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl xl:hidden pt-28 px-4 pb-6 overflow-y-auto">
          <nav className="flex flex-col gap-2 max-w-md mx-auto">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-4 rounded-xl text-base font-medium transition-all
                  ${isActive
                    ? 'bg-brand-gradient text-white shadow-lg'
                    : 'text-muted hover:text-white bg-bg-card/50'}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {/* Usamos un div animado para envolver el Outlet (opcional, pero da buen efecto) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <Outlet />
        </div>
      </main>

    </div>
  );
}