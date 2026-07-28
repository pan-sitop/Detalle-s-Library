import { useState } from 'react';
import { AlertTriangle, Ban, CheckCircle, Search, Clock, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { morososService } from '../../services/api';
import Modal from '../../components/admin/Modal';

export default function AdminUsuariosMorosos() {
  const { data: usuarios, loading, refetch, setData } = useApi(morososService.getAll, []);
  const [busqueda, setBusqueda] = useState('');
  const [suspendModal, setSuspendModal] = useState(null); // { id, nombre }
  const [dias, setDias] = useState(7);
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);

  // Filtrar por nombre o email
  const usuariosFiltrados = (usuarios || []).filter(u => 
    u.NOMBRE?.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.EMAIL?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleLevantar = async (id) => {
    if (!window.confirm('¿Seguro que deseas levantar la suspensión a este usuario?')) return;
    try {
      await morososService.levantar(id);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSuspenderSubmit = async (e) => {
    e.preventDefault();
    if (!dias || !motivo.trim()) return alert('Días y motivo son obligatorios');
    setSaving(true);
    try {
      await morososService.suspender(suspendModal.id, dias, motivo);
      setSuspendModal(null);
      setDias(7);
      setMotivo('');
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted text-sm mt-1">
            Suspende cuentas o levanta suspensiones activas.
          </p>
        </div>
        
        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Buscar usuario..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple transition-colors"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg border-b border-border text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-muted">Cargando usuarios...</td>
                </tr>
              ) : usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((user) => {
                  const isSuspendido = user.ESTADO_CUENTA === 'BLOQUEADO' || user.ESTADO_CUENTA === 'SUSPENDIDO';
                  return (
                    <tr key={user.PERSONA_ID} className="hover:bg-bg-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.NOMBRE} {user.APELLIDO}</div>
                        <div className="text-muted text-xs">{user.EMAIL}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isSuspendido ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                              <Ban size={12} /> {user.ESTADO_CUENTA}
                            </span>
                            {user.MOTIVO && <span className="text-xs text-muted mt-1 max-w-[200px] truncate" title={user.MOTIVO}>Motivo: {user.MOTIVO}</span>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <CheckCircle size={12} /> {user.ESTADO_CUENTA}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSuspendido ? (
                          <button
                            onClick={() => handleLevantar(user.PERSONA_ID)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg border border-border text-muted hover:text-white transition-colors"
                          >
                            Levantar Suspensión
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModal({ id: user.PERSONA_ID, nombre: user.NOMBRE })}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                          >
                            Suspender
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-muted">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!suspendModal} onClose={() => setSuspendModal(null)} title={`Suspender a ${suspendModal?.nombre}`}>
        <form onSubmit={handleSuspenderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Días de suspensión</label>
            <input 
              type="number" 
              min="1"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Motivo</label>
            <textarea 
              rows="3"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Multa por retraso de libro..."
              className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSuspendModal(null)}
              className="px-4 py-2 text-sm text-muted hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Confirmar Suspensión
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}