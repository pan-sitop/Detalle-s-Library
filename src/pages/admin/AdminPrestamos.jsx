import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { prestamoService, reservaService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminPrestamos() {
  const { data: prestamos, loading: loadingPrestamos, setData: setPrestamos } = useApi(prestamoService.getAll, []);
  const { data: reservas, loading: loadingReservas, setData: setReservas } = useApi(reservaService.getAll, []);
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Función auxiliar para obtener el ID del administrador logueado
  const getAdminId = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.PERSONA_ID || user.persona_id || user.id || 1;
  };

  const handleDevolver = async (prestamo) => {
    setSaving(true);
    try {
      const id = prestamo.PRESTAMO_ID || prestamo.prestamo_id;
      // Enviamos el admin_id para que Node pueda ejecutar PKG_SESION.SET_ADMIN
      await prestamoService.updateEstado(id, 'Devuelto', { admin_id: getAdminId() });
      
      setPrestamos((prev) =>
        prev.map((p) => ((p.PRESTAMO_ID || p.prestamo_id) === id ? { ...p, estado: 'DEVUELTO', ESTADO: 'DEVUELTO' } : p))
      );
      showToast(`"${prestamo.LIBRO || prestamo.libro}" marcado como devuelto`);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al actualizar el préstamo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmar = async (reserva) => {
    setSaving(true);
    try {
      const id = reserva.RESERVA_ID || reserva.reserva_id;
      await reservaService.updateEstado(id, 'Confirmada', { admin_id: getAdminId() });
      
      setReservas((prev) =>
        prev.map((r) => ((r.RESERVA_ID || r.reserva_id) === id ? { ...r, estado: 'Confirmada', ESTADO: 'Confirmada' } : r))
      );
      showToast(`Reserva de "${reserva.LIBRO || reserva.libro}" confirmada`);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al confirmar la reserva', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async () => {
    setSaving(true);
    try {
      const id = cancelTarget.RESERVA_ID || cancelTarget.reserva_id;
      // Enviamos el admin_id por query param (o ajustalo según tu route en Node)
      await reservaService.remove(`${id}?admin_id=${getAdminId()}`);
      
      setReservas((prev) => prev.filter((r) => (r.RESERVA_ID || r.reserva_id) !== id));
      showToast('Reserva cancelada');
      setCancelTarget(null);
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al cancelar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white">Préstamos y reservas</h1>
        <p className="text-muted text-sm mt-1">PRESTAMO · RESERVA</p>
      </div>

      <section>
        <h2 className="text-white font-medium mb-3">Préstamos</h2>
        {loadingPrestamos ? (
          <div className="text-muted text-sm py-6 text-center">Cargando préstamos...</div>
        ) : (
          <DataTable
            columns={['Libro', 'Usuario', 'Prestado', 'Vence', 'Estado', 'Acciones']}
            data={prestamos || []}
            renderRow={(p) => (
              <>
                <td className="px-5 py-3 text-white">{p.LIBRO || p.libro}</td>
                <td className="px-5 py-3 text-muted">{p.USUARIO || p.usuario}</td>
                <td className="px-5 py-3 text-muted">{p.FECHA_PRESTAMO || p.fecha_prestamo}</td>
                <td className="px-5 py-3 text-muted">{p.FECHA_VENCIMIENTO || p.fecha_vencimiento}</td>
                <td className="px-5 py-3"><Badge status={p.ESTADO || p.estado} /></td>
                <td className="px-5 py-3">
                  {(p.ESTADO || p.estado || '').toUpperCase() !== 'DEVUELTO' && (
                    <button
                      onClick={() => handleDevolver(p)}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    >
                      <RotateCcw size={14} /> Marcar devuelto
                    </button>
                  )}
                </td>
              </>
            )}
          />
        )}
      </section>

      <section>
        <h2 className="text-white font-medium mb-3">Reservas</h2>
        {loadingReservas ? (
          <div className="text-muted text-sm py-6 text-center">Cargando reservas...</div>
        ) : (
          <DataTable
            columns={['Libro', 'Usuario', 'Fecha reserva', 'Estado', 'Acciones']}
            data={reservas || []}
            renderRow={(r) => (
              <>
                <td className="px-5 py-3 text-white">{r.LIBRO || r.libro}</td>
                <td className="px-5 py-3 text-muted">{r.USUARIO || r.usuario}</td>
                <td className="px-5 py-3 text-muted">{r.FECHA_RESERVA || r.fecha_reserva}</td>
                <td className="px-5 py-3"><Badge status={r.ESTADO || r.estado} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    {(r.ESTADO || r.estado) === 'Pendiente' && (
                      <button
                        onClick={() => handleConfirmar(r)}
                        disabled={saving}
                        className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                        title="Confirmar reserva"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setCancelTarget(r)}
                      disabled={saving}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      title="Cancelar reserva"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </>
            )}
          />
        )}
      </section>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelar}
        title="Cancelar reserva"
        message={`¿Seguro que quieres cancelar la reserva de "${cancelTarget?.LIBRO || cancelTarget?.libro}"?`}
        loading={saving}
      />
    </div>
  );
}