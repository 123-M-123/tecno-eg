'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { C } from '@/styles/colores'

import { Producto } from '../context/CarritoContext'

type Props = {
  titulo: string
  productos: Producto[]
  onVerProducto: (producto: Producto, indice: number, lista: Producto[]) => void
}

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function Carrusel({ titulo, productos, onVerProducto }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: '2.5rem' }}>

      {/* Título del carrusel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: C.vino, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {titulo}
        </h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => scroll('left')} style={btnStyle}>‹</button>
          <button onClick={() => scroll('right')} style={btnStyle}>›</button>
        </div>
      </div>

      {/* Track del carrusel */}
      <div ref={ref}
       className="carrusel-track"
      style={{
        display: 'flex', gap: '0.75rem',
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        msOverflowStyle: 'none' as React.CSSProperties['msOverflowStyle'],
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none',
      }}>
        {productos.map((p, i) => (
          <div
            key={p.id_producto}
            onClick={() => onVerProducto(p, i, productos)}
            style={{
              flexShrink: 0, width: 160, scrollSnapAlign: 'start',
              cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
              border: `1.5px solid ${C.crema}`,
              background: C.white,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 20px rgba(239,127,26,0.25)`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {/* Imagen */}
            <div style={{ position: 'relative', aspectRatio: '1', background: C.gris }}>
              <Image
                src={p.imagen} alt={p.titulo} fill
                sizes="160px"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
              {p.etiqueta && (
                <span style={{
                  position: 'absolute', top: 6, left: 6,
                  background: C.naranja, color: C.white,
                  fontSize: '0.6rem', fontWeight: 700,
                  padding: '0.15rem 0.45rem', borderRadius: 10,
                  letterSpacing: '0.04em',
                }}>
                  {p.etiqueta}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '0.6rem 0.75rem' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', fontWeight: 600, color: C.vino, lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {p.titulo}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.naranja }}>
                {formatARS(p.precio)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%',
  border: `1.5px solid ${C.naranjaPale}`,
  background: C.white, color: C.naranja,
  fontSize: '1.1rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, lineHeight: 1,
}