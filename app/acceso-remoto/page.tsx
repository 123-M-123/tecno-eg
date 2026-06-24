'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccesoRemotoPage() {
  const router = useRouter();

  useEffect(() => {
    // Esto hace que la página cargue (status 200), permitiendo que se lea la metadata,
    // y redirige al usuario inmediatamente al anclaje.
    window.location.replace('/#quienes');
  }, []);

  return (
    <div style={{ background: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Mensaje breve por si la conexión es lenta, pero casi ni se ve */}
      <p style={{ fontFamily: 'sans-serif', color: '#666' }}>Redirigiendo a Tecno EG...</p>
    </div>
  );
}