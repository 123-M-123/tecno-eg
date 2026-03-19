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
  const [preferenceId, setPreferenceId] = useState('');
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
        console.log('Preference response:', data);
        
        if (!response.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || 'Error creating preference');
        }
        
        setPreferenceId(data.id);
      } catch (error) {
        console.error('Error creating preference:', error);
        console.log('Error details:', error);
      } finally {
        setLoading(false);
      }
    };

    createPreference();
  }, [product]);

  return (
    <div className="border rounded-lg p-4 shadow-md">
      {product.imagen && (
        <img src={product.imagen} alt={product.titulo} className="w-full h-48 object-cover rounded" />
      )}
      <h3 className="font-bold mt-2">{product.titulo}</h3>
      {product.categoria && (
        <span className="text-sm text-gray-500">
          {product.categoria}
        </span>
      )}
      <p className="text-gray-600 text-sm mt-1">{product.descripcion}</p>

      <div className="mt-4">
        <p className="text-lg font-bold">
          ${product.precio.toLocaleString('es-AR')}
        </p>
      </div>

      {loading ? (
        <button disabled className="w-full bg-gray-300 text-white py-2 rounded mt-4">
          Cargando...
        </button>
      ) : preferenceId ? (
        <a href={`https://mercadopago.com/checkout/v1/redirect?pref_id=${preferenceId}`} className="w-full bg-blue-600 text-white py-2 rounded mt-4 block text-center">
          Comprar Ahora
        </a>
      ) : (
        <button disabled className="w-full bg-red-400 text-white py-2 rounded mt-4">
          Error al cargar
        </button>
      )}
    </div>
  );
}