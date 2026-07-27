import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollMagicFeature({ books }) {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // === 1. Animación de la Ventana (Contenedor 3D) ===
  // Entra desde la izquierda y se queda en x: 0 para siempre a partir de 0.3
  const windowX = useTransform(scrollYProgress, [0, 0.3, 1], ["-100vw", "0vw", "0vw"]);
  // Rotación 3D: empieza en 45°, termina en 12° y se mantiene
  const windowRotateY = useTransform(scrollYProgress, [0, 0.4, 1], [45, 12, 12]);
  // Opacidad: aparece rápido y se mantiene en 1 SIEMPRE
  const windowOpacity = useTransform(scrollYProgress, [0, 0.1, 1], [0, 1, 1]);

  // === 2. Animación de los Libros (Caída y Apilamiento) ===
  // Cada libro cae desde arriba y se queda en y: 0 con opacity: 1
  // El valor final SIEMPRE es 1 de opacidad y "0vh" de posición

  // Libro 1 (Fondo - cae primero)
  const b1Y = useTransform(scrollYProgress, [0.15, 0.4, 1], ["-120vh", "0vh", "0vh"]);
  const b1Opacity = useTransform(scrollYProgress, [0.15, 0.3, 1], [0, 1, 1]);

  // Libro 2
  const b2Y = useTransform(scrollYProgress, [0.3, 0.55, 1], ["-120vh", "0vh", "0vh"]);
  const b2Opacity = useTransform(scrollYProgress, [0.3, 0.45, 1], [0, 1, 1]);

  // Libro 3
  const b3Y = useTransform(scrollYProgress, [0.45, 0.7, 1], ["-120vh", "0vh", "0vh"]);
  const b3Opacity = useTransform(scrollYProgress, [0.45, 0.6, 1], [0, 1, 1]);

  // Libro 4 (Frente - cae último)
  const b4Y = useTransform(scrollYProgress, [0.6, 0.85, 1], ["-120vh", "0vh", "0vh"]);
  const b4Opacity = useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]);

  const bookTransforms = [
    { y: b1Y, opacity: b1Opacity, rotateZ: -8, x: -40, z: 0 },
    { y: b2Y, opacity: b2Opacity, rotateZ: 4, x: -5, z: 30 },
    { y: b3Y, opacity: b3Opacity, rotateZ: -3, x: 30, z: 60 },
    { y: b4Y, opacity: b4Opacity, rotateZ: 12, x: 65, z: 90 },
  ];

  return (
    <section id="descubre" ref={containerRef} className="h-[400vh] relative bg-background">
      {/* Sticky container: se "despega" naturalmente al terminar los 400vh */}
      <div 
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden" 
        style={{ perspective: '1200px' }}
      >
        {/* Ventana Glassmorphism 3D */}
        <motion.div 
          style={{ 
            x: windowX, 
            rotateY: windowRotateY, 
            opacity: windowOpacity,
            transformStyle: "preserve-3d" 
          }}
          className="relative w-[90vw] max-w-5xl h-[70vh] bg-[#0B0A10]/40 border border-purple-500/20 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-purple-900/30 flex flex-col md:flex-row items-center p-8 md:p-16 overflow-visible"
        >
          {/* Texto promocional */}
          <div className="flex-1 text-left z-10" style={{ transform: "translateZ(80px)" }}>
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Arma tu propia <br/>
              <span className="text-purple-400">
                lista de lectura
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-md">
              Selecciona, guarda y organiza los títulos que siempre quisiste leer. Descubre una nueva dimensión visual donde tu colección cobra vida.
            </p>
          </div>

          {/* Zona de caída de Libros 3D */}
          <div className="flex-1 relative w-full h-full mt-10 md:mt-0" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {books.slice(0, 4).map((book, index) => {
                const t = bookTransforms[index];
                return (
                  <motion.div
                    key={book.id}
                    style={{
                      y: t.y,
                      opacity: t.opacity,
                      x: t.x,
                      rotateZ: t.rotateZ,
                      z: t.z,
                    }}
                    className="absolute w-40 md:w-52 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden border border-white/10 bg-slate-900"
                  >
                    <img 
                      src={book.coverUrl} 
                      alt={book.titulo} 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
