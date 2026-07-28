import HeroSection from '../components/HeroSection';
import ScrollMagicFeature from '../components/ScrollMagicFeature';
import TrendingCarousel from '../components/TrendingCarousel';
import NewReleases from '../components/NewReleases';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';
import { mockBooks } from '../data/mockBooks';

export default function Home() {
  const { user, rol } = useAuth();
  return (
    <div className="flex flex-col">
      <HeroSection />
      
      {/* Scrolljacking 3D section */}
      <ScrollMagicFeature books={mockBooks} />

      {/* Carrusel de Tendencias a pantalla completa */}
      <TrendingCarousel />

      {/* Nuevos Lanzamientos (grid de tarjetas) */}
      <NewReleases />

      {/* Chatbot flotante (Solo si está logueado y no es admin) */}
      {user && rol !== 'admin' && <Chatbot />}
    </div>
  );
}
