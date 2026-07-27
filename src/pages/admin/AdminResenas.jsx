import { useState } from 'react';
import { Trash2, Star } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { resenaService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminResenas() {
  const { data: resenas, loading, setData } = useApi(resenaService.getAll, []);
  const { showToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const getAdminId = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.PERSONA_ID || user.persona_id || user.id || 1;
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const id = deleteTarget.RESENA_ID || deleteTarget.resena_id;
      // Añadimos el admin_id para que el trigger de auditoría de Oracle no falle
      await resenaService.remove(`${id}?admin_id=${getAdminId()}`);
      
      setData((prev) => prev.filter((r) => (r.RESENA_ID || r.resena_id) !== id));
      showToast('Reseña eliminada');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al eliminar la reseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Moderación de reseñas</h1>
        <p className="text-muted text-sm mt-1">RESENA</p>
      </div>

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Cargando reseñas...</div>
      ) : (
        <DataTable
          columns={['Libro', 'Usuario', 'Calificación', 'Comentario', 'Acciones']}
          data={resenas || []}
          renderRow={(r) => (
            <>
              <td className="px-5 py-3 text-white">{r.LIBRO || r.libro}</td>
              <td className="px-5 py-3 text-muted">{r.USUARIO || r.usuario}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} fill="currentColor" /> {r.CALIFICACION || r.calificacion}/10
                </div>
              </td>
              <td className="px-5 py-3 text-muted max-w-xs truncate">{r.COMENTARIO || r.comentario}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="text-red-400 hover:text-red-300"
                  title="Eliminar reseña"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </>
          )}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar reseña"
        message={`¿Seguro que quieres eliminar la reseña de "${deleteTarget?.USUARIO || deleteTarget?.usuario}" sobre "${deleteTarget?.LIBRO || deleteTarget?.libro}"?`}
        loading={saving}
      />
    </div>
  );
}