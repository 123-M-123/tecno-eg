'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/products';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoria, setCategoria] = useState('Todos');
  const [etiqueta, setEtiqueta] = useState('Todas');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const categorias = ['Todos', ...Array.from(new Set(products.map(p => p.categoria).filter(Boolean)))];
  
  const etiquetas = categoria === 'Todos' 
    ? ['Todas'] 
    : ['Todas', ...Array.from(new Set(products.filter(p => p.categoria === categoria).map(p => p.etiqueta).filter(Boolean)))];

  const productosFiltrados = products.filter(p => {
    const porCategoria = categoria === 'Todos' || p.categoria === categoria;
    const porEtiqueta = etiqueta === 'Todas' || p.etiqueta === etiqueta;
    return porCategoria && porEtiqueta;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mi Tienda</h1>
          <div className="text-sm text-gray-600">Bienvenido</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Nuestros Productos</h2>
          <p className="text-gray-600">Descubrí nuestra selección de productos disponibles</p>
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategoria(cat as string); setEtiqueta('Todas'); }}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                categoria === cat 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtros por etiqueta */}
        {categoria !== 'Todos' && (
          <div className="flex flex-wrap gap-2 mb-8">
            {etiquetas.map(etiq => (
              <button
                key={etiq}
                onClick={() => setEtiqueta(etiq as string)}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
                  etiqueta === etiq 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-800'
                }`}
              >
                {etiq}
              </button>
            ))}
          </div>
        )}

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay productos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((product) => (
              <ProductCard key={product.id_producto} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p>&copy; 2024 Mi Tienda. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}