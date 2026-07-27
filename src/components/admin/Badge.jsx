const styles = {
  activo: 'bg-emerald-500/15 text-emerald-400',
  vencido: 'bg-red-500/15 text-red-400',
  devuelto: 'bg-sky-500/15 text-sky-400',
  pendiente: 'bg-amber-500/15 text-amber-400',
  confirmada: 'bg-emerald-500/15 text-emerald-400',
  cancelada: 'bg-red-500/15 text-red-400',
  crear: 'bg-emerald-500/15 text-emerald-400',
  modificar: 'bg-amber-500/15 text-amber-400',
  eliminar: 'bg-red-500/15 text-red-400',
  aprobar: 'bg-sky-500/15 text-sky-400',
};

export default function Badge({ status }) {
  const key = status?.toLowerCase();
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[key] || 'bg-gray-500/15 text-gray-400'}`}>
      {status}
    </span>
  );
}
