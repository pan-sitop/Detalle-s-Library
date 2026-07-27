import os

new_releases_content = '''import { useState, useEffect } from 'react';
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
    navigate(/libro/\);
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
'''

trending_carousel_content = '''import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { libroService } from '../services/api';

export default function TrendingCarousel() {
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    libroService.getAll().then(data => {
      setBooks((data || []).slice(0, 5));
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [books.length]);

  const handleReadNow = (bookId) => {
    navigate(/libro/\);
  };

  const getCoverUrl = (id) => {
    const covers = [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800&h=1200',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800&h=1200',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800&h=1200',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800&h=1200',
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800&h=1200'
    ];
    return covers[(id || 0) % covers.length];
  };

  if (books.length === 0) return null;

  const currentBook = books[currentIndex];
  const id = currentBook.RECURSO_ID || currentBook.recurso_id || currentBook.LIBRO_ID || currentBook.libro_id;
  const titulo = currentBook.TITULO || currentBook.titulo;
  const autor = currentBook.EDITORIAL_NOMBRE || currentBook.editorial_nombre || 'Autor Desconocido';
  const sinopsis = currentBook.SINOPSIS || Una fascinante obra literaria de formato \. Escrita en \, esta entrega te sumergirá en un mundo de conocimiento y entretenimiento inolvidable.;

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center bg-[#0B0A10] overflow-hidden py-20 border-y border-white/5">
      
      <div className="container mx-auto px-6 md:px-12 relative z-10 w-full">
        
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
            <span>En tendencia</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 w-full"
          >
            <div className="w-full md:w-auto flex justify-center md:justify-start shrink-0">
              <div className="relative w-56 md:w-72 lg:w-80 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group">
                <img 
                  src={getCoverUrl(id)} 
                  alt={titulo}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0A10]/50 via-transparent to-white/5 pointer-events-none" />
                <div className="absolute -bottom-px left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#0B0A10]" />
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
              <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                {titulo}
              </h2>
              
              <p className="text-xl text-purple-300 font-medium mb-8">
                Por {autor}
              </p>
              
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
                {sinopsis}
              </p>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => handleReadNow(id)}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-semibold transition-all w-full sm:w-auto"
                >
                  <span>Ver detalles</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/explorar')} className="hidden sm:flex items-center justify-center px-6 py-4 rounded-full font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  Explorar más
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center md:justify-start gap-3 mt-16">
          {books.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={h-1.5 rounded-full transition-all duration-300 \}
              aria-label={Ir al slide \}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
'''

with open(r"c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\components\NewReleases.jsx", 'w', encoding='utf-8') as f:
    f.write(new_releases_content)

with open(r"c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\components\TrendingCarousel.jsx", 'w', encoding='utf-8') as f:
    f.write(trending_carousel_content)

print("Update complete")
