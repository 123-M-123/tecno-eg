'use client';

import { useEffect, useState } from 'react';

interface Product {
  titulo: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  categoria?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [preferenceId, setPreferenceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createPreference = async () => {
      try {
        const response = await fetch('/api/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: product.titulo,
            price: product.precio,
            quantity: 1,
            description: product.descripcion,
          }),
        });

        const data = await response.json();
        setPreferenceId(data.id);
      } catch (error) {
        console.error('Error creating preference:', error);
      } finally {
        setLoading(false);
      }
    };

    createPreference();
  }, [product]);

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      {product.imagen && (
        <img 
          src={product.imagen} 
          alt={product.titulo}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      <h3 className="text-xl font-bold mb-2">{product.titulo}</h3>
      {product.categoria && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
          {product.categoria}
        </span>
      )}
      <p className="text-gray-600 mb-2 line-clamp-2">{product.descripcion}</p>
      <p className="text-green-600 font-bold text-lg mb-4">
        ${product.precio.toLocaleString('es-AR')}
      </p>
      
      {loading ? (
        <button className="w-full bg-gray-300 text-white py-2 rounded-md cursor-not-allowed">
          Cargando...
        </button>
      ) : preferenceId ? (
        <a
          href={`https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=${preferenceId}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md text-center transition-colors"
        >
          Comprar Ahora
        </a>
      ) : (
        <button className="w-full bg-red-300 text-white py-2 rounded-md cursor-not-allowed">
          Error al cargar
        </button>
      )}
    </div>
  );
}