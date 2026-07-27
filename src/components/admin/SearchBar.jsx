import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { libroService } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    libroService.search(debouncedQuery).then((res) => {
      setResults(res);
      setLoading(false);
    });
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (libro) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate('/admin/libros', { state: { editLibroId: libro.libro_id } });
  };

  return (
    <div ref={containerRef} className="relative w-80">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar libro por título o ISBN..."
        className="w-full bg-bg-hover border border-border rounded-lg pl-9 pr-9 py-2
        text-sm text-gray-100 placeholder:text-muted focus:outline-none focus:border-purple"
      />
      {loading && (
        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
      )}

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-bg-card border border-border rounded-lg
          shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">Sin resultados para "{debouncedQuery}"</div>
          // Reemplaza la línea 62 a 72 de SearchBar.jsx por esto:
          ) : (
            results.map((libro) => {
              const id = libro.LIBRO_ID || libro.libro_id;
              const titulo = libro.TITULO || libro.titulo;
              const isbn = libro.ISBN || libro.isbn;

              return (
                <button
                  key={id}
                  onClick={() => handleSelect({ libro_id: id })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-bg-hover transition-colors"
                >
                  <BookOpen size={16} className="text-purple shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{titulo}</p>
                    <p className="text-xs text-muted">{isbn}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
