'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id_producto?: string;
  titulo: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  categoria?: string;
  etiqueta?: string;
  stock?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
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
    <>
      <div className="border rounded-lg p-4 shadow-md">
        {product.imagen && (
          <img
            src={product.imagen}
            alt={product.titulo}
            className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-90 transition"
            onClick={() => setModalAbierto(true)}
          />
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

      {/* Modal imagen grande */}
      {modalAbierto && product.imagen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 z-10 bg-white text-black rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold hover:bg-gray-200 shadow-lg border-2 border-gray-300"
            >
              ✕
            </button>
            <img
              src={product.imagen}
              alt={product.titulo}
              className="w-full rounded-t-lg shadow-2xl max-h-[60vh] object-contain bg-black"
            />
            <div className="bg-white rounded-b-lg p-4">
              <h3 className="font-bold text-lg">{product.titulo}</h3>
              <p className="text-gray-600 text-sm">{product.descripcion}</p>
              <p className="text-xl font-bold mt-2">
                $ {product.precio.toLocaleString('es-AR')}
              </p>
              <button
                onClick={handleBuy}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded mt-3 disabled:bg-gray-300"
              >
                {loading ? 'Cargando...' : 'Comprar Ahora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}