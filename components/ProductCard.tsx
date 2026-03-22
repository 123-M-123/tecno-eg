'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  titulo: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  categoria?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuy = () => {
    setLoading(true);
    const params = new URLSearchParams({
      titulo: product.titulo,
      precio: String(product.precio),
      descripcion: product.descripcion,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="border rounded-lg p-4 shadow-md">
      {product.imagen && (
        <img src={product.imagen} alt={product.titulo} className="w-full h-48 object-cover rounded" />
      )}
      <h3 className="font-bold mt-2">{product.titulo}</h3>
      {product.categoria && (
        <span className="text-sm text-gray-500">{product.categoria}</span>
      )}
      <p className="text-gray-600 text-sm mt-1">{product.descripcion}</p>
      <div className="mt-4">
        <p className="text-lg font-bold">
          $ {product.precio.toLocaleString('es-AR')}
        </p>
      </div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:bg-gray-300"
      >
        {loading ? 'Cargando...' : 'Comprar Ahora'}
      </button>
    </div>
  );
}