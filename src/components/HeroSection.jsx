import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const handleScrollToFeature = () => {
    const section = document.getElementById('descubre');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden w-full">
      {/* Background glow effects */}
      
      

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl mx-auto"
        >
          {/* Título principal */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 text-white tracking-tight">
            Tu biblioteca.
            <br />
            <span className=" ">
              Sin límites.
            </span>
          </h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Accede a miles de títulos desde cualquier dispositivo. Explora, guarda y sumérgete en historias infinitas con una experiencia diseñada para ti.
          </motion.p>

          {/* Botones centrados */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/explorar"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Explorar libros</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={handleScrollToFeature}
              className="px-8 py-4 rounded-full font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
            >
              Saber más
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
