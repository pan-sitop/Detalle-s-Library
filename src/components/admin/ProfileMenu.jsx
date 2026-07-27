import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada correctamente');
    navigate('/login');
  };

  const inicial = user?.nombre?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg hover:bg-bg-hover px-2 py-1.5 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center
          text-sm font-semibold text-white shrink-0">
          {inicial}
        </div>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-bg-card border border-border
          rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-white font-medium">
              {user ? `${user.nombre} ${user.apellido}` : 'Cargando...'}
            </p>
            <p className="text-xs text-muted mt-0.5">{user?.email}</p>
            {user?.cargo && <p className="text-xs text-purple mt-1">{user.cargo}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400
            hover:bg-bg-hover transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
