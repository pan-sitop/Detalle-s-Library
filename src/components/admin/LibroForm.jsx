import { useState, useEffect } from 'react';

export default function LibroForm({ initialData = null, editoriales = [], onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    titulo: initialData?.TITULO || initialData?.titulo || '',
    isbn: initialData?.ISBN || initialData?.isbn || '',
    formato: initialData?.FORMATO || initialData?.formato || 'PDF',
    anio_publicacion: initialData?.ANIO_PUBLICACION || initialData?.anio_publicacion || '',
    copias_disponibles: initialData?.COPIAS_DISPONIBLES || initialData?.copias_disponibles || '',
    editorial_id: initialData?.EDITORIAL_ID || initialData?.editorial_id || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Título</label>
        <input required name="titulo" value={formData.titulo} onChange={handleChange} 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/30" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">ISBN (o Código interno)</label>
          <input required name="isbn" value={formData.isbn} onChange={handleChange}
            placeholder="Ej: 9780133970777"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/30" />
        </div>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Formato</label>
          <select name="formato" value={formData.formato} onChange={handleChange}
            className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30">
            <option value="Libro">Libro Físico</option>
            <option value="PDF">PDF</option>
            <option value="EPUB">EPUB</option>
            <option value="Revista">Revista</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Año de publicación</label>
          <input type="number" required name="anio_publicacion" value={formData.anio_publicacion} onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30" />
        </div>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Copias disponibles</label>
          <input type="number" required name="copias_disponibles" value={formData.copias_disponibles} onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Editorial</label>
        <select required name="editorial_id" value={formData.editorial_id} onChange={handleChange}
          className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30">
          <option value="">Selecciona una editorial</option>
          {editoriales.map((ed, idx) => (
            <option key={ed.EDITORIAL_ID || ed.editorial_id || idx} value={ed.EDITORIAL_ID || ed.editorial_id}>
              {ed.NOMBRE || ed.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-6">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:text-white hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm bg-white text-black hover:bg-slate-200 font-medium transition-all disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}