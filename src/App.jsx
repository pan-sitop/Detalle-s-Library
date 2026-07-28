// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Explorar from './pages/Explorar';
import MiLista from './pages/MiLista';
import Login from './pages/Login';
import Register from './pages/Register';
import LibroDetalle from './pages/LibroDetalle'; 
import Proximamente from './pages/Proximamente'; 

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLibros from './pages/admin/AdminLibros';
import AdminPrestamos from './pages/admin/AdminPrestamos';
import AdminAuditoria from './pages/admin/AdminAuditoria';
import AdminResenas from './pages/admin/AdminResenas';

// 👇 AQUÍ ESTÁN LAS IMPORTACIONES QUE FALTABAN 👇
import AdminUsuariosMorosos from './pages/admin/AdminUsuariosMorosos'; 
import AdminConsolaSQL from './pages/admin/AdminConsolaSQL';
import AdminReportes from './pages/admin/AdminReportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas con MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="mi-lista" element={<MiLista />} />
          <Route path="libro/:id" element={<LibroDetalle />} /> 
          <Route path="proximamente" element={<Proximamente />} />
        </Route>

        {/* Auth (sin layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin protegido con AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="libros" element={<AdminLibros />} />
          <Route path="prestamos" element={<AdminPrestamos />} />
          <Route path="auditoria" element={<AdminAuditoria />} />
          <Route path="resenas" element={<AdminResenas />} />
          <Route path="morosos" element={<AdminUsuariosMorosos />} />
          <Route path="sql" element={<AdminConsolaSQL />} />
          <Route path="reportes" element={<AdminReportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;