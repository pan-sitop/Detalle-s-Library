import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Cuenta creada exitosamente. Inicia sesión.');
        setTimeout(() => navigate('/login'), 1000);
      } else {
        showToast(data.message || 'Error al crear la cuenta', 'error');
      }
    } catch (err) {
      showToast('No se pudo conectar con el servidor', 'error');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background ambient glows */}
      
      

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-900/10">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-10">
            <Link to="/" className="flex items-center gap-2 text-purple-500 hover:text-purple-400 transition-colors mb-6">
              <BookOpen className="w-9 h-9" />
              <span className="font-serif text-3xl font-bold tracking-wide text-white">Detalle's Library</span>
            </Link>
            <h1 className="text-2xl font-semibold text-white mb-2">Crea tu cuenta</h1>
            <p className="text-slate-400 text-sm text-center">Únete y accede a miles de títulos sin límites</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre & Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-300">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                    required
                    disabled={isLoading}
                    className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-transparent outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="apellido" className="block text-sm font-medium text-slate-300">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Apellido"
                    required
                    disabled={isLoading}
                    className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-transparent outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-transparent outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-transparent outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-slate-300">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full bg-[#1A1825] text-white placeholder:text-slate-600 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-transparent outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-2 decoration-purple-400/30 hover:decoration-purple-300/50"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Subtle bottom text */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Al registrarte, aceptas nuestros Términos y Política de Privacidad.
        </p>
      </motion.div>
    </div>
  );
}
