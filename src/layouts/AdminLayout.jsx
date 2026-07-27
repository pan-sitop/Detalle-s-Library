import { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, ShieldCheck,
  MessageSquare, ChevronLeft, ChevronRight, Sparkles,
  AlertTriangle, Terminal
} from 'lucide-react';
import SearchBar from '../components/admin/SearchBar';
import ProfileMenu from '../components/admin/ProfileMenu';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'libros', label: 'Libros', icon: BookOpen },
  { to: 'prestamos', label: 'Préstamos y reservas', icon: ClipboardList },
  { to: 'auditoria', label: 'Auditoría', icon: ShieldCheck },
  { to: 'resenas', label: 'Reseñas', icon: MessageSquare },
  { to: 'morosos', label: 'Morosos', icon: AlertTriangle },
  { to: 'sql', label: 'Consola SQL', icon: Terminal },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const { isAuthenticated, rol } = useAuth();

  // Protección de ruta: solo admins
  if (!isAuthenticated || rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-bg">
      <aside
        className={`${open ? 'w-64' : 'w-20'} shrink-0 border-r border-border
        bg-bg-card transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center gap-2 px-5 py-6">
          <Sparkles className="text-purple shrink-0" size={22} />
          {open && (
            <div className="leading-tight">
              <span className="font-display italic text-xl text-white">Detalle's Library</span>
              <p className="text-[10px] tracking-widest text-muted">ADMIN PANEL</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-brand-gradient text-white font-medium'
                  : 'text-muted hover:bg-bg-hover hover:text-white'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="m-3 flex items-center justify-center gap-2 rounded-lg border border-border
          py-2 text-muted hover:text-white hover:bg-bg-hover text-sm"
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {open && 'Colapsar'}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-border">
          <SearchBar />
          <ProfileMenu />
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}