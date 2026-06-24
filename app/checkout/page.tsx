'use client';

import { Suspense, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useConfigStore } from '@/store/useConfigStore';
import { savePaymentToMaster } from '@/lib/googleSheets';

function CheckoutContent() {
  const { items, clientData, setClientData, isClientDataComplete, getTotal, clearCart } = useCartStore();
  const { config } = useConfigStore();
  const [metodo, setMetodo] = useState<'alias' | 'mp' | 'qr'>('alias');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const total = getTotal();
  const descuento = Number(config.Descuento_Efectivo) || 10;
  const precioFinal = metodo === 'alias' ? total : Math.round(total / (1 - descuento / 100));

  if (items.length === 0 && !exito) return (
    <div style={{padding: '5rem', textAlign: 'center'}}>
      <h2>Tu carrito está vacío</h2>
      <a href="/">Volver a la tienda</a>
    </div>
  );

  // FORMULARIO DE DATOS (Bloqueo)
  if (!isClientDataComplete() && !exito) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{fontWeight: 900, marginBottom: '1rem'}}>Tus Datos de Contacto</h2>
          <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem'}}>Necesitamos estos datos para procesar tu pedido.</p>
          <input 
            style={inputStyle} placeholder="Nombre Completo" 
            value={clientData.nombre} onChange={(e) => setClientData({nombre: e.target.value})} 
          />
          <input 
            style={inputStyle} placeholder="WhatsApp (sin 0 ni 15)" 
            value={clientData.whatsapp} onChange={(e) => setClientData({whatsapp: e.target.value})} 
          />
          <select 
            style={inputStyle} value={clientData.metodoEntrega}
            onChange={(e) => setClientData({metodoEntrega: e.target.value as any})}
          >
            <option value="retiro">Retiro en local</option>
            <option value="envio">Envío a domicilio</option>
          </select>
          {clientData.metodoEntrega === 'envio' && (
            <input 
              style={inputStyle} placeholder="Dirección y Localidad" 
              value={clientData.direccion} onChange={(e) => setClientData({direccion: e.target.value})} 
            />
          )}
        </div>
      </div>
    );
  }

  const handlePagar = async () => {
    setEnviando(true);
    
    // SISTEMA MAESTRO 10 COLUMNAS (A-J)
    const pedido = [
      config.Email_Duenio || 'tecnoeg@gmail.com', // A: Socio
      new Date().toLocaleString('es-AR'),          // B: Fecha
      items.map(i => `${i.cantidad}x ${i.nombre}`).join(' | '), // C: Productos
      precioFinal,                                 // D: Precio Total
      'Pendiente',                                 // E: Estado
      `ID-${Math.random().toString(36).slice(5).toUpperCase()}`, // F: ID Transacción
      `Metodo: ${metodo}`,                         // G: Notas
      clientData.nombre,                           // H: Nombre Cliente
      clientData.whatsapp,                         // I: WhatsApp
      clientData.metodoEntrega === 'envio' ? clientData.direccion : 'Retiro en Local' // J: Entrega
    ];

    try {
      // Intentamos guardar en Google Sheets Maestro
      const res = await fetch('/api/checkout/save', { // Debes crear esta API route para llamar a savePaymentToMaster
        method: 'POST',
        body: JSON.stringify(pedido)
      });
      
      if (res.ok) {
        setExito(true);
        clearCart();
      }
    } catch (e) {
      alert("Error al conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) return (
    <div style={containerStyle}>
      <div style={{...cardStyle, textAlign: 'center'}}>
        <h1 style={{fontSize: '4rem'}}>✅</h1>
        <h2>¡Pedido Recibido!</h2>
        <p>Gracias {clientData.nombre}. Nos contactaremos por WhatsApp al {clientData.whatsapp}.</p>
        <button onClick={() => window.location.href = '/'} style={btnPagar}>Volver al Inicio</button>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <p style={{fontSize: '0.7rem', color: '#999'}}>FINALIZAR COMPRA</p>
        <h1 style={{fontSize: '2rem', fontWeight: 900}}>$ {precioFinal.toLocaleString('es-AR')}</h1>
        
        <div style={{display: 'flex', gap: '0.5rem', margin: '1.5rem 0'}}>
          <button onClick={() => setMetodo('alias')} style={{...btnMetodo, borderColor: metodo === 'alias' ? 'var(--color-medio-1)' : '#eee'}}>Transferencia</button>
          <button onClick={() => setMetodo('mp')} style={{...btnMetodo, borderColor: metodo === 'mp' ? '#009EE3' : '#eee'}}>Mercado Pago</button>
        </div>

        {metodo === 'alias' ? (
          <div style={{background: '#f0fff4', padding: '1rem', borderRadius: 10, marginBottom: '1rem'}}>
            <p style={{margin: 0, fontWeight: 700}}>Alias: {config.Alias || 'mguiyemo.mp'}</p>
            <p style={{fontSize: '0.8rem', color: '#22543d'}}>Transferí y luego hacé clic en confirmar.</p>
          </div>
        ) : (
          <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem'}}>Se aplicará el precio de lista para pagos con tarjeta.</p>
        )}

        <button onClick={handlePagar} disabled={enviando} style={btnPagar}>
          {enviando ? 'Procesando...' : 'CONFIRMAR PEDIDO'}
        </button>
      </div>
    </div>
  );
}

// ESTILOS
const containerStyle: React.CSSProperties = { minHeight: '100vh', background: '#f7f6f3', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' };
const cardStyle: React.CSSProperties = { background: '#fff', padding: '2rem', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8rem', marginBottom: '0.8rem', borderRadius: 10, border: '1px solid #ddd', fontSize: '1rem' };
const btnMetodo: React.CSSProperties = { flex: 1, padding: '0.8rem', borderRadius: 10, border: '2px solid', background: '#fff', fontWeight: 700, cursor: 'pointer' };
const btnPagar: React.CSSProperties = { width: '100%', padding: '1rem', borderRadius: 12, border: 'none', background: '#1a7f5a', color: '#fff', fontWeight: 800, cursor: 'pointer', marginTop: '1rem' };

export default function CheckoutPage() {
  return <Suspense fallback={null}><CheckoutContent /></Suspense>;
}