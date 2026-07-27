export default function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-sm">{label}</span>
        <Icon size={18} className="text-purple" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {trend && <p className="text-xs text-emerald-400 mt-1">{trend}</p>}
    </div>
  );
}
