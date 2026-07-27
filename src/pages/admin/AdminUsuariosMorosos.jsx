import { useState } from 'react';
import { AlertTriangle, Ban, CheckCircle, Search, Clock } from 'lucide-react';

export default function AdminUsuariosMorosos() {
  // 1. Datos simulados (Mock Data) para llenar la tabla
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Carlos Mamani', email: 'cmamani@umsa.bo', diasRetraso: 12, recurso: 'Fundamentos de Bases de Datos', suspendido: false },
    { id: 2, nombre: 'Lucía Fernández', email: 'lucia.f@gmail.com', diasRetraso: 25, recurso: 'Sistemas Operativos Modernos', suspendido: false },
    { id: 3, nombre: 'Jorge Pérez', email: 'jorge.perez@hotmail.com', diasRetraso: 5, recurso: 'Clean Code', suspendido: false },
    { id: 4, nombre: 'Ana Condori', email: 'ana.condori@yahoo.com', diasRetraso: 42, recurso: 'Redes de Computadoras', suspendido: true },
  ]);

  const [busqueda, setBusqueda] = useState('');

  // 2. Función simulada: Solo actualiza el estado en React, no llama al backend
  const handleToggleSuspension = (id) => {
    setUsuarios(usuarios.map(user => 
      user.id === id ? { ...user, suspendido: !user.suspendido } : user
    ));
  };

  // Filtrar por nombre o email
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Usuarios Morosos
          </h1>
          <p className="text-muted text-sm mt-1">
            Gestión y suspensión de usuarios con préstamos vencidos (Modo Simulado).
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
                <th className="px-6 py-4 font-medium">Recurso Retenido</th>
                <th className="px-6 py-4 font-medium">Días de Retraso</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.nombre}</div>
                      <div className="text-muted text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-muted">{user.recurso}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-red-400">
                        <Clock size={14} />
                        {user.diasRetraso} días
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.suspendido ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                          <Ban size={12} /> Suspendido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          <CheckCircle size={12} /> Activo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleSuspension(user.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.suspendido 
                            ? 'bg-bg border border-border text-muted hover:text-white' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20'
                        }`}
                      >
                        {user.suspendido ? 'Levantar Suspensión' : 'Suspender'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted">
                    No se encontraron usuarios morosos con ese término de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}