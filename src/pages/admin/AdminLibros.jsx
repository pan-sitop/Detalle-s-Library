import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import LibroForm from '../../components/admin/LibroForm';
import { useApi } from '../../hooks/useApi';
import { libroService, editorialService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminLibros() {
  const { user } = useAuth();
  const { data: libros, loading, refetch, setData } = useApi(libroService.getAll, []);
  const { data: editoriales } = useApi(editorialService.getAll, []);
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLibro, setEditingLibro] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.editLibroId && libros) {
      const libro = libros.find((l) => l.libro_id === location.state.editLibroId);
      if (libro) {
        setEditingLibro(libro);
        setModalOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, libros, navigate, location.pathname]);

  const openCreate = () => { setEditingLibro(null); setModalOpen(true); };
  const openEdit = (libro) => { setEditingLibro(libro); setModalOpen(true); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      // 1. Extraemos el ID del administrador de manera segura, cubriendo las mayúsculas de Oracle
      const adminId = user?.PERSONA_ID || user?.persona_id || user?.id;

      // 2. Validamos que realmente tengamos un ID antes de mandar la petición
      if (!adminId) {
        showToast('Error de sesión: No se identificó al administrador.', 'error');
        setSaving(false);
        return;
      }

      // 3. Inyectamos el ID validado
      const dataToSend = {
        ...formData,
        admin_id: adminId 
      };

      if (editingLibro) {
        const id = editingLibro.LIBRO_ID || editingLibro.libro_id;
        await libroService.update(id, dataToSend); 
        showToast('Recurso actualizado correctamente');
      } else {
        await libroService.create(dataToSend); 
        showToast('Recurso creado correctamente');
      }
      
      await refetch();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const id = deleteTarget.LIBRO_ID || deleteTarget.libro_id;
      const adminId = user?.PERSONA_ID || user?.persona_id || user?.id || 1;
      
      // Enviamos el ID del administrador por la URL para que el backend lo atrape
      await libroService.remove(`${id}?admin_id=${adminId}`); 
      
      setData((prev) => prev.filter((l) => (l.LIBRO_ID || l.libro_id) !== id));
      showToast('Recurso eliminado');
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al eliminar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const editorialNombre = (id) => {
    const ed = editoriales?.find((e) => (e.EDITORIAL_ID || e.editorial_id) === id);
    return ed?.NOMBRE || ed?.nombre || '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Gestión de libros</h1>
          <p className="text-muted text-sm mt-1">LIBRO_DIGITAL · EDITORIAL · GENERO</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Nuevo libro
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm py-10 text-center">Cargando libros...</div>
      ) : (
        <DataTable
          columns={['Título', 'ISBN', 'Formato', 'Año', 'Copias', 'Editorial', 'Acciones']}
          data={libros || []}
          renderRow={(l) => (
            <>
              <td className="px-5 py-3 text-white font-medium">{l.TITULO || l.titulo}</td>
              <td className="px-5 py-3 text-slate-400">{l.ISBN || l.isbn}</td>
              <td className="px-5 py-3 text-slate-400">{l.TIPO || l.tipo || l.FORMATO || l.formato}</td>
              <td className="px-5 py-3 text-slate-400">{l.ANIO_PUBLICACION || l.anio_publicacion}</td>
              <td className="px-5 py-3 text-slate-400">{l.COPIAS_DISPONIBLES || l.copias_disponibles}</td>
              <td className="px-5 py-3 text-slate-400">{editorialNombre(l.EDITORIAL_ID || l.editorial_id)}</td>
              <td className="px-5 py-3">
                <div className="flex gap-3">
                  <button onClick={() => openEdit(l)} className="text-slate-400 hover:text-white transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(l)} className="text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLibro ? 'Editar libro' : 'Nuevo libro'}>
        <LibroForm
          key={editingLibro?.libro_id ?? 'nuevo'}
          initialData={editingLibro}
          editoriales={editoriales || []}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar libro"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        loading={saving}
      />
    </div>
  );
}
