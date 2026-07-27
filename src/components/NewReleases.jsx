import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { libroService } from '../services/api';

export default function NewReleases() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    libroService.getAll().then(data => {
      setBooks((data || []).slice(0, 5));
    }).catch(err => console.error(err));
  }, []);

  const getCoverUrl = (id) => {
    const covers = [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400&h=600',
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400&h=600'
    ];
    return covers[(id || 0) % covers.length];
  };

  const handleAction = (bookId) => {
    navigate(`/libro/${bookId}`);
  };

  return (
    <section className="py-24 md:py-32 bg-background relative">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-purple-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Nuevos</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">Nuevos Lanzamientos</h2>
            <p className="text-slate-400">Los títulos más recientes que acaban de llegar a la biblioteca</p>
          </div>
          <button onClick={() => navigate('/explorar')} className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors uppercase tracking-wider whitespace-nowrap">
            Ver todos &rarr;
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
          {books.map((book, idx) => {
            const id = book.RECURSO_ID || book.recurso_id || book.LIBRO_ID || book.libro_id;
            const titulo = book.TITULO || book.titulo;
            const autor = book.EDITORIAL_NOMBRE || book.editorial_nombre || 'Autor Desconocido';
            return (
            <motion.div 
              key={id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/5 shadow-lg transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-900/20"
            >
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-purple-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-md">
                Nuevo
              </div>

              <div className="aspect-[2/3] w-full relative overflow-hidden">
                <img 
                  src={getCoverUrl(id)} 
                  alt={titulo}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A10] via-[#0B0A10]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <button 
                    onClick={() => handleAction(id)}
                    className="w-full bg-purple-600/90 hover:bg-purple-500 text-white py-2 rounded-lg backdrop-blur-sm transition-all transform translate-y-3 group-hover:translate-y-0 flex items-center justify-center gap-1.5 font-medium text-sm shadow-xl"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalles</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white truncate text-sm mb-0.5">{titulo}</h3>
                <p className="text-xs text-purple-300/70 truncate">{autor}</p>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
