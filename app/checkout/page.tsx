'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

declare global {
  interface Window { MercadoPago: any }
}

const ALIAS = 'mguiyemo.mp';
const CVU   = '';

// ── Paleta neutral elegante ───────────────────────────────────────────
const K = {
  bg:        '#F7F6F3',
  surface:   '#FFFFFF',
  border:    '#E2E0DC',
  muted:     '#9A9690',
  text:      '#1C1B19',
  sub:       '#6B6862',
  accent:    '#2D6BE4',
  accentBg:  '#EEF3FC',
  green:     '#1A7F5A',
  greenBg:   '#EDF7F3',
  mp:        '#009EE3',
  mpBg:      '#EDF7FD',
  warn:      '#7A5C00',
  warnBg:    '#FFF8E1',
} as const;

type Metodo = 'alias' | 'tarjeta' | 'mp' | 'otros' | 'qr';

const OPCIONES: { id: Metodo; emoji: string; label: string; sub: string }[] = [
  { id: 'alias',   emoji: '🏦', label: 'Transferencia',     sub: 'Obtené descuento pagando directo' },
  { id: 'tarjeta', emoji: '💳', label: 'Tarjeta / Efectivo', sub: 'Medios por fuera de MercadoPago'  },
  { id: 'mp',      emoji: '🔵', label: 'Cuenta MP',          sub: 'Usá tu saldo o tarjetas en MP'    },
{ id: 'qr', emoji: '📲', label: 'QR (apps bancarias)', sub: 'Pagá con MODO, Ualá, Cta DNi, Nar-X o bancos' },
  { id: 'otros',   emoji: '🌐', label: 'Otros métodos',      sub: 'Próximamente'                     },
];

// ── Componente botón de opción ────────────────────────────────────────
function OpcionBtn({ op, activo, onClick }: { op: typeof OPCIONES[0]; activo: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: '1 1 140px', padding: '0.85rem 0.75rem',
      borderRadius: 12, cursor: 'pointer', textAlign: 'left',
      border:      `2px solid ${activo ? K.accent : K.border}`,
      background:  activo ? K.accentBg : K.surface,
      transition:  'all 0.18s',
      opacity:     op.id === 'otros' ? 0.6 : 1,
    }}>
      <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{op.emoji}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: activo ? K.accent : K.text, lineHeight: 1.2 }}>
        {op.label}
      </div>
      <div style={{ fontSize: '0.7rem', color: K.muted, marginTop: '0.2rem', lineHeight: 1.3 }}>
        {op.sub}
      </div>
    </button>
  );
}

// ── Checkout principal ────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const brickContainer = useRef<HTMLDivElement>(null);

  const [metodo,      setMetodo]      = useState<Metodo>('alias');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando,    setEnviando]    = useState(false);
  const [enviado,     setEnviado]     = useState(false);

  const titulo      = searchParams?.get('titulo')      || '';
  const precio      = Number(searchParams?.get('precio')) || 0;
  const descripcion = searchParams?.get('descripcion') || '';

  // ── Brick Tarjeta/Efectivo (sin wallet MP) ────────────────────────
  useEffect(() => {
    if (metodo !== 'tarjeta') return;
    const container = document.getElementById('brick-tarjeta');
    if (!container || container.children.length > 0) return;

    const init = async () => {
      try {
        const res  = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precio, quantity: 1, description: descripcion }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script');
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve();
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-tarjeta', {
          initialization: { amount: precio, preferenceId: data.id },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard:  'all',
              ticket:     'all',   // Pago Fácil y Rapipago van acá
            },
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData }: any) => {
              const r = await fetch('/api/process-payment', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              const p = await r.json();
              if      (p.status === 'approved') window.location.href = '/success';
              else if (p.status === 'pending' || p.status === 'in_process') window.location.href = '/pending';
              else    window.location.href = '/failure';
            },
            onError: () => setError('Error en el formulario de pago.'),
          },
        });
      } catch (e: any) {
        setError(e.message); setLoading(false);
      }
    };
    init();
  }, [metodo]);

  // ── Brick Cuenta MP (wallet + saldo, sin tarjetas offline) ────────
  useEffect(() => {
    if (metodo !== 'mp') return;
    const container = document.getElementById('brick-mp');
    if (!container || container.children.length > 0) return;

    const init = async () => {
      try {
        const res  = await fetch('/api/create-preference', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, price: precio, quantity: 1, description: descripcion }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (!window.MercadoPago) {
          await new Promise<void>(resolve => {
            const s = document.createElement('script');
            s.src = 'https://sdk.mercadopago.com/js/v2';
            s.async = true; s.onload = () => resolve();
            document.body.appendChild(s);
          });
        }

        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'es-AR' });
        await mp.bricks().create('payment', 'brick-mp', {
          initialization: { amount: precio, preferenceId: data.id },
          customization: {
            paymentMethods: {
              mercadoPago: 'all', // Solo wallet y saldo MP
            },
          },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async ({ formData, selectedPaymentMethod }: any) => {
              if (selectedPaymentMethod?.type === 'wallet_purchase') return;
              const r = await fetch('/api/process-payment', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              const p = await r.json();
              if      (p.status === 'approved') window.location.href = '/success';
              else if (p.status === 'pending' || p.status === 'in_process') window.location.href = '/pending';
              else    window.location.href = '/failure';
            },
            onError: () => setError('Error al conectar con MercadoPago.'),
          },
        });
      } catch (e: any) {
        setError(e.message); setLoading(false);
      }
    };
    init();
  }, [metodo]);

  // ── Enviar comprobante ────────────────────────────────────────────
  const handleEnviarComprobante = async () => {
    if (!comprobante) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('archivo', comprobante);
    fd.append('titulo',  titulo);
    fd.append('precio',  String(precio));
    try {
      const res = await fetch('/api/upload-comprobante', { method: 'POST', body: fd });
      if (res.ok) setEnviado(true);
      else        setError('Error al enviar. Intentá de nuevo.');
    } catch { setError('Error de conexión.'); }
    finally   { setEnviando(false); }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: K.bg, padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: K.surface, borderRadius: 16, padding: '1.5rem',
          border: `1px solid ${K.border}`, marginBottom: '1rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.4rem' }}>
            Finalizar compra
          </p>
          <p style={{ fontSize: '0.9rem', color: K.sub, margin: '0 0 0.6rem', lineHeight: 1.4 }}>
            {titulo}
          </p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: K.text, margin: 0, letterSpacing: '-0.02em' }}>
            $ {precio.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Selector métodos */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, margin: '0 0 0.6rem 0.25rem' }}>
            Elegí cómo pagar
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {OPCIONES.map(op => (
              <OpcionBtn
                key={op.id} op={op} activo={metodo === op.id}
                onClick={() => setMetodo(op.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Panel Transferencia ── */}
        {metodo === 'alias' && !enviado && (
          <div style={{ background: K.surface, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            
            <div style={{ background: K.greenBg, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem' }}>💚</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: K.green, fontWeight: 600 }}>
                Pagando por transferencia obtés un descuento especial. Consultá el monto final por WhatsApp.
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: K.muted, display: 'block', marginBottom: '0.2rem' }}>Alias</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: K.text, letterSpacing: '0.03em' }}>{ALIAS}</span>
            </div>

            {CVU && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: K.muted, display: 'block', marginBottom: '0.2rem' }}>CVU</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: K.text }}>{CVU}</span>
              </div>
            )}

            <div style={{ background: K.warnBg, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: K.warn }}>
                ⚠️ Transferí y luego subí el comprobante para confirmar tu pedido.
              </p>
            </div>

            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: K.text, marginBottom: '0.5rem' }}>
              Comprobante de transferencia
            </label>
            <input
              type="file" accept="image/*,application/pdf"
              onChange={e => setComprobante(e.target.files?.[0] || null)}
              style={{ width: '100%', marginBottom: '1rem', fontSize: '0.85rem' }}
            />

            {error && <p style={{ color: 'red', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}

            <button
              onClick={handleEnviarComprobante}
              disabled={!comprobante || enviando}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
                background: !comprobante || enviando ? K.border : K.green,
                color: !comprobante || enviando ? K.muted : '#fff',
                fontWeight: 800, fontSize: '0.95rem',
                cursor: !comprobante || enviando ? 'not-allowed' : 'pointer',
              }}
            >
              {enviando ? 'Enviando...' : 'Confirmar pedido →'}
            </button>
          </div>
        )}

        {/* ── Confirmación comprobante ── */}
        {metodo === 'alias' && enviado && (
          <div style={{ background: K.greenBg, borderRadius: 16, padding: '2rem', textAlign: 'center', border: `1px solid ${K.green}` }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>✅</p>
            <h2 style={{ fontWeight: 800, color: K.green, marginBottom: '0.5rem' }}>¡Comprobante recibido!</h2>
            <p style={{ color: K.sub, fontSize: '0.88rem' }}>
              Verificamos tu pago y te confirmamos el pedido a la brevedad.
            </p>
          </div>
        )}

        {/* ── Panel Tarjeta / Efectivo ── */}
        {metodo === 'tarjeta' && (
          <div style={{ background: K.surface, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.78rem', color: K.muted, marginBottom: '1rem' }}>
              Tarjeta de crédito, débito o efectivo (Pago Fácil / Rapipago) — procesado por MercadoPago de forma segura, sin necesidad de cuenta.
            </p>
            {loading && <p style={{ color: K.muted, fontSize: '0.85rem' }}>Cargando formulario...</p>}
            {error   && <p style={{ color: 'red',   fontSize: '0.82rem' }}>{error}</p>}
            <div id="brick-tarjeta" />
          </div>
        )}

        {/* ── Panel Cuenta MP ── */}
        {metodo === 'mp' && (
          <div style={{ background: K.surface, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.78rem', color: K.muted, marginBottom: '1rem' }}>
              Iniciá sesión en MercadoPago para pagar con tu saldo disponible o tarjetas guardadas en tu cuenta.
            </p>
            {loading && <p style={{ color: K.muted, fontSize: '0.85rem' }}>Cargando...</p>}
            {error   && <p style={{ color: 'red',   fontSize: '0.82rem' }}>{error}</p>}
            <div id="brick-mp" />
          </div>
        )}
{/* ── Panel QR ── */}
{metodo === 'qr' && (
  <div style={{
    background: K.surface,
    borderRadius: 16,
    padding: '1.5rem',
    border: `1px solid ${K.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  }}>
    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
       Escaneá este QR con tu app bancaria (MODO, Ualá, Cuenta DNI, Naranja X o MercadoPago)
    </p>

    {qrUrl ? (
  <img
    src={qrUrl}
    alt="QR de pago"
    style={{
      width: '100%',
      maxWidth: 260,
      borderRadius: 12,
      display: 'block',
      margin: '0 auto'
    }}
  />
) : (
  <div style={{
    width: '100%',
    height: 220,
    background: '#eee',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    color: '#666'
  }}>
    Generando QR...
  </div>
)}
  </div>
)}
        {/* ── Panel Otros métodos ── */}
        {metodo === 'otros' && (
          <div style={{ background: K.surface, borderRadius: 16, padding: '1.5rem', border: `1px solid ${K.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: K.muted, marginBottom: '1rem' }}>
              Plataformas disponibles próximamente
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[
  { nombre: 'PayPal',  emoji: '🅿️', color: '#003087' },
  { nombre: 'Stripe',  emoji: '🔷', color: '#635BFF' },
  { nombre: 'Cripto',  emoji: '₿',  color: '#F7931A' },
{ nombre: 'Apple Pay',   emoji: '🍎', color: '#6B2FA0' },
{ nombre: 'Google Pay',   emoji: '🌐', color: '#6B2FA0' },
{ nombre: 'Wise',   emoji: '🏦', color: '#6B2FA0' },

].map(p => (
  <div key={p.nombre} style={{
    flex: '1 1 100px', padding: '1rem 0.75rem', borderRadius: 10,
    border: `1.5px solid ${K.border}`, textAlign: 'center',
    cursor: 'default',
  }}>
    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.emoji}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: p.color }}>{p.nombre}</div>
    <div style={{ fontSize: '0.65rem', color: K.muted, marginTop: '0.2rem' }}>Próximamente</div>
  </div>
))}
            </div>
            <div style={{ background: K.bg, borderRadius: 8, padding: '0.75rem 1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: K.sub }}>
                ¿Necesitás pagar con alguna de estas plataformas? Contactanos y lo gestionamos.
              </p>
              <a
                href="https://wa.me/5491158081432?text=Hola%2C%20quiero%20consultar%20sobre%20m%C3%A9todos%20de%20pago%20alternativos%20para%20mi%20compra."
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: '0.6rem',
                  background: '#25D366', color: '#fff',
                  padding: '0.4rem 1rem', borderRadius: 20,
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700,
                }}
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}
{/* Volver a la tienda */}
<div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <a href="/" style={{
    fontSize: '0.88rem', color: K.muted,
    textDecoration: 'none', display: 'inline-flex',
    alignItems: 'center', gap: '0.3rem',
  }}>
    ← Volver a la tienda
  </a>
</div>
        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: K.muted, marginTop: '1.5rem' }}>
          🔒 Tus datos están protegidos · Pagos procesados de forma segura
        </p>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9A9690' }}>Cargando...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}