'use client'

import { C } from '@/styles/colores'

const condiciones = [
  { icono: '🗓', titulo: 'Entregas', detalle: 'Viernes y sábados' },
  { icono: '📍', titulo: 'Retiro', detalle: 'Barrio de Flores, CABA' },
  { icono: '💰', titulo: 'Señá', detalle: '50% para reservar' },
  { icono: '📦', titulo: 'Stock', detalle: 'Consultá por WhatsApp antes de comprar' },
]

export default function HeroSection() {
  return (
    <section
      id="inicio"
      style={{
        background: C.fondo,
        padding: '3rem 1.5rem 2.5rem',
        textAlign: 'center',
        borderBottom: `3px solid ${C.naranjaPale}`,
      }}
    >
      {/* Título */}
      <h1 style={{
        fontSize: 'clamp(1.4rem, 4vw, 2rem)',
        fontWeight: 800,
        color: C.vino,
        margin: '0 0 0.4rem',
        letterSpacing: '-0.01em',
      }}>
        Bazar & Regalos
      </h1>
      <p style={{
        color: C.grisOscuro,
        fontSize: '1rem',
        margin: '0 0 2.5rem',
      }}>
        Productos de calidad con entrega a domicilio o retiro en Flores
      </p>

      {/* Condiciones — 4 íconos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        maxWidth: 720,
        margin: '0 auto',
      }}>
        {condiciones.map((c) => (
          <div key={c.titulo} style={{
            background: C.crema,
            border: `1.5px solid ${C.crema}`,
            borderRadius: 14,
            padding: '1.1rem 0.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{c.icono}</div>
            <div style={{
              fontSize: '0.75rem', fontWeight: 700, color: C.naranja,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
            }}>
              {c.titulo}
            </div>
            <div style={{ fontSize: '0.85rem', color: C.grisOscuro, lineHeight: 1.4 }}>
              {c.detalle}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/5491168075600"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '2rem',
          background: '#25D366', color: C.white,
          padding: '0.65rem 1.5rem', borderRadius: 24,
          textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.428a.75.75 0 0 0 .915.915l5.571-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.354l-.355-.211-3.667.971.988-3.607-.231-.371A9.725 9.725 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        Consultar STOCK por WhatsApp
      </a>
    </section>
  )
}
