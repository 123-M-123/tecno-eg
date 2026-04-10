'use client';
 
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
 
declare global {
  interface Window {
    MercadoPago: any;
  }
}
 
const ALIAS = 'Guillermo-tecno-eg';
const CVU   = ''; // Opcional: agregá el CVU si lo tenés
 
function CheckoutContent() {
  const searchParams = useSearchParams();
  const brickContainer  = useRef<HTMLDivElement>(null);
  const brickRendered   = useRef(false);
 
  const [metodoPago,    setMetodoPago]    = useState<'mp' | 'transferencia'>('mp');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(true);
  const [comprobante,   setComprobante]   = useState<File | null>(null);
  const [enviando,      setEnviando]      = useState(false);
  const [enviado,       setEnviado]       = useState(false);
 
  const titulo      = searchParams?.get('titulo')      || '';
  const precio      = Number(searchParams?.get('precio'))  || 0;
  const descripcion = searchParams?.get('descripcion') || '';
 
  // ── Inicializar Brick MP ──────────────────────────────────────────
  useEffect(() => {
    if (metodoPago !== 'mp') return;
    if (brickRendered.current)  return;
    brickRendered.current = true;
 
    const initBrick = async () => {
      try {
        const res = await fetch('/api/create-preference', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ title: titulo, price: precio, quantity: 1, description: descripcion }),
        });
 
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error creando preferencia');
 
        const preferenceId = data.id;
 
        const script    = document.createElement('script');
        script.src      = 'https://sdk.mercadopago.com/js/v2';
        script.async    = true;
        document.body.appendChild(script);
 
        script.onload = async () => {
          const mp            = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
          const bricksBuilder = mp.bricks();
 
          await bricksBuilder.create('payment', 'payment-brick-container', {
            initialization: { amount: precio, preferenceId },
            customization: {
              paymentMethods: {
                creditCard:  'all',
                debitCard:   'all',
                mercadoPago: 'all',
                ticket:      'all',
              },
            },
            callbacks: {
              onReady: () => setLoading(false),
              onSubmit: async ({ formData, selectedPaymentMethod }: any) => {
                if (selectedPaymentMethod?.type === 'wallet_purchase') return;
 
                const result  = await fetch('/api/process-payment', {
                  method:  'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body:    JSON.stringify(formData),
                });
                const payment = await result.json();
 
                if      (payment.status === 'approved')                        window.location.href = '/success';
                else if (payment.status === 'pending' || payment.status === 'in_process') window.location.href = '/pending';
                else                                                           window.location.href = '/failure';
              },
              onError: (error: any) => {
                console.error('Brick error:', error);
                setError('Ocurrió un error con el formulario de pago.');
              },
            },
          });
        };
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
        setLoading(false);
      }
    };
 
    initBrick();
  }, [metodoPago]);
 
  // ── Enviar comprobante de transferencia ───────────────────────────
  const handleEnviarComprobante = async () => {
    if (!comprobante) return;
    setEnviando(true);
 
    const fd = new FormData();
    fd.append('archivo',     comprobante);
    fd.append('titulo',      titulo);
    fd.append('precio',      String(precio));
    fd.append('descripcion', descripcion);
 
    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) setEnviado(true);
      else        setError('Error al enviar el comprobante. Intentá de nuevo.');
    } catch {
      setError('Error de conexión al enviar el comprobante.');
    } finally {
      setEnviando(false);
    }
  };
 
  // ── UI ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1.25rem' }}>
 
      {/* Resumen del pedido */}
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
        Finalizar compra
      </h1>
      <p  style={{ color: '#555', marginBottom: '0.25rem' }}>{titulo}</p>
      <p  style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        $ {precio.toLocaleString('es-AR')}
      </p>
 
      {/* Selector de método de pago */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {(['mp', 'transferencia'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMetodoPago(m)}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10,
              border:     `2px solid ${metodoPago === m ? '#009EE3' : '#ddd'}`,
              background: metodoPago === m ? '#e8f4fd' : '#fff',
              fontWeight: metodoPago === m ? 700 : 400,
              cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            {m === 'mp' ? '💳 MercadoPago' : '🏦 Transferencia'}
          </button>
        ))}
      </div>
 
      {/* ── OPCIÓN MP ── */}
      {metodoPago === 'mp' && (
        <>
          {loading && <p style={{ color: '#888' }}>Cargando formulario de pago...</p>}
          {error   && <p style={{ color: 'red'  }}>{error}</p>}
          <div id="payment-brick-container" ref={brickContainer} />
        </>
      )}
 
      {/* ── OPCIÓN TRANSFERENCIA ── */}
      {metodoPago === 'transferencia' && !enviado && (
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '1.5rem', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Datos para transferir
          </h2>
 
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>ALIAS</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ALIAS}</span>
          </div>
 
          {CVU && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#888', display: 'block' }}>CVU</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{CVU}</span>
            </div>
          )}
 
          <div style={{ background: '#fff3cd', borderRadius: 8, padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            ⚠️ Transferí exactamente <strong>$ {precio.toLocaleString('es-AR')}</strong> y subí el comprobante abajo para confirmar tu pedido.
          </div>
 
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Subir comprobante de transferencia
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={e => setComprobante(e.target.files?.[0] || null)}
            style={{ marginBottom: '1rem', width: '100%' }}
          />
 
          {error && <p style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</p>}
 
          <button
            onClick={handleEnviarComprobante}
            disabled={!comprobante || enviando}
            style={{
              width: '100%', padding: '0.9rem',
              background:  !comprobante || enviando ? '#ccc' : '#00b894',
              border:      'none', borderRadius: 10,
              color:       '#fff', fontWeight: 800,
              fontSize:    '1rem', cursor: !comprobante || enviando ? 'not-allowed' : 'pointer',
            }}
          >
            {enviando ? 'Enviando...' : 'Confirmar pedido con comprobante'}
          </button>
        </div>
      )}
 
      {/* ── COMPROBANTE ENVIADO ── */}
      {metodoPago === 'transferencia' && enviado && (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#d4edda', borderRadius: 12 }}>
          <p style={{ fontSize: '2rem' }}>✅</p>
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>¡Comprobante recibido!</h2>
          <p style={{ color: '#555' }}>
            Vamos a verificar tu transferencia y te confirmamos el pedido pronto.
          </p>
        </div>
      )}
    </div>
  );
}
 
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem' }}>Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}