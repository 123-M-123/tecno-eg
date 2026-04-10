'use client'
import Image from 'next/image'
import { useState } from 'react'
import { C } from '@/styles/colores'

const ANILLOS = [
  {
    label: 'Gratis',
    precio: 'Sin cargo',
    color: '#2d9c4a',
    barrios: ['Flores', 'Parque Avellaneda'],
  },
  {
    label: 'Anillo 1',
    precio: '$3.000 – $5.000',
    color: C.naranjaPale,
    barrios: ['Caballito', 'Parque Chacabuco', 'Floresta', 'Mataderos', 'Villa del Parque', 'Monte Castro', 'Villa Santa Rita', 'Vélez Sársfield'],
  },
  {
    label: 'Anillo 2',
    precio: '$5.000 – $7.000',
    color: C.naranja,
    barrios: ['Almagro', 'Boedo', 'San Cristóbal', 'Villa Luro', 'Liniers', 'Lugano', 'Villa Soldati', 'Villa Riachuelo'],
  },
  {
    label: 'Anillo 3',
    precio: '$7.000 – $9.000',
    color: C.vino,
    barrios: ['Palermo', 'Recoleta', 'Belgrano', 'Núñez', 'Saavedra', 'Balvanera', 'Parque Patricios', 'Barracas', 'San Telmo', 'La Boca'],
  },
]

const BARRIOS_SELECT = ANILLOS.flatMap((a, i) =>
  a.barrios.map(b => ({ nombre: b, anillo: i }))
).sort((a, b) => a.nombre.localeCompare(b.nombre))

export default function EnviosSection() {
  const [seleccion, setSeleccion] = useState<number | null>(null)

  return (
    <section id="envios" style={{
      padding: '3rem 1.25rem',
      background: C.fondo,
      borderTop: `3px solid ${C.naranja}`,
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Título */}
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, color: C.vino,
          margin: '0 0 0.3rem',
        }}>
          📦 Envíos a domicilio
        </h2>
        <p style={{ color: C.grisOscuro, fontSize: '1.5rem', margin: '0 0 2rem' }}>
          Solo Capital Federal · PARA ENVIOS CONSULTAR DISPONIBILIDAD
        </p>

{/* Mapa */}
<div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.gris}`, marginBottom: '1.5rem' }}>
  <Image
    src="/mapa-envios.png"
    alt="Mapa de zonas de envío Capital Federal"
    width={700}
    height={840}
    style={{ width: '100%', height: 'auto', display: 'block' }}
  />
</div>

        {/* Leyenda */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {ANILLOS.map(a => (
            <span key={a.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.78rem', fontWeight: 600,
            }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: a.color, display: 'inline-block' }}/>
              {a.label} · {a.precio}
            </span>
          ))}
        </div>

        {/* Calculadora */}
        <div style={{
          background: C.white, border: `1.5px solid ${C.crema}`,
          borderRadius: 14, padding: '1.25rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: C.vino, fontSize: '0.95rem' }}>
            ¿Cuánto pago de envío?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              onChange={e => setSeleccion(e.target.value ? parseInt(e.target.value) : null)}
              style={{
                flex: 1, minWidth: 180, padding: '0.5rem 0.75rem',
                borderRadius: 8, border: `1px solid ${C.gris}`,
                fontSize: '0.85rem', color: C.vino,
              }}
            >
              <option value="">Elegí tu barrio...</option>
              {BARRIOS_SELECT.map(b => (
                <option key={b.nombre} value={b.anillo}>{b.nombre}</option>
              ))}
            </select>

            {seleccion !== null && (
              <div style={{
                padding: '0.5rem 1.25rem', borderRadius: 20,
                background: ANILLOS[seleccion].color,
                color: seleccion === 1 ? C.vino : C.white,
                fontWeight: 700, fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}>
                {ANILLOS[seleccion].precio}
              </div>
            )}
          </div>
        </div>

        {/* Nota */}
        <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: C.grisOscuro, textAlign: 'center' }}>
          ⚠️ Los precios de envío son orientativos y pueden variar. Consultá por WhatsApp antes de confirmar.
        </p>

      </div>
    </section>
  )
}